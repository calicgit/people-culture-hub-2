import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const REFERRAL_OPTIONS = [
  "Bruna Kostelac Košir",
  "Dunja Vorkapić",
  "Maja Darija Škrljak",
  "Marija Felkel",
  "Mirela Kotarac",
  "Romina Ivančić Maćešić",
  "Slavica Gunjević Golubović",
  "Szabolcs Annus",
  "Tanja Pureta",
  "Tome Barić",
  "Vjekoslav Golubović",
  "Tina Balenović",
  "Iva Taiber",
  "NITKO",
];

interface MemberEntry {
  fullName: string;
  address: string;
  oib: string;
  dateOfBirth: string;
}

const TOTAL_STEPS = 8;

const CorporateMembershipApplication = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 3: Company data
  const [companyName, setCompanyName] = useState("");
  const [companyOib, setCompanyOib] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyPostalCode, setCompanyPostalCode] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Step 4: Referrals
  const [referrals, setReferrals] = useState<string[]>([]);

  // Step 5: How heard
  const [howHeard, setHowHeard] = useState("");

  // Step 6: Number of members
  const [memberCount, setMemberCount] = useState(1);

  // Step 7: Member details
  const [members, setMembers] = useState<MemberEntry[]>([
    { fullName: "", address: "", oib: "", dateOfBirth: "" },
  ]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return (
          companyName.trim() &&
          companyOib.trim() &&
          companyAddress.trim() &&
          companyCity.trim() &&
          companyPostalCode.trim() &&
          companyCountry.trim() &&
          contactName.trim() &&
          contactRole.trim() &&
          contactPhone.trim() &&
          contactEmail.trim() &&
          contactEmail.includes("@")
        );
      case 4:
        return referrals.length > 0;
      case 5:
        return true;
      case 6:
        return memberCount >= 1;
      case 7:
        return members.every(
          (m) =>
            m.fullName.trim() &&
            m.address.trim() &&
            m.oib.trim() &&
            m.dateOfBirth
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("membership_applications")
        .insert({
          first_name: contactName.split(" ")[0] || contactName.trim(),
          last_name: contactName.split(" ").slice(1).join(" ") || "-",
          phone: contactPhone.trim(),
          email: contactEmail.trim(),
          company: companyName.trim(),
          membership_tier: "korporativno",
          referrals,
          how_heard: howHeard.trim() || null,
          paid_by: "employer",
          payer_company_name: companyName.trim(),
          payer_full_name: contactName.trim(),
          payer_address: companyAddress.trim(),
          payer_oib: companyOib.trim(),
          applicant_oib: companyOib.trim(),
          invoice_email: contactEmail.trim(),
        });

      if (error) throw error;

      try {
        const membersRows = members
          .map(
            (m, i) => `
            <tr><td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
            <td style="padding:6px;border:1px solid #ddd;">${m.fullName.trim()}</td>
            <td style="padding:6px;border:1px solid #ddd;">${m.address.trim()}</td>
            <td style="padding:6px;border:1px solid #ddd;">${m.oib.trim()}</td>
            <td style="padding:6px;border:1px solid #ddd;">${m.dateOfBirth || "—"}</td></tr>`,
          )
          .join("");
        const html = `
          <h2>Nova korporativna prijava - People & Culture HUB</h2>
          <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Kompanija</td><td style="padding:8px;border:1px solid #ddd;">${companyName.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">OIB</td><td style="padding:8px;border:1px solid #ddd;">${companyOib.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Adresa</td><td style="padding:8px;border:1px solid #ddd;">${companyAddress.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Kontakt osoba</td><td style="padding:8px;border:1px solid #ddd;">${contactName.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${contactEmail.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefon</td><td style="padding:8px;border:1px solid #ddd;">${contactPhone.trim()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Broj članova</td><td style="padding:8px;border:1px solid #ddd;">${memberCount}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Preporuka</td><td style="padding:8px;border:1px solid #ddd;">${(referrals || []).join(", ") || "—"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Kako je saznao/la</td><td style="padding:8px;border:1px solid #ddd;">${howHeard.trim() || "—"}</td></tr>
          </table>
          <h3>Članovi</h3>
          <table style="border-collapse:collapse;width:100%;">
            <tr style="background:#f5f5f5;">
              <th style="padding:6px;border:1px solid #ddd;">#</th>
              <th style="padding:6px;border:1px solid #ddd;">Ime i prezime</th>
              <th style="padding:6px;border:1px solid #ddd;">Adresa</th>
              <th style="padding:6px;border:1px solid #ddd;">OIB</th>
              <th style="padding:6px;border:1px solid #ddd;">Datum rođenja</th>
            </tr>
            ${membersRows}
          </table>
        `;
        await supabase.functions.invoke("send-email", {
          body: {
            to: "hub@peopleandculture.hr",
            subject: `Nova korporativna prijava: ${companyName.trim()}`,
            html,
            replyTo: contactEmail.trim(),
          },
        });
      } catch {
        // best-effort
      }

      setStep(8);
    } catch (err: any) {
      toast.error("Greška pri slanju prijave. Pokušajte ponovo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 6) {
      // Adjust members array to match count
      const newMembers: MemberEntry[] = [...members];
      while (newMembers.length < memberCount) {
        newMembers.push({ fullName: "", address: "", oib: "", dateOfBirth: "" });
      }
      setMembers(newMembers.slice(0, memberCount));
      setStep(7);
    } else if (step === 7) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const toggleReferral = (name: string) => {
    if (name === "NITKO") {
      setReferrals(referrals.includes("NITKO") ? [] : ["NITKO"]);
      return;
    }
    setReferrals((prev) => {
      const filtered = prev.filter((r) => r !== "NITKO");
      return filtered.includes(name) ? filtered.filter((r) => r !== name) : [...filtered, name];
    });
  };

  const updateMember = (index: number, field: keyof MemberEntry, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const progress = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background text-foreground py-4 px-6 flex items-center justify-between border-b border-border">
        {step > 1 ? (
          <button onClick={prevStep} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft size={16} /> Natrag
          </button>
        ) : (
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft size={16} /> Natrag
          </Link>
        )}
        <span className="font-heading text-sm font-medium">People & Culture HUB</span>
      </div>

      {/* Progress bar */}
      {step < 8 && (
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Form content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                      Poštovani/a,
                    </h1>
                    <p className="text-muted-foreground font-body text-lg leading-relaxed">
                      molimo Vas da odgovorite na nekoliko pitanja kako bi uspješno zaprimili Vašu prijavu!
                    </p>
                    <p className="text-muted-foreground font-body text-lg">
                      Unaprijed hvala, <strong className="text-foreground">People & Culture HUB!</strong>
                    </p>
                  </div>
                  <Button size="lg" onClick={() => setStep(2)} className="text-lg px-10 py-6">
                    Prijavi se!
                  </Button>
                </div>
              )}

              {/* Step 2: GDPR Consent */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    SUGLASNOST ZA OBRADU PODATAKA <span className="text-destructive">*</span>
                  </h2>
                  <p className="text-muted-foreground font-body text-sm">
                    Sudjelovanjem u ovom upitniku potvrđujem da:
                  </p>
                  <ul className="space-y-3 text-muted-foreground font-body text-sm">
                    {[
                      "Razumijem da će moje sudjelovanje uključivati online upitnik u trajanju do 5 minuta.",
                      "Razumijem da je moje sudjelovanje u potpunosti dobrovoljno.",
                      "Razumijem da se mogu povući u bilo kojem trenutku, bez navođenja razloga i bez ikakvih posljedica.",
                      "Razumijem da će moji osobni podaci biti korišteni isključivo za potrebe ovog upitnika i prijave u People & Culture HUB udrugu.",
                      "Imam mogućnost kontaktirati službenika za obradu osobnih podataka (hub@peopleandculture.hr) u slučaju bilo kakvih dodatnih pitanja ili nejasnoća.",
                      "Razumijem da mogu kontaktirati nadležno tijelo za etička pitanja ako imam dvojbe u vezi s provođenjem upitnika.",
                      "Informiran/a sam o svojim pravima u skladu s Općom uredbom o zaštiti podataka (GDPR), uključujući pravo na pristup, ispravak, povlačenje privole, brisanje podataka i pritužbu nadzornom tijelu (AZOP).",
                      "Razumijem da preporuka nije uvjet za učlanjenje, niti daje prednost u proces, već služi isključivo za bržu obradu podataka navedenih u prijavnici.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground font-body text-xs italic">
                    Klikom na gumb &quot;Prihvaćam&quot; potvrđujem da sam razumio/la gore navedene informacije i pristajem sudjelovati u upitniku.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Prihvaćam
                    </Button>
                    <Button onClick={() => setStep(1)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      Ne prihvaćam
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Company & Contact Info */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Osnovni podaci o tvrtki <span className="text-destructive">*</span>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-foreground">Naziv tvrtke <span className="text-destructive">*</span></Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-foreground">OIB tvrtke <span className="text-destructive">*</span></Label>
                      <Input value={companyOib} onChange={(e) => setCompanyOib(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-foreground">Adresa sjedišta <span className="text-destructive">*</span></Label>
                      <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-foreground">Grad <span className="text-destructive">*</span></Label>
                        <Input value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-foreground">Poštanski broj <span className="text-destructive">*</span></Label>
                        <Input value={companyPostalCode} onChange={(e) => setCompanyPostalCode(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-foreground">Država <span className="text-destructive">*</span></Label>
                      <Input value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} className="mt-1" />
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-muted-foreground font-body text-sm mb-3">Kontakt osoba</p>
                    </div>
                    <div>
                      <Label className="text-foreground">Ime i prezime kontakt osobe <span className="text-destructive">*</span></Label>
                      <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-foreground">Funkcija kontakt osobe <span className="text-destructive">*</span></Label>
                      <Input value={contactRole} onChange={(e) => setContactRole(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-foreground">Telefonski broj <span className="text-destructive">*</span></Label>
                      <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} type="tel" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-foreground">Adresa e-pošte <span className="text-destructive">*</span></Label>
                      <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" className="mt-1" />
                    </div>
                  </div>
                  <Button onClick={nextStep} disabled={!canProceed()} className="w-full">
                    U redu
                  </Button>
                </div>
              )}

              {/* Step 4: Referral */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      Preporuka <span className="text-destructive">*</span>
                    </h2>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                      Radi učinkovitije obrade prijava, udruga omogućuje članovima osnivačima da preporuče nove kandidate. Preporuka nije uvjet za učlanjenje, niti daje prednost u proces, već služi isključivo tome da brže potvrdimo podatke navedene u prijavnici.
                    </p>
                    <p className="text-muted-foreground font-body text-sm mt-2">
                      Ukoliko ne postoji takva osoba, molimo odaberite <strong>NITKO</strong>.
                    </p>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {REFERRAL_OPTIONS.map((name) => (
                      <label
                        key={name}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          referrals.includes(name)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <Checkbox
                          checked={referrals.includes(name)}
                          onCheckedChange={() => toggleReferral(name)}
                        />
                        <span className={`font-body text-sm ${name === "NITKO" ? "font-semibold" : ""} text-foreground`}>
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <Button onClick={nextStep} disabled={!canProceed()} className="w-full">
                    U redu
                  </Button>
                </div>
              )}

              {/* Step 5: How did you hear */}
              {step === 5 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Gdje ste saznali za People & Culture HUB udrugu?
                  </h2>
                  <Textarea
                    value={howHeard}
                    onChange={(e) => setHowHeard(e.target.value)}
                    placeholder="Vaš odgovor..."
                    className="min-h-[100px]"
                  />
                  <Button onClick={nextStep} className="w-full">
                    U redu
                  </Button>
                </div>
              )}

              {/* Step 6: Number of members */}
              {step === 6 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Broj osoba koje želite učlaniti u Udrugu <span className="text-destructive">*</span>
                  </h2>
                  <div>
                    <Label className="text-foreground">Broj osoba</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={memberCount}
                      onChange={(e) => setMemberCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={nextStep} disabled={!canProceed()} className="w-full">
                    U redu
                  </Button>
                </div>
              )}

              {/* Step 7: Member details */}
              {step === 7 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Podaci o članovima <span className="text-destructive">*</span>
                  </h2>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {members.map((member, idx) => (
                      <div key={idx} className="space-y-3 p-4 rounded-lg border border-border">
                        <p className="font-heading font-semibold text-foreground text-sm">
                          Član {idx + 1} od {members.length}
                        </p>
                        <div>
                          <Label className="text-foreground text-xs">Ime i prezime <span className="text-destructive">*</span></Label>
                          <Input
                            value={member.fullName}
                            onChange={(e) => updateMember(idx, "fullName", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-xs">Adresa prebivališta <span className="text-destructive">*</span></Label>
                          <Input
                            value={member.address}
                            onChange={(e) => updateMember(idx, "address", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-xs">OIB <span className="text-destructive">*</span></Label>
                          <Input
                            value={member.oib}
                            onChange={(e) => updateMember(idx, "oib", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-xs">Datum rođenja <span className="text-destructive">*</span></Label>
                          <Input
                            type="date"
                            value={member.dateOfBirth}
                            onChange={(e) => updateMember(idx, "dateOfBirth", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSubmit} disabled={!canProceed() || loading} className="w-full">
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    Pošalji
                  </Button>
                </div>
              )}

              {/* Step 8: Thank you */}
              {step === 8 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Check className="text-primary" size={32} />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    Hvala na prijavi!
                  </h2>
                  <p className="text-muted-foreground font-body text-lg">
                    Kontaktirati ćemo Vas ubrzo!
                  </p>
                  <p className="font-heading text-lg font-semibold text-primary">
                    People & Culture HUB
                  </p>
                  <Link to="/">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Natrag na početnu
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step >= 3 && step <= 7 && (
            <button
              onClick={prevStep}
              className="mt-6 flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body mx-auto"
            >
              <ArrowLeft size={14} /> Natrag
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateMembershipApplication;
