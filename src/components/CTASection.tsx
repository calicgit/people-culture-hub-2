import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="py-20 bg-secondary">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">Ready to Make an Impact?</h2>
        <p className="text-secondary-foreground/70 text-base mb-8 font-body">
          Whether you're an HR leader, a workplace advocate, or an organization seeking better practices — join our mission to transform workplaces for good.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild><Link to="/meetup-invite">Organize a Meetup</Link></Button>
          <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
            Partner With Us
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
