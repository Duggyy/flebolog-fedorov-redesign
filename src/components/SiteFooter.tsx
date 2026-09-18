import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="bg-navy text-navy-foreground py-12">
      <div className="container">
        <div className="flex justify-center">
          <div>
            {/* ⚠️ Здесь именно h2, а не h3. Футер есть на каждой странице, а h3
                требует, чтобы выше был h2. На страницах без h2 (альбомы
                конференций, статьи новостей и блога — там всего два заголовка,
                h1 и этот) получался перескок уровней h1 → h3: 50 страниц из 69.
                Оформление задаётся классами, поэтому на вид ничего не меняется. */}
            <h2 className="text-lg font-bold text-white mb-4">Разделы</h2>
            <ul className="space-y-2 text-sm text-navy-foreground/80">
              <li><Link to="/" className="hover:text-white transition-colors">Главная</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">Отзывы</Link></li>
              <li><Link to="/phlebology" className="hover:text-white transition-colors">Флебология</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">Новости</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-foreground/80">
          <p>© 2026 Флеболог Фёдоров Д.А. Все права защищены.</p>
          <a
            href="https://metrika.yandex.ru/stat/?id=108735234&from=informer"
            target="_blank"
            rel="nofollow"
            className="shrink-0"
          >
            <img
              src="https://informer.yandex.ru/informer/108735234/3_1_FFFFFFFF_EFEFEFFF_0_pageviews"
              style={{ width: 88, height: 31, border: 0 }}
              alt="Яндекс.Метрика"
              title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
