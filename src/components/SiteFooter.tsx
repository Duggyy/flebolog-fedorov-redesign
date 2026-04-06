import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="bg-navy text-navy-foreground py-12">
      <div className="container">
        <div className="flex justify-center">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Разделы</h3>
            <ul className="space-y-2 text-sm text-navy-foreground/80">
              <li><Link to="/" className="hover:text-white transition-colors">Главная</Link></li>
              <li><Link to="/phlebology" className="hover:text-white transition-colors">Флебология</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">Новости</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-navy-foreground/50">
          <p>© 2026 Флеболог Фёдоров Д.А. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
