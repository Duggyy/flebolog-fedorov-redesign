/**
 * Круговой оборот «справочник → Word → справочник».
 *
 * Проверка нужна именно такая: по отдельности «собрали архив» и «разобрали
 * архив» могут быть зелёными, а вместе — терять дефис, цвет или полный текст.
 * Ошибка тут тихая: файл откроется в Word, врач его пришлёт, и только тогда
 * выяснится, что подпункты стали обычными строками.
 */
import { describe, it, expect } from "vitest";
import {
  buildDictionaryDocx,
  parseDictionaryDocx,
  parseWordParagraphs,
  type DictionaryDocSection,
} from "./dictionary-docx";

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const roundTrip = async (sections: DictionaryDocSection[], heading = "") => {
  const bytes = buildDictionaryDocx(sections, heading);
  return parseDictionaryDocx(toArrayBuffer(bytes));
};

describe("справочник ↔ Word", () => {
  it("возвращает разделы, записи, полный текст, цвет и дефис", async () => {
    const sections: DictionaryDocSection[] = [
      {
        title: "Жалобы",
        entries: [
          { short: "Тяжесть в ногах к вечеру", full: "", color: "" },
          { short: "Отёки голеней", full: "Отёки появляются к вечеру", color: "#185fa5" },
        ],
      },
      {
        title: "Анамнез заболевания",
        entries: [
          { short: "Состояние после", full: "", color: "" },
          { short: "-флебэктомии", full: "", color: "" },
          { short: "-склеротерапии", full: "Склеротерапия вен нижних конечностей", color: "" },
        ],
      },
    ];

    const parsed = await roundTrip(sections);

    expect(parsed.warnings).toEqual([]);
    expect(parsed.sections.map((section) => section.title)).toEqual([
      "Жалобы",
      "Анамнез заболевания",
    ]);
    expect(parsed.sections[0].entries).toEqual([
      { short: "Тяжесть в ногах к вечеру", full: "", color: "" },
      { short: "Отёки голеней", full: "Отёки появляются к вечеру", color: "#185fa5" },
    ]);
    expect(parsed.sections[1].entries.map((entry) => entry.short)).toEqual([
      "Состояние после",
      "-флебэктомии",
      "-склеротерапии",
    ]);
    expect(parsed.sections[1].entries[2].full).toBe("Склеротерапия вен нижних конечностей");
  });

  it("дефис остаётся разметкой подпункта, а не частью проверки на глаз", async () => {
    // Дефисные строки должны вернуться с дефисом: именно по нему панель
    // строит дерево, и потеря дефиса разваливает группу.
    const parsed = await roundTrip([
      {
        title: "Анамнез",
        entries: [
          { short: "Считает себя больной более", full: "", color: "" },
          { short: "-1 года", full: "", color: "" },
          { short: "-3 лет", full: "", color: "" },
          { short: "-5 лет", full: "", color: "" },
        ],
      },
    ]);

    const shorts = parsed.sections[0].entries.map((entry) => entry.short);
    expect(shorts.filter((text) => text.startsWith("-"))).toHaveLength(3);
    expect(shorts[0]).toBe("Считает себя больной более");
  });

  it("не съедает угловые скобки, амперсанды и кавычки в тексте", async () => {
    const tricky = 'Стеноз <50% & "флоу" > нормы';
    const parsed = await roundTrip([
      { title: "УЗИ", entries: [{ short: tricky, full: "A & B < C", color: "" }] },
    ]);

    expect(parsed.sections[0].entries[0].short).toBe(tricky);
    expect(parsed.sections[0].entries[0].full).toBe("A & B < C");
  });

  it("заголовок документа не становится разделом, но и не пропадает молча", async () => {
    const parsed = await roundTrip(
      [{ title: "Жалобы", entries: [{ short: "Одна жалоба", full: "", color: "" }] }],
      "Справочник подсказок",
    );

    // Заголовок жирный — значит выглядит как раздел. Он попадает в список
    // разделов, но пустой, и потому отфильтровывается: в справочник не
    // просачивается лишняя строка.
    expect(parsed.sections).toHaveLength(1);
    expect(parsed.sections[0].title).toBe("Жалобы");
  });

  it("предупреждает о строке, попавшей в файл до первого раздела", async () => {
    // Так выглядит файл, где врач случайно поставил подпункт выше заголовка
    // «Жалобы». Молча выбросить его нельзя — иначе он просто исчезнет при
    // импорте и никто не поймёт, куда.
    const parsed = await roundTrip([
      { title: "-забытая строка", entries: [] },
      { title: "Жалобы", entries: [{ short: "Запись", full: "", color: "" }] },
    ]);

    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toContain("до первого раздела");
    expect(parsed.sections.map((section) => section.title)).toEqual(["Жалобы"]);
  });

  it("не склеивает слова, которые Word разбил на отдельные прогоны", async () => {
    // Абзац вырезан дословно из «Шаблон ИБ 2026_10.docx». Word разбил
    // «Anamnes morbi:» на три прогона, потому что проверка орфографии считает
    // «Anamnes» и «morbi» разными словами, а пробел вынесла в середину
    // отдельным прогоном с xml:space="preserve". Если такие прогоны
    // выбрасывать, заголовок превращается в «Anamnesmorbi» — и раздел
    // перестаёт находиться в SECTION_MAP при следующей сборке шаблона.
    const paragraph =
      '<w:p w14:paraId="095EFFD9" w:rsidR="00D5743C"><w:pPr><w:rPr><w:b/></w:rPr></w:pPr>' +
      '<w:proofErr w:type="spellStart"/>' +
      '<w:r><w:rPr><w:b/><w:lang w:val="en-US"/></w:rPr><w:t>Anamnes</w:t></w:r>' +
      '<w:proofErr w:type="spellEnd"/>' +
      '<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>' +
      '<w:proofErr w:type="spellStart"/>' +
      '<w:r><w:rPr><w:b/><w:lang w:val="en-US"/></w:rPr><w:t>morbi</w:t></w:r>' +
      '<w:proofErr w:type="spellEnd"/>' +
      '<w:r><w:rPr><w:b/></w:rPr><w:t>:</w:t></w:r></w:p>';

    const paragraphs = parseWordParagraphs(paragraph);

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].text).toBe("Anamnes morbi:");
    expect(paragraphs[0].bold).toBe(true);
  });

  it("на файле не от Word отвечает понятной ошибкой", async () => {
    const notDocx = new TextEncoder().encode("это просто текст");
    await expect(parseDictionaryDocx(toArrayBuffer(notDocx))).rejects.toThrow(/каталог архива/);
  });

  it("пустой справочник даёт пустой список, а не падение", async () => {
    const parsed = await roundTrip([]);
    expect(parsed.sections).toEqual([]);
    expect(parsed.warnings).toEqual([]);
  });
});
