/**
 * Карта «раздел документа → поле формы».
 *
 * Проверяем на настоящих названиях из «Шаблон ИБ 2026_10.docx»: именно на них
 * 01.11.2026 выяснилось, что загрузка из Word не знала карты и отказывалась
 * брать 15 разделов из 26 (367 записей из 583). Тест держит это правило.
 */
import { describe, expect, it } from "vitest";
import { ignoreHeaderPattern, mapDocumentSections } from "./ib-section-map";

const FIELDS = ["Жалобы", "Анамнез заболевания", "Основное заболевание", "Локальный осмотр"];

const section = (title: string, entries: string[]) => ({
  title,
  entries: entries.map((short) => ({ short, full: "", color: "" })),
});

describe("карта разделов", () => {
  it("приводит название из документа к подписи поля", () => {
    const { sections, unknown } = mapDocumentSections(
      [section("Anamnes morbi", ["Тяжесть в ногах"]), section("ДИАГНОЗ", ["Варикоз"])],
      FIELDS,
    );

    expect(unknown).toEqual([]);
    expect(sections.map((item) => item.title)).toEqual(["Анамнез заболевания", "Основное заболевание"]);
  });

  it("раскладывает раздел в несколько полей, если формулировки не называют сторону", () => {
    const { sections } = mapDocumentSections([section("УЗИ: МПВ", ["Рефлюкс 2 ст."])], [
      ...FIELDS,
      "Правая нижняя конечность: бассейн МПВ",
      "Левая нижняя конечность: бассейн МПВ",
    ]);

    expect(sections.map((item) => item.title)).toEqual([
      "Правая нижняя конечность: бассейн МПВ",
      "Левая нижняя конечность: бассейн МПВ",
    ]);
  });

  it("точная подпись поля сильнее карты", () => {
    // «Жалобы» есть и в карте (как «Жалобы:»), и в форме. Правило не должно
    // увести раздел в другое поле.
    const { sections } = mapDocumentSections([section("Жалобы", ["Отеки"])], FIELDS);
    expect(sections.map((item) => item.title)).toEqual(["Жалобы"]);
  });

  it("не дублирует записи, когда несколько разделов ложатся в одно поле", () => {
    const { sections } = mapDocumentSections(
      [
        section("Осмотр, кожные покровы", ["Трофическая язва"]),
        section("Вены", ["Трофическая язва"]),
      ],
      FIELDS,
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Локальный осмотр");
    expect(sections[0].entries.map((entry) => entry.short)).toEqual(["Трофическая язва"]);
  });

  it("раздел без правила попадает в отчёт, а не в базу", () => {
    const { sections, unknown } = mapDocumentSections(
      [section("Раздел, которого нет в форме", ["Запись"])],
      FIELDS,
    );

    expect(sections).toEqual([]);
    expect(unknown).toEqual([{ title: "Раздел, которого нет в форме", count: 1 }]);
  });

  it("жирные коды МКБ и служебное «-и» — не заголовки разделов", () => {
    // Без этого 15 записей «Код МКБ» уезжали в несуществующее поле и пропадали:
    // строки «I87.8 Другие уточнённые поражения вен» выделены жирным.
    expect(ignoreHeaderPattern.test("I87.8 Другие уточнённые поражения вен")).toBe(true);
    expect(ignoreHeaderPattern.test("-и")).toBe(true);
    expect(ignoreHeaderPattern.test("Шаблон ИБ 2026_10")).toBe(true);
    expect(ignoreHeaderPattern.test("Anamnes morbi")).toBe(false);
    expect(ignoreHeaderPattern.test("ДИАГНОЗ")).toBe(false);
  });
});
