export type Report = {
  slug: string;
  title: string;
  /** Постер (обложка). Пусто, если видео недоступно на источнике. */
  poster: string;
  /** Локальный видеофайл. Пусто, если видео недоступно на источнике. */
  video: string;
  /** Длительность в секундах. */
  duration: number;
  /** Страница источника: Rutube, либо первоисточник, если копия на Rutube снята. */
  sourceUrl: string;
};

const rutube = (id: string) => `https://rutube.ru/video/${id}/`;

/**
 * Доклады и выступления. Названия и порядок взяты со старого сайта flebologfedorov.ru.
 * Видео скачаны с Rutube и размещены локально (сжаты, H.264, faststart).
 */
export const reports: Report[] = [
  {
    slug: "total-evlo-live",
    title: "«Тотал ЭВЛО c Дмитрием Федоровым на Актуальной Флебологии LIVE»",
    poster: "/videos/reports/total-evlo-live.jpg",
    video: "/videos/reports/total-evlo-live.mp4",
    duration: 2830,
    sourceUrl: rutube("0884ad151af064a999cc37b94f79b1cd"),
  },
  {
    slug: "lazer-novoy-volny",
    title: "«Особенности клинического применения лазера новой волны» Федоров Д.А.",
    poster: "/videos/reports/lazer-novoy-volny.jpg",
    video: "/videos/reports/lazer-novoy-volny.mp4",
    duration: 1303,
    sourceUrl: rutube("beb6dfe197da35e2a5c6ea5084af78fe"),
  },
  {
    slug: "spb-venous-forum-2022",
    title: "15-й Санкт-Петербургский Венозный Форум (Рождественские встречи), 30 ноября — 02 декабря 2022 г., Санкт-Петербург, Россия.",
    poster: "/videos/reports/spb-venous-forum-2022.jpg",
    video: "/videos/reports/spb-venous-forum-2022.mp4",
    duration: 911,
    sourceUrl: rutube("b2cc26df1b1428a2b78280463284b99f"),
  },
  {
    slug: "spb-venous-forum-2021",
    title: "14-й Санкт-Петербургский Венозный Форум (Рождественские встречи), 08 — 10 декабря 2021 г., Санкт-Петербург, Россия.",
    poster: "/videos/reports/spb-venous-forum-2021.jpg",
    video: "/videos/reports/spb-venous-forum-2021.mp4",
    duration: 1041,
    sourceUrl: rutube("b3b33885a7b2c87821d3a67c37001416"),
  },
  {
    slug: "patsient-venoznaya-patologiya",
    title: "Пациент с венозной патологией на хирургическом приеме: от варикозной болезни до посттромботического синдрома",
    poster: "/videos/reports/patsient-venoznaya-patologiya.jpg",
    video: "/videos/reports/patsient-venoznaya-patologiya.mp4",
    duration: 1685,
    sourceUrl: rutube("425cabb0246dfc337133023259c273b1"),
  },
  {
    slug: "hirurgicheskoe-lechenie-21-vek",
    title: "Хирургическое лечение варикозной болезни в 21 веке. Все возможные варианты. Перспективы.",
    poster: "/videos/reports/hirurgicheskoe-lechenie-21-vek.jpg",
    video: "/videos/reports/hirurgicheskoe-lechenie-21-vek.mp4",
    duration: 5061,
    /*
     * Копия на Rutube (9e73f6a68376316c0784a74597c76442) снята по жалобе на
     * авторские права — API отвечает 404 с причиной `UGC_copyright_abuse`.
     * Видео взято с первоисточника: круглый стол «Академии практической
     * флебологии» на 1med.tv (участники Кургинян, Соломахин, Маркин, Фёдоров).
     * Права на запись принадлежат площадке, в кадре — её брендинг.
     */
    sourceUrl:
      "https://1med.tv/archive/akademiya-prakticheskoy-flebologii/akademiya-prakticheskoy-flebologii-khirurgicheskoe-lechenie-varikoznoy-bolezni-v-21-veke-vse-vozmozhnye-varianty-perspektivy-kurginyan-solomakhin-markin-fedorov/",
  },
  {
    slug: "evlk-vchera-segodnya-zavtra",
    title: "ЭВЛК: Вчера, сегодня! Завтра? Что мы ждем от этого метода?",
    poster: "/videos/reports/evlk-vchera-segodnya-zavtra.jpg",
    video: "/videos/reports/evlk-vchera-segodnya-zavtra.mp4",
    duration: 1323,
    sourceUrl: rutube("5d024058fe913041de6eaaa8c6702a25"),
  },
  {
    slug: "chto-mozhno-sdelat-pri-pomoshchi-evlt",
    title: "Что можно сделать при помощи ЭВЛК?",
    poster: "/videos/reports/chto-mozhno-sdelat-pri-pomoshchi-evlt.jpg",
    video: "/videos/reports/chto-mozhno-sdelat-pri-pomoshchi-evlt.mp4",
    duration: 1040,
    sourceUrl: rutube("9a463128f99d123643bfc600b08a0c1e"),
  },
];
