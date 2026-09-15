import { Link } from "react-router-dom";
import { ChevronRight, Droplet, Scissors, Sparkles, Syringe, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { findMethod, methods, type MethodBlock } from "@/components/methods-data";

/**
 * Страница метода лечения из блока «Как мы лечим» на главной.
 * Тексты и изображения взяты со старого сайта, оформление — общее для всех
 * пяти методов, поэтому разметка задаётся блоками в `methods-data.ts`.
 */

const icons: Record<string, LucideIcon> = {
  skleroterapiya: Syringe,
  laser: Zap,
  operacii: Scissors,
  zvezdochki: Sparkles,
  microskleroterapia: Droplet,
};

type Group = { heading?: string; blocks: MethodBlock[] };

/** Абзацы до первого заголовка идут вводной частью, дальше — по карточке на секцию. */
const groupBlocks = (blocks: MethodBlock[]): Group[] => {
  const groups: Group[] = [];
  let current: Group = { blocks: [] };

  const flush = () => {
    if (current.heading !== undefined || current.blocks.length > 0) groups.push(current);
  };

  for (const block of blocks) {
    if (block.type === "heading") {
      flush();
      current = { heading: block.text, blocks: [] };
      continue;
    }
    current.blocks.push(block);
  }
  flush();

  return groups;
};

const BlockView = ({ block }: { block: MethodBlock }) => {
  switch (block.type) {
    case "text":
      return <p className="text-muted-foreground text-base leading-relaxed">{block.text}</p>;

    case "list":
      return (
        <ul className="text-muted-foreground text-base leading-relaxed list-disc ml-6 space-y-2">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "note":
      return (
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary p-6">
          <p className="text-base font-semibold italic text-primary leading-relaxed">{block.text}</p>
        </div>
      );

    case "gallery":
      // Исходные картинки подписаны «внутри» файла и имеют разный размер,
      // поэтому вписываем их в одинаковые рамки — без обрезки подписей.
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {block.images.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-contain"
              />
            </div>
          ))}
        </div>
      );

    case "figure":
      return (
        <figure className="overflow-hidden rounded-2xl border border-border bg-card">
          {block.caption && (
            <figcaption className="px-5 pt-5 text-sm font-semibold uppercase tracking-wide text-primary">
              {block.caption}
            </figcaption>
          )}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto"
          />
        </figure>
      );

    default:
      return null;
  }
};

const MethodPage = ({ slug }: { slug: string }) => {
  const method = findMethod(slug);

  if (!method) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SiteNav />
        <main className="flex-1">
          <div className="container py-20 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Метод не найден</h1>
            <Link to="/" className="text-primary font-semibold hover:underline">
              ← На главную
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const Icon = icons[method.slug] ?? Syringe;
  const groups = groupBlocks(method.blocks);
  const others = methods.filter((item) => item.slug !== method.slug);

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
            <span className="text-foreground">{method.title}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-muted via-background to-muted py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Icon className="h-5 w-5" />
                <span className="font-semibold uppercase tracking-wide text-sm">Как мы лечим</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                {method.title}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                {method.lead}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container max-w-5xl">
            <div className="space-y-8">
              {groups.map((group, groupIndex) =>
                group.heading ? (
                  <div
                    key={group.heading}
                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl"
                  >
                    <h2 className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 inline-block mb-6 tracking-tight">
                      {group.heading}
                    </h2>
                    <div className="space-y-4">
                      {group.blocks.map((block, blockIndex) => (
                        <BlockView key={`${groupIndex}-${blockIndex}`} block={block} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={`intro-${groupIndex}`} className="space-y-4">
                    {group.blocks.map((block, blockIndex) => (
                      <BlockView key={`${groupIndex}-${blockIndex}`} block={block} />
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Перелинковка методов: помогает и навигации, и индексации */}
            <div className="mt-14 border-t border-border pt-8">
              <h2 className="text-lg font-bold text-foreground mb-4">Другие методы лечения</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/methods/${item.slug}`}
                      className="group flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="py-12 bg-background">
          <div className="container text-center">
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-12 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.97] max-w-max mx-auto"
            >
              ← На главную
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default MethodPage;
