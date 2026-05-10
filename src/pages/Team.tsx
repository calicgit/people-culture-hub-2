import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type TeamMember = {
  id: string;
  full_name: string;
  council: string;
  title: string | null;
  title_en: string | null;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
};

const councilOrder = ["upravno_vijece", "savjetodavno_vijece", "znanstveno_vijece"] as const;

const councilLabels: Record<string, { hr: string; en: string }> = {
  upravno_vijece: { hr: "Upravno vijeće", en: "Executive Board" },
  savjetodavno_vijece: { hr: "Savjetodavno vijeće", en: "Advisory Board" },
  znanstveno_vijece: { hr: "Znanstveno vijeće", en: "Scientific Board" },
};

const getPhotoSrc = (url: string) => {
  return url.startsWith("/team/") ? `${url}?v=20260506-veseljka` : url;
};

const TeamPhoto = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
    <img
      src={src}
      alt={alt}
      className="block h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
    />
  </div>
);

const Team = () => {
  const { t, lang } = useLanguage();
  const displayTitle = (m: { title: string | null; title_en: string | null }) =>
    lang === "en" ? (m.title_en || m.title) : m.title;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("team_members" as never)
        .select("*")
        .order("display_order", { ascending: true });
      if (data) setMembers(data as unknown as TeamMember[]);
      setLoading(false);
    };
    void load();
  }, []);

  const membersByCouncil = councilOrder.map((council) => ({
    council,
    label: councilLabels[council],
    members: members.filter((m) => m.council === council),
  }));

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-secondary-foreground/70 hover:text-secondary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Početna", "Home")}
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-xl md:text-3xl font-bold mb-4"
          >
            {t("Tim People & Culture HUB-a", "People & Culture HUB Team")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-secondary-foreground/80 max-w-2xl font-body"
          >
            {t(
              "Upoznajte članove Upravnog, Savjetodavnog i Znanstvenog vijeća naše Udruge.",
              "Meet the members of our association's Executive, Advisory and Scientific boards."
            )}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container space-y-20">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">
              {t("Učitavanje...", "Loading...")}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {t(
                "Članovi tima će uskoro biti objavljeni.",
                "Team members will be published soon."
              )}
            </div>
          ) : (
            membersByCouncil
              .filter((g) => g.members.length > 0)
              .map((group, gi) => (
                <div key={group.council}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: gi * 0.1 }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-6 w-6 text-primary" />
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        {t(group.label.hr, group.label.en)}
                      </h2>
                    </div>
                    <div className="h-1 w-16 bg-primary rounded-full" />
                  </motion.div>

                  <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 max-w-4xl">
                    {group.members.map((member, mi) => {
                      const hasBio = !!member.bio;
                      return (
                        <motion.button
                          type="button"
                          key={member.id}
                          onClick={() => hasBio && setSelected(member)}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: mi * 0.05 }}
                          className={`group p-0 text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                            hasBio ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary" : "cursor-default"
                          }`}
                          aria-label={hasBio ? t(`Otvori biografiju: ${member.full_name}`, `Open bio: ${member.full_name}`) : member.full_name}
                        >
                          {member.photo_url ? (
                            <TeamPhoto
                              src={getPhotoSrc(member.photo_url)}
                              alt={member.full_name}
                            />
                          ) : (
                            <div className="aspect-[3/4] w-full flex items-center justify-center bg-accent">
                              <Users className="h-16 w-16 text-accent-foreground/30" />
                            </div>
                          )}
                          <div className="p-4 space-y-0">
                            <h3 className="font-heading text-lg font-semibold text-foreground">
                              {member.full_name}
                            </h3>
                            {displayTitle(member) && (
                              <p className="text-sm text-primary font-medium">
                                {displayTitle(member)}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {selected.photo_url && (
                    <img
                      src={getPhotoSrc(selected.photo_url)}
                      alt={selected.full_name}
                      className="w-20 max-h-24 rounded-md object-contain object-top bg-muted flex-shrink-0"
                    />
                  )}
                  <div>
                    <DialogTitle className="font-heading text-xl text-left">
                      {selected.full_name}
                    </DialogTitle>
                    {displayTitle(selected) && (
                      <DialogDescription className="text-primary font-medium text-left mt-1">
                        {displayTitle(selected)}
                      </DialogDescription>
                    )}
                  </div>
                </div>
              </DialogHeader>
              {selected.bio && (
                <div className="mt-4 space-y-3 text-sm text-foreground/90 font-body leading-relaxed whitespace-pre-line">
                  {selected.bio}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <LandingFooter />
    </div>
  );
};

export default Team;
