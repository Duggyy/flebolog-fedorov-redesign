export type ConferencePhoto = {
  src: string;
  alt: string;
};

export type ConferenceAlbum = {
  slug: string;
  title: string;
  sourceUrl: string;
  cover: string;
  photos: ConferencePhoto[];
};

const sourceBaseUrl = "https://flebologfedorov.ru/?design=114&gallery=";

const afrPiter2024Photos = [
  "/images/conferences/afr-piter-2024/photo-01.jpg",
  "/images/conferences/afr-piter-2024/photo-02.jpg",
  "/images/conferences/afr-piter-2024/photo-03.jpg",
  "/images/conferences/afr-piter-2024/photo-04.jpg",
  "/images/conferences/afr-piter-2024/photo-05.jpg",
  "/images/conferences/afr-piter-2024/photo-06.jpg",
  "/images/conferences/afr-piter-2024/photo-07.jpg",
  "/images/conferences/afr-piter-2024/photo-08.jpg",
  "/images/conferences/afr-piter-2024/photo-09.jpg",
  "/images/conferences/afr-piter-2024/photo-10.jpg",
  "/images/conferences/afr-piter-2024/photo-11.jpg",
  "/images/conferences/afr-piter-2024/photo-12.jpg",
  "/images/conferences/afr-piter-2024/photo-13.jpg",
  "/images/conferences/afr-piter-2024/photo-14.jpg",
  "/images/conferences/afr-piter-2024/photo-15.jpg",
  "/images/conferences/afr-piter-2024/photo-16.jpg",
];

const piterRozhdVstr2023Photos = Array.from(
  { length: 24 },
  (_, index) =>
    `/images/conferences/Piter-rozhd-vstr-2023/photo-${String(index + 1).padStart(2, "0")}.jpg`,
);

const ufaBashkirVenForum2023Photos = Array.from(
  { length: 17 },
  (_, index) =>
    `/images/conferences/Ufa-Bashkir-Ven-Forum-2023/photo-${String(index + 1).padStart(2, "0")}.jpg`,
);

const makePhotos = (title: string, images: string[]): ConferencePhoto[] =>
  images.map((src, index) => ({
    src,
    alt: `${title}. Фото ${index + 1}`,
  }));

