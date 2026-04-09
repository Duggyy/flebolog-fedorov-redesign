import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

const Reviews = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://prodoctorov.ru/static/js/widget_big.js?v7";
    script.defer = true;
    script.async = true;
    script.id = "pd-script";
    document.body.appendChild(script);

    script.onload = () => setLoading(false);

    return () => {
      const existingScript = document.getElementById("pd-script");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />

      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">Отзывы</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-muted py-20">
        <div className="container text-center">
          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">Отзывы пациентов</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Отзывы о нашей работе
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Более 5000 довольных пациентов. Настоящие истории выздоровления.
          </p>
        </div>
      </section>

      {/* Widget */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <div id="pd_widget_big" data-doctor="556844" className="w-full">
              <div className="pd_rate_header text-center mb-8">
                <div className="text-2xl font-bold text-foreground mb-2">Отзывы о враче Федоров Д. А.</div>

              </div>

              <div id="pd_widget_big_content" className="w-full min-h-[500px] bg-white rounded-2xl shadow-2xl border overflow-hidden mb-8"></div>

              <div className="text-center mt-8 opacity-75">
                <a target="_blank" href="https://prodoctorov.ru" className="inline-block">
                  <img src="https://prodoctorov.ru/static/_v1/pd/logos/logo-pd-widget.png" alt="ProDoctorov" className="h-8 w-auto mx-auto" />
                </a>
              </div>
            </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Reviews;

