import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SupportedAuthType = "recovery" | "invite";

const getPasswordErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("weak") || normalized.includes("easy to guess") || normalized.includes("known to be weak")) {
    return "Lozinka je preslaba ili prelagana za pogoditi. Koristi barem 12 znakova, kombinaciju velikih i malih slova, broj i poseban znak te izbjegni ime, email i česte lozinke poput 123456 ili Password123.";
  }

  return message;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasValidResetLink, setHasValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setValidState = () => {
      window.history.replaceState({}, document.title, window.location.pathname);

      if (isMounted) {
        setHasValidResetLink(true);
        setIsCheckingLink(false);
      }
    };

    const setInvalidState = () => {
      if (isMounted) {
        setHasValidResetLink(false);
        setIsCheckingLink(false);
      }
    };

    const resolveResetLink = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);

      const authTypeValue = hashParams.get("type") ?? searchParams.get("type");
      const authType: SupportedAuthType | null =
        authTypeValue === "invite" || authTypeValue === "recovery" ? authTypeValue : null;

      const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
      const authCode = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.session) {
          setValidState();
          return;
        }
      }

      if (tokenHash && authType) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: authType,
        });

        if (!error && data.session) {
          setValidState();
          return;
        }
      }

      if (authCode) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (!error && data.session) {
          setValidState();
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setValidState();
        return;
      }

      setInvalidState();
    };

    void resolveResetLink();

    return () => {
      isMounted = false;
    };
  }, []);

  const passwordsMatch = useMemo(() => password === confirmPassword, [confirmPassword, password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Lozinka je prekratka",
        description: "Nova lozinka mora imati najmanje 8 znakova.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Lozinke se ne podudaraju",
        description: "Upiši istu novu lozinku u oba polja.",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Sesija je istekla",
        description: "Otvori ponovno poveznicu iz emaila i pokušaj opet.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast({
        title: "Promjena lozinke nije uspjela",
        description: getPasswordErrorMessage(error.message),
        variant: "destructive",
      });
      return;
    }

    await supabase.auth.signOut();
    toast({
      title: "Lozinka je promijenjena",
      description: "Sada se prijavi s novom lozinkom.",
    });
    navigate("/council-login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link
          to="/council-login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Povratak na prijavu
        </Link>

        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Postavi novu lozinku</h1>
          </div>

          {isCheckingLink ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Provjeravam poveznicu za postavljanje lozinke...
            </div>
          ) : !hasValidResetLink ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Poveznica za postavljanje lozinke nije valjana ili je istekla. Zatraži novu poveznicu na stranici prijave.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nova lozinka</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Najmanje 8 znakova"
                />
                <p className="text-xs text-muted-foreground">
                  Preporuka: barem 12 znakova, veliko i malo slovo, broj i poseban znak.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Ponovi novu lozinku</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ponovi novu lozinku"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                Nemoj koristiti ime, prezime, email adresu ili česte lozinke poput <span className="font-medium text-foreground">123456</span>, <span className="font-medium text-foreground">Password123</span> ili slične jednostavne kombinacije.
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Spremanje..." : "Spremi novu lozinku"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;