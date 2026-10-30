/**
 * Справочник ↔ документ Word (.docx).
 *
 * Зачем свой модуль, а не библиотека. Нужны ровно две вещи: собрать архив из
 * четырёх XML-файлов и разобрать такой же архив обратно. Ради этого тащить
 * в сборку zip-библиотеку на сотню килобайт смысла нет: браузер сам умеет
 * разжимать (`DecompressionStream`), а запись без сжатия — шестьдесят строк.
 *
 * Формат документа повторяет «Шаблон ИБ», по которому врач уже работает:
 *
 *     Жалобы                                  ← жирный абзац = раздел
 *     Тяжесть в ногах к вечеру                ← обычный абзац = запись
 *     Отечность голеней | Отёки к вечеру      ← краткое имя | полный текст
 *     Состояние после                         ← подсказка
 *     -флебэктомии                            ← дефис = подпункт
 *
 * Поэтому выгруженный файл можно править в Word и загружать обратно: дефис
 * остаётся разметкой подпункта, `|` отделяет полный текст (тот же разделитель,
 * что в «Вставить из буфера»), а цвет шрифта переносится как цвет текста.
 *
 * Два правила, добытые на настоящем файле доктора (2026-10-31), — их легко
 * нарушить «для удобства» и потом неделю искать пропавшие строки:
 *
 *   • Табуляция — не текст и не разделитель. В документе она стоит отступом
 *     и выравниванием («протяженность\tкатетров»), поэтому при чтении
 *     становится пробелом. Если считать её разделителем «краткое | полное»,
 *     строки с отступом начинаются с пустого поля и пропадают целиком.
 *   • Пробельный прогон — это текст. Word разбивает «Anamnes morbi» на три
 *     прогона, когда проверка орфографии подчёркивает слова по отдельности,
 *     и выносит пробел в середину отдельным `<w:r>`. Выбросить его — значит
 *     получить «Anamnesmorbi».
 *
 * Ограничение: если в самом тексте записи встретится `|`, при чтении он
 * разделит запись на краткую и полную часть. В справочнике доктора таких
 * строк нет (проверено на шаблоне 2026-10), но помнить об этом стоит.
 */

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type DictionaryDocEntry = {
  /** Текст записи как он лежит в справочнике: с дефисом у подпункта. */
  short: string;
  full: string;
  /** `#rrggbb` или пустая строка. */
  color: string;
};

export type DictionaryDocSection = {
  title: string;
  entries: DictionaryDocEntry[];
};

export type ParsedDictionary = {
  sections: DictionaryDocSection[];
  warnings: string[];
};

/* ------------------------------------------------------------------ ZIP --- */

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = crcTable[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * Сборка архива без сжатия.
 *
 * Word читает такие файлы наравне со сжатыми, а нам не нужно ждать
 * асинхронный `CompressionStream` и следить за порядком потоков. Справочник
 * клиники — это сотни килобайт, экономить здесь нечего.
 */
const zipStore = (files: Array<{ name: string; data: Uint8Array }>): Uint8Array => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosTime =
    ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const dosDate =
    (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    // 0x0800 — имена в UTF-8. Без этого флага Word покажет кракозябры вместо
    // «Справочник».
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    chunks.push(local, file.data);

    const entry = new Uint8Array(46 + nameBytes.length);
    const entryView = new DataView(entry.buffer);
    entryView.setUint32(0, 0x02014b50, true);
    entryView.setUint16(4, 20, true);
    entryView.setUint16(6, 20, true);
    entryView.setUint16(8, 0x0800, true);
    entryView.setUint16(10, 0, true);
    entryView.setUint16(12, dosTime, true);
    entryView.setUint16(14, dosDate, true);
    entryView.setUint32(16, crc, true);
    entryView.setUint32(20, file.data.length, true);
    entryView.setUint32(24, file.data.length, true);
    entryView.setUint16(28, nameBytes.length, true);
    entryView.setUint32(42, offset, true);
    entry.set(nameBytes, 46);
    central.push(entry);

    offset += local.length + file.data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of [...chunks, ...central, end]) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
};

