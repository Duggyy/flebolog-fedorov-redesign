import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

const Reviews = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://prodoctorov.ru/static/js/widget_big.js?v7";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
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

      {/* ProDoctorov Widget */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl p-8">
          <div id="pd_widget_big" data-doctor="556844">
            <div className="pd_rate_header">Отзывы о враче Федоров Д. А.<br/>
            <a target="_blank" className="pd_rate_new" href="https://prodoctorov.ru/new/rate/doctor/556844/">Оставить отзыв</a>
            </div>
            <div id="pd_widget_big_content" className="w-full min-h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center flex items-center justify-center text-gray-500">
              <div>
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">★</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Отзывы ProDoctorov</h3>
                <p className="text-sm">Виджет загружается...</p>
              </div>
            </div>
            <a target="_blank" href="https://prodoctorov.ru/obninsk/vrach/556844-fedorov/#otzivi" className="pd_read_all">Читать все отзывы</a>
            <span id="pd_powered_by">
              <a target="_blank" href="https://prodoctorov.ru">
<img className="pd_logo" src="/images/prodoctorov-logo.png" alt="ProDoctorov" />
              </a>
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Reviews;

