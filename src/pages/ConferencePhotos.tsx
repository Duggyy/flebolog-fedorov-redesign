import { Link, useParams } from "react-router-dom";
import { ChevronRight, Images, X } from "lucide-react";
import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { conferenceAlbums } from "@/components/conference-gallery-data";

const ConferencePhotos = () => {
  const { slug } = useParams();
  const album = slug ? conferenceAlbums.find((item) => item.slug === slug) : null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (album) {
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
                  Фотографии с конференций
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">{album.title}</span>
              </div>
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Фотогалерея</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{album.title}</h1>
              <Link to="/conference-photos" className="text-sm font-semibold text-primary hover:underline">
                Назад к списку конференций
              </Link>
            </div>
          </section>

          <section className="py-14">
            <div className="container">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {album.photos.map((photo) => (
                  <button
                    key={photo.src}
                    type="button"
                    className="group overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)] transition-all text-left"
                    onClick={() => setSelectedImage(photo.src)}
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Закрыть фото"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt={album.title}
              className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
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
              <span className="text-foreground font-medium">Фотографии с конференций</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Фотогалерея</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Фотографии с конференций
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Фотографии с профессиональных конференций, форумов и встреч по флебологии.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferenceAlbums.map((album) => (
                <Link
                  key={album.slug}
                  to={`/conference-photos/${album.slug}`}
                  className="group overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)] transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Images className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {album.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Открыть фотографии
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
