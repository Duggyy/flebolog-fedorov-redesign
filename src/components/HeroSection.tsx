import { Award, Stethoscope, CalendarCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import artveImg from "@/assets/artve.png";
import medastrumImg from "@/assets/medastrm.png";
import medplusImg from "@/assets/medplus.png";
import niarmedicImg from "@/assets/niarmedic.jpg";

const clinics = [
  {
    logo: medastrumImg, name: "МедАструм", bg: "bg-white",
    address: "Москва, ул. Большая Очаковская, д. 44",
    phone: "+7 (495) 744-78-74",
    url: "https://medastrum.ru/spetsialisty/fedorov-dmitriy-anatolievich",
  },
  {
    logo: artveImg, name: "ArtVe", bg: "bg-white",
    address: "Москва, Проспект Мира, 102, с. 38",
    phone: "+7 (906) 020-30-80",
    url: "https://artve.ru/specialists",
  },
  {
    logo: niarmedicImg, name: "Ниармедик", bg: "bg-white",
    address: "Обнинск, ул. Гагарина, д. 37Б",
    phone: "+7 (484) 290-80-25",
    url: "https://flebologfedorov.ru/",
  },
  {
    logo: medplusImg, name: "Медицина Плюс", bg: "bg-white",
    address: "Смоленск, ул. Николаева, д. 13а",
    phone: "+7 (4812) 70-21-51",
    url: "https://medicinaplus67.ru/phlebology/",
  },
];

const stats = [
{ icon: Stethoscope, label: "Ведущий флеболог", desc: "Современное оборудование" },
{ icon: Award, label: "К.м.н.", desc: "Кандидат медицинских наук" },
{ icon: CalendarCheck, label: "30+ лет", desc: "Опыт работы" },
{ icon: ShieldCheck, label: "5000+", desc: "Успешных операций" }];


const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-muted via-background to-muted py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-10 items-start animate-fade-up">
          <div className="md:w-5/12 flex-shrink-0">
            <div className="relative">
              <img
                alt="Доктор Фёдоров Д.А."
                className="rounded-2xl w-full max-w-sm shadow-[0_8px_30px_-12px_hsl(220_55%_12%/0.3)]" src="/images/475397a4-aec3-4fd8-b76a-3aa7437915d9.jpg" />
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                ✦ Ведущий специалист
              </div>
            </div>
            <div className="mt-8 max-w-sm">
              <Link to="/doctor" className="inline-block w-full text-center bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-[0.97]">
                Подробнее о враче
              </Link>
            </div>
          </div>

          <div className="md:w-7/12">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Врач-флеболог</p>
            <h1 className="text-hero-heading leading-[1.1]">
              <span className="text-4xl md:text-5xl font-bold block">ФЁДОРОВ</span>
              <span className="text-2xl md:text-3xl font-medium block mt-1">Дмитрий Анатольевич</span>
            </h1>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Работает в медцентрах</p>
              <div className="flex flex-col gap-3">
                {clinics.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      className={`${c.bg} rounded-md flex items-center justify-center h-7 w-24 overflow-hidden flex-shrink-0 shadow-sm border border-border/30 p-0.5 hover:shadow-md hover:border-primary/30 transition-all`}>
                      <img src={c.logo} alt={c.name} className="h-full w-full object-contain" />
                    </a>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <a href={c.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {c.name}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.address}</p>
                      <p className="text-xs text-secondary font-medium">{c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-3">
                Профессиональная деятельность
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> Федоров Дмитрий Анатольевич, 1969 г.р. закончил Московскую медицинскую Академию им. И.М.Сеченова в 1993 г.</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> 2003-2015гг. Перешел на работу в «Медицинское учреждение по проблемам флебологии» (г. Москва), где основной сферой деятельности стало лечение варикозного расширения вен нижних конечностей.</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> 2018-2023гг. заведующий хирургического отделения центра флебологии "МИФЦ" в Москве и ведущий хирурго-флеболог «Медицинского Инновационного Флебологического Центра».</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-3">
                Научная деятельность
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> Автор более 70 научных работ по разнообразным темам общей и сосудистой хирургии.</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> В 2004г. получил патент на изобретение № 2264176 – «Способ лечения вариконого расширения вен нижних конечностей»</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">▸</span> Соавтор медицинских руководств по флебологии: 2023г – «IQ флебология: от сосудистой звездочки до трофической язвы» (212 стр). 2024г – «IQ флебология в таблицах» (59 стр). 2026г – руководство для врачей «Краткое руководство по флебологии» (216 стр).</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {stats.map((s) => <div key={s.label} className="bg-white rounded-xl p-5 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.12)] hover:shadow-[0_4px_20px_-4px_hsl(220_15%_50%/0.18)] transition-shadow flex items-start gap-3 active:scale-[0.98]">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>)}
        </div>
      </div>
    </section>);};
export default HeroSection;