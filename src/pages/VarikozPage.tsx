import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import TreatmentSection from "@/components/TreatmentSection";
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const VarikozPage = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <SiteNav />

    {/* Breadcrumb */}
    <div className="bg-muted border-b border-border">
      <div className="container py-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Варикозная болезнь</span>
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
            Варикозная болезнь (варикоз)
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Полное руководство по диагностике, лечению и профилактике
          </p>
        </div>
      </div>
    </section>

    {/* Content */}
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-muted-foreground text-base leading-relaxed">Варикозная болезнь (варикоз) – это не только женское заболевание, как принято считать, очень часто с этой неприятной проблемой сталкиваются и мужчины. Однако женщины придают большее значение этого явлению в силу выраженного косметического дефекта. Зачастую, глядя в зеркало, женщина обнаруживает у себя сосудистые «звездочки» и расстраивается именно из-за внешних проявлений болезни. Но все не так просто.</p>
            <p className="text-muted-foreground text-base leading-relaxed">Варикозное расширение вен нижних конечностей коварное заболевание. По данным Всемирной организации здравоохранения им страдает около двадцати процентов населения планеты в возрасте от двадцати пяти лет и старше. Первые проявления варикоза не имеют выраженных внешних признаков, а значит, обнаружить его в начальной стадии бывает затруднительно. Поэтому необходимо заниматься профилактикой. Ряд элементарных правил поможет сохранить вены здоровыми. Сбалансированное питание, удобная обувь и отдых для ног позволят продлить их молодость и красоту.</p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Механизм развития варикозного расширения вен</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base leading-relaxed">Суть варикозной болезни состоит в том, что вены с возрастом становятся менее эластичными, стенка сосудов растягивается и происходит его расширение. Можно сказать, что данное заболевание является следствием прямохождения человека. Медицине известно о нем еще с давних времен. Усугубляют ситуацию различные неблагоприятные факторы, под воздействием которых процесс ускоряется.</p>
              <p className="text-muted-foreground text-base leading-relaxed">Венозные клапаны начинают хуже справляться со своей работой, перегружая сосуды. Следствием этого является появление чувства тяжести в ногах, образование отеков, затем прибавляются косметические проявления в виде выраженной сосудистой сетки. Если не предпринимать никаких мер, заболевание будет прогрессировать, и появятся более тяжелые проявления варикоза.</p>
              <p className="text-muted-foreground text-base leading-relaxed">В последние годы варикозная болезнь вен стала молодеть. Если раньше первые проявления регистрировались у людей старше тридцати пяти лет, то сейчас за медицинской помощью обращаются молодые люди в возрасте двадцати-тридцати лет.</p>
              <p className="text-muted-foreground text-base leading-relaxed">Ранние проявления варикоза заметить непросто. Но если у вас появились судороги или часто устают ноги, то это повод понаблюдать за своим здоровьем более пристально. В случае появления сосудистых «звездочек» желательно обратиться к врачу и пройти обследование. Варикозное расширение вен может прогрессировать очень быстро, а чем запущеннее болезнь, тем сложнее она поддается лечению. Варикоз на последних стадиях приводит к образованию тромбов и трофических язв. Поэтому не откладывайте с визитом к врачу, если заметили у себя первые признаки варикозной болезни.</p>
              <p className="text-muted-foreground text-base leading-relaxed">Надо отметить, что варикоз страшен не только своими внешними проявлениями и дискомфортом. Как и любое заболевание, варикозное расширение вен может сопровождаться развитием осложнений. Именно они являются крайне нежелательными и могут приводить к инвалидизации и летальным исходам. Основными проблемами, с которыми могут столкнуться больные даже на ранних стадиях заболевания, это тромбофлебит и спонтанное (ничем не спровоцированное) кровотечение из варикозных узлов. И если кровотечение из варикозной вены можно остановить прижатием или перевязкой, то тромбофлебит может привести к отрыву тромба и развитию тромбоэмболии легочной артерии (ТЭЛА). К сожалению, такое развитие ситуации может привести к инфаркт-пневмонии или даже летальному исходу.</p>
              <p className="text-muted-foreground text-base leading-relaxed">При достаточно запущенном и долго существующем варикозе возникают локальные нарушения кровоснабжения в голенях. Сначала это вызывает появление потемнения кожи, затем ее истончение и далее формируется трофическая язва. Это очень серьезное осложнение, которое часто требует длительного и дорогостоящего лечения. К сожалению, такую ситуацию не всегда удается вылечить. Иногда формируется стойкое нарушение кровоснабжения, вплоть до инвалидизации.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border-l-8 border-primary shadow-xl">
            <p className="text-xl font-semibold text-primary mb-6 italic text-center">ИМЕННО ПОЭТОМУ не надо ждать, пока болезнь примет запущенные и осложненные формы. Чем раньше начать лечение, тем больше шансов на успех. Кроме этого, лечение на ранних стадиях проходит быстрее, комфортнее, да и стоит намного дешевле.</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Причины возникновения варикозной болезни</h2>
            <p className="text-muted-foreground text-base leading-relaxed">Назвать точную и единственную причину возникновения варикозного расширения крайне затруднительно. По сути это совокупность различных факторов, которые вместе дают толчок развитию процесса. Среди них можно выделить несколько основных:</p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Наследственный фактор</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">К сожалению, наследственность в данном случае играет большую роль. Если ваши родители или бабушки и дедушки страдали от варикозного расширения вен, то, скорее всего, у вас оно появится тоже. Вероятность проявления генов составляет более девяноста процентов. Неблагоприятные факторы только ускорят это процесс. Вам нужно с молодого возраста наблюдать за состоянием сосудов.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Беременность</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Во время беременности женский организм претерпевает большие изменения: перестраивается гормональный фон, растет матка, сдавливая сосуды, значительно увеличивается масса тела. Все эти изменения негативно сказываются на кровеносной системе и в особенности на венах. Во время процесса родов сосуды в буквальном смысле проверяются на прочность. Очень многие женщины именно после беременности начинают жаловаться на варикозное расширение вен.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Вредные привычки</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Курение, алкоголь и перекусы чем попало, крайне негативно сказываются на состоянии стенок сосудов. Регулярное злоупотребление спиртосодержащими напитками, выкуривание большого количества сигарет в день и фаст-фуд неизбежно приведет к варикозной болезни. Излюбленная привычка многих женщин сидеть нога на ногу также препятствует нормальному току крови, а значит, травмирует сосуды.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Условия труда</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">В группе риска находятся работники тех профессий, когда приходится долгое время стоять на ногах: врачи, продавцы, парикмахеры и другие. Стоит насторожиться и работникам офиса, поскольку долгое сидение не менее вредно. Для профилактики варикоза таким людям необходимо делать регулярные кратковременные перерывы, делать зарядку, прогуливаться для того, чтобы ликвидировать застойные явления в сосудах.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Неудобная обувь и одежда</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Узкая тесная обувь и высокие каблуки, если они носятся постоянно, приводят к варикозному расширению вен. Но обувь на сплошной подошве тоже не лучший вариант. Самыми удобными считаются туфли на небольшом каблуке до четырех сантиметров. Вредной также будет слишком сильно обтягивающая одежда, особенно из синтетических тканей. Постоянное давление и отсутствие воздуха – негативные факторы.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-primary border-b border-primary pb-1 mb-4 inline-block">Большие физические нагрузки</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Спортсмены также находятся в группе риска по варикозной болезни вен. Особенно часто от нее страдают любители тяжелой атлетики. Постоянное поднятие тяжестей и наличие наследственной предрасположенности гарантированно приведет к варикозу. Таскание тяжелых сумок женщинами можно отнести к этому же разряду, поэтому стоит себя беречь и стараться не поднимать тяжести слишком часто, особенно если у родственников было варикозное расширение вен.</p>
              </div>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed mt-6">Сочетание нескольких факторов одновременно значительно повышает риск возникновения варикоза поэтому, даже имея здоровые вены сегодня, лучше регулярно заниматься профилактикой, чем в скором времени пополнить ряды людей страдающих от этой неприятной болезни.</p>
          </div>

          <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Современные методы диагностики варикозного расширения вен</h2>
          <div className="bg-card rounded-xl p-6 border border-border">
            <p className="text-muted-foreground text-base leading-relaxed mb-4">В настоящее время медицина имеет на вооружении несколько современных методов диагностики. Поставить диагноз варикоза сегодня можно даже на ранних стадиях возникновения болезни. Конечно, самым простым и необходимым, является внешний осмотр и сбор анамнеза заболевания. Дальше применяется инструментальный метод исследования. Именно он поможет полностью прояснить картину и подобрать оптимальное лечение. Наиболее распространенными методами являются:</p>
            <p className="text-muted-foreground text-base leading-relaxed font-semibold text-primary border-b border-primary pb-1"><span className="text-primary mr-2 font-bold">▸</span>Ультразвуковое исследование с оценкой размера, извитости вен и направления кровотока. Это основной и самый распространенный метод диагностики. Существует много расхожих названий – дуплекс, триплекс, УЗДГ, УЗДС и множество модификаций на эту тему. Главное – это суть исследования – оценить состояние глубоких и поверхностных вен. Обследование занимает не более получаса, но является достаточно информативным методом.</p>
            <p className="text-muted-foreground text-base leading-relaxed font-semibold text-primary border-b border-primary pb-1"><span className="text-primary mr-2 font-bold">▸</span>Флебография – это инвазивная методика, которая основана на введении в сосудистое русло контрастного вещества и осмотром на рентгене или компьютерном томографе. Обычно его назначают при нечеткой клинической картине варикоза и для уточнения диагноза в сложных. Такими могут быть врожденные аномалии развития сосудов, тромботические поражения магистральных вен, сдавление сосудов извне (опухоли, травмы и пр).</p>
            <p className="text-muted-foreground text-base leading-relaxed">После проведения диагностических исследований флеболог оценивает тяжесть заболевания и назначает необходимое лечение варикоза.</p>
          </div>

          <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">Лечение варикозного расширения вен в современной медицине</h2>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Эндовазальная (внутрисосудистая) лазерная коагуляция вен (ЭВЛК)</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">современный метод лечения варикоза с помощью лазера. На данный момент это «ЗОЛОТОЙ СТАНДАРТ» в лечении варикоза. Применяться данная методика лечения стала на рубеже веков в 1999–2000  гг. С 2009 г. данное лечение было утверждено «Минздравом» и разрешено к применению в России. Преимуществами ЭВЛК являются безопасность и низкая травматичность для пациента, а также возможность полностью амбулаторного лечения. При этом методе с помощью лазера «запаивается» сегмент магистральной вены, которая поражена варикозом.</p>
            </div>
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Радиочастотная коагуляция (РЧО)</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">метод полностью схожий с ЭВЛК, но для проведения коагуляции вены используется не энергия лазера, а микроволновое излучение.</p>
            </div>
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Тотальная ЭВЛК (ТоталЭВЛК)</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">самая современная и малотравматичная методика. При таком лечении амбулаторно с помощью внутрисосудистого лазера «запаиваются» не только все варикозно измененные магистральные вены, но и пораженные болезнью узлы. Ведь именно узлы наиболее часто заставляют наших пациентов обратиться за лечением.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-400 shadow-md">
              <h3 className="text-xl font-bold text-destructive underline underline-offset-4 decoration-destructive mb-3">Флебэктомия</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">является самым старым и травматичным способом лечения варикоза. Эта операция выполняется из нескольких разрезов, после чего пораженная вена выдергивается из ноги – и это не преувеличение! К сожалению, это приводит к формированию больших гематом и требует обязательных перевязок иногда с необходимостью выдавливания этих кровяных сгустков. Кроме этого, хирург не может контролировать полноценность и адекватность выполнения операции, т.к. не проводится УЗИ-контроль выполненного лечения. К сожалению, при выдергивании вен иногда происходит травматизация окружающих нервов с формированием стойкого нарушения чувствительности, особенно в области нижней трети голени и голеностопа. Такое лечение проводится в условиях стационара и сопровождается необходимостью госпитализации на несколько дней. Восстановительный период может быть и коротким, а может растянуться на несколько недель и даже месяцев.</p>
              <p className="text-muted-foreground text-sm leading-relaxed font-semibold mt-3">Надо отметить, что в специализированных флебологических центрах эта методика не применяется именно в силу своей травматичности, необходимости госпитализации и обязательного анестезиологического пособия.</p>
            </div>
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Минифлебэктомия</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">используется как дополнение к ЭВЛК сегмента магистральной вены и, по сути, ничем не отличается от традиционной флебэктомии по своей травматичности. Однако при этом методе выдергиваются не магистральные вены, а крупные варикозные узлы. Такая операция выполняется из небольших проколов.</p>
              <p className="text-muted-foreground text-sm leading-relaxed font-semibold mt-3">Отрицательные моменты:</p>
              <ul className="text-muted-foreground text-sm leading-relaxed list-disc ml-6 space-y-1 mt-2">
                <li>все та же травматичность, т.к. это механическое выдергивание вен;</li>
                <li>отсутствие контроля полноценности и эффективности операции, т.к. выполняется вслепую, без УЗИ-контроля по заранее нарисованным участкам;</li>
                <li>необходимость выполнения перевязок и выдавливания образовавшихся гематом на месте удаленных узлов. </li>
              </ul>
            </div>
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Склеротерапия</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">– один из самых эффективных методов лечения ретикулярного варикоза, косметических вен и капилляров. Также часто применяется как продолжение лечения после внутрисосудистого запаивания магистральных вен и крупных узлов. Существуют различные способы проведения склеротерапии: жидкая и вспененная форма, УЗИ-сопровождение, микросклеротерапия капиллярных сеточек и т.д.</p>
            </div>
            <div className="bg-card rounded-xl p-6 border-l-4 border-primary hover:border-primary/70 transition-all">
              <h3 className="text-xl font-bold text-primary underline underline-offset-4 decoration-primary mb-3">Нетермальные нетумесцентные методы (NTNT)</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">– сюда относят механохимическую и клеевую облитерацию сегментов магистральных вен. На данный момент методики не очень распространены в России, а некоторые вообще являются спорными.</p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed italic mt-8">Конечно же проводятся и другие научные поиски и разработки. Это обработка вен паром, запайка с помощью внекорпорального ультразвука, наподобие дробления камней. На данный момент это в основном именно творчество и научные эксперименты. Но, мы всегда ждем новых методов…</p>
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

export default VarikozPage;

