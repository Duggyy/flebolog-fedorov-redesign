import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    ym?: (counterId: number | string, method: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const YM_COUNTER_ID = 108735234;
const GA_ID = "G-XXXXXXXXXX";

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    const title = document.title;

    // Yandex.Metrika page view
    if (typeof window.ym === "function") {
      window.ym(YM_COUNTER_ID, "hit", path, {
        title,
      });
    }

    // Google Analytics page view
    if (typeof window.gtag === "function" && GA_ID !== "G-XXXXXXXXXX") {
      window.gtag("config", GA_ID, {
        page_path: path,
        page_title: title,
      });
    }
  }, [location]);
}

