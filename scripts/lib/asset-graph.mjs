/**
 * Определение «нужных» и «устаревших» файлов в папке сборки.
 *
 * Считаем достижимость от `index.html`: файл нужен, если на него ссылается
 * index.html или любой файл, до которого уже добрались (JS/CSS ссылаются на
 * свои чанки, картинки, шрифты). Всё, до чего добраться не удалось, — остаток
 * прошлых сборок.
 *
 * ⚠️ Почему нельзя просто искать «файлы, на которые никто не ссылается».
 * Vite кладёт в каждый ленивый чанк карту предзагрузки, где перечислены имена
 * его зависимостей, включая входной чанк. Поэтому остатки прошлой сборки
 * ссылаются друг на друга и образуют замкнутый кластер: старый входной чанк
 * «упомянут» в старых ленивых чанках, а те — в нём. Проверено: такой поиск
 * давал 0 брошенных файлов там, где их было 46. Достижимость от index.html
 * этой ловушки не имеет.
 *
 * ⚠️ Порядок важен: функцию имеет смысл вызывать ПОСЛЕ сборки. До неё в папке
 * лежит index.html прошлой сборки, и от него достижимо ровно прошлое поколение
 * — то есть «устаревших» окажется ноль.
 */
import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} distDir папка сборки
 * @returns {{ all: string[], reachable: string[], stale: string[] }}
 *   имена файлов относительно `assets/`
 */
export const findUnreachableAssets = (distDir) => {
  const assetsDir = path.join(distDir, "assets");
  const indexPath = path.join(distDir, "index.html");

  if (!fs.existsSync(assetsDir) || !fs.existsSync(indexPath)) {
    return { all: [], reachable: [], stale: [] };
  }

  const all = fs
    .readdirSync(assetsDir)
    .filter((name) => fs.statSync(path.join(assetsDir, name)).isFile());
  const allSet = new Set(all);

  const reachable = new Set();
  const queue = [];

  const seedFrom = (content) => {
    for (const name of allSet) {
      if (!reachable.has(name) && content.includes(name)) {
        reachable.add(name);
        queue.push(name);
      }
    }
  };

  seedFrom(fs.readFileSync(indexPath, "utf8"));

  while (queue.length) {
    const name = queue.shift();
    if (!/\.(js|css)$/.test(name)) continue;
    seedFrom(fs.readFileSync(path.join(assetsDir, name), "utf8"));
  }

  return {
    all,
    reachable: all.filter((name) => reachable.has(name)),
    stale: all.filter((name) => !reachable.has(name)),
  };
};
