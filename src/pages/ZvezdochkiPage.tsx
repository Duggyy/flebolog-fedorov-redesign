import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import TreatmentSection from "@/components/TreatmentSection";
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const ZvezdochkiPage = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <SiteNav />

    {/* Breadcrumb */}
    <div className="bg-muted border-b border-border">
      <div className="container py-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Сосудистые звездочки</span>
      </div>
    </div>

    {/* Hero */}
    <section className="bg-gradient-to-br from-muted via-background to-muted py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Syringe className="h-5 w-5" />
            <span className="font-semibold uppercase tracking-wide text-sm">Что мы лечим</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Сосудистые звездочки на ногах
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Лечение и профилактика сосудистых звездочек
          </p>
        </div>
      </div>
    </section>

    {/* Content */}
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Сосудистые звездочки — это не только эстетическая проблема</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base leading-relaxed">Сосудистые звездочки на ногах — это не только эстетическая проблема, но и первый сигнал Вашей капиллярной системы о развитии варикозной болезни.</p>
              <p className="text-muted-foreground text-lg font-semibold mt-4">Появление сосудистых звездочек означает расширение капилляров, а они, в свою очередь, сигнализируют о повышенном кровяном давлении на этом участке кровеносной системы. Кроме того, в этом случае капилляры начинают деформироваться, утрачивая свой естественный тонус. И хотя появление «звездочек» не всегда свидетельствует о существовании варикозной патологии, проверить этот факт стоит в кабинете врача.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Почему появляются сосудистые звездочки на ногах?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Слишком интенсивные нагрузки</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Врожденная слабость соединительных тканей, провоцирующая наследственную предрасположенность к варикозу;</p>
              </div>
              <div className="bg-card rounded-xl p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Неудобная обувь</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">и очень частый выбор высоких каблуков. Шпильки и узкие туфли, надеваемые постоянно, возможно, и сделают Вас красивыми поначалу, но потом болезнь возьмет свое обратно;</p>
              </div>
              <div className="bg-card rounded-xl p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Длительное нахождение в одном положении</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">(сидя или стоя);</p>
              </div>
              <div className="bg-card rounded-xl p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Любовь к длительному загару</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">неважно - на солнце или в солярии.</p>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary underline underline-offset-4 decoration-secondary mb-3">Проблемы с сердцем и печенью</h3>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary underline underline-offset-4 decoration-secondary mb-3">Лечение гормональными препаратами</h3>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary underline underline-offset-4 decoration-secondary mb-3">Термические нагрузки</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">– бани, сауны, ванны и пр.;</p>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary underline underline-offset-4 decoration-secondary mb-3">Лишний вес</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border-l-8 border-primary shadow-xl">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Профилактика сосудистых звездочек на ногах</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Откажитесь от крайне высоких каблуков и выбирайте удобную обувь хотя бы во время прогулок. Пусть высокие «лодочки» останутся для праздничных мероприятий;</p>
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Если Вы вынуждены вести малоподвижный образ жизни, старайтесь находить время и поводы для движения, чаще менять свое положение в течение рабочего дня. Кроме того, важно контролировать свои нагрузки – они не должны быть чрезмерными!</p>
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Не подвергайте ноги слишком сильным перепадам температур (здесь увлечение баней или сауной не всегда может действовать благотворно);</p>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Пользуйтесь защитными кремами в солнечный день;</p>
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Почаще предпринимайте утренние или вечерние пробежки или прогулки. Очень полезна будет езда на велосипеде;</p>
                <p className="font-semibold text-primary text-lg border-b border-primary pb-1"><span className="mr-2">▸</span>Не набирайте лишних килограммов;</p>
                <p className="font-semibold text-primary text-lg"><span className="mr-2">▸</span>Введите в привычку принимать контрастный душ, чередуя теплые и холодные обливания ног.</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/20 rounded-2xl p-8 border-4 border-primary shadow-2xl">
            <p className="text-xl font-bold text-primary text-center leading-tight">{"Обратившись в наш центр, Вы можете быть уверены, что не только решите косметические проблемы появления сосудистых звездочек на ногах, но и получите точный диагноз, грамотную консультацию и лечение, которое предотвратит дальнейшее развитие варикоза"}</p>
            <p className="text-primary font-semibold text-center mt-4 text-lg">Сосудистые звездочки лечение у Доктора Федорова.</p>
          </div>
        </div>
      </div>
    </section>

    <div className="py-12 bg-background">
      <div className="container text-center">
        <Link 
          to="/" 
          className="inline-block bg-primary text-primary-foreground px-12 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.97] max-w-max mx-auto"
        >
          ← На главную
        </Link>
      </div>
    </div>
    <SiteFooter />
  </div>
);

export default ZvezdochkiPage;

