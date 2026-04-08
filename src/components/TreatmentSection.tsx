import { useState } from "react";
import { Syringe, Zap, Scissors, Sparkles } from "lucide-react";
import sclerotherapyBg from "@/assets/sclerotherapy.png";
import { treatmentResultsData } from "@/components/treatment-results-data";

const tabs = [
"Направления лечения",
"Результаты лечения",
"Эстетическая флебология. Результаты",
"Отзывы",
"Доклады и выступления",
"Блог врача",
"Фото с коллегами",
"Фото с конференций"];


const conditions = [
{ icon: Syringe, label: "Варикозная болезнь" },
{ icon: Syringe, label: "Тромбофлебит" },
{ icon: Syringe, label: "Сосудистые звездочки" },
{ icon: Syringe, label: "Трофические язвы" }];


const methods = [
{ icon: Zap, label: "Склеротерапия", desc: "лечение вен без операции", bg: sclerotherapyBg },
{ icon: Zap, label: "Лечение варикоза лазером", desc: "ЭВЛК", bg: "/images/method-laser.png" },
{ icon: Scissors, label: "Малоинвазивные операции на венах", desc: "", bg: "/images/method-operacii.png" },
{ icon: Sparkles, label: "Удаление сосудистых звездочек", desc: "", bg: "/images/method-zvezdochki.png" },
{ icon: Sparkles, label: "Микросклеротерапия", desc: "", bg: "/method-microsklerotherapy.jpg" }
];

const TreatmentSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-section-bg py-16">
      <div className="container">
        <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Наши услуги</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Направления <span className="text-primary">лечения</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab, i) =>
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] w-[calc(25%-6px)] ${
            activeTab === i ?
            "bg-primary text-primary-foreground shadow-lg shadow-primary/20" :
            "bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"}`
            }>
            
              {tab}
            </button>
          )}
        </div>

        {activeTab === 0 && <MethodsContent />}
        {activeTab === 1 && <ResultsContent />}
        {activeTab === 2 && <PlaceholderContent title="Эстетическая флебология. Результаты" />}
        {activeTab === 3 && <ReviewsContent />}
        {activeTab === 4 && <PlaceholderContent title="Доклады и выступления" />}
        {activeTab === 5 && <PlaceholderContent title="Блог врача" />}
        {activeTab === 6 && <PlaceholderContent title="Фото с коллегами" />}
        {activeTab === 7 && <PlaceholderContent title="Фото с конференций" />}
      </div>
    </section>);

};

const MethodsContent = () =>
<div className="animate-fade-up">
    <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
      Мы предлагаем нашим пациентам программы, включающие консультацию, диагностику,
      лечение и дальнейшее наблюдение в течение нескольких лет с применением самых
      современных методов ультразвуковой диагностики и инновационных лечебных процедур.
    </p>

    <h3 className="text-lg font-bold text-foreground mb-4">Что мы лечим?</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {conditions.map((c) =>
    <div
      key={c.label}
      className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_4px_20px_-4px_hsl(220_15%_50%/0.16)] transition-shadow cursor-pointer active:scale-[0.98]">
      
          <div className="bg-primary/10 rounded-lg p-2">
            <c.icon className="h-4 w-4 text-primary flex-shrink-0" />
          </div>
          <span className="text-sm font-semibold text-foreground">{c.label}</span>
        </div>
    )}
    </div>

    <h3 className="text-lg font-bold text-foreground mb-4">Как мы лечим?</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {methods.map((m) =>
    <div
      key={m.label}
      className="relative rounded-xl text-center shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_4px_20px_-4px_hsl(220_15%_50%/0.16)] transition-shadow cursor-pointer active:scale-[0.98] overflow-hidden min-h-[180px] flex items-end">
      
          {'bg' in m && m.bg ?
      <>
              <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${m.bg})` }} />
        
              
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-5">
                <p className="text-xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight tracking-tight">{m.label}</p>
                {m.desc && <p className="text-lg font-semibold text-white/95 mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">{m.desc}</p>}
              </div>
            </> :

      <div className="relative z-10 w-full p-5 bg-white flex flex-col items-center justify-center min-h-[180px]">
              <div className="bg-secondary/10 rounded-lg p-3 w-fit mx-auto mb-3">
                <m.icon className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-sm font-bold text-foreground">{m.label}</p>
              {m.desc && <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>}
            </div>
      }
        </div>
    )}
    </div>

    <div className="mt-10 bg-white rounded-xl p-6 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]">
      <h4 className="text-base font-bold text-foreground mb-3">Наше оборудование</h4>
      <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <li className="flex items-start gap-2"><span className="text-secondary">▸</span> Ультрасовременный лазер третьего поколения с длиной волны 1940 нм</li>
        <li className="flex items-start gap-2"><span className="text-secondary">▸</span> Автоматическая программируемая тракция световода</li>
        <li className="flex items-start gap-2"><span className="text-secondary">▸</span> Тонкие радиальные световоды 365 мкм</li>
        <li className="flex items-start gap-2"><span className="text-secondary">▸</span> Специальная помпа для местной анестезии</li>
        <li className="flex items-start gap-2"><span className="text-secondary">▸</span> Постоянный УЗИ контроль всех процедур</li>
      </ul>
    </div>
  </div>;


