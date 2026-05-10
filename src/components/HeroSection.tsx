import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-hr.jpg";

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroImg} alt="HR professionals collaborating" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/80 via-navy/70 to-navy-deep/40" />
    </div>
    <div className="container relative z-10 py-20">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 border border-primary/30">
          Human Resources NGO
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-5">
          People First, <span className="text-primary">Always</span>
        </h1>
        <p className="text-lg text-primary-foreground/75 mb-8 font-body leading-relaxed">
          We champion fair workplace practices, empower HR professionals, and advocate for employee rights across organizations worldwide.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" asChild><Link to="/sections">Our Sections <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/meetup-invite">Organize a Meetup</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
