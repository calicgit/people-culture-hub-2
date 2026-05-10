import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg p-4 md:p-6">
      <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-muted-foreground font-body flex-1">
          Koristimo kolačiće kako bismo vam pružili bolje korisničko iskustvo i analizirali promet na stranici. Korištenjem naše stranice slažete se s našim pravilima o korištenju kolačića.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={handleAccept} size="sm">
            Razumijem
          </Button>
          <Link
            to="/politika-privatnosti"
            className="text-sm text-primary hover:underline font-body whitespace-nowrap"
          >
            Politika privatnosti
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
