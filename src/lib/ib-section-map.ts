/**
 * Карта «раздел документа Word → поле формы».
 *
 * Нужна потому, что доктор называет разделы по-своему: в его шаблоне это
 * `Anamnes morbi`, `УЗИ: МПВ`, `ПОВОД ОБРАЩЕНИЯ`, а раздел справочника ищется
 * по ПОДПИСИ ПОЛЯ («Анамнез заболевания»). Без карты такие записи легли бы
 * в базу и никогда не появились в панели подсказок.
 *
 * Карта живёт в `ib-section-map.json`, а не в коде, ровно потому, что её
 * читают двое: приложение (при загрузке файла) и `scripts/build-ib-template.mjs`
 * (когда из документа собирают справочник). Две копии уже разъезжались —
 * карта в сборщике знала про 26 разделов, а загрузка из Word не знала ни про
 * один и отказывалась брать 15 разделов из 26 (01.11.2026).
 *
 * Одно правило может указывать на НЕСКОЛЬКО полей: формулировки УЗИ не
 * называют сторону, поэтому идут и в правую, и в левую конечность. Пустой
 * список `to` означает «в форме такого поля нет» — такие записи не пишем,
 * но и не прячем: они попадают в отчёт окна загрузки.
 */
import rawMap from "./ib-section-map.json";
import type { DictionaryDocSection } from "./dictionary-docx";

export type SectionRule = { from: string; to: string[] };

/** Правила привязки разделов документа к полям формы. */
export const sectionRules: SectionRule[] = rawMap.sections;

/**
 * Заголовки, которые разделом не считаются: титул, коды МКБ, служебное «-и».
 * В документе они выделены жирным так же, как настоящие разделы. Передаётся
 * в разборщик (`parseDictionaryDocx`), а не применяется после разбора: иначе
 * записи такого «раздела» уже не вернуть в предыдущий.
 */
export const ignoreHeaderPattern = new RegExp(rawMap.ignoreHeaders.join("|"));

/** Сравнение названий без хвостового двоеточия: «Жалобы:» и «Жалобы» — одно. */
const normalize = (title: string) => title.trim().replace(/:\s*$/, "");

export type SectionMapping = {
  /** Разделы, разложенные по полям формы — в порядке появления в документе. */
  sections: DictionaryDocSection[];
  /** Разделы, которым не нашлось поля: их не загружаем, но показываем. */
  unknown: Array<{ title: string; count: number }>;
};

/**
 * Разложить разделы документа по полям формы.
 *
 * Поля передаём снаружи, а не берём из этого модуля: список подписей живёт
 * в экране рядом с самой формой, и вторая его копия снова разъехалась бы.
 */
export const mapDocumentSections = (
  sections: DictionaryDocSection[],
  fieldLabels: string[],
): SectionMapping => {
  const labels = new Set(fieldLabels);
  const buckets = new Map<string, DictionaryDocSection>();
  const unknown: Array<{ title: string; count: number }> = [];

  for (const section of sections) {
    const title = section.title.trim();
    if (!title) continue;

    // Точная подпись поля сильнее карты: если доктор уже назвал раздел как
    // поле формы, никакое правило не должно увести его в другое место.
    const rule = sectionRules.find((item) => normalize(item.from) === normalize(title));
    const targets = labels.has(title) ? [title] : (rule?.to ?? []);

    if (targets.length === 0) {
      unknown.push({ title, count: section.entries.length });
      continue;
    }

    for (const target of targets) {
      // Поле из карты, которого нет в форме, — ошибка карты. Записать туда
      // записи значило бы сделать их невидимыми навсегда, поэтому сообщаем.
      if (!labels.has(target)) {
        unknown.push({ title: `${target} (правило для «${title}»)`, count: section.entries.length });
        continue;
      }
      const bucket = buckets.get(target) ?? { title: target, entries: [] };
      // Повторы возможны, когда два раздела документа ложатся в одно поле
      // («Осмотр, кожные покровы», «Вены», «ТАЭ» → «Локальный осмотр»).
      const seen = new Set(bucket.entries.map((entry) => `${entry.short}\u0000${entry.full}`));
      for (const entry of section.entries) {
        const key = `${entry.short}\u0000${entry.full}`;
        if (seen.has(key)) continue;
        seen.add(key);
        bucket.entries.push(entry);
      }
      buckets.set(target, bucket);
    }
  }

  return { sections: [...buckets.values()], unknown };
};