export const conferenceAlbums: ConferenceAlbum[] = [
  {
    slug: "afr-piter-2024",
    title: "Конференция АФР Питер - 2024 г.",
    sourceUrl: `${sourceBaseUrl}24`,
    cover: afrPiter2024Photos[0],
    photos: makePhotos("Конференция АФР Питер - 2024 г.", afrPiter2024Photos),
  },
  {
    slug: "piter-rozhdestvenskie-vstrechi-2023",
    title: "Питер Рождественские встречи - 2023 г.",
    sourceUrl: `${sourceBaseUrl}23`,
    cover: piterRozhdVstr2023Photos[0],
    photos: makePhotos("Питер Рождественские встречи - 2023 г.", piterRozhdVstr2023Photos),
  },
  {
    slug: "ufa-bashkirsky-venous-forum-2023",
    title: "Уфа Башкирский венозный форум - 2023 г.",
    sourceUrl: `${sourceBaseUrl}22`,
    cover: ufaBashkirVenForum2023Photos[0],
    photos: makePhotos("Уфа Башкирский венозный форум - 2023 г.", ufaBashkirVenForum2023Photos),
  },
  {
    slug: "barnaul-altay-venous-forum-2023",
    title: "Барнаул АЛТАЙСКИЙ венозный форум - 2023 г.",
    sourceUrl: `${sourceBaseUrl}21`,
    cover: "/images/news-1.jpg",
    photos: makePhotos("Барнаул АЛТАЙСКИЙ венозный форум - 2023 г.", ["/images/news-1.jpg"]),
  },
  {
    slug: "akademiya-prakticheskoy-flebologii-2023",
    title: "Академия практической флебологии - 2023 г.",
    sourceUrl: `${sourceBaseUrl}20`,
    cover: "/images/news-2.jpg",
    photos: makePhotos("Академия практической флебологии - 2023 г.", ["/images/news-2.jpg"]),
  },
  {
    slug: "gelendzhik-2023",
    title: "Геленджик Научно практическая конференция - 2023 г.",
    sourceUrl: `${sourceBaseUrl}19`,
    cover: "/images/news-5.jpg",
    photos: makePhotos("Геленджик Научно практическая конференция - 2023 г.", ["/images/news-5.jpg"]),
  },
  {
    slug: "saint-petersburg-rozhdestvenskie-vstrechi-2022",
    title: "Санкт-Петербург: Рождественские встречи - 2022 г.",
    sourceUrl: `${sourceBaseUrl}18`,
    cover: "/images/news-3.jpg",
    photos: makePhotos("Санкт-Петербург: Рождественские встречи - 2022 г.", ["/images/news-3.jpg"]),
  },
  {
    slug: "novosibirsk-2022",
    title: "Новосибирск - 2022 г.",
    sourceUrl: `${sourceBaseUrl}17`,
    cover: "/images/news-3.jpg",
    photos: makePhotos("Новосибирск - 2022 г.", ["/images/news-3.jpg"]),
  },
  {
    slug: "yaroslavl-2021",
    title: "Ярославль - 2021 г.",
    sourceUrl: `${sourceBaseUrl}16`,
    cover: "/images/news-5.jpg",
    photos: makePhotos("Ярославль - 2021 г.", ["/images/news-5.jpg"]),
  },
  {
    slug: "tashkent-2021",
    title: "Ташкент - 2021 г.",
    sourceUrl: `${sourceBaseUrl}15`,
    cover: "/images/news-2.jpg",
    photos: makePhotos("Ташкент - 2021 г.", ["/images/news-2.jpg"]),
  },
  {
    slug: "novosibirsk-2021",
    title: "Новосибирск - 2021 г.",
    sourceUrl: `${sourceBaseUrl}14`,
    cover: "/images/news-3.jpg",
    photos: makePhotos("Новосибирск - 2021 г.", ["/images/news-3.jpg"]),
  },
  {
    slug: "moscow-2021",
    title: "Москва - 2021 г.",
    sourceUrl: `${sourceBaseUrl}13`,
    cover: "/images/news-2.jpg",
    photos: makePhotos("Москва - 2021 г.", ["/images/news-2.jpg"]),
  },
  {
    slug: "krasnodar-2021",
    title: "Краснодар - 2021 г.",
    sourceUrl: `${sourceBaseUrl}12`,
    cover: "/images/news-4.jpg",
    photos: makePhotos("Краснодар - 2021 г.", ["/images/news-4.jpg"]),
  },
  {
    slug: "barnaul-pyatigorsk-2021",
    title: "Барнаул Пятигорск - 2021 г.",
    sourceUrl: `${sourceBaseUrl}11`,
    cover: "/images/news-1.jpg",
    photos: makePhotos("Барнаул Пятигорск - 2021 г.", ["/images/news-1.jpg"]),
  },
  {
    slug: "sochi-2020",
    title: "Сочи - 2020 г.",
    sourceUrl: `${sourceBaseUrl}10`,
    cover: "/images/news-5.jpg",
    photos: makePhotos("Сочи - 2020 г.", ["/images/news-5.jpg"]),
  },
  {
    slug: "kaliningrad-2020",
    title: "Калининград - 2020 г.",
    sourceUrl: `${sourceBaseUrl}9`,
    cover: "/images/news-5.jpg",
    photos: makePhotos("Калининград - 2020 г.", ["/images/news-5.jpg"]),
  },
  {
    slug: "moscow-2020",
    title: "Москва - 2020 г.",
    sourceUrl: `${sourceBaseUrl}8`,
    cover: "/images/news-2.jpg",
    photos: makePhotos("Москва - 2020 г.", ["/images/news-2.jpg"]),
  },
  {
    slug: "saint-petersburg-rozhdestvenskie-vstrechi-2019",
    title: "Санкт-Петербург: Рождественские встречи - 2019 г.",
    sourceUrl: `${sourceBaseUrl}7`,
    cover: "/images/news-3.jpg",
    photos: makePhotos("Санкт-Петербург: Рождественские встречи - 2019 г.", ["/images/news-3.jpg"]),
  },
  {
    slug: "abrau-durso-2019",
    title: "Абрау Дюрсо - 2019 г.",
    sourceUrl: `${sourceBaseUrl}6`,
    cover: "/images/news-5.jpg",
    photos: makePhotos("Абрау Дюрсо - 2019 г.", ["/images/news-5.jpg"]),
  },
  {
    slug: "moscow-2019",
    title: "Москва - 2019 г.",
    sourceUrl: `${sourceBaseUrl}5`,
    cover: "/images/news-2.jpg",
    photos: makePhotos("Москва - 2019 г.", ["/images/news-2.jpg"]),
  },
  {
    slug: "saint-petersburg-belie-nochi-2019",
    title: "Санкт-Петербург: Белые ночи - 2019 г.",
    sourceUrl: `${sourceBaseUrl}4`,
    cover: "/images/news-3.jpg",
    photos: makePhotos("Санкт-Петербург: Белые ночи - 2019 г.", ["/images/news-3.jpg"]),
  },
  {
    slug: "riga-2018",
    title: "Рига - 2018 г.",
    sourceUrl: `${sourceBaseUrl}3`,
    cover: "/images/news-14.jpg",
    photos: makePhotos("Рига - 2018 г.", ["/images/news-14.jpg"]),
  },
];
