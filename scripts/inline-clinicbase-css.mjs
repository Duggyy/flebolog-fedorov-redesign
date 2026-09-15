import { readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist-clinicbase";
const htmlPath = join(distDir, "clinicbase.html");
let html = await readFile(htmlPath, "utf8");
const cssMatch = html.match(/<link rel="stylesheet"[^>]+href="([^"]+\.css)"[^>]*>/);

if (cssMatch) {
  const cssPath = join(distDir, cssMatch[1].replace(/^\//, ""));
  const css = await readFile(cssPath, "utf8");
  html = html.replace(cssMatch[0], `<style>${css}</style>`);
  await writeFile(htmlPath, html);

  // CSS теперь внутри HTML — внешний файл больше никем не используется.
  // Убираем, чтобы не выкладывать на хостинг 79 КБ мёртвого груза.
  // Best-effort: в окружении агента удаление может блокироваться защитой от
  // массового удаления — это не повод ронять сборку, файл просто останется
  // лежать (на работоспособность не влияет, predeploy-check его покажет).
  try {
    await unlink(cssPath);
    console.log(`inline-clinicbase-css: ${cssMatch[1]} заинлайнен в HTML и удалён`);
  } catch (error) {
    const reason = /BULK_CONFIRM_REQUIRED/.test(String(error))
      ? "сработала защита от массового удаления"
      : String(error?.message || error).split("\n")[0];
    console.warn(
      `inline-clinicbase-css: CSS заинлайнен, но ${cssMatch[1]} удалить не удалось (${reason}) — ` +
        "файл можно не выкладывать",
    );
  }
}
