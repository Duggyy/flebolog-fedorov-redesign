import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Главная", path: "/" },
  { label: "Отзывы", path: "/reviews" },
  { label: "Флебология", path: "/phlebology" },
  { label: "Новости", path: "/news" },
  
];

const SiteNav = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="container">
        <ul className="flex gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`inline-block px-6 py-3.5 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SiteNav;
