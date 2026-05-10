import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Sections", to: "/sections" },
  { label: "Resources", to: "/resources" },
  { label: "Meetup Invite", to: "/meetup-invite" },
  { label: "Legal", to: "/legal" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-heading text-xl font-bold text-foreground">
          People & Culture <span className="text-primary">HUB</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${location.pathname === l.to ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          <Button size="sm">Get Involved</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border px-6 pb-4 space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Button size="sm" className="w-full">Get Involved</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
