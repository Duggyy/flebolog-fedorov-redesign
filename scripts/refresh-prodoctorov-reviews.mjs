#!/usr/bin/env node
/**
 * Refreshes the cached ProDoctorov reviews shown on /reviews.
 *
 * Why this exists
 * ---------------
 * prodoctorov.ru protects its doctor pages with a JS anti-bot challenge
 * (ServicePipe). Plain HTTP clients — curl, PHP, wget, even Googlebot/YandexBot
 * UAs — receive either a 403 or an 1809-byte challenge page instead of the
 * reviews, so neither the browser nor a PHP endpoint can scrape it at runtime.
 * ProDoctorov also exposes no public reviews API (the only open endpoint,
 * /api/share/widget/doctor/<id>/footer/, returns the rating summary without the
 * review list).
 *
 * The only reliable read path is a real browser with a realistic fingerprint,
 * which is what this script does. It runs out-of-band (cron / CI / automation)
 * and writes a static JSON file the SPA can always fetch.
 *
 * Contract
 * --------
 *  - Writes public/data/prodoctorov-reviews.json ONLY after a fully successful
 *    run that produced a valid, non-empty review list.
 *  - On ANY failure (no network, challenge page, markup change, empty result)
 *    it exits non-zero and leaves the existing file untouched — so the site
 *    keeps showing the previously loaded reviews, which is the desired
 *    behaviour.
 *  - Refuses to write if the freshly scraped newest review is older than the
 *    one already cached (a sign of a partial or degraded render).
 *
 * Usage
 * -----
 *   node scripts/refresh-prodoctorov-reviews.mjs [--dry-run] [--verbose]
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { readdirSync } from 'node:fs';

import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const DOCTOR_ID = '556844';
const REVIEWS_PAGE_URL = `https://prodoctorov.ru/obninsk/vrach/${DOCTOR_ID}-fedorov/otzivi/`;
const DOCTOR_PAGE_URL = `https://prodoctorov.ru/obninsk/vrach/${DOCTOR_ID}-fedorov/`;
// Официальный виджет рейтинга на нашем домене не работает: ПроДокторов отдаёт
// на его скрипт HTML-заглушку, и браузер блокирует её (Opaque Response Blocking).
// Зато этот же API доступен с самой страницы врача (same-origin), поэтому рейтинг
// забираем оттуда и рисуем своим блоком.
const WIDGET_API_PATH = `/api/share/widget/doctor/${DOCTOR_ID}/footer/`;
const OUTPUT_FILE = join(PROJECT_ROOT, 'public', 'data', 'prodoctorov-reviews.json');
const REVIEWS_LIMIT = 4;
const TEXT_LIMIT = 620;
const ATTEMPTS = 3;

const REALISTIC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const VERBOSE = argv.includes('--verbose');

const log = (...args) => console.log('[reviews]', ...args);
const debug = (...args) => { if (VERBOSE) console.log('[reviews:debug]', ...args); };

/**
 * Playwright normally resolves the browser itself, but on this machine the
 * bundled download lives under a versioned cache directory. Prefer whatever
 * Playwright reports, then fall back to an explicit path / cache scan.
 */
function resolveChromiumExecutable() {
  const candidates = [];

  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);

  try {
    const reported = chromium.executablePath();
    if (reported) candidates.push(reported);
  } catch {
    /* Playwright could not resolve it — fall through to the manual scan. */
  }

  const cacheRoot = join(homedir(), 'Library', 'Caches', 'ms-playwright');
  if (existsSync(cacheRoot)) {
    const builds = readdirSync(cacheRoot)
      .filter((name) => name.startsWith('chromium-'))
      .sort((a, b) => Number(b.split('-')[1] ?? 0) - Number(a.split('-')[1] ?? 0));

    for (const build of builds) {
      candidates.push(
        join(cacheRoot, build, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        join(cacheRoot, build, 'chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        join(cacheRoot, build, 'chrome-mac-arm64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
      );
    }
  }

  const found = candidates.find((path) => path && existsSync(path));
  if (!found) {
    throw new Error(
      'Не найден исполняемый файл Chromium. Установите браузер командой `npx playwright install chromium` ' +
      'или задайте переменную окружения CHROME_PATH.',
    );
  }

  return found;
}

/** "2026-06-04" + "4 июня в 13:54" → "4 июня 2026 в 13:54" */
function formatReviewDate(iso, displayed) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!match) return displayed ?? '';

  const [, year, month, day] = match;
  const monthName = MONTHS_GENITIVE[Number(month) - 1];
  if (!monthName) return displayed ?? '';

  const time = /(\d{1,2}:\d{2})/.exec(displayed ?? '');
  return `${Number(day)} ${monthName} ${year}${time ? ` в ${time[1]}` : ''}`;
}

