import { Link } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { newsItems } from "@/components/news-data";

const News = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-14">
          <div className="container">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Новости</span>
            </div>

            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">События</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Новости и события
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Конференции, мастер-классы и профессиональные достижения в области флебологии.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] transition-all hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)]"
                >
                  <Link to={`/news/${item.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {item.cover ? (
                        <img
                          src={item.cover}
                          alt={item.title}
                          width="640"
                          height="400"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          Без изображения
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <time>{item.date}</time>
                      </div>
                      {/* ⚠️ h2, а не h3 — как во всех остальных списках сайта
                          (блог, альбомы конференций, доклады, коллеги). В списке
                          новостей заголовок карточки был единственным h3 среди
                          h2, из-за чего получался перескок h1 → h3. Оформление
                          задаётся классами, поэтому на вид ничего не меняется. */}
                      <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h2>
                      {item.anons && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.anons}</p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default News;
