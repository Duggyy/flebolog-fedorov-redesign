import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { conferenceAlbums } from "@/components/conference-gallery-data";

/**
 * Если картинка не загрузилась (файла нет, обрыв связи), подставляем запасной
 * источник: в сетке — полноразмерное фото вместо миниатюры, в лайтбоксе —
 * миниатюру вместо полного. Срабатывает один раз, чтобы не зациклиться.
 */
const handleImageError = (event: SyntheticEvent<HTMLImageElement>, fallback: string) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = fallback;
};

const ConferencePhotos = () => {
  const { slug } = useParams();
  const album = slug ? conferenceAlbums.find((item) => item.slug === slug) : null;
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => {
        if (current === null || !album) return current;
        const total = album.photos.length;
        return (current + delta + total) % total;
      });
    },
    [album],
  );

  useEffect(() => {
    setIndex(null);
  }, [slug]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, step]);

  if (album) {
    const current = index === null ? null : album.photos[index];

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
                <Link to="/conference-photos" className="hover:text-primary transition-colors">
                  Фото с конференций
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">{album.title}</span>
              </div>
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Фотогалерея</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{album.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  to="/conference-photos"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Все альбомы
                </Link>
                <span className="text-sm text-muted-foreground">
                  {album.photos.length}{" "}
                  {album.photos.length === 1 ? "фотография" : album.photos.length < 5 ? "фотографии" : "фотографий"}
                </span>
              </div>
            </div>
          </section>

          <section className="py-14">
            <div className="container">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.photos.map((photo, photoIndex) => (
                  <button
                    key={photo.full}
                    type="button"
                    className="group overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)] transition-all hover:-translate-y-1"
                    onClick={() => setIndex(photoIndex)}
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={photo.thumb}
                        alt={photo.alt}
                        width="600"
                        height="450"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => handleImageError(event, photo.full)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />

        {current && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={album.title}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              onClick={close}
              aria-label="Закрыть фото"
            >
              <X className="h-8 w-8" />
            </button>

            {album.photos.length > 1 && (
              <>
                <button
                  className="absolute left-3 md:left-6 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  className="absolute right-3 md:right-6 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <figure className="flex flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
              <img
                src={current.full}
                alt={current.alt}
                onError={(event) => handleImageError(event, current.thumb)}
                className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              />
              <figcaption className="text-sm text-white/70">
                {(index ?? 0) + 1} / {album.photos.length}
              </figcaption>
            </figure>
          </div>
        )}
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Фото с конференций</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Фотогалерея</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Фото с конференций</h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Фотографии с профессиональных конференций, форумов и встреч по флебологии.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferenceAlbums.map((item) => (
                <Link
                  key={item.slug}
                  to={`/conference-photos/${item.slug}`}
                  className="group overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)] transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={item.cover}
                      alt={item.title}
                      width="600"
                      height="375"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => handleImageError(event, item.photos[0].full)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Images className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.photos.length}{" "}
                      {item.photos.length === 1 ? "фотография" : item.photos.length < 5 ? "фотографии" : "фотографий"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ConferencePhotos;
