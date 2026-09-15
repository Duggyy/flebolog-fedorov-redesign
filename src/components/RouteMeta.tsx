import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Заголовок вкладки и meta description для текущей страницы.
 *
 * Зачем: приложение — SPA, `index.html` один на все маршруты, поэтому без этого
 * компонента ВСЕ страницы отдавали один и тот же `<title>` и одну `description`.
 * Проверено: 18 маршрутов → 1 уникальный заголовок. Последствия — поисковики не
 * различают страницы, во вкладках и истории браузера они неотличимы, а Метрика
 * складывает все просмотры под одним названием.
 *
 * Заголовок берётся из уже отрисованного `<h1>` страницы, а не из отдельной
 * таблицы: тогда он не может разойтись с содержимым, и новые страницы получают
 * правильный заголовок автоматически, без правок в 18 файлах. Тяжёлые данные
 * (news/blog) при этом в основной бандл не попадают — в отличие от подхода
 * «одна таблица заголовков на всё приложение».
 *
 * ⚠️ Ждём появления `<h1>`: ленивый маршрут грузится чанком, и сразу после
 * перехода на странице ещё висит заглушка Suspense.
 */

/**
 * ⚠️ Нельзя прочитать `<h1>` сразу после смены маршрута.
 *
 * Ленивый маршрут подгружается чанком, и в момент перехода React оставляет на
 * экране ПРЕДЫДУЩУЮ страницу (так работает Suspense с переходом), поэтому
 * первый же прочитанный `<h1>` принадлежит ещё старой странице — заголовок
 * отставал на один шаг. Проверено: после перехода «Варикоз» → «Рига 2018»
 * заголовок оставался про варикоз, а про альбом появлялся только на следующем
 * переходе.
 *
 * Поэтому опрашиваем DOM, пока значение не перестанет меняться: смена `<h1>`
 * сбрасывает счётчик, и фиксируем только устоявшееся значение.
 */
const TICK_MS = 60;
/** 3 × 60 мс неизменности — содержимое точно отрисовано. */
const STABLE_TICKS = 3;
/** ~3 с: с запасом на загрузку самого тяжёлого чанка. */
const MAX_TICKS = 50;

const SITE_SUFFIX = "флеболог Д.А. Фёдоров";
const MAX_DESCRIPTION = 160;

// Заголовок и описание главной заданы прямо в index.html — запоминаем их до
// того, как компонент что-либо изменит, чтобы вернуть при возврате на «/».
const INITIAL_TITLE = document.title;
const INITIAL_DESCRIPTION =
  document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";

const setDescription = (content: string) => {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

/**
 * `noindex` только для страницы «не найдена».
 *
 * Сайт — SPA: `.htaccess` переписывает любой неизвестный путь на `index.html`,
 * поэтому несуществующая страница отдаётся со статусом 200 (soft-404). Без
 * этого тега поисковик может проиндексировать бесконечное число таких адресов.
 * Тег обязательно снимается на обычных страницах — иначе noindex утечёт на весь сайт.
 */
const setNoIndex = (on: boolean) => {
  const existing = document.querySelector('meta[name="robots"]');
  if (!on) {
    existing?.remove();
    return;
  }
  if (existing) {
    existing.setAttribute("content", "noindex, follow");
    return;
  }
  const tag = document.createElement("meta");
  tag.setAttribute("name", "robots");
  tag.setAttribute("content", "noindex, follow");
  document.head.appendChild(tag);
};

const firstParagraph = (): string => {
  const scope = document.querySelector("main") ?? document.body;
  for (const p of scope.querySelectorAll("p")) {
    const text = (p.textContent ?? "").replace(/\s+/g, " ").trim();
    // Совсем короткие абзацы (подписи, врезки) в описание не годятся.
    if (text.length >= 60) return text;
  }
  return "";
};

const truncate = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, "")}…`;
};

const readH1 = (): string =>
  (
    document.querySelector("main h1")?.textContent ??
    document.querySelector("h1")?.textContent ??
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Главная: возвращаем заголовок и описание из index.html. Ждать нечего —
    // Index импортируется обычным импортом и уже отрисован.
    if (pathname === "/") {
      document.title = INITIAL_TITLE;
      setDescription(INITIAL_DESCRIPTION);
      setNoIndex(false);
      return;
    }

    let cancelled = false;
    let ticks = 0;
    let stable = 0;
    let last = "";
    let timer: number | undefined;

    const commit = (h1: string) => {
      const isNotFound = /не найдена|не найден/i.test(h1);
      setNoIndex(isNotFound);

      // Если в заголовке уже есть фамилия врача, второй раз её не добавляем.
      document.title = h1.includes("Фёдоров") ? `${h1} — врач-флеболог` : `${h1} — ${SITE_SUFFIX}`;

      const lead = firstParagraph();
      // Если подходящего абзаца нет, возвращаем описание по умолчанию, а не
      // оставляем то, что было: иначе при переходе внутри приложения на такой
      // странице висело бы описание предыдущей.
      setDescription(lead ? truncate(lead, MAX_DESCRIPTION) : INITIAL_DESCRIPTION);
    };

    const tick = () => {
      if (cancelled) return;

      const h1 = readH1();
      if (h1) {
        if (h1 === last) stable += 1;
        else {
          last = h1;
          stable = 0;
        }
        if (stable >= STABLE_TICKS) {
          commit(h1);
          return;
        }
      }

      if (ticks++ < MAX_TICKS) {
        timer = window.setTimeout(tick, TICK_MS);
      } else if (last) {
        // Чанк так и не загрузился — фиксируем то, что успели увидеть.
        commit(last);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
};

export default RouteMeta;
