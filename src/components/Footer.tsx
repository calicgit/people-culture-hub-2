import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-navy-deep py-16">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <h3 className="font-heading text-lg font-bold text-primary-foreground mb-3">
            People & Culture <span className="text-primary">HUB</span>
          </h3>
          <p className="text-primary-foreground/50 font-body text-sm leading-relaxed">
            Advancing human resource practices for a fairer, more inclusive workplace worldwide.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-4">Pages</h4>
          <div className="space-y-2">
            {[{ l: "Home", t: "/" }, { l: "Sections", t: "/sections" }, { l: "Meetup Invite", t: "/meetup-invite" }, { l: "Legal", t: "/legal" }].map((i) => (
              <Link key={i.t} to={i.t} className="block text-primary-foreground/50 hover:text-primary transition-colors text-sm">{i.l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-4">Focus Areas</h4>
          <div className="space-y-2 text-primary-foreground/50 text-sm">
            <p>Talent Acquisition</p><p>Learning & Development</p><p>Employee Wellness</p><p>DEI Initiatives</p>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-4">Contact</h4>
          <div className="space-y-3 text-primary-foreground/50 text-sm">
            <div className="flex items-center gap-2"><Mail size={14} /> hub@peopleandculture.hr</div>
            <div className="flex items-center gap-2"><Phone size={14} /> +385 1 4103 734</div>
            <div className="flex items-center gap-2"><MapPin size={14} /> Kamenarka 37, 10000 Zagreb</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center text-primary-foreground/30 text-xs font-body gap-2">
        <span>© {new Date().getFullYear()} People & Culture HUB. All rights reserved.</span>
        <Link to="/legal" className="hover:text-primary transition-colors">Privacy & Legal</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
