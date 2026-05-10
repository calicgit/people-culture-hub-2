import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, BookOpen, FileText, Download, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import blogHero from "@/assets/blog-hero.jpg";
import talentImg from "@/assets/section-talent.jpg";
import learningImg from "@/assets/section-learning.jpg";
import wellnessImg from "@/assets/section-wellness.jpg";
import deiImg from "@/assets/section-dei.jpg";

type Category = "All" | "Article" | "Guide" | "Toolkit" | "Report";

interface Resource {
  title: string;
  excerpt: string;
  category: Category;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  featured?: boolean;
}

const resources: Resource[] = [
  {
    title: "The 2026 State of Employee Engagement: What HR Leaders Need to Know",
    excerpt: "Our comprehensive report reveals the latest trends in employee engagement, with data from 12,000 organizations across 45 countries and actionable strategies for improvement.",
    category: "Report",
    date: "Mar 15, 2026",
    readTime: "12 min read",
    image: learningImg,
    tags: ["Engagement", "Research", "Global Trends"],
    featured: true,
  },
  {
    title: "Building a Bias-Free Recruitment Pipeline: A Step-by-Step Guide",
    excerpt: "Learn how to audit your hiring process for unconscious bias and implement structured practices that lead to fairer, more diverse talent acquisition.",
    category: "Guide",
    date: "Mar 8, 2026",
    readTime: "9 min read",
    image: talentImg,
    tags: ["Recruitment", "DEI", "Best Practices"],
  },
  {
    title: "Mental Health in the Workplace: Policy Templates & Implementation",
    excerpt: "A ready-to-use toolkit with policy templates, manager training outlines, and measurement frameworks for building a mentally healthy workplace.",
    category: "Toolkit",
    date: "Feb 28, 2026",
    readTime: "15 min read",
    image: wellnessImg,
    tags: ["Mental Health", "Wellness", "Policy"],
  },
  {
    title: "Why Return-to-Office Mandates Are Failing — and What to Do Instead",
    excerpt: "Research-backed analysis of hybrid work policies that actually retain talent, with case studies from organizations that got it right.",
    category: "Article",
    date: "Feb 20, 2026",
    readTime: "7 min read",
    image: learningImg,
    tags: ["Remote Work", "Retention", "Culture"],
  },
  {
    title: "The HR Leader's Guide to AI-Powered People Analytics",
    excerpt: "How to leverage AI responsibly in HR — from predictive attrition models to sentiment analysis — while maintaining employee trust and privacy.",
    category: "Guide",
    date: "Feb 12, 2026",
    readTime: "11 min read",
    image: talentImg,
    tags: ["AI", "Analytics", "Technology"],
  },
  {
    title: "DEI Metrics That Matter: Measuring What Counts",
    excerpt: "Move beyond headcount diversity. This toolkit provides frameworks for measuring inclusion, equity in pay and promotion, and belonging at scale.",
    category: "Toolkit",
    date: "Jan 30, 2026",
    readTime: "10 min read",
    image: deiImg,
    tags: ["DEI", "Metrics", "Inclusion"],
  },
  {
    title: "Onboarding in 2026: Creating First-Day Experiences That Stick",
    excerpt: "The first 90 days define retention. Discover modern onboarding frameworks that increase new-hire satisfaction by up to 82%.",
    category: "Article",
    date: "Jan 18, 2026",
    readTime: "6 min read",
    image: wellnessImg,
    tags: ["Onboarding", "Retention", "Employee Experience"],
  },
  {
    title: "Global Compliance Checklist for Remote Teams",
    excerpt: "Navigate the complexities of employing across borders with this comprehensive compliance checklist covering tax, labor law, and data privacy.",
    category: "Guide",
    date: "Jan 5, 2026",
    readTime: "14 min read",
    image: deiImg,
    tags: ["Compliance", "Remote Work", "Global HR"],
  },
];

const categories: Category[] = ["All", "Article", "Guide", "Toolkit", "Report"];

const categoryIcons: Record<string, typeof BookOpen> = {
  Article: BookOpen,
  Guide: FileText,
  Toolkit: Download,
  Report: Tag,
};

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = resources.filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featured = resources.find((r) => r.featured);
  const rest = filtered.filter((r) => !r.featured || activeCategory !== "All" || searchQuery !== "");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src={blogHero} alt="HR resources workspace" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 to-navy/50" />
          </div>
          <div className="container relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4 border border-primary/30">
                Knowledge Hub
              </span>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
                Resources & Insights
              </h1>
              <p className="text-primary-foreground/70 font-body text-base leading-relaxed">
                Articles, guides, toolkits, and reports to help HR professionals build better workplaces.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-10 border-b border-border bg-card sticky top-16 z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured */}
        {activeCategory === "All" && searchQuery === "" && featured && (
          <section className="py-12">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="h-64 md:h-full">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{featured.category}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><Clock size={12} /> {featured.readTime}</span>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{featured.title}</h2>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featured.tags.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{t}</span>
                    ))}
                  </div>
                  <Button variant="default" size="sm">
                    Read Full Report <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Grid */}
        <section className="py-12">
          <div className="container">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body text-lg">No resources found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeCategory === "All" && searchQuery === "" ? rest : filtered).map((r, i) => {
                  const Icon = categoryIcons[r.category] || BookOpen;
                  return (
                    <motion.article
                      key={r.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer flex flex-col"
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1.5">
                          <Icon size={12} /> {r.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                          <span>{r.date}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {r.readTime}</span>
                        </div>
                        <h3 className="font-heading text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                          {r.title}
                        </h3>
                        <p className="text-muted-foreground text-sm font-body leading-relaxed flex-1">{r.excerpt}</p>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {r.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px]">{t}</span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
