<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

const PRODOCTOROV_REVIEWS_URL = 'https://prodoctorov.ru/obninsk/vrach/556844-fedorov/otzivi/#otzivi';
const REVIEWS_LIMIT = 4;

$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/prodoctorov-reviews.json';
$fallbackFile = dirname(__DIR__) . '/data/prodoctorov-reviews-fallback.json';

try {
    $html = fetch_reviews_page(PRODOCTOROV_REVIEWS_URL);
    $reviews = parse_reviews($html, REVIEWS_LIMIT);

    if (count($reviews) > 0) {
        $payload = [
            'source' => 'prodoctorov',
            'isCached' => false,
            'cachedAt' => date(DATE_ATOM),
            'reviews' => $reviews,
        ];
        write_cache($cacheDir, $cacheFile, $payload);
        respond($payload);
    }
} catch (Throwable $error) {
    // Fall through to the cache.
}

$cachedPayload = read_json_file($cacheFile);
if ($cachedPayload !== null && !empty($cachedPayload['reviews'])) {
    $cachedPayload['source'] = $cachedPayload['source'] ?? 'cache';
    $cachedPayload['isCached'] = true;
    respond($cachedPayload);
}

$fallbackPayload = read_json_file($fallbackFile);
if ($fallbackPayload !== null) {
    $fallbackPayload['source'] = 'fallback';
    $fallbackPayload['isCached'] = true;
    respond($fallbackPayload);
}

http_response_code(503);
respond([
    'source' => 'unavailable',
    'isCached' => true,
    'cachedAt' => null,
    'reviews' => [],
]);

function fetch_reviews_page(string $url): string
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; dafeodorov.ru reviews cache)',
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: ru-RU,ru;q=0.9,en;q=0.8',
            ],
        ]);

        $html = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if (!is_string($html) || $html === '' || $status >= 400) {
            throw new RuntimeException($error ?: 'ProDoctorov response error');
        }

        return $html;
    }

    $context = stream_context_create([
        'http' => [
            'timeout' => 15,
            'header' => "User-Agent: Mozilla/5.0 (compatible; dafeodorov.ru reviews cache)\r\nAccept-Language: ru-RU,ru;q=0.9,en;q=0.8\r\n",
        ],
    ]);
    $html = file_get_contents($url, false, $context);

    if (!is_string($html) || $html === '') {
        throw new RuntimeException('ProDoctorov response error');
    }

    return $html;
}

function parse_reviews(string $html, int $limit): array
{
    $html = preg_replace('/<(br|\/p|\/div|\/section|\/article|\/li|\/h[1-6]|\/span)\b[^>]*>/iu', "\n", $html) ?? $html;
    $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/[ \t\x{00A0}]+/u', ' ', $text) ?? $text;
    $lines = array_values(array_filter(array_map('trim', preg_split('/\R/u', $text) ?: [])));
    $reviews = [];
    $monthPattern = 'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря';

    for ($i = 0; $i < count($lines) && count($reviews) < $limit; $i++) {
        if (!preg_match('/^Пациент\s+/u', $lines[$i])) {
            continue;
        }

        $name = $lines[$i];
        $date = '';
        $rating = '';
        $speciality = '';
        $storyStart = -1;

        for ($j = $i + 1; $j < min($i + 12, count($lines)); $j++) {
            if ($date === '' && preg_match('/^\d{1,2}\s+(' . $monthPattern . ')\s+\d{4}\s+в\s+\d{2}:\d{2}$/u', $lines[$j])) {
                $date = $lines[$j];
                continue;
            }
            if ($rating === '' && preg_match('/^\d(?:[.,]\d)?\s+(Отлично|Хорошо|Нормально|Плохо|Ужасно)$/u', $lines[$j])) {
                $rating = $lines[$j];
                continue;
            }
            if ($lines[$j] === 'История пациента') {
                $storyStart = $j + 1;
                break;
            }
            if ($speciality === '' && !in_array($lines[$j], ['Отзыв проверен', 'История пациента'], true) && !preg_match('/^\d/u', $lines[$j])) {
                $speciality = $lines[$j];
            }
        }

        if ($storyStart < 0 || $date === '' || $rating === '') {
            continue;
        }

        $storyParts = [];
        for ($k = $storyStart; $k < count($lines); $k++) {
            $line = $lines[$k];
            if (preg_match('/^(Понравилось|Не понравилось|Медицинский центр|Приём был|Пациент\s+)/u', $line)) {
                break;
            }
            if ($line === '' || $line === '/') {
                continue;
            }
            $storyParts[] = $line;
        }

        $reviewText = trim(implode(' ', $storyParts));
        if ($reviewText === '' || string_contains_ci($reviewText, 'отзыв удалён')) {
            continue;
        }

        $reviews[] = [
            'name' => $name,
            'date' => $date,
            'rating' => $rating,
            'speciality' => $speciality,
            'text' => shorten_text($reviewText, 560),
        ];
    }

    return $reviews;
}

function shorten_text(string $text, int $limit): string
{
    $text = preg_replace('/\s+/u', ' ', trim($text)) ?? trim($text);
    if (string_length($text) <= $limit) {
        return $text;
    }

    return rtrim(string_slice($text, 0, $limit - 1), " \t\n\r\0\x0B.,;:") . '...';
}

function string_length(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
}

function string_slice(string $text, int $start, int $length): string
{
    return function_exists('mb_substr') ? mb_substr($text, $start, $length) : substr($text, $start, $length);
}

function string_contains_ci(string $haystack, string $needle): bool
{
    if (function_exists('mb_stripos')) {
        return mb_stripos($haystack, $needle) !== false;
    }

    return stripos($haystack, $needle) !== false;
}

function read_json_file(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }

    $json = file_get_contents($file);
    if (!is_string($json) || $json === '') {
        return null;
    }

    $payload = json_decode($json, true);
    return is_array($payload) ? $payload : null;
}

function write_cache(string $dir, string $file, array $payload): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    file_put_contents(
        $file,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX,
    );
}

function respond(array $payload): never
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
