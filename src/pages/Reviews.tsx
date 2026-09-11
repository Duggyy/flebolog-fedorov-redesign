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
};

type ReviewsPayload = {
  source: string;
  isCached?: boolean;
  cachedAt?: string | null;
  reviews: ProDoctorovReview[];
};

const fallbackReviews: ProDoctorovReview[] = [
  {
    name: "Пациент +7 916 52XXXXX",
    date: "9 января 2026 в 15:10",
    rating: "5.0 Отлично",
    speciality: "Флеболог",
    text: "17.12.25 проводилась ЭВЛК. От всего сердца я хочу поблагодарить Дмитрия Анатольевича за чуткое отношение, профессионализм и качественную помощь в лечении."
  },
  {
    name: "Пациент +7 919 03XXXXX",
    date: "14 ноября 2025 в 23:03",
    rating: "5.0 Отлично",
    speciality: "Сосудистый хирург (ангиохирург)",
    text: "Хочу выразить огромную благодарность и восхищение доктору Дмитрию Анатольевичу Федорову за блестяще проведенную операцию ЭВЛК по удалению варикозной вены на ноге."
  },
  {
    name: "Пациент +7 903 73XXXXX",
    date: "22 октября 2025 в 15:11",
    rating: "5.0 Отлично",
    speciality: "",
    text: "Был варикоз, болезненное ощущение в ноге, нашла доктора по отзывам на сайте и не пожалела. Хороший доктор, помог справиться с проблемой."
  },
  {
    name: "Пациент +7 968 66XXXXX",
    date: "17 июня 2025 в 11:07",
    rating: "5.0 Отлично",
    speciality: "",
    text: "Доктор Дмитрий Анатольевич очень хороший специалист с золотыми руками. Провел мне операцию блестяще. Рекомендую всем, кто хочет забыть, что такое варикозное расширение вен."
  }
];

const Reviews = () => {
  const [reviews, setReviews] = useState<ProDoctorovReview[]>(fallbackReviews);
  const [reviewsSource, setReviewsSource] = useState("fallback");
  const [reviewsUpdatedAt, setReviewsUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://prodoctorov.ru/static/js/widget_footer.js?v06";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch("/api/prodoctorov-reviews.php", { cache: "no-store" });
        if (!response.ok) throw new Error("reviews_api_unavailable");
        const payload = (await response.json()) as ReviewsPayload;
        if (!Array.isArray(payload.reviews) || payload.reviews.length === 0) {
          throw new Error("reviews_api_empty");
        }
        if (!cancelled) {
          setReviews(payload.reviews.slice(0, 4));
          setReviewsSource(payload.isCached ? "cache" : payload.source);
          setReviewsUpdatedAt(payload.cachedAt ?? null);
        }
        return;
      } catch {
        try {
          const response = await fetch("/data/prodoctorov-reviews-fallback.json", { cache: "no-store" });
          if (!response.ok) throw new Error("reviews_fallback_unavailable");
          const payload = (await response.json()) as ReviewsPayload;
          if (!cancelled && Array.isArray(payload.reviews) && payload.reviews.length > 0) {
            setReviews(payload.reviews.slice(0, 4));
            setReviewsSource("fallback");
            setReviewsUpdatedAt(payload.cachedAt ?? null);
          }
        } catch {
          if (!cancelled) {
            setReviews(fallbackReviews);
            setReviewsSource("fallback");
            setReviewsUpdatedAt(null);
          }
        }
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

      {/* Latest ProDoctorov reviews */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">ПроДокторов</p>
              <h2 className="text-3xl font-bold text-foreground">Последние отзывы пациентов</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {reviewsSource === "prodoctorov" ? "Обновлено при загрузке страницы" : "Показаны последние сохраненные отзывы"}
              {reviewsUpdatedAt ? ` · ${new Date(reviewsUpdatedAt).toLocaleDateString("ru-RU")}` : ""}
            </p>
          </div>
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
