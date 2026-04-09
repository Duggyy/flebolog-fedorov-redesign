import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Doctor from "./pages/Doctor.tsx";
import Phlebology from "./pages/Phlebology.tsx";
import News from "./pages/News.tsx";
import Reviews from "./pages/Reviews.tsx";
import VarikozPage from "./pages/VarikozPage.tsx";
import TromboflebitPage from "./pages/TromboflebitPage.tsx";
import ZvezdochkiPage from "./pages/ZvezdochkiPage.tsx";
import YazvyPage from "./pages/YazvyPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/phlebology" element={<Phlebology />} />
          <Route path="/news" element={<News />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/varikoz" element={<VarikozPage />} />
          <Route path="/tromboflebit" element={<TromboflebitPage />} />
          <Route path="/zvezdochki" element={<ZvezdochkiPage />} />
          <Route path="/yazvy" element={<YazvyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

