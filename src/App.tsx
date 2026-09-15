import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalytics } from "@/hooks/use-analytics";
import RouteMeta from "@/components/RouteMeta";
import { methodCards, methodPath } from "@/components/methods-cards";

// Home page stays eager: it is the LCP entry point and must not wait on a chunk.
import Index from "./pages/Index.tsx";

// Every other route is code-split so heavy data modules (news, blog, galleries)
// are only downloaded when the visitor actually opens that section.
const Doctor = lazy(() => import("./pages/Doctor.tsx"));
const Phlebology = lazy(() => import("./pages/Phlebology.tsx"));
const News = lazy(() => import("./pages/News.tsx"));
const NewsPost = lazy(() => import("./pages/NewsPost.tsx"));
const Reviews = lazy(() => import("./pages/Reviews.tsx"));
const VarikozPage = lazy(() => import("./pages/VarikozPage.tsx"));
const TromboflebitPage = lazy(() => import("./pages/TromboflebitPage.tsx"));
const ZvezdochkiPage = lazy(() => import("./pages/ZvezdochkiPage.tsx"));
const YazvyPage = lazy(() => import("./pages/YazvyPage.tsx"));
const MethodPage = lazy(() => import("./pages/MethodPage.tsx"));
const ConferencePhotos = lazy(() => import("./pages/ConferencePhotos.tsx"));
const Colleagues = lazy(() => import("./pages/Colleagues.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const AestheticResults = lazy(() => import("./pages/AestheticResults.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const Analytics = () => {
  useAnalytics();
  return null;
};

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
    <span className="text-sm text-muted-foreground">Загрузка…</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Analytics />
        {/* Заголовок вкладки и description под текущий маршрут: без него все
            страницы SPA отдают один и тот же <title> из index.html. */}
        <RouteMeta />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/phlebology" element={<Phlebology />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsPost />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/varikoz" element={<VarikozPage />} />
            <Route path="/tromboflebit" element={<TromboflebitPage />} />
            <Route path="/zvezdochki" element={<ZvezdochkiPage />} />
            <Route path="/yazvy" element={<YazvyPage />} />
            {/* Методы лечения из блока «Как мы лечим». Список маршрутов берётся
                из маленького methods-cards.ts, поэтому тяжёлый methods-data.ts
                попадает только в ленивый чанк MethodPage. */}
            {methodCards.map((method) => (
              <Route
                key={method.slug}
                path={methodPath(method.slug)}
                element={<MethodPage slug={method.slug} />}
              />
            ))}
            <Route path="/conference-photos" element={<ConferencePhotos />} />
            <Route path="/conference-photos/:slug" element={<ConferencePhotos />} />
            <Route path="/colleagues" element={<Colleagues />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/aesthetic-results" element={<AestheticResults />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
