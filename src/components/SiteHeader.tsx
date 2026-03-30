import clinicLogo from "@/assets/clinic-logo.png";

const SiteHeader = () => {
  return (
    <header className="bg-navy text-navy-foreground">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <img src={clinicLogo} alt="Ниармедик" className="h-10 w-10 rounded-md brightness-0 invert" />
          <div>
            <span className="text-lg font-bold text-white tracking-wide">ВРАЧ-​ФЛЕБОЛОГ</span>
            <p className="text-xs text-navy-foreground/70">Ваш надежный врач-флеболог более 30 лет!</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;