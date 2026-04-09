import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import TreatmentSection from "@/components/TreatmentSection";
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const TromboflebitPage = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <SiteNav />

    {/* Breadcrumb */}
    <div className="bg-muted border-b border-border">
      <div className="container py-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Тромбофлебит</span>
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
            Тромбофлебит
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Диагностика, лечение и профилактика тромбофлебита
          </p>
        </div>
      </div>
    </section>

    {/* Content */}
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Что такое тромбофлебит</h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-base leading-relaxed">Тромбофлебит – патологическое состояние, при котором происходит формирование тромботических масс в просвете вен с развитием сопутствующей воспалительной реакции окружающих тканей.</p>
              <p className="text-muted-foreground text-lg leading-relaxed font-semibold">Существует две разновидности заболевания:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-primary/30">
                  <h3 className="text-xl font-bold text-primary mb-3">Тромбофлебит поверхностных вен</h3>
                  <p className="text-muted-foreground text-sm">при поражении вен, которые расположены близко к поверхности кожи.</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-primary/30">
                  <h3 className="text-xl font-bold text-primary mb-3">Тромбофлебит глубоких вен</h3>
                  <p className="text-muted-foreground text-sm">при заболевании глубоко расположенных вен.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Причины возникновения заболевания</h2>
            <p className="text-muted-foreground text-base leading-relaxed">Этот недуг может быть спровоцирован рядом причин:</p>
            <div className="space-y-3 mt-6">
              <p className="font-semibold text-primary text-base border-l-4 border-primary pl-4 py-2 bg-primary/5"><span className="text-primary font-bold mr-2">▸</span>варикозная болезнь, не подвергающаяся своевременному лечению, ведь тромбофлебит является одним из осложнений варикоза;</p>
              <p className="font-semibold text-primary text-base border-l-4 border-primary pl-4 py-2 bg-primary/5"><span className="text-primary font-bold mr-2">▸</span>повреждение венозной стенки, это может быть химическое воздействие (введение препаратов), травматическое или за счет сдавления извне;</p>
              <p className="font-semibold text-primary text-base border-l-4 border-primary pl-4 py-2 bg-primary/5"><span className="text-primary font-bold mr-2">▸</span>повышение свёртываемости крови, её загустение в силу обезвоживания или наследственные факторы - тромбофилии;</p>
              <p className="font-semibold text-primary text-base border-l-4 border-primary pl-4 py-2 bg-primary/5"><span className="text-primary font-bold mr-2">▸</span>снижение скорости движения крови в организме по причине малой двигательной активности.</p>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl p-6 mt-6 border border-primary/30">
              <p className="font-bold text-primary text-lg">Варикозная болезнь — самая частая причина возникновения тромбофлебита. При несвоевременном лечении варикоза может формироваться осложнение – тромбофлебит, когда уже требуется лечение более серьёзного заболевания.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-destructive/10 to-destructive/20 rounded-2xl p-8 border-l-8 border-destructive shadow-xl mt-12">
            <h2 className="text-2xl font-bold text-destructive border-b-4 border-destructive pb-2 inline-block mb-6 tracking-tight">Симптомы тромбофлебита поверхностных вен</h2>
            <div className="space-y-4">
              <p className="text-destructive font-semibold text-xl leading-relaxed">Тромбофлебит поверхностных вен как правило развивается именно в варикозных венах. Это приводит к формированию болезненных уплотнений, покраснению кожи и формированию местного повышения температуры.</p>
              <p className="text-destructive font-bold text-2xl mt-8 bg-destructive/20 p-4 rounded-lg text-center">При возникновении этих симптомов важно незамедлительно обратиться за помощью к врачу.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Осложнения при отсутствии лечения тромбофлебита</h2>
            <p className="text-muted-foreground text-base leading-relaxed">Если своевременно не предпринять меры для лечения тромбофлебита, существует риск развития опасных осложнений. Серьёзность этого заболевания заключается в том, что на ранних стадиях его сложно диагностировать. Часто пациент даже не подозревает о том, что у него развивается тромбофлебит, так как внешние признаки проявляются уже в процессе прогрессирования болезни.</p>
            <div className="bg-destructive/10 rounded-xl p-6 mt-4 border-l-4 border-destructive">
              <h3 className="text-xl font-bold text-destructive mb-3">Самым опасным в течение этого заболевания является то, что может оторваться тромб, перекрывающий движение крови</h3>
              <p className="text-destructive font-semibold">Причём, произойти это может в любой момент, предугадать который нет никакой возможности. Оторвавшись, тромб отправляется в «свободное плавание» по кровеносной системе. При этом есть большой риск его попадания в кровеносные сосуды лёгких, что приводит к эмболии — перекрытию лёгочной артерии. Это опасно тем, что без моментальной помощи может наступить летальный исход.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Кто в группе риска?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-warning/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-warning mb-4">Основная группа риска</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• люди, страдающие варикозным расширением вен</li>
                  <li>• беременные женщины во время родов и послеродовом периоде</li>
                  <li>• люди с малоподвижным образом жизни</li>
                </ul>
              </div>
              <div className="bg-warning/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-warning mb-4">Дополнительные факторы риска</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• пациенты с высокой свёртываемостью крови</li>
                  <li>• послеоперационные пациенты</li>
                  <li>• люди, страдающие ожирением</li>
                  <li>• пожилые люди</li>
                  <li>• онкологические пациенты</li>
                </ul>
              </div>
            </div>
            <p className="text-primary font-semibold text-lg mt-6 bg-primary/10 p-4 rounded-lg">Важно осознавать принадлежность к группе риска, чтобы своевременно диагностировать заболевание на самых ранних стадиях. Это поможет избежать серьёзных осложнений.</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Лечение тромбофлебита</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">Лечение тромбофлебита поверхностных вен подбирается индивидуально, в зависимости от стадии и характера заболевания. Диагностику и назначение лечения проводить врач флеболог.</p>
                <p className="text-muted-foreground text-base leading-relaxed font-semibold mt-4 bg-primary/10 p-4 rounded-lg">В зависимости от распространенности тромбофлебита, его длительности и опасности отрыва тромба подбирается различная по продолжительности и объёму терапия.</p>
                <p className="text-primary font-bold mt-4 text-lg">Надо четко понимать, что «увидеть» тромб можно только при УЗИ, которое врач-флеболог должен выполнить на приеме. Никакие «внешние» признаки и пр. не являются точными данными заболевания. Именно поэтому этот диагноз нельзя поставить дистанционно или на основании простого осмотра.</p>
              </div>
              <div className="bg-emerald/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-emerald mb-4">Результат лечения</h3>
                <p className="text-emerald font-semibold text-lg mb-4">Существует множество различных схем лечения этого заболевания. В большинстве случаев можно проводить лечение амбулаторно.</p>
                <p className="text-muted-foreground text-sm leading-relaxed mt-4">После проведённого лечения, медикаментозного или хирургического, важно применять профилактические меры по предотвращению повторного возникновения заболевания.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <TreatmentSection />

    <SiteFooter />
  </div>
);

export default TromboflebitPage;

