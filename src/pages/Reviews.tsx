import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

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
  }
];

const Reviews = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://prodoctorov.ru/static/js/widget_footer.js?v06";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">Отзывы</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-muted py-20">
        <div className="container text-center">
          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Отзывы пациентов</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Отзывы о нашей работе
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Более 5000 довольных пациентов. Настоящие истории выздоровления.
          </p>
        </div>
      </section>

      {/* ProDoctorov Footer Widget */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          <div id="pd_widget_footerd556844" className="pd_widget_footer" data-doctor="556844">
            <div className="pd_left">
              <a target="_blank" className="pd_doctor_name" href="https://prodoctorov.ru/obninsk/vrach/556844-fedorov/">
                Федоров Дмитрий Анатольевич
              </a>
            </div>
            <div className="pd_middle">
              <div id="pd_widget_footer_content_middled556844"></div>
            </div>
            <div className="pd_right">
              <div id="pd_widget_footer_content_rightd556844"></div>
            </div>
          </div>
          <div className="pd_powered_by mt-8">
            <a target="_blank" href="https://prodoctorov.ru">
              <img className="pd_logo" width="132" src="/images/prodoctorov-logo.png" alt="ProDoctorov" />
            </a>
          </div>
        </div>
      </section>

      {/* Local Reviews - as before */}
      <section className="py-20">
        <div className="container max-w-4xl">
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
          <div className="mt-12 text-center">
            <div className="flex gap-6 justify-center">
              <a href="https://prodoctorov.ru/new/rate/doctor/556844/" className="text-sm font-semibold text-primary hover:underline">
                Оставить отзыв на ПроДокторов →
              </a>
              <a href="https://prodoctorov.ru/obninsk/vrach/556844-fedorov/#otzivi" className="text-sm font-semibold text-secondary hover:underline">
                Читать все отзывы →
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Reviews;

