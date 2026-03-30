import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ChevronRight, Calendar } from "lucide-react";

const newsItems = [
{
  date: "08.11.2023",
  title: "Ежегодная научная конференция «Алтайский венозный форум»",
  text: "21 и 22 сентября 2023 года в Барнауле прошла всероссийская конференция «Алтайский венозный форум 2023».",
  image: "https://flebologfedorov.ru/ext_images/906/img_8da0a485c4df887659928df08866c10c"
},
{
  date: "08.11.2023",
  title: "Научно-практическая конференция «Академия практической флебологии»",
  text: "16 сентября 2023 года в Москве прошла научно-практическая конференция «Академия практической флебологии». В мероприятии принял активное участие Дмитрий Анатольевич Фёдоров.",
  image: "https://flebologfedorov.ru/ext_images/906/img_3f510688108d63e49d047410cb304976"
},
{
  date: "10.12.2022",
  title: "15-й Санкт-Петербургский Венозный Форум",
  text: "Врач-флеболог Фёдоров Дмитрий Анатольевич принимал непосредственное участие в работе форума.",
  image: "https://flebologfedorov.ru/ext_images/906/img_a022bf417af7e8baa6363fdb7a190141"
},
{
  date: "10.11.2022",
  title: "VI Всероссийский съезд «Эстетическая флебология 2022»",
  text: "5 ноября 2022 года в Москве состоялся VI всероссийский съезд специалистов по эстетической флебологии.",
  image: "https://flebologfedorov.ru/ext_images/906/img_3abde7cf9c2b43809fa8fb103efe9877"
},
{
  date: "19.09.2022",
  title: "Дружеский визит Лизанца Ю.М., руководителя центра «Сосудистая клиника на Пресне»",
  text: "19 сентября 2022 года в рамках обмена опытом состоялся визит Юрия Михайловича Лизанца — флеболога, кандидата медицинских наук, руководителя «Сосудистой клиники на Пресне».",
  image: "https://flebologfedorov.ru/ext_images/906/img_835d009f0c4f91dd791e1d47d1a260cb"
},
{
  date: "17.09.2022",
  title: "Научно-практическая конференция «Академия практической флебологии», Москва",
  text: "17 сентября 2022 года в Москве прошла научно-практическая конференция в формате «Академия практической флебологии».",
  image: "https://flebologfedorov.ru/ext_images/906/img_9c604e9e71f74317a59a0aa30cd89440"
},
{
  date: "17.08.2022",
  title: "Мастер-класс для хирурга-флеболога из г. Иваново",
  text: "18 июля 2022 года прошёл очередной мастер-класс для хирурга-флеболога из города Иваново, Барвинской Виктории Николаевны.",
  image: "https://flebologfedorov.ru/ext_images/906/img_e350eb32448b4df550bfb7cc8c0d8ed6"
},
{
  date: "23.06.2022",
  title: "II Флебологический форум «Сибирская волна — 2022», Новосибирск",
  text: "С 22 по 23 апреля 2022 года в Новосибирске состоялся II Флебологический Форум «Сибирская волна», в котором принял участие Фёдоров Д.А. в качестве приглашённого спикера.",
  image: "https://flebologfedorov.ru/ext_images/906/img_da59c70b689e99b9b95fab9c53285bd6"
},
{
  date: "10.03.2020",
  title: "Тотальная ЭВЛК — революционная методика лечения варикоза",
  text: "В декабре 2019 года доктором Фёдоровым ВПЕРВЫЕ в России была выполнена операция «Тотальная ЭВЛК» — максимально современный и комфортный метод лечения.",
  image: "https://flebologfedorov.ru/ext_images/906/img_2bfd70f13f61b8c438280a64b807d28a"
},
{
  date: "21.01.2019",
  title: "Новейшее оборудование в лечении варикоза!",
  text: "Процедура Эндовазальной Лазерной Коагуляции (ЭВЛК) стала «Золотым стандартом» во флебологии. Доктор Фёдоров использует самое передовое оборудование для максимальных результатов.",
  image: "https://flebologfedorov.ru/ext_images/906/img_8e56055c8d50fe760a4cbc8eaed316e4"
},
{
  date: "20.11.2018",
  title: "Мастер-класс для флебологов из центра «Варикоза нет», Уфа",
  text: "16–18 октября 2018 года был проведён мастер-класс по применению современных методик лечения различных форм варикозной болезни.",
  image: "https://flebologfedorov.ru/ext_images/906/img_66f8824084432338127d0a3be6529f7a"
},
{
  date: "17.07.2018",
  title: "Обучающий цикл для начинающих флебологов",
  text: "В июне 2018 года был проведён минисеминар с обучающим циклом для начинающих флебологов из Омска и Санкт-Петербурга.",
  image: "https://flebologfedorov.ru/ext_images/906/img_fdab53aeae925371280b8fc6189c2510"
},
{
  date: "17.07.2018",
  title: "XII научно-практическая конференция «Актуальные вопросы флебологии», Рязань",
  text: "Под эгидой Ассоциации флебологов России состоялась общероссийская научная конференция с участием ведущих специалистов из России и зарубежья.",
  image: "https://flebologfedorov.ru/ext_images/906/img_7ce42322627e144587bfd786d9e81797"
},
{
  date: "04.06.2018",
  title: "Конференция «Новые исследования в антикоагулянтной терапии тромбозов»",
  text: "Основными докладчиками конференции были ведущие флебологи Германии. Обсуждались современные методы лечения варикоза и компрессионной терапии.",
  image: "https://flebologfedorov.ru/ext_images/906/img_c29f22edff5fd6651086d67362ca526d"
}];


const News = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-14">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Новости</span>
          </div>

          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">События</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Новости и события
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
            Конференции, мастер-классы и профессиональные достижения в области флебологии.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-14">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item, i) =>
            <article
              key={i}
              className="bg-card rounded-xl overflow-hidden shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.18)] transition-shadow group">
              
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy" />
                
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <time>{item.date}</time>
                  </div>
                  <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {item.text}
                  </p>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Запишитесь на консультацию</h2>
          <p className="text-navy-foreground/70 mb-6 max-w-lg mx-auto text-sm">
            Дмитрий Анатольевич всегда в курсе последних достижений флебологии и применяет их в своей практике.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-[0.97]">
            Записаться на приём
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>);

};

export default News;