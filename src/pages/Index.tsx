import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/HeroSection";
import TreatmentSection from "@/components/TreatmentSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SiteNav />
      <HeroSection />
      <TreatmentSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
