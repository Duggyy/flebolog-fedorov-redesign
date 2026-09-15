import { Link } from "react-router-dom";
import { ChevronRight, User, X } from "lucide-react";
import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { colleagues, type Colleague } from "@/components/colleagues-data";

const PREVIEW_LINES = 3;

const ColleagueCard = ({ colleague, onOpen }: { colleague: Colleague; onOpen: (photo: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = colleague.description.length > PREVIEW_LINES;
  const visible = expanded || !isLong ? colleague.description : colleague.description.slice(0, PREVIEW_LINES);

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_-4px_hsl(220_15%_50%/0.1)] transition-all hover:shadow-[0_8px_30px_-8px_hsl(220_15%_50%/0.22)]">
      {colleague.photo ? (
        <button
          type="button"
          className="group block aspect-[4/3] w-full overflow-hidden bg-muted"
          onClick={() => onOpen(colleague.photo)}
          aria-label={`Открыть фото: ${colleague.name}`}
        >
          <img
            src={colleague.thumb}
            alt={colleague.name}
            width="600"
            height="450"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </button>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground/60">
          <User className="h-12 w-12" />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-base font-bold text-foreground leading-snug">{colleague.name}</h2>
        {visible.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {visible.map((line, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="text-secondary">▸</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        {isLong && (
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-primary hover:underline"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Свернуть" : "Читать полностью"}
          </button>
        )}
      </div>
    </article>
  );
};

const Colleagues = () => {
  const [selected, setSelected] = useState<string | null>(null);

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
              <span className="text-foreground font-medium">Фото с коллегами</span>
            </div>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Фотогалерея</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Фото с коллегами</h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-base">
              Коллеги Дмитрия Анатольевича Фёдорова — ведущие флебологи и сосудистые хирурги России и зарубежья.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleagues.map((colleague) => (
                <ColleagueCard key={colleague.slug} colleague={colleague} onOpen={setSelected} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setSelected(null)}
            aria-label="Закрыть фото"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selected}
            alt="Фото коллеги"
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Colleagues;
