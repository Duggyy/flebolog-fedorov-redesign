import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ChevronRight, Calendar } from "lucide-react";

const newsItems = [
{
  date: "08.11.2023",
  title: "Ежегодная научная конференция «Алтайский венозный форум»",
  text: "21 и 22 сентября 2023 года в Барнауле прошла всероссийская конференция «Алтайский венозный форум 2023».",
image: "/images/news-1.jpg"
},
{
  date: "08.11.2023",
  title: "Научно-практическая конференция «Академия практической флебологии»",
  text: "16 сентября 2023 года в Москве прошла научно-практическая конференция «Академия практической флебологии». В мероприятии принял активное участие Дмитрий Анатольевич Фёдоров.",
image: "/images/news-2.jpg"
},
{
  date: "10.12.2022",
  title: "15-й Санкт-Петербургский Венозный Форум",
  text: "Врач-флеболог Фёдоров Дмитрий Анатольевич принимал непосредственное участие в работе форума.",
image: "/images/news-3.jpg"
},
{
  date: "10.11.2022",
  title: "VI Всероссийский съезд «Эстетическая флебология 2022»",
  text: "5 ноября 2022 года в Москве состоялся VI всероссийский съезд специалистов по эстетической флебологии.",
image: "/images/news-4.jpg"
},
{
  date: "19.09.2022",
  title: "Дружеский визит Лизанца Ю.М., руководителя центра «Сосудистая клиника на Пресне»",
  text: "19 сентября 2022 года в рамках обмена опытом состоялся визит Юрия Михайловича Лизанца — флеболога, кандидата медицинских наук, руководителя «Сосудистой клиники на Пресне».",
image: "/images/news-5.jpg"
},
{
  date: "17.09.2022",
  title: "Научно-практическая конференция «Академия практической флебологии», Москва",
  text: "17 сентября 2022 года в Москве прошла научно-практическая конференция в формате «Академия практической флебологии».",
image: "/images/news-1.jpg"
},
{
  date: "17.08.2022",
  title: "Мастер-класс для хирурга-флеболога из г. Иваново",
  text: "18 июля 2022 года прошёл очередной мастер-класс для хирурга-флеболога из города Иваново, Барвинской Виктории Николаевны.",
image: "/images/news-2.jpg"
},
{
  date: "23.06.2022",
  title: "II Флебологический форум «Сибирская волна — 2022», Новосибирск",
  text: "С 22 по 23 апреля 2022 года в Новосибирске состоялся II Флебологический Форум «Сибирская волна», в котором принял участие Фёдоров Д.А. в качестве приглашённого спикера.",
image: "/images/news-3.jpg"
},
{
  date: "10.03.2020",
  title: "Тотальная ЭВЛК — революционная методика лечения варикоза",
  text: "В декабре 2019 года доктором Фёдоровым ВПЕРВЫЕ в России была выполнена операция «Тотальная ЭВЛК» — максимально современный и комфортный метод лечения.",
image: "/images/news-4.jpg"
},
{
  date: "21.01.2019",
  title: "Новейшее оборудование в лечении варикоза!",
  text: "Процедура Эндовазальной Лазерной Коагуляции (ЭВЛК) стала «Золотым стандартом» во флебологии. Доктор Фёдоров использует самое передовое оборудование для максимальных результатов.",
image: "/images/news-5.jpg"
},
{
  date: "20.11.2018",
  title: "Мастер-класс для флебологов из центра «Варикоза нет», Уфа",
  text: "16–18 октября 2018 года был проведён мастер-класс по применению современных методик лечения различных форм варикозной болезни.",
image: "/images/news-1.jpg"
},
{
  date: "17.07.2018",
  title: "Обучающий цикл для начинающих флебологов",
  text: "В июне 2018 года был проведён минисеминар с обучающим циклом для начинающих флебологов из Омска и Санкт-Петербурга.",
image: "/images/news-2.jpg"
},
{
  date: "17.07.2018",
  title: "XII научно-практическая конференция «Актуальные вопросы флебологии», Рязань",
  text: "Под эгидой Ассоциации флебологов России состоялась общероссийская научная конференция с участием ведущих специалистов из России и зарубежья.",
image: "/images/news-13.jpg"
},
{
  date: "04.06.2018",
  title: "Конференция «Новые исследования в антикоагулянтной терапии тромбозов»",
  text: "Основными докладчиками конференции были ведущие флебологи Германии. Обсуждались современные методы лечения варикоза и компрессионной терапии.",
image: "/images/news-14.jpg"
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

      <SiteFooter />
    </div>);

};

export default News;