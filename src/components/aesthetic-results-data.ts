export type AestheticResult = {
  id: number;
  /** Фото «до». Путь от корня сайта, напр. /images/aesthetic-results/result-01-before.jpg */
  before: string;
  /** Фото «после». */
  after: string;
  /** Необязательная подпись: зона, методика, срок наблюдения. */
  caption?: string;
};

/**
 * Эстетическая флебология. Результаты.
 *
 * Раздел новый — прямого источника на старом сайте (flebologfedorov.ru) нет.
 * Структура готова, материалы добавляет доктор.
 *
 * Чтобы наполнить раздел:
 *   1. Положить фото в `public/images/aesthetic-results/` парами
 *      `result-01-before.jpg` / `result-01-after.jpg` (ASCII-имена, стабильные).
 *   2. Добавить запись сюда:
 *      { id: 1, before: "/images/aesthetic-results/result-01-before.jpg",
 *        after: "/images/aesthetic-results/result-01-after.jpg",
 *        caption: "Сосудистые звёздочки, микросклеротерапия" }
 *
 * Пока массив пуст, страница показывает аккуратную заглушку вместо сетки.
 */
export const aestheticResults: AestheticResult[] = [];
