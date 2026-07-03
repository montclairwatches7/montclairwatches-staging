import { ArrowRight, Award, ShieldCheck, Clock, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30 selection:text-primary">

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 hover:scale-100"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="relative container text-center z-10 px-6">

          <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-8xl font-heading text-white leading-none mb-8 animate-slide-up">
            The Spirit of <span className="italic font-light text-primary">Precision</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Montclair is more than a luxury watch house; it is a dedication to the
            art of time itself. We curate exceptional timepieces designed to be
            passed down through generations.
          </p>
        </div>
      </section>


      <section className="py-16 sm:py-24 lg:py-32 container px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8">

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading leading-tight">
              Crafting <span className="italic font-light">Timepieces</span> for a Lifetime
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg font-light">
              Built on Swiss precision and timeless design, Montclair is a trusted
              destination for watch enthusiasts who demand exceptional quality,
              style, and reliability.
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 xs:gap-8 pt-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Award size={20} />
                </div>
                <h3 className="font-heading text-xl">Curated Excellence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every watch in our collection is carefully inspected and verified
                  by our expert watchmakers to guarantee authentic quality.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-heading text-xl">Lifetime Trust</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We build lasting connections. Our extensive warranty and global
                  support ensure your timepiece is protected for years to come.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-md md:max-w-lg lg:max-w-none mx-auto">
            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <img
              src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80"
              alt="Horological Mastery"
              className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-10"
            />
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24 bg-secondary/20 border-y border-border/40">
        <div className="container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { icon: Clock, value: "15+", label: "Years of Trust" },
              { icon: Users, value: "50k+", label: "Happy Collectors" },
              { icon: Award, value: "120+", label: "Curated Brands" },
              { icon: Globe, value: "24", label: "Global Showrooms" },
            ].map((stat, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-center text-primary opacity-60">
                  <stat.icon size={28} strokeWidth={1} />
                </div>
                <div className="text-4xl font-heading">{stat.value}</div>
                <div className="text-[10px] font-label uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-16 sm:py-24 lg:py-32 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading leading-tight italic">
              "Time is the only <span className="text-primary not-italic font-bold">true luxury</span>. We simply provide the vessel."
            </h2>

          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24 lg:py-32 container px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-heading leading-tight">
            Find Your <span className="italic font-light">Signature</span> Watch
          </h2>
          <p className="text-muted-foreground text-lg font-light leading-relaxed">
            Discover our exclusive collections and find a timepiece that does
            more than tell time—it tells your unique story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              to="/collection"
              className="bg-primary text-white px-6 xs:px-8 sm:px-12 py-4 sm:py-5 text-xs font-label font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black hover:border-black border border-transparent transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              Explore Collection <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="border border-border px-6 xs:px-8 sm:px-12 py-4 sm:py-5 text-xs font-label font-bold tracking-[0.2em] uppercase hover:bg-secondary transition-all w-full sm:w-auto"
            >
              Consult an Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
