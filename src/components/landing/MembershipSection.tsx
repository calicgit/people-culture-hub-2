import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const MembershipSection = () => {
  const { t } = useLanguage();

  const discountFeature = t(
    "Popust na kotizacije za konferenciju People & Culture HORIZONS.",
    "Discount on People & Culture HORIZONS conference fees."
  );

  const tiers = [
    {
      name: t("Student članstvo", "Student Membership"),
      price: "€30/god",
      description: t("Namijenjeno redovitim studentima", "For full-time students"),
      link: "/prijava-clanstvo",
      features: [
        t("Pristup edukacijama", "Access to training sessions"),
        t("Newsletter i resursi", "Newsletter & resources"),
        t("Umrežavanje na događanjima", "Networking at events"),
        discountFeature,
      ],
    },
    {
      name: t("Basic članstvo", "Basic Membership"),
      price: "€120/god",
      popular: true,
      link: "/prijava-clanstvo",
      features: [
        t("Pristup svim edukacijama", "Access to all training sessions"),
        t("Newsletter i resursi", "Newsletter & resources"),
        t("Umrežavanje na događanjima", "Networking at events"),
        discountFeature,
      ],
    },
    {
      name: t("Advanced članstvo", "Advanced Membership"),
      price: "€170/god",
      description: t(
        "Namijenjeno članovima vijeća, odbora ili drugih tijela Udruge",
        "For council, board or other association body members"
      ),
      link: "/prijava-clanstvo",
      features: [
        t("Sve pogodnosti Basic članstva", "All Basic membership benefits"),
        t("Sudjelovanje u vijećima i odborima", "Participation in councils & boards"),
        t("Pristup ekskluzivnim materijalima", "Access to exclusive materials"),
        t("Prioritetno umrežavanje", "Priority networking"),
        discountFeature,
      ],
    },
    {
      name: t("Korporativno članstvo", "Corporate Membership"),
      price: t("Cijena na upit", "Price on request"),
      description: t("Namijenjeno tvrtkama", "For companies"),
      link: "/prijava-korporativno",
      features: [
        t("Višestruki članovi tima", "Multiple team members"),
        t("Pristup svim edukacijama", "Access to all training"),
        t("Benchmarking izvještaji", "Benchmarking reports"),
        t("Savjetodavna podrška", "Advisory support"),
        t("Prioritetno umrežavanje", "Priority networking"),
        discountFeature,
      ],
    },
  ];

  return (
    <section id="clanstvo" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("Članstvo", "Membership")}
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4">
            {t("Postanite dio naše zajednice", "Become Part of Our Community")}
          </h2>
          <p className="text-muted-foreground font-body">
            {t(
              "Odaberite razinu članstva koja odgovara vašim potrebama i krenite koristiti pogodnosti.",
              "Choose the membership level that fits your needs and start enjoying all benefits."
            )}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.popular
                  ? "bg-secondary text-secondary-foreground border-secondary ring-2 ring-primary"
                  : "bg-card border-border"
              }`}
            >
              {tier.popular && (
                <span className="self-start px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-3">
                  {t("Najpopularnije", "Most Popular")}
                </span>
              )}
              <h3 className="font-heading text-xl font-bold mb-1">{tier.name}</h3>
              {tier.description && (
                <p className={`text-xs mb-2 ${tier.popular ? "text-secondary-foreground/70" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>
              )}
              {tier.price && <div className={`font-heading font-bold mb-6 ${tier.price === t("Cijena na upit", "Price on request") ? "text-base" : "text-3xl"}`}>{tier.price}</div>}
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm font-body">
                    <Check size={16} className={tier.popular ? "text-primary mt-0.5 shrink-0" : "text-primary mt-0.5 shrink-0"} />
                    <span className={tier.popular ? "text-secondary-foreground/80" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={tier.link || "/prijava-clanstvo"} className="w-full">
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {t("Učlani se", "Join Now")}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Tvrtke članice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {t("Tvrtke članice", "Member Companies")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <a
              href="https://www.otpbanka.hr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OTP banka"
              className="inline-flex items-center justify-center border border-border transition-opacity hover:opacity-80"
            >
              <img
                src="/members/otp-banka.png"
                alt="OTP banka"
                className="h-12 md:h-16 w-auto object-contain"
                loading="lazy"
              />
            </a>
            <a
              href="https://deepproject.hr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DeeP Project"
              className="inline-flex items-center justify-center border border-border transition-opacity hover:opacity-80"
            >
              <img
                src="/members/deep-project.png"
                alt="DeeP Project"
                className="h-12 md:h-16 w-auto object-contain"
                loading="lazy"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MembershipSection;
