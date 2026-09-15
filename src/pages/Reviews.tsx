import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

type ProDoctorovReview = {
  name: string;
  date: string;
  rating: string;
  speciality: string;
  text: string;
  publishedAt?: string;
};

type ProDoctorovRating = {
  stars: number;
  totalRates: number;
  bestQuote?: string;
  profileUrl?: string;
};

type ReviewsPayload = {
  source?: string;
  isCached?: boolean;
  cachedAt?: string | null;
  rating?: ProDoctorovRating | null;
  reviews?: ProDoctorovReview[];
};

const PRODOCTOROV_PROFILE_URL = "https://prodoctorov.ru/obninsk/vrach/556844-fedorov/#otzivi";

/** Русское склонение: 1 оценка, 2 оценки, 5 оценок. */
const plural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};

const Stars = ({ value }: { value: number }) => (
  <span className="flex items-center gap-0.5" role="img" aria-label={`Рейтинг ${value.toFixed(1)} из 5`}>
    {[0, 1, 2, 3, 4].map((index) => (
      <svg key={index} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path
          d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
          fill={index < Math.round(value) ? "#F5A623" : "#E2E5EA"}
        />
      </svg>
    ))}
  </span>
);

/**
 * ПроДокторов закрывает страницы врача JS-защитой от ботов (ServicePipe) и не
 * отдаёт публичного API со списком отзывов. Поэтому ни браузер, ни серверный
 * запрос не могут прочитать отзывы «вживую»: скрипт
 * scripts/refresh-prodoctorov-reviews.mjs раз в сутки перезаписывает
 * /data/prodoctorov-reviews.json, а страница просто берёт самый свежий
 * доступный снимок.
 *
 * Источники перебираются по порядку — каждый следующий нужен только если
 * предыдущий недоступен. Если не ответил ни один, на экране остаются ранее
 * загруженные отзывы (встроенный список), а не пустой блок.
 */
const REVIEWS_SOURCES = [
  "/data/prodoctorov-reviews.json",
  "/api/prodoctorov-reviews.php",
  "/data/prodoctorov-reviews-fallback.json",
] as const;

const REQUEST_TIMEOUT_MS = 8000;

const fetchReviews = async (url: string) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`reviews_source_${response.status}`);

    const payload = (await response.json()) as ReviewsPayload;
    if (!Array.isArray(payload.reviews) || payload.reviews.length === 0) {
      throw new Error("reviews_source_empty");
    }

    return {
      reviews: payload.reviews.slice(0, 4),
      cachedAt: payload.cachedAt ?? null,
      rating: payload.rating ?? null,
    };
  } finally {
    window.clearTimeout(timer);
  }
};

/**
 * Последний рубеж: показывается, только если не ответил ни один источник выше.
 * Актуальный снимок живёт в /data/prodoctorov-reviews.json — этот список нужен
 * лишь чтобы блок отзывов никогда не оказался пустым.
 */
const fallbackReviews: ProDoctorovReview[] = [
  {
    name: "Пациент +7 914 20XXXXX",
    date: "4 июня 2026 в 13:54",
    rating: "5.0 Отлично",
    speciality: "Флеболог",
    text: "Хочу выразить огромную благодарность Фёдорову Дмитрию Анатольевичу за его профессионализм, мастерство, доброту, искренность, чуткость! Обратилась к нему с проблемой варикозного расширения вен. После консультации, результатов УЗИ, была направленна на ЭВЛК, которую Дмитрий Анатольевич провел блестяще! Далее мне провели сеанс склеротерапии, и я с уверенностью могу сказать, что у доктора золотые руки."
  },
  {
    name: "Пациент +7 925 82XXXXX",
    date: "27 мая 2026 в 15:59",
    rating: "5.0 Отлично",
    speciality: "Флеболог",
    text: "Обратилась к Федорову Дмитрию Анатольевичу повторно. До этого 2 года назад он провел лазерную коагуляцию, и я осталась очень довольна результатом. В этот раз доктор на приеме проверил состояние вен и посоветовал склеротерапию, все объяснил и дал рекомендации."
  },
  {
    name: "Пациент +7 977 81XXXXX",
    date: "20 мая 2026 в 12:51",
    rating: "5.0 Отлично",
    speciality: "Флеболог",
    text: "Меня стала беспокоить тяжесть в ногах, усталость, появились звездочки и вены. Решила заняться этим вопросом. Обратилась по совету к врачу, сделали УЗИ, и врач принял решение, что мне необходима лазерная коагуляция обеих ног. Почитала положительные отзывы о враче и решила поехать к нему, меня не смутили 120 км в один конец. И я не пожалела ни разу."
  },
  {
    name: "Пациент +7 910 91XXXXX",
    date: "20 мая 2026 в 07:05",
    rating: "5.0 Отлично",
    speciality: "Флеболог",
    text: "Болела нога. В 2013 году был тромбоз и операция по купированию вены. Было сделано УЗИ и операция по спаиванию вены лазером. Доктор был внимательный, все объяснял и пояснял рекомендации."
  }
];

