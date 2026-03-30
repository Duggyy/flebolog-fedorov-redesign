import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Stethoscope, Search, FileText, ChevronRight } from "lucide-react";

const diagnosticSteps = [
  {
    icon: Stethoscope,
    title: "Консультация флеболога",
    text: "Осмотр пациента происходит в два этапа: стоя и лёжа. Такой подход позволяет правильно диагностировать заболевание, безошибочно определяя поражённые участки и венозные узлы. На этом этапе определяется стадия болезни, что позволяет выбрать верную тактику лечения.",
  },
  {
    icon: Search,
    title: "Ультразвуковое дуплексное сканирование сосудов",
    text: "Исследование помогает определить состояние клапанного аппарата вен — как поверхностных, так и глубоких. Определяется протяжённость патологии, диаметр вен, поражённых варикозными изменениями. Метод позволяет выявить наличие тромбов и посттромбофлебитические изменения стенок венозных сосудов.",
  },
  {
    icon: FileText,
    title: "Создание гемодинамической модели и разработка плана лечения",
    text: "В соответствии с данными диагностики подбирается индивидуальный план лечения. Применяются инновационные методы, позволяющие сократить период реабилитации. В отличие от стандартных методов, устраняются только притоки и стволы с патологическим кровотоком, сохраняя нормальный венозный отток.",
  },
];

const advantages = [
  "Консультацию опытного врача-флеболога, к.м.н.",
  "Диагностику заболеваний с применением новейшего оборудования",
  "Подбор и проведение наиболее эффективного лечения",
  "Профилактику и наблюдение за состоянием венозной системы",
];

const Phlebology = () => {
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
            <span className="text-foreground font-medium">Флебология</span>
          </div>

          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Направление</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Флебология
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
            Флебология — наука о диагностике и лечении заболеваний вен. Флеболог — специалист, 
            занимающийся лечением и профилактикой болезней венозной системы.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-14">
        <div className="container max-w-4xl">
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Доктор Фёдоров Д.А. — врач-флеболог высокой квалификации с более чем 30-летним опытом работы. 
              Ежедневно он готов принять вас для диагностики и лечения заболеваний венозной системы.
            </p>
            <p>
              В своей практике Дмитрий Анатольевич применяет новейшие достижения в области флебологии. 
              Инновационные методы и современное оборудование позволяют успешно лечить такие заболевания, 
              как флебит, тромбофлебит, трофические язвы и другие болезни венозной системы. 
              Каждый пациент получает индивидуальное лечение, которое назначается в зависимости от характера заболевания.
            </p>
            <p>
              Колоссальный опыт в области флебологии в сочетании с современными методами ультразвуковой диагностики 
              и инновационными способами лечения позволяют добиваться наилучших результатов.
            </p>
          </div>

          <blockquote className="mt-8 border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-xl">
            <p className="text-foreground italic leading-relaxed">
              «Экспертная диагностика, передовые технологии лечения и большой научный потенциал — 
              это флебология будущего в настоящем. Я рад помочь пациенту с любой сосудистой проблемой!»
            </p>
            <p className="mt-3 text-sm font-semibold text-primary">— Фёдоров Д.А., к.м.н.</p>
          </blockquote>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-section-bg py-14">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Обращаясь к доктору Фёдорову, <span className="text-primary">вы получаете</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {advantages.map((a, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 flex items-start gap-3 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]"
              >
                <div className="bg-primary/10 rounded-lg p-2 mt-0.5">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Для достижения успешного результата важны все составляющие: правильная диагностика, 
            грамотно подобранное лечение и эффективная профилактика повторного возникновения болезни.
          </p>
        </div>
      </section>

      {/* Diagnostic algorithm */}
      <section className="py-14">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Алгоритм <span className="text-primary">диагностики</span>
          </h2>
          <div className="space-y-6">
            {diagnosticSteps.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] flex gap-5 items-start"
              >
                <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Phlebology;
