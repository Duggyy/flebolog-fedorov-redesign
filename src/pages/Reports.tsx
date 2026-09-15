import { Link } from "react-router-dom";
import { ChevronRight, Play, X } from "lucide-react";
import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { reports, type Report } from "@/components/reports-data";

const formatDuration = (seconds: number) => {
  if (!seconds) return "";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const ReportCard = ({ report, onPlay }: { report: Report; onPlay: (report: Report) => void }) => {
  const playable = Boolean(report.video);

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] transition-all hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)]">
      {playable ? (
        <button
          type="button"
          className="group relative block aspect-video w-full overflow-hidden bg-muted"
          onClick={() => onPlay(report)}
          aria-label={`Смотреть: ${report.title}`}
        >
          <img
            src={report.poster}
            alt={report.title}
            width="640"
            height="360"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
            </span>
          </span>
          {report.duration > 0 && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
              {formatDuration(report.duration)}
            </span>
          )}
        </button>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted px-6 text-center">
          <span className="text-sm text-muted-foreground">Видео недоступно на источнике</span>
        </div>
      )}
      <div className="p-5">
        <h2 className="text-base font-bold text-foreground leading-snug">{report.title}</h2>
      </div>
    </article>
  );
};

const Reports = () => {
  const [active, setActive] = useState<Report | null>(null);

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
              <span className="text-foreground font-medium">Доклады и выступления</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Видео</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Доклады и выступления</h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Доклады и выступления Дмитрия Анатольевича Фёдорова на конференциях и форумах по флебологии.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <ReportCard key={report.slug} report={report} onPlay={setActive} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {active && active.video && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setActive(null)}
            aria-label="Закрыть видео"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <video
              src={active.video}
              poster={active.poster}
              controls
              autoPlay
              playsInline
              className="w-full rounded-xl bg-black shadow-2xl"
            />
            <p className="mt-3 text-sm text-white/80">{active.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
