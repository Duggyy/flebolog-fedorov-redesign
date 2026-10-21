import { Database, LogIn, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clearAuthSession, loadAuthSession } from "@/lib/auth-session";
import { apiLogout } from "@/lib/clinicbase-api";

const ClinicBaseHeader = ({
  hideAction = false,
  compact = false,
}: {
  hideAction?: boolean;
  /**
   * Узкая шапка для рабочего места врача. В прототипе это окно программы, где
   * место по вертикали тратится на данные, а не на брендинг: 68 px шапки над
   * формой из сорока строк — это строка-две приёма, которых не видно.
   */
  compact?: boolean;
}) => {
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
      <div
        className={
          compact
            ? "flex w-full items-center justify-between gap-2 px-2 py-1"
            : "container flex items-center justify-between py-3"
        }
      >
        <div className={compact ? "flex items-center gap-1.5" : "flex items-center gap-3"}>
          <div
            className={
              compact
                ? "flex h-6 w-6 items-center justify-center rounded-sm bg-white/10 text-white"
                : "flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white"
            }
          >
            <Database className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
          </div>
          <div className={compact ? "flex items-baseline gap-2" : undefined}>
            <span
              className={
                compact
                  ? "text-[13px] font-bold tracking-wide text-white"
                  : "text-lg font-bold text-white tracking-wide"
              }
            >
              ClinicBase
            </span>
            <p className={compact ? "text-[10px] text-navy-foreground/70" : "text-xs text-navy-foreground/70"}>
              {compact ? "база приёмов" : "База приемов и пациентов"}
            </p>
          </div>
        </div>
        {!hideAction && (
          <Link
            to="/login"
            onClick={showLogout ? handleLogout : undefined}
            className={
              compact
                ? "inline-flex h-6 items-center gap-1 rounded-sm bg-white/10 px-2 text-[11px] font-medium text-white transition hover:bg-white/15"
                : "inline-flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/15"
            }
          >
            {showLogout ? (
              <LogOut className={compact ? "h-3 w-3" : "h-4 w-4"} />
            ) : (
              <LogIn className={compact ? "h-3 w-3" : "h-4 w-4"} />
            )}
            {showLogout ? "Выйти" : "Войти"}
          </Link>
        )}
      </div>
    </header>
  );
};

export default ClinicBaseHeader;
