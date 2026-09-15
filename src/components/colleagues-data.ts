export type Colleague = {
  slug: string;
  name: string;
  /** Полноразмерный портрет. */
  photo: string;
  /** Миниатюра для сетки. */
  thumb: string;
  /** Регалии и должности — строки списка, как на старом сайте. */
  description: string[];
};

/**
 * Коллеги — ведущие флебологи и сосудистые хирурги.
 * Имена, описания и фотографии взяты со старого сайта flebologfedorov.ru без изменений.
 */
export const colleagues: Colleague[] = [
  {
    slug: "lowell-kabnik",
    name: "Lowell Kabnik (USA)",
    photo: "/images/colleagues/lowell-kabnik/photo.jpg",
    thumb: "/images/colleagues/lowell-kabnik/thumb.jpg",
    description: [],
  },
  {
    slug: "felizitas-pannier",
    name: "Felizitas Pannier (Germany)",
    photo: "/images/colleagues/felizitas-pannier/photo.jpg",
    thumb: "/images/colleagues/felizitas-pannier/thumb.jpg",
    description: [
      "Privatdozentin Dr. med. Felizitas Pannier",
      "2008 — 2010 Член правления Немецкое общество флебологов (DGP)",
      "Член научно—консультативного совета DGP в 2010-2012 годах, а с 2012 года снова член правления DGP",
      "2009 — 2013 гг. Вице-президент Международного союза флебологов (UIP)",
      "В 2010 году она была президентом 52-го ежегодного собрания (DGP), с 2011 года она является руководителем AG эндовенозная тепловая терапия варикоза в DGP",
      "Доктор Эберхард Рабе (Германия) - почетный Президент Международного Союза Флебологов (International Union of Plebology), член-корреспондент Швейцарского государственного флебологического общества, Почетный член Американского венозного форума.",
      "Март 1988 - настоящее время Профессор в «Klinik und Poliklinik für Dermatologie und Allergologie» Бонн, Германия",
    ],
  },
  {
    slug: "alexander-flor",
    name: "Alexander Flor (Austria)",
    photo: "/images/colleagues/alexander-flor/photo.jpg",
    thumb: "/images/colleagues/alexander-flor/thumb.jpg",
    description: [],
  },
  {
    slug: "malay-patel",
    name: "Dr. Malay D. Patel (India)",
    photo: "/images/colleagues/malay-patel/photo.jpg",
    thumb: "/images/colleagues/malay-patel/thumb.jpg",
    description: [
      "Сосудистый хирург, специалист по эндоваскулярным заболеваниям и флеболог с активной частной практикой \"First Choice Vascular\" в Ахмедабаде, Индия.",
      "Сосудистое общество Индии (бывший президент).",
      "Венозная ассоциация Индии (президент-основатель).",
    ],
  },
  {
    slug: "ints-udris",
    name: "Ints Udris; Интс Удрис (Латвия)",
    photo: "/images/colleagues/ints-udris/photo.jpg",
    thumb: "/images/colleagues/ints-udris/thumb.jpg",
    description: [],
  },
  {
    slug: "uldis-maurins",
    name: "Dr. med. Uldis Mauriņš; Улдис Мауриньш (Латвия)",
    photo: "/images/colleagues/uldis-maurins/photo.jpg",
    thumb: "/images/colleagues/uldis-maurins/thumb.jpg",
    description: [],
  },
  {
    slug: "shaydakov",
    name: "Шайдаков Евгений Владимирович (Россия)",
    photo: "/images/colleagues/shaydakov/photo.jpg",
    thumb: "/images/colleagues/shaydakov/thumb.jpg",
    description: [
      "Доктор медицинских наук, профессор.",
      "С 2004 года Председатель ассоциации флебологов Санкт-Петербурга и Северо-Западного Федерального округа.",
      "С 2008 года Председатель Санкт-Петербургского Венозного Форума (ежегодной международной научно-практической конференции).",
      "Член совета директоров Университета Вен и Лимфы (Нью Йорк)",
      "Петрозаводский Государственный Университет — Профессор кафедры госпитальной хирургии",
      "Национальный медицинский исследовательский центр онкологии им Н.Н.Петрова — Ведущий научный сотрудник",
      "Санкт-Петербургская Ассоциация Флебологов — Председатель",
      "Национальная Коллегия Флебологов (НКФ, Россия) — Председатель",
      "Европейский Венозный Форум (EVF) — Паст-Президент",
      "Американский Венозный Форум (AVF) — действительный член Международного Комитета",
      "Американская Ассоциация Флеболимфологии (AVLS) — действительный член Международного Комитета",
      "Королевская Ассоциация Медицины (Лондон, Великобритания) — действительный член",
    ],
  },
  {
    slug: "zolotukhin",
    name: "Золотухин Игорь Анатольевич (Россия)",
    photo: "/images/colleagues/zolotukhin/photo.jpg",
    thumb: "/images/colleagues/zolotukhin/thumb.jpg",
    description: [
      "Профессор РАН, доктор медицинских наук.",
      "Профессор, Российский национальный исследовательский медицинский университет им. Н.И.Пирогова.",
      "Член Ассоциации флебологов России с 1998 г., Исполнительный секретарь АФР.",
      "Член American College of Phlebology, International Society on Thrombosis and Haemostasis, European Society of Vascular and Endovascular Surgery.",
    ],
  },
  {
    slug: "ilyukhin",
    name: "Илюхин Евгений Аркадьевич (Россия)",
    photo: "/images/colleagues/ilyukhin/photo.jpg",
    thumb: "/images/colleagues/ilyukhin/thumb.jpg",
    description: [
      "Кандидат медицинских наук.",
      "Вице-президент Ассоциации флебологв России (АФР), Европейского венозного форума (EVF).",
      "Член Научного совета и Исполнительного совета Ассоциации флебологов России.",
      "С 2016 г. член редакционной коллегии рецензируемого журнала Ассоциации флебологов России \"Флебология\".",
    ],
  },
  {
    slug: "bogachev",
    name: "Богачев Вадим Юрьевич (Россия)",
    photo: "/images/colleagues/bogachev/photo.jpg",
    thumb: "/images/colleagues/bogachev/thumb.jpg",
    description: [
      "Профессор, доктор медицинских наук.",
      "Лауреат премии правительства Российской Федерации в области науки и техники.",
      "Главный редактор журнала «Амбулаторная хирургия».",
      "Ответственный секретарь журнала «Флебология».",
      "Член редколлегий журналов «Медицинский совет», «Проблемы женского здоровья» и «Кардиология».",
    ],
  },
  {
    slug: "dzhenina",
    name: "Дженина Ольга Вадимовна (Россия)",
    photo: "/images/colleagues/dzhenina/photo.jpg",
    thumb: "/images/colleagues/dzhenina/thumb.jpg",
    description: [
      "Кандидат медицинских наук.",
      "Ведущий специалист по лечению тромбоэмболических осложнений.",
    ],
  },
  {
    slug: "koreshkov",
    name: "Корешков Алексей Евгеньевич (Россия)",
    photo: "/images/colleagues/koreshkov/photo.jpg",
    thumb: "/images/colleagues/koreshkov/thumb.jpg",
    description: [],
  },
  {
    slug: "shimanko",
    name: "Шиманко Александр Ильич (Россия)",
    photo: "/images/colleagues/shimanko/photo.jpg",
    thumb: "/images/colleagues/shimanko/thumb.jpg",
    description: [
      "Профессор, доктор медицинских наук.",
      "Профессор «Кафедры хирургических болезней и клинической ангиологии» Московского Государственного медико-стоматологического университета им. А.И.Евдокимова.",
      "Член Исполнительного Совета Ассоциации флебологов России.",
      "Член редакционной коллегии журнала «Флебология».",
    ],
  },
  {
    slug: "petrikov",
    name: "Петриков Алексей Сергеевич (Россия)",
    photo: "/images/colleagues/petrikov/photo.jpg",
    thumb: "/images/colleagues/petrikov/thumb.jpg",
    description: [
      "Профессор, доктор медицинских наук.",
      "Профессор кафедры факультетской хирургии им. И.И. Неймарка, госпитальной хирургии с курсом ДПО ФГБОУ ОУ АГМУ Минздрава России.",
      "Член Российского общества хирургов.",
      "Член ассоциации флебологов России.",
      "Член ассоциации сердечно-сосудистых хирургов России.",
    ],
  },
  {
    slug: "borsuk",
    name: "Борсук Денис Александрович (Россия)",
    photo: "/images/colleagues/borsuk/photo.jpg",
    thumb: "/images/colleagues/borsuk/thumb.jpg",
    description: [
      "Врач сердечно-сосудистый хирург, флеболог.",
      "Основатель и главный врач сети \"Клиника флебологии и лазерной хирургии\".",
      "Председатель контрольной комиссии Национальной коллегии флебологов.",
    ],
  },
  {
    slug: "lizanets",
    name: "Лизанец Юрий Михайлович (Россия)",
    photo: "/images/colleagues/lizanets/photo.jpg",
    thumb: "/images/colleagues/lizanets/thumb.jpg",
    description: [
      "Кандидат медицинских наук, Врач-хирург (флеболог).",
      "Основатель сети клиник инновационной флебологии.",
    ],
  },
  {
    slug: "maksimov",
    name: "Максимов Сергей Владимирович (Россия)",
    photo: "/images/colleagues/maksimov/photo.jpg",
    thumb: "/images/colleagues/maksimov/thumb.jpg",
    description: [
      "Кандидат медицинских наук, Врач-хирург (флеболог).",
      "Руководитель сети флебологических центров «Vascul clinic»",
      "Член «Ассоциации флебологов России», Российского общества ангиологов и сосудистых хирургов», СРО «Национальная коллегия флебологов», «Санкт-Петербургской ассоциации флебологов»",
    ],
  },
  {
    slug: "rosukhovskiy",
    name: "Росуховский Дмитрий Александрович (Россия)",
    photo: "/images/colleagues/rosukhovskiy/photo.jpg",
    thumb: "/images/colleagues/rosukhovskiy/thumb.jpg",
    description: [
      "Кандидат медицинских наук, Врач-хирург (флеболог).",
      "Первым из Российских флебологов обучился методике CLaCS у автора Касуо Мияки (Бразилия).",
      "Адаптировал методику CLaCS, создал и внедрил авторскую методику сосудистого омоложения – ЛАСТИК.",
      "Член совета Национальной коллегии флебологов.",
      "Врач сердечно-сосудистый хирург, флеболог.",
      "Главный врач сети клиник лазерной хирургии «Варикоза нет» региона «Поволжье» и Москвы.",
      "Рекордсмен России по количеству операции и просто профессионал своего дела.",
    ],
  },
  {
    slug: "guzhkov",
    name: "Гужков Олег Николаевич (Россия)",
    photo: "/images/colleagues/guzhkov/photo.jpg",
    thumb: "/images/colleagues/guzhkov/thumb.jpg",
    description: [
      "Профессор, доктор медицинских наук.",
      "Доцент ФГБОУ ВО «Ярославского государственного медицинского Университета».",
      "Вице-президент, (АФР)",
    ],
  },
  {
    slug: "potapov",
    name: "Потапов Максим Петрович (Россия)",
    photo: "/images/colleagues/potapov/photo.jpg",
    thumb: "/images/colleagues/potapov/thumb.jpg",
    description: [
      "Кандидат медицинских наук, Врач-хирург (флеболог).",
      "Доцент, Ученый секретарь совета, руководитель центра симуляционного обучения ФГБОУ ВО «Ярославского государственного медицинского Университета».",
      "Участник Рабочей группой экспертов Ассоциации флебологов России по разработке Российских клинических рекомендаций по диагностике и лечению хронических заболеваний вен 2018 г.",
    ],
  },
  {
    slug: "khorev",
    name: "Хорев Николай Германович (Россия)",
    photo: "/images/colleagues/khorev/photo.jpg",
    thumb: "/images/colleagues/khorev/thumb.jpg",
    description: [
      "Профессор, доктор медицинских наук.",
      "Заведующий кафедрой кардиологии и сердечно-сосудистой хирургии ФГБОУ ВО Алтайский Государственный Медицинский Университет, г. Барнаул.",
    ],
  },
];
