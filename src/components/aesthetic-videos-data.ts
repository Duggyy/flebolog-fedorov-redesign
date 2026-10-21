/**
 * Видео раздела «Эстетическая флебология».
 *
 * Ролики сняты в клинике и показывают процедуру вблизи: руки до/после,
 * работа с сосудистыми звёздочками, сеанс с аппаратом. Вертикальные (9:16),
 * поэтому в сетке это карточки с постером, а сам плеер открывается поверх
 * страницы — три автозапускающихся плеера на одном экране не нужны.
 *
 * Файлы: `public/videos/aesthetic/<id>.mp4` и `<id>.jpg` (постер 720×1280).
 * Кодируются скриптом `.workbuddy-ai/tools/encode-web-video.py`:
 * 720×1280, CRF 25, звук выровнен по −11.4 LUFS, как у роликов «Видео-практики».
 */
export type AestheticVideo = {
  /** Имя файла без расширения */
  id: string;
  /** Заголовок на карточке и в плеере */
  title: string;
  /** Пояснение под заголовком. Короткое: одна-две строки */
  caption: string;
};

export const aestheticVideos: AestheticVideo[] = [
  {
    id: "hands-before-after",
    title: "Руки: до и после",
    caption: "Вены на руках до процедуры и после курса лечения.",
  },
  {
    id: "vein-closeup",
    title: "Крупный план: исчезает вена",
    caption: "Сосудистые звёздочки вблизи — так выглядит работа с ними.",
  },
  {
    id: "laser-session",
    title: "Процедура в работе",
    caption: "Аппарат в руках врача: как проходит сеанс.",
  },
];

export const aestheticVideoSrc = (id: string) => `/videos/aesthetic/${id}.mp4`;
export const aestheticVideoPoster = (id: string) => `/videos/aesthetic/${id}.jpg`;
