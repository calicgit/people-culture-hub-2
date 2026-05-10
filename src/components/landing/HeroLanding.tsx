import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImg from "@/assets/hero-hr.jpg";

const HeroLanding = () => {
  const { t } = useLanguage();

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="HR professionals" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/85 via-navy/70 to-secondary/60" />
      </div>
      <div className="container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 border border-primary/30">
              {t("Udruga za ljude i organizacijsku kulturu", "Association for People and Organizational Culture")}
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            {t("Povezujemo ljude,", "Connecting people,")}
            <br />
            <span className="text-primary">{t("gradimo budućnost.", "building the future.")}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 font-body leading-relaxed max-w-lg">
            {t(
              "Profesionalna udruga stručnjaka koji oblikuju zdravije, otpornije i smislenije radne organizacije kroz ljude, kulturu i znanstveno utemeljene prakse.",
              "A professional association of experts shaping healthier, more resilient, and more meaningful work organizations through people, culture, and evidence-based practices."
            )}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => document.getElementById("clanstvo")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("Postani član", "Become a Member")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              onClick={() => document.getElementById("o-nama")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("Saznaj više", "Learn More")}
            </Button>
          </div>
        </motion.div>
      </div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ArrowDown className="text-primary-foreground/50" size={28} />
      </motion.div>
    </section>
  );
};

export default HeroLanding;