/**
 * Рейтинг на последний случай, когда не ответил ни один источник.
 * Живые значения приходят в /data/prodoctorov-reviews.json (поле `rating`).
 */
const fallbackRating: ProDoctorovRating = { stars: 5, totalRates: 68 };

const Reviews = () => {
  const [reviews, setReviews] = useState<ProDoctorovReview[]>(fallbackReviews);
  const [rating, setRating] = useState<ProDoctorovRating | null>(fallbackRating);
  const [reviewsSource, setReviewsSource] = useState<string>("built-in");
  const [reviewsUpdatedAt, setReviewsUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      for (const source of REVIEWS_SOURCES) {
        try {
          const { reviews: loaded, cachedAt, rating: loadedRating } = await fetchReviews(source);
          if (cancelled) return;
          setReviews(loaded);
          setReviewsSource(source);
          setReviewsUpdatedAt(cachedAt);
          // Источник может не содержать рейтинг — тогда оставляем прежний.
          if (loadedRating) setRating(loadedRating);
          return;
        } catch {
          // Источник недоступен — пробуем следующий. Если не ответит ни один,
          // ниже останутся ранее загруженные отзывы.
        }
      }

      if (!cancelled) {
        setReviews(fallbackReviews);
        setRating(fallbackRating);
        setReviewsSource("built-in");
        setReviewsUpdatedAt(null);
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      <main className="flex-1">
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

      {/*
        Рейтинг на ПроДокторов.
        Раньше здесь стоял официальный виджет (widget_footer.js). Он перестал
        работать: ПроДокторов отдаёт на его скрипт HTML-заглушку, и браузер
        блокирует её (Opaque Response Blocking), поэтому блок оставался пустым.
        Теперь рейтинг забирает scripts/refresh-prodoctorov-reviews.mjs и мы
        рисуем его сами — данные те же, что показывал виджет.
      */}
      {rating && (
        <section className="py-12 bg-background" data-rating-stars={rating.stars}>
          <div className="container max-w-4xl">
            <div className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <a
                  href={PRODOCTOROV_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Федоров Дмитрий Анатольевич
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={rating.stars} />
                  <span className="text-sm text-muted-foreground">
                    {rating.stars.toFixed(1)} · {rating.totalRates}{" "}
                    {plural(rating.totalRates, "оценка", "оценки", "оценок")} на ПроДокторов
                  </span>
                </div>
              </div>
              <a
                href={rating.profileUrl || PRODOCTOROV_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                Читать все отзывы →
              </a>
            </div>
            <div className="pd_powered_by mt-8 text-center">
              <a target="_blank" rel="noopener noreferrer" href="https://prodoctorov.ru">
                <img className="pd_logo mx-auto" width="132" src="/images/prodoctorov-logo.png" alt="ProDoctorov" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Latest ProDoctorov reviews */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">ПроДокторов</p>
              <h2 className="text-3xl font-bold text-foreground">Последние отзывы пациентов</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {reviewsUpdatedAt
                ? `ПроДокторов · обновлено ${new Date(reviewsUpdatedAt).toLocaleDateString("ru-RU")}`
                : "Показаны последние сохранённые отзывы"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-reviews-source={reviewsSource}>
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
                    <p className="text-xs text-muted-foreground">
                      {[r.date, r.rating, r.speciality].filter(Boolean).join(" · ")}
                    </p>
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
      </main>

      <SiteFooter />
    </div>
  );
};

export default Reviews;
