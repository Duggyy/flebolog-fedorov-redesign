import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClinicBaseHome from "@/pages/ClinicBaseHome";
import Login from "@/pages/Login";
import DoctorDatabase from "@/pages/DoctorDatabase";
import DoctorAdmin from "@/pages/DoctorAdmin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ClinicBaseApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClinicBaseHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor-db" element={<DoctorDatabase />} />
          <Route path="/doctor-admin" element={<DoctorAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default ClinicBaseApp;
