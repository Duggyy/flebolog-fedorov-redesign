import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { getNewsItem } from "@/components/news-data";

/** Old-site images carry align/width attributes; keep the original text-wrap layout. */
const imageStyle = (align: string, width: string): CSSProperties => {
  const w = width ? (width.endsWith("%") ? width : `${width}px`) : undefined;
  if (align === "left") {
    return { float: "left", width: w, maxWidth: "45%", margin: "0.25rem 1.25rem 0.75rem 0" };
  }
  if (align === "right") {
    return { float: "right", width: w, maxWidth: "45%", margin: "0.25rem 0 0.75rem 1.25rem" };
  }
  return { width: w, maxWidth: "100%", margin: "1.5rem auto", display: "block" };
};

const NewsPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getNewsItem(slug) : undefined;
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

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SiteNav />
        <main className="flex-1">
          <section className="py-24">
            <div className="container text-center">
              <h1 className="text-2xl font-bold text-foreground mb-3">Новость не найдена</h1>
              <p className="text-muted-foreground mb-6">
                Возможно, ссылка устарела или материал был перемещён.
              </p>
              <Link to="/news" className="text-primary hover:underline font-semibold">
                Вернуться к новостям
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
              <Link to="/news" className="hover:text-primary transition-colors">Новости</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium line-clamp-1">{item.title}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight max-w-4xl">
              {item.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time>{item.date}</time>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              {item.anons && (
                <p className="mb-8 border-l-4 border-primary/40 pl-4 text-lg font-medium leading-relaxed text-foreground">
                  {item.anons}
                </p>
              )}

              {/* flow-root contains the floated images from the source markup */}
              <div className="flow-root">
                {item.blocks.map((block, i) => {
                  if (block.type === "heading") {
                    return (
                      <h2 key={i} className="mt-10 mb-4 text-xl md:text-2xl font-bold text-foreground">
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === "text") {
                    return (
                      <p key={i} className="mb-4 text-base leading-relaxed text-muted-foreground">
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={i} className="mb-5 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
                        {block.items.map((li, j) => (
                          <li key={j}>{li}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "video") {
                    const src =
                      block.platform === "rutube"
                        ? `https://rutube.ru/play/embed/${block.id}`
                        : block.platform === "vk"
                          ? `https://vk.com/video_ext.php?oid=${block.oid}&id=${block.id}`
                          : `https://www.youtube.com/embed/${block.id}`;
                    return (
                      <div key={i} className="my-8 aspect-video w-full overflow-hidden rounded-xl bg-black">
                        <iframe
                          src={src}
                          title={item.title}
                          className="h-full w-full"
                          allow="clipboard-write; autoplay; fullscreen; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setZoom(block.src)}
                      style={imageStyle(block.align, block.width)}
                      className="cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                      aria-label="Открыть изображение"
                    >
                      <img src={block.src} alt={item.title} loading="lazy" decoding="async" className="w-full rounded-lg" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 border-t border-border pt-6">
                <Link
                  to="/news"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Все новости и события
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
            alt={item.title}
            className="mx-auto block max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default NewsPost;
