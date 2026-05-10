import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import meetupImg from "@/assets/meetup-hero.jpg";

const MeetupInvite = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      full_name: (formData.get("full_name") as string).trim(),
      email: (formData.get("email") as string).trim(),
      organization: (formData.get("organization") as string)?.trim() || null,
      city_region: (formData.get("city_region") as string).trim(),
      hr_role: (formData.get("hr_role") as string).trim(),
      motivation: (formData.get("motivation") as string).trim(),
      preferred_format: (formData.get("preferred_format") as string)?.trim() || null,
    };

    const { error } = await supabase.from("meetup_applications").insert(payload);

    setLoading(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
  };

  const benefits = [
    { icon: Users, title: "Connect with HR Peers", desc: "Build a local network of HR professionals passionate about people-first workplaces." },
    { icon: CalendarDays, title: "Full Event Support", desc: "We provide branding materials, speaker recommendations, and promotional support." },
    { icon: MapPin, title: "Your City, Your Rules", desc: "Choose the format — panels, workshops, fireside chats, or networking mixers." },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0">
            <img src={meetupImg} alt="Networking event" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 to-navy/60" />
          </div>
          <div className="container relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4 border border-primary/30">
                Become an Organizer
              </span>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
                Host a People & Culture Meetup
              </h1>
              <p className="text-primary-foreground/70 font-body text-base leading-relaxed">
                Bring HR professionals together in your city. We'll support you every step of the way with resources, speakers, and promotion.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border">
                  <b.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-sm font-body">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-16 bg-warm-gray">
          <div className="container max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-2">Apply to Organize</h2>
              <p className="text-muted-foreground text-center font-body mb-8">Fill out the form below and our team will get in touch within 48 hours.</p>

              {submitted ? (
                <div className="bg-card rounded-xl p-10 text-center border border-border">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">Application Received!</h3>
                  <p className="text-muted-foreground font-body text-sm">Thank you for your interest. We'll review your application and reach out soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                      <Input required name="full_name" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                      <Input required name="email" type="email" placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Organization</label>
                      <Input name="organization" placeholder="Your company or NGO" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">City / Region *</label>
                      <Input required name="city_region" placeholder="e.g. Berlin, Germany" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Your HR Role / Background *</label>
                    <Input required name="hr_role" placeholder="e.g. HR Director, People Ops Lead" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Why do you want to organize a meetup? *</label>
                    <Textarea required name="motivation" rows={4} placeholder="Tell us about your motivation and what topics you'd like to cover..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred Format</label>
                    <Input name="preferred_format" placeholder="e.g. Panel discussion, Workshop, Networking mixer" />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MeetupInvite;
