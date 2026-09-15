import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { stories, storyPoster, storyVideo } from "@/components/stories-data";

/**
 * Лента коротких вертикальных видео на главной.
 *
 * Размещение согласовано с владельцем: блок идёт сразу под меню, одинаково на
 * телефоне и на компьютере. Шесть кружков на узком экране не помещаются,
 * поэтому лента прокручивается вбок; подсказок о прокрутке три — затемнение у
 * края, полоска положения внизу и сама возможность тянуть мышью.
 */
const StoriesRow = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const [scrollable, setScrollable] = useState(false);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /** Пересчитывает полоску положения и затемнения по краям. */
  const update = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const canScroll = max > 4;

    setScrollable(canScroll);
    if (canScroll) {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (track && thumb) {
        const width = Math.max(30, Math.round(track.clientWidth * (row.clientWidth / row.scrollWidth)));
        thumb.style.width = `${width}px`;
        thumb.style.left = `${Math.round((row.scrollLeft / max) * (track.clientWidth - width))}px`;
      }
    }
    setEdges({
      left: canScroll && row.scrollLeft > 4,
      right: canScroll && row.scrollLeft < max - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const row = rowRef.current;
    row?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Шрифт подгружается асинхронно и меняет ширину подписей, а с ней и
    // переполнение ленты — пересчитываем после загрузки.
    const timer = window.setTimeout(update, 400);
    return () => {
      row?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(timer);
    };
  }, [update]);

  // Перетаскивание мышью. На телефоне прокрутка работает обычным свайпом,
  // а на компьютере горизонтальная лента без этого почти недоступна.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: MouseEvent) => {
      down = true;
      startX = e.pageX;
      startLeft = row.scrollLeft;
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      e.preventDefault();
      row.scrollLeft = startLeft - (e.pageX - startX);
    };
    const onUp = () => {
      down = false;
    };

    row.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      row.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <section className="bg-white py-5 border-b border-border">
        <div className="container">
          {/* На узком экране заголовок и подпись не помещаются в строку и рвутся
              по слогам, поэтому там подпись уходит под заголовок. */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3.5">
            <h2 className="text-lg font-bold text-foreground whitespace-nowrap">Короткие видео</h2>
            <span className="text-xs text-muted-foreground">
              {stories.length} роликов · без звука, с субтитрами
            </span>
          </div>

          <div className="relative">
            {edges.left && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[52px] bg-gradient-to-l from-transparent to-white" />
            )}
            {edges.right && (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[52px] bg-gradient-to-r from-transparent to-white" />
            )}

            <div
              ref={rowRef}
              className="scrollbar-none flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing"
            >
              {stories.map((story, i) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Смотреть видео: ${story.caption}`}
                  className="group flex w-[68px] flex-shrink-0 flex-col items-center gap-[7px] focus:outline-none"
                >
                  <span className="block rounded-full bg-primary p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-primary/40">
                    <img
                      src={storyPoster(story.id)}
                      alt=""
                      width="62"
                      height="62"
                      loading="lazy"
                      decoding="async"
                      className="block h-[62px] w-[62px] rounded-full border-2 border-white object-cover"
                    />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight text-foreground">
                    {story.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            ref={trackRef}
            className={`relative mt-1 h-[3px] rounded-full bg-border transition-opacity ${
              scrollable ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            <div ref={thumbRef} className="absolute top-0 h-[3px] rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {openIndex !== null && (
        <StoryViewer startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
};

/** Полноэкранный просмотр: автопереход, полосы прогресса, звук по кнопке. */
const StoryViewer = ({ startIndex, onClose }: { startIndex: number; onClose: () => void }) => {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const story = stories[current];

  const next = useCallback(() => {
    if (current >= stories.length - 1) {
      onClose();
      return;
    }
    setCurrent(current + 1);
  }, [current, onClose]);

  const prev = useCallback(() => {
    // На первом видео «назад» перезапускает его, как в сториз.
    if (current === 0) {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
      return;
    }
    setCurrent(current - 1);
  }, [current]);

  // Пока открыт просмотр, страница под ним не прокручивается.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  // Атрибут `muted` в React обновляется ненадёжно — ставим свойство напрямую.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, current]);

  useEffect(() => {
    setProgress(0);
  }, [current]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр видео"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,15,22,0.86)]"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-[430px] overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          key={story.id}
          ref={videoRef}
          src={storyVideo(story.id)}
          poster={storyPoster(story.id)}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted={muted}
          playsInline
          preload="auto"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
          }}
          onEnded={next}
        />

        <div className="absolute inset-x-0 top-0 bg-black/45 px-3.5 pb-4 pt-3">
          <div className="flex gap-[3px]">
            {stories.map((s, i) => (
              <span key={s.id} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
                />
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <img
              src={storyPoster(story.id)}
              alt=""
              className="h-[30px] w-[30px] rounded-full object-cover"
            />
            <span className="text-[13px] font-medium text-white">Фёдоров Д.А.</span>
            <span className="text-xs text-white/70">{story.label}</span>
            <span className="ml-auto text-xs text-white/70">
              {current + 1} / {stories.length}
            </span>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Включить звук" : "Выключить звук"}
              className="text-white/85 transition-colors hover:text-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="text-white/85 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3.5 pb-4 pt-4">
          <p className="text-[13px] leading-relaxed text-white">{story.caption}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/doctor"
              onClick={onClose}
              className="rounded-full border border-white/60 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
            >
              Записаться на приём
            </Link>
            <Link
              to="/phlebology"
              onClick={onClose}
              className="rounded-full border border-white/60 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
            >
              Подробнее о методе
            </Link>
          </div>
        </div>

        {/* Тап по левой и правой четверти переключает видео, как в сториз. */}
        <button
          type="button"
          onClick={prev}
          aria-label="Предыдущее видео"
          className="absolute bottom-28 left-0 top-16 w-1/4 focus:outline-none"
        />
        <button
          type="button"
          onClick={next}
          aria-label="Следующее видео"
          className="absolute bottom-28 right-0 top-16 w-1/4 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default StoriesRow;
