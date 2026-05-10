import { motion } from "framer-motion";
import { Users, GraduationCap, BarChart3, Rocket, Award, Building2, Landmark, BookOpen, Handshake } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const WhatWeDoSection = () => {
  const { t } = useLanguage();

  const areas = [
    {
      icon: Users,
      title: t("Izgradnja zajednice", "Building Community"),
      desc: t(
        "Povezivanje stručnjaka, mentorstvo i razmjena znanja.",
        "Connecting professionals, mentorship, and knowledge exchange."
      ),
    },
    {
      icon: GraduationCap,
      title: t("Edukacija i razvoj", "Education & Development"),
      desc: t(
        "Programi poput People Experience Lab, Culture Circle i Leadership Studio.",
        "Programs like People Experience Lab, Culture Circle and Leadership Studio."
      ),
    },
    {
      icon: BarChart3,
      title: t("Utjecaj na praksu i politike", "Impact on Practice & Policy"),
      desc: t(
        "Istraživanja i preporuke za razvoj tržišta rada.",
        "Research and recommendations for labor market development."
      ),
    },
    {
      icon: Rocket,
      title: t("Inovacije i tehnologija", "Innovation & Technology"),
      desc: t(
        "People analytics, HR tech i pilot projekti.",
        "People analytics, HR tech and pilot projects."
      ),
    },
    {
      icon: Award,
      title: t("Promocija struke", "Promoting the Profession"),
      desc: t(
        "Nagrade, inicijative i jačanje vidljivosti područja.",
        "Awards, initiatives, and increasing field visibility."
      ),
    },
  ];

  const connectPoints = [
    { icon: Building2, label: t("Gospodarstvo", "Business sector") },
    { icon: BookOpen, label: t("Akademsku zajednicu", "Academic community") },
    { icon: Landmark, label: t("Institucije i državu", "Institutions & government") },
    { icon: Handshake, label: t("Sindikate", "Unions") },
  ];

  return (
    <section id="sto-radimo" className="py-24 bg-secondary text-secondary-foreground">
      <div className="container">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("Naše djelovanje", "Our Activities")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
            {t("Što radimo", "What We Do")}
          </h2>
          <p className="font-body opacity-80">
            {t(
              "Naše djelovanje temelji se na pet ključnih područja koja pokrivaju cjelokupni spektar razvoja ljudi i organizacijske kulture.",
              "Our work is based on five key areas covering the full spectrum of people development and organizational culture."
            )}
          </p>
        </motion.div>

        {/* 5 Key Areas - 3 top, 2 centered below */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {areas.slice(0, 3).map((a, i) => (
            <motion.div
              key={a.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                <a.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{a.title}</h3>
              <p className="text-sm font-body opacity-75 leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center gap-5 mb-20 -mt-[55px]">
          {areas.slice(3).map((a, i) => (
            <motion.div
              key={a.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 3}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all w-full max-w-sm text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                <a.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{a.title}</h3>
              <p className="text-sm font-body opacity-75 leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Kako djelujemo */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 md:p-14 border border-white/10 text-center"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            {t("Kako djelujemo", "How We Operate")}
          </h3>
          <p className="font-body opacity-80 max-w-xl mx-auto mb-8">
            {t(
              "Djelujemo kao neutralna i stručna platforma koja povezuje ključne dionike s ciljem razvoja zdravijeg i konkurentnijeg radnog okruženja.",
              "We act as a neutral and expert platform connecting key stakeholders to develop a healthier and more competitive work environment."
            )}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {connectPoints.map((cp, i) => (
              <motion.div
                key={cp.label}
                variants={fadeUp}
                custom={i + 1}
                className="bg-white/5 rounded-xl p-5 border border-white/10"
              >
                <cp.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <span className="font-body text-sm">{cp.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
