import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const events = [
  {
    date: "Apr 12, 2026",
    time: "10:00 AM – 4:00 PM",
    location: "Berlin, Germany",
    title: "Future of Work Summit",
    desc: "A full-day conference exploring AI in HR, remote work policies, and the evolving employer-employee relationship.",
    tag: "Conference",
  },
  {
    date: "Apr 28, 2026",
    time: "6:30 PM – 8:30 PM",
    location: "Online (Zoom)",
    title: "DEI Metrics That Matter",
    desc: "A practical workshop on measuring and reporting diversity, equity, and inclusion outcomes effectively.",
    tag: "Workshop",
  },
  {
    date: "May 15, 2026",
    time: "7:00 PM – 9:00 PM",
    location: "London, UK",
    title: "HR Leaders Networking Mixer",
    desc: "An evening of connection for senior HR professionals to share challenges, wins, and industry insights.",
    tag: "Networking",
  },
];

const news = [
  {
    date: "Mar 10, 2026",
    title: "People & Culture HUB Launches New Employee Wellness Toolkit",
    desc: "Our latest free resource helps organizations build comprehensive mental health and wellbeing programs from scratch.",
  },
  {
    date: "Feb 22, 2026",
    title: "Partnership with Global Talent Alliance Announced",
    desc: "We're joining forces to create ethical recruitment standards across 20 countries in the coming year.",
  },
  {
    date: "Jan 30, 2026",
    title: "2025 Impact Report Now Available",
    desc: "Last year we reached 50,000 HR professionals across 45 countries — read the full report on our achievements.",
  },
];

const tagColors: Record<string, string> = {
  Conference: "bg-secondary text-secondary-foreground",
  Workshop: "bg-primary text-primary-foreground",
  Networking: "bg-accent text-accent-foreground",
};

const EventsNewsSection = () => (
  <section className="py-20 bg-warm-gray">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-primary font-medium text-sm uppercase tracking-wider">Stay Updated</span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Events & News</h2>
        <p className="text-muted-foreground text-base font-body">Join our upcoming events and stay informed about the latest in people-first HR.</p>
      </motion.div>

      {/* Events */}
      <div className="mb-16">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-6">Upcoming Events</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 flex flex-col hover:shadow-lg transition-shadow"
            >
              <span className={`self-start px-3 py-1 rounded-full text-xs font-medium mb-4 ${tagColors[e.tag]}`}>
                {e.tag}
              </span>
              <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{e.title}</h4>
              <p className="text-muted-foreground text-sm font-body mb-4 flex-1">{e.desc}</p>
              <div className="space-y-1.5 text-muted-foreground text-xs font-body">
                <div className="flex items-center gap-1.5"><CalendarDays size={13} /> {e.date}</div>
                <div className="flex items-center gap-1.5"><Clock size={13} /> {e.time}</div>
                <div className="flex items-center gap-1.5"><MapPin size={13} /> {e.location}</div>
              </div>
              <Button size="sm" variant="outline" className="mt-4 w-full">Register</Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* News */}
      <div>
        <h3 className="font-heading text-xl font-semibold text-foreground mb-6">Latest News</h3>
        <div className="space-y-4">
          {news.map((n, i) => (
            <motion.div
              key={n.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <span className="text-xs text-muted-foreground font-body md:w-28 shrink-0">{n.date}</span>
              <div className="flex-1">
                <h4 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">{n.title}</h4>
                <p className="text-muted-foreground text-sm font-body mt-1">{n.desc}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default EventsNewsSection;