/**
 * Trims a review to TEXT_LIMIT characters, preferring to stop on a sentence
 * boundary so the card does not end mid-word.
 */
function shortenText(text, limit = TEXT_LIMIT) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;

  const cut = normalized.slice(0, limit);
  const lastSentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));

  if (lastSentence > limit * 0.6) return cut.slice(0, lastSentence + 1).trim();
  return `${cut.replace(/[\s.,;:—-]+$/, '')}…`;
}

/**
 * Splits the review body into speciality + story. The DOM looks like:
 *   Флеболог
 *   История пациента
 *   <review text>
 *   Понравилось
 *   <what the patient liked>
 *   Приём был в мае  2026          ← lives in <footer>, not here
 */
function parseReviewBody(bodyText) {
  const lines = (bodyText ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  const storyIndex = lines.findIndex((line) => /^История пациента$/i.test(line));

  if (storyIndex < 0) {
    const speciality = lines[0] && lines[0].length < 60 ? lines[0] : '';
    const rest = speciality ? lines.slice(1) : lines;
    return { speciality, story: rest.join(' ').trim() };
  }

  const speciality = lines
    .slice(0, storyIndex)
    .filter((line) => !/^Отзыв проверен$/i.test(line))
    .join(' ')
    .trim();

  const rest = lines.slice(storyIndex + 1);
  const stopIndex = rest.findIndex((line) =>
    /^(Понравилось|Не понравилось|Комментарий|Медицинский центр|Приём был|Пациент\s)/i.test(line),
  );
  const story = (stopIndex >= 0 ? rest.slice(0, stopIndex) : rest).join(' ').trim();

  return { speciality, story };
}

async function scrapeReviews() {
  const executablePath = resolveChromiumExecutable();
  debug('chromium:', executablePath);

  const browser = await chromium.launch({
    executablePath,
    proxy: { server: 'direct://' },
    args: ['--no-proxy-server', '--proxy-bypass-list=*', '--disable-blink-features=AutomationControlled'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'ru-RU',
      timezoneId: 'Europe/Moscow',
      userAgent: REALISTIC_UA,
      extraHTTPHeaders: { 'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8' },
    });

    // Playwright advertises itself via navigator.webdriver; the challenge checks it.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();

    let lastError = null;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      try {
        debug(`attempt ${attempt}/${ATTEMPTS}: loading reviews page`);
        await page.goto(REVIEWS_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.b-review-card[itemprop="review"]', { timeout: 45000 });

        const scraped = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.b-review-card[itemprop="review"]'));

          return cards
            .map((card) => {
              const dateEl = card.querySelector('[itemprop="datePublished"]');
              const iso = dateEl?.getAttribute('content') ?? '';
              if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

              const commentsEl = card.querySelector('.b-review-card__comments');
              const ratingEl = card.querySelector('[class*="review-card-tooltips__stars"]');

              return {
                iso,
                displayed: (dateEl?.innerText ?? '').trim().replace(/\s+/g, ' '),
                reviewId: card.getAttribute('data-review-id') ?? '',
                name: (card.querySelector('.b-review-card__author-link')?.innerText ?? '').trim(),
                rating: (ratingEl?.innerText ?? '').trim().replace(/\s+/g, ' '),
                body: commentsEl?.innerText ?? '',
              };
            })
            .filter(Boolean);
        });

        if (scraped.length === 0) throw new Error('на странице не найдено ни одной карточки отзыва');

        const reviews = scraped
          .sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0))
          .slice(0, REVIEWS_LIMIT)
          .map((item) => {
            const { speciality, story } = parseReviewBody(item.body);
            return {
              name: item.name,
              date: formatReviewDate(item.iso, item.displayed),
              rating: item.rating,
              speciality,
              text: shortenText(story),
              publishedAt: item.iso,
              reviewId: item.reviewId,
            };
          });

        const invalid = reviews.filter((review) => !review.name || !review.date || !review.text);
        if (invalid.length > 0) {
          throw new Error(`у ${invalid.length} из ${reviews.length} отзывов не хватает обязательных полей`);
        }

        // Рейтинг берём из виджет-API, пока мы на домене ПроДокторов: запрос
        // same-origin, поэтому защита его пропускает. Необязателен — если не
        // ответил, отзывы всё равно сохраняем.
        const rating = await page.evaluate(async (apiPath) => {
          try {
            const response = await fetch(apiPath);
            if (!response.ok) return null;

            const data = await response.json();
            const stars = Number.parseFloat(data?.stars);
            const totalRates = Number.parseInt(data?.total_rates, 10);
            if (!Number.isFinite(stars) || !Number.isFinite(totalRates)) return null;

            return {
              stars,
              totalRates,
              bestQuote: typeof data?.positive_rate === 'string' ? data.positive_rate.trim() : '',
              profileUrl: typeof data?.url === 'string' ? data.url : '',
            };
          } catch {
            return null;
          }
        }, WIDGET_API_PATH);

        return { reviews, totalOnPage: scraped.length, rating };
      } catch (error) {
        lastError = error;
        debug(`attempt ${attempt} failed:`, error.message);
        if (attempt < ATTEMPTS) await page.waitForTimeout(3000 * attempt);
      }
    }

    throw lastError ?? new Error('не удалось получить отзывы');
  } finally {
    await browser.close();
  }
}

