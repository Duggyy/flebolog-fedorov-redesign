export type ConferencePhoto = {
  /** Небольшая миниатюра для сетки. */
  thumb: string;
  /** Полноразмерное фото для просмотра. */
  full: string;
  alt: string;
};

export type ConferenceAlbum = {
  slug: string;
  title: string;
  /** Страница альбома на старом сайте (источник материалов). */
  sourceUrl: string;
  /** Обложка альбома — миниатюра первого фото, как на старом сайте. */
  cover: string;
  photos: ConferencePhoto[];
};

const sourceBaseUrl = "https://flebologfedorov.ru/?design=114&gallery=";

const makePhotos = (folder: string, title: string, count: number): ConferencePhoto[] =>
  Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      thumb: `/images/conferences/${folder}/thumb-${number}.jpg`,
      full: `/images/conferences/${folder}/photo-${number}.jpg`,
      alt: `${title}. Фото ${index + 1}`,
    };
  });

const makeAlbum = (
  slug: string,
  title: string,
  folder: string,
  galleryId: number,
  count: number,
): ConferenceAlbum => {
  const photos = makePhotos(folder, title, count);
  return {
    slug,
    title,
    sourceUrl: `${sourceBaseUrl}${galleryId}`,
    cover: photos[0].thumb,
    photos,
  };
};

/**
 * Альбомы «Фото с конференций» в том же порядке, что на flebologfedorov.ru.
 * Фотографии и подписи взяты со старого сайта без изменений.
 */
export const conferenceAlbums: ConferenceAlbum[] = [
  makeAlbum("afr-piter-2024", "Конференция АФР Питер - 2024 г.", "afr-piter-2024", 24, 16),
  makeAlbum("piter-rozhdestvenskie-vstrechi-2023", "Питер Рождественские встречи - 2023 г.", "Piter-rozhd-vstr-2023", 23, 24),
  makeAlbum("ufa-bashkirsky-venous-forum-2023", "Уфа Башкирский венозный форум - 2023 г.", "Ufa-Bashkir-Ven-Forum-2023", 22, 17),
  makeAlbum("barnaul-altaysky-venous-forum-2023", "Барнаул АЛТАЙСКИЙ венозный форум - 2023 г.", "barnaul-altaysky-venous-forum-2023", 21, 16),
  makeAlbum("akademiya-prakticheskoy-flebologii-2023", "Академия практической флебологии - 2023 г.", "akademiya-prakticheskoy-flebologii-2023", 20, 8),
  makeAlbum("gelendzhik-2023", "Геленджик Научно практическая конференция - 2023 г.", "gelendzhik-2023", 19, 18),
  makeAlbum("sankt-peterburg-rozhdestvenskie-vstrechi-2022", "Санкт-Петербург: Рождественские встречи - 2022 г.", "sankt-peterburg-rozhdestvenskie-vstrechi-2022", 15, 13),
  makeAlbum("novosibirsk-2022", "Новосибирск - 2022 г.", "novosibirsk-2022", 14, 5),
  makeAlbum("yaroslavl-2021", "Ярославль - 2021 г.", "yaroslavl-2021", 13, 5),
  makeAlbum("tashkent-2021", "Ташкент - 2021 г.", "tashkent-2021", 12, 21),
  makeAlbum("novosibirsk-2021", "Новосибирск - 2021 г.", "novosibirsk-2021", 11, 7),
  makeAlbum("moskva-2021", "Москва - 2021 г.", "moskva-2021", 10, 8),
  makeAlbum("krasnodar-2021", "Краснодар - 2021 г.", "krasnodar-2021", 9, 8),
  makeAlbum("barnaul-pyatigorsk-2021", "Барнаул Пятигорск - 2021 г.", "barnaul-pyatigorsk-2021", 8, 15),
  makeAlbum("sochi-2020", "Сочи - 2020 г.", "sochi-2020", 7, 2),
  makeAlbum("kaliningrad-2020", "Калининград - 2020 г.", "kaliningrad-2020", 5, 10),
  makeAlbum("moskva-2020", "Москва - 2020 г.", "moskva-2020", 4, 10),
  makeAlbum("sankt-peterburg-rozhdestvenskie-vstrechi-2019", "Санкт-Петербург: Рождественские встречи - 2019 г.", "sankt-peterburg-rozhdestvenskie-vstrechi-2019", 16, 6),
  makeAlbum("abrau-dyurso-2019", "Абрау Дюрсо - 2019 г.", "abrau-dyurso-2019", 3, 14),
  makeAlbum("moskva-2019", "Москва - 2019 г.", "moskva-2019", 2, 2),
  makeAlbum("sankt-peterburg-belye-nochi-2019", "Санкт-Петербург: Белые ночи - 2019 г.", "sankt-peterburg-belye-nochi-2019", 1, 6),
  makeAlbum("riga-2018", "Рига - 2018 г.", "riga-2018", 6, 8),
];
