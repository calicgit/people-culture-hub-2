import { motion } from "framer-motion";
import { Target, Eye, Heart, Lightbulb, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const AboutSection = () => {
  const { t } = useLanguage();

  const missionPoints = [
    { icon: BookOpen, text: t("Znanstvenim spoznajama", "Scientific insights") },
    { icon: Heart, text: t("Etičkim principima", "Ethical principles") },
    { icon: Lightbulb, text: t("Stvarnom organizacijskom utjecaju", "Real organizational impact") },
  ];

  const connectPoints = [
    t("Gospodarstvo", "Business sector"),
    t("Akademsku zajednicu", "Academic community"),
    t("Institucije i državu", "Institutions & government"),
    t("Sindikate", "Unions"),
  ];

  return (
    <section id="o-nama" className="py-24">
      <div className="container">
        {/* Intro - Tko smo */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {t("Tko smo", "About Us")}
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mt-2 mb-6">
              {t(
                "Prva strukovno-znanstvena udruga za ljude i kulturu u Hrvatskoj.",
                "Croatia's first professional-scientific association for people & culture."
              )}
            </h2>
            <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
              <p>
                {t(
                  "People & Culture HUB je prva strukovno-znanstvena udruga u Hrvatskoj posvećena razvoju organizacijske kulture i upravljanju ljudima kao ključnom faktoru poslovnog uspjeha.",
                  "People & Culture HUB is Croatia's first professional-scientific association dedicated to developing organizational culture and managing people as a key factor in business success."
                )}
              </p>
              <p>
                {t(
                  "Okupljamo stručnjake iz područja ljudskih potencijala, lidere iz gospodarstva te akademsku zajednicu s ciljem unapređenja praksi rada kroz znanost, etiku i konkretne alate.",
                  "We bring together HR professionals, business leaders, and the academic community to improve work practices through science, ethics, and practical tools."
                )}
              </p>
            </div>
          </motion.div>

          {/* Svrha */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="bg-accent rounded-2xl p-8 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                {t("Naša svrha", "Our Purpose")}
              </h3>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-5">
              {t(
                "Djelujemo u vremenu velikih promjena na tržištu rada – od nedostatka radne snage i novih regulativa do promjene vještina i očekivanja zaposlenika. Postojimo kako bismo:",
                "We operate in a time of major labor market changes – from workforce shortages and new regulations to changing skills and employee expectations. We exist to:"
              )}
            </p>
            <ul className="space-y-3">
              {[
                t("Povezali znanost i praksu", "Connect science and practice"),
                t("Unaprijedili kvalitetu rada i organizacijske kulture", "Improve the quality of work and organizational culture"),
                t("Doprinosili stvaranju pravednijeg, transparentnijeg i održivog radnog sustava", "Contribute to a fairer, more transparent, and sustainable work system"),
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-foreground font-body text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Misija & Vizija */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="bg-accent rounded-2xl p-8 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">{t("Naša misija", "Our Mission")}</h3>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              {t(
                "Gradimo zajednicu koja razvija i primjenjuje prakse rada temeljene na:",
                "We build a community that develops and applies work practices based on:"
              )}
            </p>
            <div className="space-y-4">
              {missionPoints.map((p, i) => (
                <motion.div key={p.text} variants={fadeUp} custom={i + 1} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <p.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-body text-sm text-foreground">{p.text}</span>
                </motion.div>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground mt-5 italic">
              {t(
                "S fokusom na psihološku sigurnost, angažiranost, leadership, uključivost i kulturu učenja.",
                "Focusing on psychological safety, engagement, leadership, inclusion, and a culture of learning."
              )}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="bg-accent rounded-2xl p-8 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">{t("Naša vizija", "Our Vision")}</h3>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              {t(
                "Postati referentna regionalna platforma za područje People & Culture – mjesto gdje se susreću istraživanja, praksa i stvarne potrebe organizacija i ljudi.",
                "To become the leading regional platform for People & Culture – where research, practice, and the real needs of organizations and people meet."
              )}
            </p>

          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
