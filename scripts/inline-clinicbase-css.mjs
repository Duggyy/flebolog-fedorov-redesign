import { readFile, writeFile } from "node:fs/promises";
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
}

