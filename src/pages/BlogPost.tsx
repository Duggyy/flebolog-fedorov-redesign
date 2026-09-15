import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { getBlogPost } from "@/components/blog-data";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    setZoom(null);
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SiteNav />
        <main className="flex-1">
          <section className="py-24">
            <div className="container text-center">
              <h1 className="text-2xl font-bold text-foreground mb-3">Публикация не найдена</h1>
              <p className="text-muted-foreground mb-6">
                Возможно, ссылка устарела или материал был перемещён.
              </p>
              <Link to="/blog" className="text-primary hover:underline font-semibold">
                Вернуться в блог врача
              </Link>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

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
              <Link to="/blog" className="hover:text-primary transition-colors">Блог врача</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
            </div>

            {post.kicker && (
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">{post.kicker}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time>{post.date}</time>
              </span>
              {post.source && (
                <span className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                  {post.source}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              {post.anons && (
                <p className="mb-8 border-l-4 border-primary/40 pl-4 text-lg font-medium leading-relaxed text-foreground">
                  {post.anons}
                </p>
              )}

              {post.blocks.map((block, i) => {
                if (block.type === "heading") {
                  return (
                    <h2 key={i} className="mt-10 mb-4 text-xl md:text-2xl font-bold text-foreground">
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "text") {
                  return (
                    <p key={i} className="mb-5 text-base leading-relaxed text-muted-foreground">
                      {block.text}
                    </p>
                  );
                }
                if (block.type === "video") {
                  return (
                    <figure key={i} className="my-8">
                      <video
                        src={block.src}
                        poster={post.cover || undefined}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full rounded-xl bg-black shadow-lg"
                      />
                    </figure>
                  );
                }
                return (
                  <figure key={i} className="my-8">
                    <button
                      type="button"
                      onClick={() => setZoom(block.src)}
                      className="block w-full overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                      aria-label="Открыть изображение"
                    >
                      <img
                        src={block.thumb}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full object-contain transition-transform duration-500 hover:scale-[1.02]"
                      />
                    </button>
                  </figure>
                );
              })}

              {post.pdf && (
                <p className="mt-8">
                  <a
                    href={post.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
                  >
                    <FileText className="h-4 w-4" />
                    Открыть PDF публикации
                  </a>
                </p>
              )}

              <div className="mt-12 border-t border-border pt-6">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Все публикации блога
                </Link>
              </div>
            </div>
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
            alt={post.title}
            className="mx-auto block max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BlogPost;
