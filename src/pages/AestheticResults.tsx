import { Link } from "react-router-dom";
import { ChevronRight, Images, X } from "lucide-react";
import { useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { aestheticResults } from "@/components/aesthetic-results-data";

const AestheticResults = () => {
  const [zoom, setZoom] = useState<string | null>(null);
  const hasResults = aestheticResults.length > 0;

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-14">
          <div className="container">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Эстетическая флебология. Результаты</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Эстетическая флебология</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Результаты</h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Удаление сосудистых звёздочек и «сеточек», лечение расширенных вен на ногах и руках
              с максимальным косметическим результатом.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            {hasResults ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {aestheticResults.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]"
                  >
                    <div className="grid grid-cols-2">
                      <div className="p-3 text-center md:p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">До</span>
                        <button
                          type="button"
                          onClick={() => setZoom(item.before)}
                          className="mt-2 block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Открыть фото до процедуры"
                        >
                          <img
                            src={item.before}
                            alt="До процедуры"
                            width="400"
                            height="400"
                            loading="lazy"
                            decoding="async"
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                      </div>
                      <div className="border-l border-border p-3 text-center md:p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">После</span>
                        <button
                          type="button"
                          onClick={() => setZoom(item.after)}
                          className="mt-2 block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Открыть фото после процедуры"
                        >
                          <img
                            src={item.after}
                            alt="После процедуры"
                            width="400"
                            height="400"
                            loading="lazy"
                            decoding="async"
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                      </div>
                    </div>
                    {item.caption && (
                      <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">{item.caption}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl rounded-2xl bg-card p-10 text-center shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Images className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">Фотографии готовятся к публикации</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Раздел пополняется результатами процедур. Если вы хотите увидеть примеры по своей ситуации,
                  задайте вопрос на консультации — доктор покажет подходящие случаи.
                </p>
                <Link
                  to="/reviews"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Посмотреть отзывы пациентов
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 text-white/80 transition-colors hover:text-white"
            onClick={() => setZoom(null)}
            aria-label="Закрыть изображение"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={zoom}
            alt="Увеличенное фото"
            className="mx-auto block max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AestheticResults;