function readCachedPayload() {
  if (!existsSync(OUTPUT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  log(`источник: ${REVIEWS_PAGE_URL}`);

  const cached = readCachedPayload();
  const cachedNewest = cached?.reviews?.[0]?.publishedAt ?? cached?.reviews?.[0]?.date ?? null;
  debug('cached newest:', cachedNewest ?? '—');

  let result;
  try {
    result = await scrapeReviews();
  } catch (error) {
    log(`ОШИБКА: ${error.message}`);
    log('кэш не изменён — сайт продолжит показывать ранее загруженные отзывы');
    process.exitCode = 1;
    return;
  }

  const { reviews, totalOnPage } = result;
  const newest = reviews[0];

  // Guard against a degraded render silently replacing good data with old data.
  if (cached?.reviews?.[0]?.publishedAt && newest.publishedAt < cached.reviews[0].publishedAt) {
    log(`ОШИБКА: самый свежий отзыв (${newest.publishedAt}) старше уже сохранённого (${cached.reviews[0].publishedAt})`);
    log('кэш не изменён — похоже на неполную загрузку страницы');
    process.exitCode = 1;
    return;
  }

  // Рейтинг необязателен: если виджет-API не ответил, оставляем прежний.
  const rating = result.rating ?? cached?.rating ?? null;

  const payload = {
    source: 'prodoctorov',
    isCached: false,
    cachedAt: new Date().toISOString(),
    doctorUrl: DOCTOR_PAGE_URL,
    reviewsUrl: REVIEWS_PAGE_URL,
    totalOnPage,
    rating,
    reviews,
  };

  log(`на странице найдено отзывов: ${totalOnPage}`);
  log(`самый свежий: ${newest.date} — ${newest.name}`);
  log(rating
    ? `рейтинг: ${rating.stars.toFixed(2)} — ${rating.totalRates} оценок`
    : 'рейтинг: не получен (оставлен прежний)');

  for (const review of reviews) {
    log(`  · ${review.publishedAt}  ${review.rating || '—'}  ${review.speciality || '—'}`);
  }

  if (DRY_RUN) {
    log('--dry-run: файл не изменён');
    return;
  }

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

  // Write to a temp file first so a crash mid-write cannot corrupt the cache.
  const tempFile = `${OUTPUT_FILE}.tmp`;
  writeFileSync(tempFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  renameSync(tempFile, OUTPUT_FILE);

  log(`записано: ${OUTPUT_FILE}`);
}

await main();
