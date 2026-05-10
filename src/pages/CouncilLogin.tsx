import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { getRememberLoginDefault, persistLoginPreference } from "@/lib/auth-persistence";

const CouncilLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(getRememberLoginDefault);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  if (!authLoading && session) {
    return <Navigate to="/portal" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "Greška pri prijavi",
        description: error.message,
        variant: "destructive",
      });
    } else {
      persistLoginPreference(rememberLogin);
      toast({ title: "Uspješna prijava!", description: "Dobrodošli u interni portal udruge." });
      navigate("/portal", { replace: true });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = recoveryEmail.trim() || email.trim();

    if (!targetEmail) {
      toast({
        title: "Upiši email adresu",
        description: "Potrebna je email adresa za slanje poveznice za obnovu lozinke.",
        variant: "destructive",
      });
      return;
    }

    setRecoveryLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setRecoveryLoading(false);

    if (error) {
      toast({
        title: "Slanje nije uspjelo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Poveznica je poslana",
      description: "Provjeri email i otvori poveznicu za postavljanje nove lozinke.",
    });
    setShowRecovery(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Povratak na početnu
        </Link>

        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Prijava</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email adresa</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prijava@email.hr"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Lozinka</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <label htmlFor="remember-login" className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <Checkbox
                  id="remember-login"
                  checked={rememberLogin}
                  onCheckedChange={(checked) => setRememberLogin(checked === true)}
                />
                <span>Zapamti prijavu</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setRecoveryEmail(email);
                  setShowRecovery((current) => !current);
                }}
                className="font-medium text-primary transition-opacity hover:opacity-80"
              >
                Zaboravljena lozinka?
              </button>
            </div>

            {showRecovery && (
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Obnova lozinke</p>
                  <p className="text-xs text-muted-foreground">Poslat ćemo ti poveznicu za postavljanje nove lozinke.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recovery-email">Email adresa</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="prijava@email.hr"
                  />
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handlePasswordReset} disabled={recoveryLoading}>
                  {recoveryLoading ? "Slanje..." : "Pošalji poveznicu za obnovu"}
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Prijavljivanje..." : "Prijavi se"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-body">
          Portal je dostupan samo za članove Upravnog, Savjetodavnog i Znanstvenog vijeća.
          <br />
          Za pristup kontaktirajte administratora udruge.
        </p>
      </motion.div>
    </div>
  );
};

export default CouncilLogin;
