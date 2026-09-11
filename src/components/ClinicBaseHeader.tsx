import { Database, LogIn, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clearAuthSession, loadAuthSession } from "@/lib/auth-session";
import { apiLogout } from "@/lib/clinicbase-api";

const ClinicBaseHeader = ({ hideAction = false }: { hideAction?: boolean }) => {
  const location = useLocation();
  const isWorkspacePage = location.pathname === "/doctor-db" || location.pathname === "/doctor-admin";
  const hasSession = Boolean(loadAuthSession());
  const showLogout = isWorkspacePage || hasSession;

  const handleLogout = () => {
    apiLogout().catch(() => undefined);
    clearAuthSession();
  };

  return (
    <header className="bg-navy text-navy-foreground">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-wide">ClinicBase</span>
            <p className="text-xs text-navy-foreground/70">База приемов и пациентов</p>
          </div>
        </div>
        {!hideAction && (
          <Link
            to="/login"
            onClick={showLogout ? handleLogout : undefined}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            {showLogout ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {showLogout ? "Выйти" : "Войти"}
          </Link>
        )}
      </div>
    </header>
  );
};

export default ClinicBaseHeader;
