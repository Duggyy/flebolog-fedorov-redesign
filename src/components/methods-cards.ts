/**
 * Карточки блока «Как мы лечим» на главной странице.
 *
 * Вынесены отдельным маленьким модулем: полные тексты методов лежат в
 * `methods-data.ts` и подгружаются лениво вместе со страницей `/methods/...`,
 * а главной нужны только подписи, фон и адрес. Здесь же строится сам адрес,
 * чтобы список карточек и список маршрутов не расходились.
 */

export type MethodCard = {
  slug: string;
  /** Название на карточке. */
  label: string;
  /** Пояснение под названием. */
  desc?: string;
  /** Фоновое изображение карточки. */
  image: string;
};

export const methodCards: MethodCard[] = [
  {
    slug: "skleroterapiya",
    label: "Склеротерапия",
    desc: "лечение вен без операции",
    image: "/images/method-microsklerotherapy.jpg",
  },
  {
    slug: "laser",
    label: "Лечение варикоза лазером",
    desc: "ЭВЛК",
    image: "/images/method-laser.png",
  },
  {
    slug: "operacii",
    label: "Малоинвазивные операции на венах",
    image: "/images/method-operacii.png",
  },
  {
    slug: "zvezdochki",
    label: "Удаление сосудистых звездочек",
    image: "/images/method-zvezdochki.png",
  },
  {
    slug: "microskleroterapia",
    label: "Микросклеротерапия",
    image: "/images/method-microsklerotherapy.jpg",
  },
];

/** Адрес страницы метода — единственное место, где он собирается. */
export const methodPath = (slug: string) => `/methods/${slug}`;
