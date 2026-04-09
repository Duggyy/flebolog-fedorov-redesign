import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import TreatmentSection from "@/components/TreatmentSection";
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const YazvyPage = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <SiteNav />

    {/* Breadcrumb */}
    <div className="bg-muted border-b border-border">
      <div className="container py-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Трофические язвы</span>
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
            Трофические язвы
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Лечение венозных трофических язв при запущенном варикозе
          </p>
        </div>
      </div>
    </section>

    {/* Content */}
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border-l-8 border-destructive shadow-xl">
            <h2 className="text-2xl font-bold text-destructive border-b-4 border-destructive pb-2 inline-block mb-6 tracking-tight">С трофическими язвами сталкивается пациенты, которые запустили варикоз</h2>
            <div className="space-y-4">
              <p className="text-destructive font-semibold text-lg leading-relaxed">С трофическими язвами чаще всего сталкивается пациенты, которые запустили варикоз и вовремя не обратились за профессиональной медицинской помощью.</p>
              <p className="text-destructive font-semibold text-lg leading-relaxed mt-4">Внешне это выглядит так: начинает темнеть кожа (становится темно-багрового оттенка). Этот процесс часто сопровождается не только заметными отеками, но и раздражающим зудом.</p>
              <p className="text-destructive font-semibold text-lg leading-relaxed mt-4">Со временем на месте отека открывается болезненная ранка. Если процесс не купировать, то она быстро увеличится в размерах и перерастет в венозную трофическую язву. Рана может кровоточить.</p>
              <p className="text-destructive font-semibold text-lg leading-relaxed mt-6">Если на начальной стадии трофической язвы не обратиться к специалисту-флебологу, то очень быстро рана увеличится в размерах, распространится на всю голень. Никакое самолечение не поможет справиться с этой болезнью.</p>
              <p className="text-destructive font-semibold text-lg leading-relaxed mt-4">Избавиться от трофических язв на ногах поможет только удаление причины, вызвавшей это осложнение. Если причина варикоз, то надо его устранять. Если причина в постфлебитическом синдроме – нарушении проходимости глубоких вен, то это более серьезная ситуация, которая может потребовать протезирования пораженных вен специальными стентами. Местное лечение также необходимо, но оно носит лишь временный характер.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Как лечить трофические варикозные язвы</h2>
            <p className="text-muted-foreground text-base leading-relaxed">Язва, развившаяся из-за варикоза, не затянется самостоятельно. Не стоит рассчитывать на то, что все придет в норму без врачебного вмешательства. Если все-таки болезнь затянули, язва появилась — обязательно отправляйтесь на осмотр к флебологу.</p>
            <p className="text-primary font-bold text-xl mt-4 bg-primary/10 p-4 rounded-lg">Трофическая язва часто излечивается. Но для этого потребуется комплексное лечение, назначенное специалистом. Необходимо быть готовым к тому, что придется удалить пораженные болезнью вены. После этого будет проводиться длительное местное лечение.</p>
            <p className="text-muted-foreground text-lg font-semibold mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">«Золотым стандартом» консервативного лечения трофических язв возникших при запущенном варикозе, считается создание влажной среды, которая будет сопутствовать заживлению раны.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-emerald/10 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-700 mb-3">Методы лечения:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc ml-6">
                  <li>многослойные раневые покрытия, нанесение повязок на поврежденные ткани кожи;</li>
                  <li>обязательное использование медицинского компрессионного трикотажа;</li>
                  <li>перемежающая пневмокомпрессия;</li>
                  <li>назначение венотонизирующих, антибактериальных и общеукрепляющих препаратов;</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200 shadow-md">
                <h3 className="text-lg font-bold text-emerald-700 mb-3">Результаты комплексного подхода:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc ml-6">
                  <li>Быстро проходит воспаление, налаживается микроциркуляция.</li>
                  <li>Ноги перестают опухать.</li>
                  <li>Не беспокоят болевые ощущения.</li>
                  <li>Устраняется эффект мокрой язвы, экзема быстро затягивается.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary/20 rounded-xl p-6 mt-8 border-4 border-primary shadow-2xl">
            <p className="text-primary font-bold text-lg text-center leading-tight">Напоминаем, что для лечения трофической язвы обязательным составляющим, даже начальной стадии развития, является эластическая компрессия ног.</p>
            <div className="bg-destructive/10 rounded-lg p-4 mt-4 border border-destructive/30">
              <p className="text-destructive font-semibold text-center">Не увлекайтесь самостоятельным лечением трофических язв, в противном случае рискуете получить серьезные осложнения. Лечение и подбор компрессионных изделий должен проводить опытный флеболог.</p>
            </div>
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

export default YazvyPage;

