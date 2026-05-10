import { motion } from "framer-motion";
import { Users, BookOpen, Shield, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "HR Professionals Supported" },
  { icon: BookOpen, value: "300+", label: "Workshops Delivered" },
  { icon: Shield, value: "120", label: "Policy Frameworks Created" },
  { icon: TrendingUp, value: "45", label: "Countries Reached" },
];

const values = [
  { title: "Fair Employment", desc: "Advocating for equitable hiring, compensation, and workplace policies globally." },
  { title: "Continuous Growth", desc: "Providing learning pathways for HR professionals to stay ahead of industry trends." },
  { title: "Inclusive Workplaces", desc: "Building frameworks that ensure diversity, equity, and belonging for every employee." },
];

const AboutSection = () => (
  <section className="py-20">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-primary font-medium text-sm uppercase tracking-wider">About Us</span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Transforming the World of Work</h2>
        <p className="text-muted-foreground text-base font-body">People & Culture HUB is a non-profit dedicated to elevating human resource standards, protecting employee rights, and building healthier workplaces everywhere.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-6 text-center border border-border">
            <s.icon className="w-6 h-6 text-primary mx-auto mb-3" />
            <div className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
            <div className="text-muted-foreground text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {values.map((v, i) => (
          <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-accent rounded-xl p-6 border border-primary/10">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{v.title}</h3>
            <p className="text-muted-foreground text-sm font-body">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
