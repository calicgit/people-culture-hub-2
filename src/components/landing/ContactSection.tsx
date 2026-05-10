import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const ContactSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const html = `
        <h2>Nova poruka s kontakt forme - People & Culture HUB</h2>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ime i prezime</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(name.trim())}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(email.trim())}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Predmet</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(subject.trim())}</td></tr>
        </table>
        <h3 style="margin-top:20px;">Poruka</h3>
        <p style="white-space:pre-wrap;padding:12px;border:1px solid #ddd;background:#fafafa;">${escapeHtml(message.trim())}</p>
      `;

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: "hub@peopleandculture.hr",
          subject: `Kontakt forma: ${subject.trim()}`,
          html,
          replyTo: email.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: t("Poruka poslana!", "Message Sent!"),
        description: t("Javit ćemo vam se u najkraćem roku.", "We'll get back to you shortly."),
      });
      (e.target as HTMLFormElement).reset();
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast({
        title: t("Greška", "Error"),
        description: t("Slanje poruke nije uspjelo. Pokušajte ponovo.", "Failed to send message. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontakt" className="py-20 bg-warm-gray">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("Kontakt", "Contact")}
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4">
            {t("Javite nam se!", "Get in Touch!")}
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-card rounded-xl border border-border p-6 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("Ime i prezime", "Full Name")}</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Vaše ime", "Your name")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("vaš@email.hr", "your@email.com")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("Predmet", "Subject")}</Label>
              <Input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("O čemu se radi?", "What is this about?")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("Poruka", "Message")}</Label>
              <Textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("Vaša poruka...", "Your message...")}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Send size={16} className="mr-2" />
              {loading ? t("Šaljem...", "Sending...") : t("Pošalji poruku", "Send Message")}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
