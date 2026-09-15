import { Link } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { blogPosts } from "@/components/blog-data";

const Blog = () => {
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
              <span className="text-foreground font-medium">Блог врача</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Публикации</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Блог врача</h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Статьи, видео и публикации Дмитрия Анатольевича Фёдорова о лечении варикозной болезни,
              современных методиках и оборудовании.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article
                  key={post.slug}
                  className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] transition-all hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)]"
                >
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {post.cover ? (
                        <img
                          src={post.cover}
                          alt={post.title}
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <time>{post.date}</time>
                        {post.source && (
                          <span className="rounded-md bg-secondary/10 px-2 py-0.5 font-medium text-secondary">
                            {post.source}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.anons && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{post.anons}</p>
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

export default Blog;
