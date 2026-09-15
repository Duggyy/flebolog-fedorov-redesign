import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: попытка открыть несуществующий маршрут:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-muted via-background to-muted py-20">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-6xl md:text-7xl font-bold text-primary mb-4">404</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Страница не найдена
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Возможно, адрес введён с опечаткой или страница была перемещена.
              </p>
              <Link
                to="/"
                className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.97]"
              >
                ← На главную
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFound;
