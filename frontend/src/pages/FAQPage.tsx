import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { HelpCircle, ChevronDown, Search, ArrowUpRight, Headset, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await api.get("/faqs");
      return response.data.data;
    },
  });

  const filteredFaqs = faqs?.filter((f: any) =>
    f.status === 'active' &&
    (f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-5xl">

        <header className="relative text-center mb-14 md:mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 mx-auto">
            <HelpCircle size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support Center</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-6 leading-[1.15]">
            Frequently Asked <span className="text-primary italic">Inquiries</span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            A comprehensive guide to Montclair’s luxury services, shipping protocols, and technical maintenance.
            Can’t find your answer? Our experts are ready to assist.
          </p>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[300px] bg-primary/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
        </header>

        <div className="relative mb-12 md:mb-16 group max-w-xl mx-auto">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
            <Input
              placeholder="How can we assist you today?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 md:h-16 pl-16 pr-6 bg-white dark:bg-neutral-900 border-border/40 rounded-2xl md:rounded-3xl text-sm font-medium tracking-tight shadow-sm focus:shadow-xl focus:shadow-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, n) => (
              <div key={n} className="h-20 bg-secondary/10 rounded-2xl animate-pulse border border-border/10" />
            ))
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq: any, idx: number) => (
              <div
                key={faq.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500",
                  "bg-white dark:bg-neutral-900",
                  "border border-border/40 rounded-2xl md:rounded-3xl",
                  openId === faq.id
                    ? "shadow-xl shadow-primary/5 border-primary/20"
                    : "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-5 pr-4">
                    <span className="hidden sm:flex w-8 h-8 rounded-lg bg-secondary/50 items-center justify-center text-[10px] font-black text-primary/40 group-hover:text-primary transition-colors">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className={cn(
                      "font-bold text-[15px] md:text-lg tracking-tight transition-colors duration-300",
                      openId === faq.id ? "text-primary" : "text-foreground group-hover:text-primary/70"
                    )}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl border border-border/50 flex items-center justify-center transition-all duration-500 shrink-0",
                    openId === faq.id
                      ? "rotate-180 bg-primary border-primary text-white shadow-lg shadow-primary/20"
                      : "bg-secondary/20 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                  )}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <div
                  className={cn(
                    "px-6 md:px-20 transition-all duration-500 ease-in-out",
                    openId === faq.id ? "max-h-[1000px] pb-8 md:pb-10 opacity-100" : "max-h-0 opacity-0 invisible"
                  )}
                >
                  <div className="relative">
                    <div
                      className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed selection:bg-primary/10 selection:text-primary font-light"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />

                    <div className="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Category:</span>
                        <span className="px-2.5 py-0.5 bg-primary/5 rounded-md text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/10">
                          {faq.category}
                        </span>
                      </div>

                      <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/share">
                        Reference Entry <ArrowUpRight size={11} className="group-hover/share:translate-x-0.5 group-hover/share:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center bg-secondary/5 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-6 text-muted-foreground shadow-sm">
                <Search size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 font-light">
                We couldn't find any answers matching "{searchTerm}". Please check your spelling or try more general keywords.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <footer className="mt-20 md:mt-32 relative overflow-hidden p-8 md:p-14 bg-foreground rounded-[2.5rem] md:rounded-[4rem] group shadow-2xl shadow-black/10">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary">
                <Headset size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Priority Support</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-black text-white leading-tight">
                Require Expert <span className="text-primary italic">Assistance?</span>
              </h3>
              <p className="text-white/50 text-sm md:text-base max-w-sm font-light leading-relaxed">
                Connect with our horological consultants for specialized support regarding your acquisition or collection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="mailto:concierge@montclair.com"
                className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-center hover:opacity-95 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Contact Concierge
              </a>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        </footer>

      </div>
    </div>
  );
}

