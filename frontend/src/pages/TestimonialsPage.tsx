import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Quote, Star, CheckCircle, Award, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestimonialsPage() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await api.get("/testimonials");
      return response.data.data;
    },
  });

  const activeTestimonials = testimonials?.filter((t: any) => t.status === "active") || [];

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-16 bg-background transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <header className="relative text-center mb-14 md:mb-20 animate-in fade-in slide-in-from-top-4 duration-700">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-foreground mb-4 leading-tight">
            Customer <span className="text-primary italic">Reviews</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
            Read what our customers around the world say about their experience with Montclair timepieces and our premium service.
          </p>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[220px] bg-primary/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-52 bg-secondary/10 rounded-3xl animate-pulse border border-border/20"
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5 animate-in fade-in duration-700 delay-200">
            {activeTestimonials.map((t: any) => (
              <div
                key={t.id}
                className={cn(
                  "break-inside-avoid relative overflow-hidden",
                  "bg-white dark:bg-neutral-900",
                  "border border-border/40 hover:border-primary/25",
                  "p-5 md:p-6 rounded-2xl md:rounded-3xl",
                  "shadow-sm hover:shadow-lg hover:shadow-primary/8",
                  "transition-all duration-500 group"
                )}
              >
                <div className="absolute -top-3 -right-3 opacity-[0.04] text-primary group-hover:opacity-[0.07] transition-opacity rotate-6 group-hover:rotate-0 duration-700 pointer-events-none">
                  <Quote size={120} />
                </div>

                <div className="flex items-center gap-0.5 mb-4 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      fill={i < t.rating ? "currentColor" : "none"}
                      strokeWidth={i < t.rating ? 0 : 1.5}
                    />
                  ))}
                </div>

                <p className="text-sm md:text-[15px] text-foreground font-medium italic leading-relaxed mb-5 relative z-10 line-clamp-5">
                  "{t.content}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border/25 relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-sm text-primary border border-primary/15 shrink-0">
                    {t.user_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-foreground block truncate">
                      {t.user_name}
                    </span>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTestimonials.length === 0 && !isLoading && (
          <div className="py-24 text-center flex flex-col items-center gap-3 opacity-30">
            <MessageSquare size={36} className="text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-[0.25em]">
              No reviews published yet.
            </p>
          </div>
        )}

        <footer className="mt-16 md:mt-24 py-14 px-6 md:px-12 relative overflow-hidden bg-primary/[0.03] rounded-3xl md:rounded-[3rem] text-center border border-primary/10 group/footer">
          <div className="relative z-10 max-w-lg mx-auto space-y-5">

            <h3 className="text-2xl md:text-3xl font-heading font-black text-foreground leading-snug">
              Share Your Experience
            </h3>
            <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-sm mx-auto">
              Share your thoughts with other collectors. Tell us about your shopping experience and your new timepiece.
            </p>
            <div className="pt-4">
              <button className="px-10 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                Submit Review
              </button>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/footer:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/2 opacity-0 group-hover/footer:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        </footer>

      </div>
    </div>
  );
}