const findEndOfCentralDirectory = (data: Uint8Array) => {
  const oldest = Math.max(0, data.length - 0xffff - 22);
  for (let index = data.length - 22; index >= oldest; index -= 1) {
    if (
      data[index] === 0x50 &&
      data[index + 1] === 0x4b &&
      data[index + 2] === 0x05 &&
      data[index + 3] === 0x06
    ) {
      return index;
    }
  }
  return -1;
};

/** Разжимание потока без Blob/Response: так модуль работает и в Node, и в браузере. */
const inflateRaw = async (data: Uint8Array): Promise<Uint8Array> => {
  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  // Копия в собственный буфер: `DecompressionStream` не принимает вид на
  // разделяемую память, а `subarray` из разбора архива именно такой.
  void writer.write(new Uint8Array(data));
  void writer.close();

  const reader = stream.readable.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    size += value.length;
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

/**
 * Чтение архива. Размеры берём из центрального каталога, а не из локального
 * заголовка: Word пишет их нулями и кладёт настоящие в «data descriptor»
 * после данных, если стоит флаг 0x08.
 */
const unzip = async (data: Uint8Array): Promise<Map<string, Uint8Array>> => {
  const end = findEndOfCentralDirectory(data);
  if (end < 0) throw new Error("не найден каталог архива");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const count = view.getUint16(end + 10, true);
  let pointer = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  const files = new Map<string, Uint8Array>();

  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) break;
    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(data.subarray(pointer + 46, pointer + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = data.subarray(start, start + compressedSize);
    files.set(name, method === 0 ? raw : await inflateRaw(raw));

    pointer += 46 + nameLength + extraLength + commentLength;
  }
  return files;
};

/* ----------------------------------------------------------------- DOCX --- */

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paragraph = (text: string, options: { bold?: boolean; color?: string; indent?: boolean } = {}) => {
  const properties = [
    options.bold ? "<w:spacing w:before=\"240\" w:after=\"60\"/>" : null,
    options.indent ? '<w:ind w:left="425"/>' : null,
  ]
    .filter(Boolean)
    .join("");
  const runProperties = [
    options.bold ? "<w:b/>" : null,
    options.color ? `<w:color w:val="${options.color.replace("#", "")}"/>` : null,
  ]
    .filter(Boolean)
    .join("");
  return (
    `<w:p>${properties ? `<w:pPr>${properties}</w:pPr>` : ""}<w:r>` +
    `${runProperties ? `<w:rPr>${runProperties}</w:rPr>` : ""}` +
    `<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
  );
};

const documentXml = (sections: DictionaryDocSection[], heading: string) => {
  const body: string[] = [];
  if (heading) body.push(paragraph(heading, { bold: true }));
  for (const section of sections) {
    body.push(paragraph(section.title, { bold: true }));
    for (const entry of section.entries) {
      const isChild = /^\s*[-–—]/.test(entry.short);
      const text = entry.full ? `${entry.short} | ${entry.full}` : entry.short;
      body.push(paragraph(text, { color: entry.color || undefined, indent: isChild }));
    }
  }
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<w:document xmlns:w="${W_NS}"><w:body>${body.join("")}` +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1134"/></w:sectPr>' +
    "</w:body></w:document>"
  );
};

const CONTENT_TYPES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  `<Override PartName="/word/document.xml" ContentType="${DOCX_MIME}.main+xml"/>` +
  "</Types>";

const ROOT_RELS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" ' +
  'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" ' +
  'Target="word/document.xml"/></Relationships>';

/** Собирает .docx из разделов справочника. */
export const buildDictionaryDocx = (
  sections: DictionaryDocSection[],
  heading = "",
): Uint8Array => {
  const encoder = new TextEncoder();
  return zipStore([
    { name: "[Content_Types].xml", data: encoder.encode(CONTENT_TYPES) },
    { name: "_rels/.rels", data: encoder.encode(ROOT_RELS) },
    { name: "word/document.xml", data: encoder.encode(documentXml(sections, heading)) },
  ]);
};

const decodeEntities = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");

type ParsedParagraph = { text: string; bold: boolean; color: string };

/**
 * Разбор `word/document.xml`.
 *
 * Регулярные выражения, а не DOMParser: файл нужен в двух местах — в браузере
 * и в проверке на Node, — а разметка Word здесь простая и предсказуемая.
 * Тот же приём уже используется в `scripts/build-ib-template.mjs`.
 */
export const parseWordParagraphs = (xml: string): ParsedParagraph[] => {
  const paragraphs: ParsedParagraph[] = [];
  const paragraphPattern = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;

  for (const match of xml.matchAll(paragraphPattern)) {
    const body = match[1];
    const runs = [...body.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)];
    let text = "";
    let bold = false;
    let color = "";
    let formatKnown = false;

    for (const run of runs) {
      const inner = run[1];
      const pieces = [...inner.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((piece) =>
        decodeEntities(piece[1]),
      );
      const hasTab = /<w:tab\s*\/>/.test(inner);
      // Табуляция в этом документе — не текст, а выравнивание: врач ставит её
      // вместо отступа и между колонками («протяженность\tкатетров»). Пробел
      // читается как пробел, а прежняя сборка шаблона выбрасывала её совсем,
      // из-за чего слова слипались в «катетров( см)».
      const runText = pieces.join("") + (hasTab ? " " : "");
      if (!runText) continue;
      // Пробельный прогон — это тоже текст. Word выносит пробел между словами
      // в отдельный `<w:r>` с `xml:space="preserve"`, когда проверка орфографии
      // подчёркивает слова по отдельности: «Anamnes» + « » + «morbi».
      // Выбрасывать такие прогоны нельзя — слова слипнутся в «Anamnesmorbi».
      text += runText;
      if (!formatKnown && runText.trim()) {
        const boldTag = inner.match(/<w:b(?:\s[^>]*)?\/>/);
        bold = Boolean(boldTag) && !/w:val="(?:0|false)"/.test(boldTag?.[0] ?? "");
        const colorTag = inner.match(/<w:color\s+w:val="([0-9A-Fa-f]{6})"/);
        color = colorTag ? `#${colorTag[1].toLowerCase()}` : "";
        formatKnown = true;
      }
    }

    if (!text.trim()) continue;
    paragraphs.push({ text: text.replace(/\s+$/, ""), bold, color });
  }

  return paragraphs;
};

/** Разбирает .docx обратно в разделы справочника. */
export const parseDictionaryDocx = async (data: ArrayBuffer): Promise<ParsedDictionary> => {
  const files = await unzip(new Uint8Array(data));
  const documentPart = files.get("word/document.xml");
  if (!documentPart) {
    throw new Error("в файле нет word/document.xml — это не документ Word");
  }

  const xml = new TextDecoder().decode(documentPart);
  const paragraphs = parseWordParagraphs(xml);
  const sections: DictionaryDocSection[] = [];
  const warnings: string[] = [];

  for (const item of paragraphs) {
    const isChild = /^\s*[-–—]/.test(item.text);
    // Раздел — жирный абзац без дефиса. Подпункт жирным не бывает: врач
    // выделяет жирным именно заголовки.
    if (item.bold && !isChild) {
      sections.push({ title: item.text.replace(/\s*:\s*$/, "").trim(), entries: [] });
      continue;
    }
    if (sections.length === 0) {
      // Текст до первого заголовка — обычно название документа. Не теряем
      // молча: показываем в отчёте, чтобы это не выглядело пропажей.
      warnings.push(`строка до первого раздела пропущена: «${item.text.slice(0, 40)}»`);
      continue;
    }
    // Разделитель «краткое | полное» — только вертикальная черта. Табуляцию
    // сюда пускать нельзя: в документе она стоит отступом в начале строки, и
    // тогда первым полем оказывается пустота, а запись пропадает целиком.
    // Именно так исчезали «Госпитальный комплекс», «ОАК» и «Сахар крови».
    const [shortPart, ...rest] = item.text.split("|");
    const short = shortPart.trim();
    if (!short) continue;
    sections[sections.length - 1].entries.push({
      short,
      full: rest.map((part) => part.trim()).join(" | "),
      color: item.color,
    });
  }

  return {
    sections: sections.filter((section) => section.entries.length > 0),
    warnings,
  };
};
