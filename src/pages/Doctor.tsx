import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Award, BookOpen, Microscope, Stethoscope, GraduationCap, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Doctor = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">О враче</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-muted via-background to-muted py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="md:w-4/12 flex-shrink-0">
              <img
                alt="Фёдоров Дмитрий Анатольевич"
                className="rounded-2xl w-full max-w-sm shadow-[0_8px_30px_-12px_hsl(var(--navy)/0.3)]"
                src="/images/475397a4-aec3-4fd8-b76a-3aa7437915d9.jpg"
              />
              <div className="mt-4 bg-primary/10 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-primary">Кандидат медицинских наук</p>
                <p className="text-xs text-muted-foreground mt-1">Врач-флеболог, сосудистый хирург, УЗИ диагностики</p>
              </div>
            </div>

            <div className="md:w-8/12">
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Врач-флеболог</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Фёдоров Дмитрий Анатольевич
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl text-lg">
                Кандидат медицинских наук, врач хирург-флеболог, врач сердечно-сосудистый хирург-флеболог, врач УЗИ диагностики.
                Работает в медцентрах: «МедАструм» (г. Москва), «ArtVe» (г. Москва), «Ниармедик» (г. Обнинск), «Медицина Плюс» (г. Смоленск).
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {[
                  { icon: Stethoscope, label: "30+ лет", desc: "Практики" },
                  { icon: Award, label: "70+", desc: "Научных работ" },
                  { icon: FileText, label: "Патент", desc: "№2264176" },
                  { icon: GraduationCap, label: "К.м.н.", desc: "Учёная степень" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Профессиональная деятельность */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Профессиональная деятельность</h2>
          </div>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="space-y-3">
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">1993</span>
                  <span className="text-muted-foreground">Закончил Московскую медицинскую Академию им. И.М. Сеченова. В 1994 г. окончил клиническую интернатуру по специальности хирургия, в 1996 г. — клиническую ординатуру по специальности хирургия.</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">1996–2003</span>
                  <span className="text-muted-foreground">Работал в отделении общей хирургии Российского научного центра хирургии имени академика Б.В. Петровского.</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2003</span>
                  <span className="text-muted-foreground">Перешёл в «Медицинское учреждение по проблемам флебологии» (г. Москва), где основной сферой деятельности стало лечение варикозного расширения вен нижних конечностей.</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2004</span>
                  <span className="text-muted-foreground">Стал соавтором изобретения «Способ лечения варикозного расширения вен нижних конечностей» — Патент №2264176, зарегистрирован в Государственном реестре изобретений РФ 20 ноября 2005 г.</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2015</span>
                  <span className="text-muted-foreground">Работает ведущим флебологом в клинике «Ниармедик-Обнинск».</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2018–2023</span>
                  <span className="text-muted-foreground">Заведующий хирургического отделения центра флебологии «МИФЦ» в Москве и ведущий хирург-флеболог «Медицинского Инновационного Флебологического Центра».</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2023</span>
                  <span className="text-muted-foreground">Врач-флеболог в «Медцентре эстетической флебологии ArtVe» (г. Москва).</span>
                </p>
                <p className="flex items-baseline gap-6">
                  <span className="text-primary font-bold whitespace-nowrap">2026</span>
                  <span className="text-muted-foreground">Врач-флеболог в медцентре «МедАструм» (г. Москва).</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Научная деятельность */}
      <section className="py-12 bg-muted">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Microscope className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Научная деятельность</h2>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Дмитрий Анатольевич является автором более <strong className="text-foreground">70 научных работ</strong> по
              разнообразным темам общей и сосудистой хирургии. Среди них статьи по лечению онкологических заболеваний
              органов брюшной полости, разнообразным операциям с применением лапароскопической техники. Большое внимание уделено
              лечению грыж (герниология) и варикозного расширения вен (флебология).
            </p>
            <p>
              В <strong className="text-foreground">2002 г.</strong> на базе РНЦХ РАМН им. Б.В. Петровского защитил
              кандидатскую диссертацию.
            </p>
            <p>
              С 2008 года ежегодно участвует во флебологических конференциях «Ассоциации флебологов России» (АФР),
              выступает с докладами по теме «Лазерные технологии в лечении варикозной болезни» и проводит мастер-классы
              для врачей из разных городов России и стран ближнего зарубежья.
            </p>

            <div className="grid md:grid-cols-2 gap-3 pt-2">
              {[
                { year: "2009", text: "Обучение по освоению лазерных методик в хирургии и флебологии, начало применения ЭВЛК." },
                { year: "2015", text: "Обучение в РНИМУ им. Н.И. Пирогова по специальности «Ультразвуковая диагностика»." },
                { year: "2006–2012", text: "Преподавание в должности доцента на кафедре ФППОВ Первого МГМУ им. И.М. Сеченова." },
                { year: "2012–2017", text: "Лектор в ГНЦ лазерной медицины ФМБА России, цикл лекций по флебологии." },
              ].map((item) => (
                <div key={item.year} className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-bold text-primary mb-1">{item.year}</p>
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-xl p-5 mt-4 border border-primary/10">
              <p className="text-sm font-semibold text-foreground mb-3">Научные публикации</p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span>
                  <span><strong className="text-foreground">2023 г.</strong> — соавтор «IQ флебология: от сосудистой звездочки до трофической язвы» (212 стр)</span>
                </li>

                {/* Gallery for IQ Phlebology 2023 */}
                <div className="grid grid-cols-2 gap-3 mt-4 max-w-[160px]">
                  {[
                    { src: "/images/iq-phlebology-2023-cover.jpg", label: "Обложка" },
                    { src: "/images/iq-phlebology-2023-authors.jpg", label: "Авторы" },
                  ].map((img) => (
                    <button
                      key={img.src}
                      onClick={() => setSelectedImage(img.src)}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 aspect-[2/3]"
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={120}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent text-white text-xs font-semibold px-1 py-1 text-center text-[10px]">
                        {img.label}
                      </p>
                    </button>
                  ))}
                </div>

                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span>
                  <span><strong className="text-foreground">2024 г.</strong> — соавтор «IQ флебология в таблицах» (59 стр)</span>
                </li>

                {/* Gallery for IQ Phlebology Tables */}
                <div className="grid grid-cols-3 gap-3 mt-4 max-w-[240px]">
                  {[
                    { src: "/images/iq-phlebology-cover.jpg", label: "Обложка" },
                    { src: "/images/iq-phlebology-authors-1.jpg", label: "Авторы 1" },
                    { src: "/images/iq-phlebology-authors-2.jpg", label: "Авторы 2" },
                  ].map((img) => (
                    <button
                      key={img.src}
                      onClick={() => setSelectedImage(img.src)}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 aspect-[2/3]"
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={120}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent text-white text-xs font-semibold px-1 py-1 text-center text-[10px]">
                        {img.label}
                      </p>
                    </button>
                  ))}
                </div>
              
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span>
                  <span><strong className="text-foreground">2026 г.</strong> — соавтор руководства для врачей «Краткое руководство по флебологии» (216 стр)</span>
                </li>

                {/* Gallery for Quick Phlebology Guide */}
                <div className="grid grid-cols-2 gap-3 mt-4 max-w-[160px]">
                  {[
                    { src: "/images/quick-phlebology-guide-cover.jpg", label: "Обложка" },
                    { src: "/images/quick-phlebology-guide-authors.jpg", label: "Авторы" },
                  ].map((img) => (
                    <button
                      key={img.src}
                      onClick={() => setSelectedImage(img.src)}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 aspect-[2/3]"
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={120}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent text-white text-xs font-semibold px-1 py-1 text-center text-[10px]">
                        {img.label}
                      </p>
                    </button>
                  ))}
                </div>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 mt-4 border border-primary/10">
              <p className="text-sm font-semibold text-foreground mb-2">Пионер в России</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span>
                  <span><strong className="text-foreground">2018 г.</strong> — впервые в России выполнил процедуру ЭВЛК на новом лазере «третьего поколения» с длиной волны 1940 Нм.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span>
                  <span><strong className="text-foreground">2019 г.</strong> — впервые в России выполнил операцию Тотальной ЭВЛК, которая стала основным способом лечения варикоза.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Методы лечения */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Методы лечения</h2>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Дмитрий Анатольевич проводит лечение варикоза с использованием методик ЭВЛК, Тотальной ЭВЛК и склеротерапии:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: "ЭВЛК", desc: "Эндовенозная лазерная коагуляция — малоинвазивное удаление поражённых вен." },
                { title: "Тотальная ЭВЛК", desc: "Удаление не только магистральной вены, но и всех варикозных притоков с помощью внутрисосудистого лазера." },
                { title: "Склеротерапия", desc: "Микросклеротерапия, озоносклеротерапия, микропенная Foam-Form склеротерапия, УЗИ-контролируемая склеротерапия." },
                { title: "ЧЛК", desc: "Чрезкожная лазерная коагуляция сосудистых сеточек и вен на ногах, теле, лице, кистях, стопах и лобной области." },
              ].map((m) => (
                <div key={m.title} className="bg-muted rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground mb-1">{m.title}</p>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-secondary/10 rounded-xl p-5 border border-secondary/20">
              <p className="text-sm text-foreground font-medium">
                💡 Не надо ждать, пока болезнь примет запущенные и осложнённые формы. Чем раньше начать лечение,
                тем больше шансов на успех. Лечение на ранних стадиях проходит быстрее, комфортнее и стоит намного дешевле.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Image Modal */}
{selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8 overflow-auto"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-[90vw] md:max-w-[80vw] max-h-[90vh] md:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="fixed top-4 right-4 md:top-6 md:right-6 bg-background/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-2xl hover:bg-background text-muted-foreground hover:text-foreground hover:scale-105 transition-all z-10 flex items-center justify-center"
              aria-label="Close image"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Full size publication image"
              loading="eager"
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl mx-auto block"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctor;