const priceData = [
{ name: "Первичный прием врача-флеболога", price: "1 815" },
{ name: "Первичный прием врача-флеболога, к.м.н.", price: "2 145" },
{ name: "Повторный прием врача-флеболога", price: "1 650" },
{ name: "Профилактический прием", price: "1 650" },
{ name: "Склеротерапия (Foam-form), 1 сеанс", price: "8 800" },
{ name: "Склеротерапия на голени, 1 конечность", price: "9 350" },
{ name: "Склеротерапия на бедре, 1 конечность", price: "9 350" },
{ name: "Кроссэктомия, 1 конечность", price: "17 600" },
{ name: "Минифлебэктомия по Варади, 1 конечность", price: "17 600" },
{ name: "ЭВЛК, 1 магистральная вена", price: "44 000" },
{ name: "ЭВЛК, 2 магистральные вены", price: "77 000" },
{ name: "ЭВЛК радиальным световодом, 1 вена", price: "49 500" },
{ name: "Лазерная коагуляция, 1 минута", price: "110" }];


const PriceContent = () =>
<div className="animate-fade-up">
    <div className="bg-white rounded-xl shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy text-white">
            <th className="px-5 py-4 text-left font-semibold">Наименование услуги</th>
            <th className="px-5 py-4 text-right font-semibold whitespace-nowrap">Цена, руб.</th>
          </tr>
        </thead>
        <tbody>
          {priceData.map((item, i) =>
        <tr key={i} className={`border-b border-border transition-colors hover:bg-muted/50 ${i % 2 === 0 ? "bg-white" : "bg-muted/30"}`}>
              <td className="px-5 py-3.5 text-foreground">{item.name}</td>
              <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-primary">{item.price}</td>
            </tr>
        )}
        </tbody>
      </table>
    </div>
  </div>;


function ResultsContent() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {treatmentResultsData.map((item) =>
          <article key={item.id} className="overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]">
            <div className="grid grid-cols-2">
              <div className="p-3 text-center md:p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">До</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(item.before)}
                  className="mt-2 block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Открыть фото до лечения"
                >
                  <img
                    src={item.before}
                    alt="До лечения"
                    loading="eager"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </div>

              <div className="border-l border-border p-3 text-center md:p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">После</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(item.after)}
                  className="mt-2 block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Открыть фото после лечения"
                >
                  <img
                    src={item.after}
                    alt="После лечения"
                    loading="eager"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </div>
            </div>
          </article>
        )}
      </div>

      {selectedImage && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex cursor-pointer items-start justify-center bg-black/55 p-4 overflow-y-auto pt-8"
          onClick={() => setSelectedImage(null)}
          aria-label="Закрыть увеличенное фото"
        >
          <span className="overflow-hidden rounded-xl border-2 border-white bg-background shadow-2xl">
            <img
              src={selectedImage}
              alt="Увеличенное фото"
              className="block max-h-[80dvh] max-w-[calc(100vw-2rem)] object-contain md:max-w-[50vw]"
            />
          </span>
        </button>
      )}
    </div>
  );
}



const reviews = [
{
  name: "Амелюшкина Ольга Александровна",
  text: "Выражаю благодарность Дмитрию Анатольевичу за проведенную операцию (ЭВЛК)! С первой встречи доктор располагает к себе, очень внимателен!"
},
{
  name: "Каткова Татьяна Александровна",
  text: "Прошло четыре года после ЭВЛК. Ноги после лечения не узнать! Главное, что вены проходимы, что ноги не устают. Спасибо доктору Д.А. Федорову!"
},
{
  name: "Пылаева Марина Васильевна",
  text: "Он врач от БОГА, ему не страшно доверить свою жизнь. Большое ему человеческое СПАСИБО за внимательное и трепетное отношение к пациентам и огромный ПРОФЕССИОНАЛИЗМ."
},
{
  name: "Александр Кобылецкий",
  text: "Осмотр через неделю после операции показал, что всё получилось с первого раза, вена спаялась по всей длине, заживает всё хорошо. Дмитрию Анатольевичу большое спасибо!"
}];


const ReviewsContent = () =>
<div className="animate-fade-up">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((r, i) =>
    <div key={i} className="bg-white rounded-xl p-6 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] relative">
          <div className="text-5xl text-primary/15 font-serif absolute top-3 left-4 leading-none">"</div>
          <p className="text-sm text-muted-foreground leading-relaxed relative z-10 pt-4">{r.text}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {r.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">Пациент</p>
            </div>
          </div>
        </div>
    )}
    </div>
    <div className="mt-6 flex gap-4">
      <a href="#" className="text-sm font-semibold text-primary hover:underline">
        Оставить отзыв на Продокторов →
      </a>
      <a href="#" className="text-sm font-semibold text-secondary hover:underline">
        Читать все отзывы →
      </a>
    </div>
  </div>;


const PlaceholderContent = ({ title }: {title: string;}) =>
<div className="animate-fade-up">
    <div className="bg-white rounded-xl p-10 text-center shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]">
      <p className="text-lg font-semibold text-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground">Раздел в разработке</p>
    </div>
  </div>;


export default TreatmentSection;