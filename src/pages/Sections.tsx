import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import talentImg from "@/assets/section-talent.jpg";
import learningImg from "@/assets/section-learning.jpg";
import wellnessImg from "@/assets/section-wellness.jpg";
import deiImg from "@/assets/section-dei.jpg";

const sections = [
  {
    img: talentImg,
    title: "Talent Acquisition & Recruitment",
    desc: "We develop ethical recruitment frameworks, provide training on bias-free hiring, and create toolkits for inclusive job descriptions and interview practices.",
    tags: ["Hiring Best Practices", "Employer Branding", "Inclusive Recruitment"],
  },
  {
    img: learningImg,
    title: "Learning & Development",
    desc: "Our L&D programs equip HR professionals with the latest methodologies in employee training, leadership development, and performance management.",
    tags: ["Leadership Programs", "Skill Building", "Certifications"],
  },
  {
    img: wellnessImg,
    title: "Employee Wellness & Wellbeing",
    desc: "We advocate for holistic employee wellness programs covering mental health support, work-life balance policies, and workplace safety standards.",
    tags: ["Mental Health", "Work-Life Balance", "Safety Standards"],
  },
  {
    img: deiImg,
    title: "Diversity, Equity & Inclusion",
    desc: "Our DEI section drives systemic change through policy recommendations, awareness campaigns, and measurable inclusion strategies for organizations of all sizes.",
    tags: ["Policy Frameworks", "Awareness Campaigns", "Inclusion Metrics"],
  },
];

const Sections = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="pt-16">
      <section className="py-20 bg-accent">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">What We Do</span>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">Our Sections</h1>
            <p className="text-muted-foreground text-base font-body">Each section focuses on a critical area of human resources, driving meaningful change for organizations and employees alike.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container space-y-16">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}
            >
              <div className="md:w-1/2">
                <div className="rounded-2xl overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-72 object-cover" />
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.title}</h2>
                <p className="text-muted-foreground font-body leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">{t}</span>
                  ))}
                </div>
                <button className="inline-flex items-center text-primary font-medium text-sm hover:underline mt-2">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Sections;
