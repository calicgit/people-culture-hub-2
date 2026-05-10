import { useEffect, useState, useRef } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import logoDark from "@/assets/logo-horizons-black.svg";
import logoLight from "@/assets/logo-horizons-white.svg";

const LandingNavbar = ({ forceSolid = false }: { forceSolid?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [scrolledRaw, setScrolled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const scrolled = forceSolid || scrolledRaw;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    // If we're not on the landing page, navigate first
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
    setAboutOpen(false);
  };

  const navItems = [
    { id: "novosti", label: t("Novosti", "News") },
    { id: "sto-radimo", label: t("Što radimo", "What We Do") },
    { id: "clanstvo", label: t("Članstvo", "Membership") },
    { id: "kontakt", label: t("Kontakt", "Contact") },
  ];

  const textClass = scrolled
    ? "text-muted-foreground hover:text-foreground"
    : "text-primary-foreground/80 hover:text-primary-foreground";

  const handleAboutEnter = () => {
    if (aboutTimeout.current) clearTimeout(aboutTimeout.current);
    setAboutOpen(true);
  };
  const handleAboutLeave = () => {
    aboutTimeout.current = setTimeout(() => setAboutOpen(false), 200);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-24" : "h-16"}`}>
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
          <img
            src={scrolled ? logoDark : logoLight}
            alt="People & Culture HUB"
            className={`h-20 w-auto transition-all duration-300 ${scrolled ? "translate-y-0" : "translate-y-4"}`}
          />
        </button>

        <div className="hidden md:flex items-center gap-3">
          {/* Novosti */}
          <button onClick={() => scrollTo("novosti")} className={`text-sm font-medium transition-colors ${textClass}`}>
            {t("Novosti", "News")}
          </button>

          {/* Tko smo - dropdown */}
          <div
            className="relative"
            onMouseEnter={handleAboutEnter}
            onMouseLeave={handleAboutLeave}
          >
            <button
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${textClass}`}
              onClick={() => scrollTo("o-nama")}
            >
              {t("Tko smo", "About Us")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
            </button>

            {aboutOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg py-1 z-50"
                onMouseEnter={handleAboutEnter}
                onMouseLeave={handleAboutLeave}
              >
                <button
                  onClick={() => scrollTo("o-nama")}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  {t("O nama", "About Us")}
                </button>
                <Link
                  to="/tim"
                  onClick={() => setAboutOpen(false)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  {t("Tim People & Culture HUB-a", "People & Culture HUB Team")}
                </Link>
              </div>
            )}
          </div>

          {/* Remaining items */}
          {navItems.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-sm font-medium transition-colors ${textClass}`}
            >
              {item.label}
            </button>
          ))}

          <Button
            size="sm"
            variant="outline"
            className={scrolled ? "" : "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"}
            asChild
          >
            <Link to="/council-login">Login</Link>
          </Button>
          <button
            onClick={() => setLang(lang === "hr" ? "en" : "hr")}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors rounded-md px-2.5 py-1.5 border ${
              scrolled
                ? "text-muted-foreground hover:text-foreground border-border"
                : "text-primary-foreground/80 hover:text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10"
            }`}
          >
            <Globe size={14} />
            {lang === "hr" ? "EN" : "HR"}
          </button>
        </div>

        <button
          className={`md:hidden transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border px-6 pb-4 space-y-3">
          <button onClick={() => scrollTo("novosti")} className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("Novosti", "News")}
          </button>
          <button onClick={() => scrollTo("o-nama")} className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("Tko smo", "About Us")}
          </button>
          <Link
            to="/tim"
            onClick={() => setOpen(false)}
            className="block w-full text-left text-sm font-medium text-primary pl-4"
          >
            {t("Tim People & Culture HUB-a", "P&C HUB Team")}
          </Link>
          {navItems.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
          <Button size="sm" className="w-full" variant="outline" asChild>
            <Link to="/council-login">Login</Link>
          </Button>
          <button
            onClick={() => { setLang(lang === "hr" ? "en" : "hr"); setOpen(false); }}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Globe size={14} />
            {lang === "hr" ? "Switch to English" : "Prebaci na Hrvatski"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
