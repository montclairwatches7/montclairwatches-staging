import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  Lock,
  RotateCcw,
  Headphones,
  Award,
  Star,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  Flame,
  Clock,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useBanners, useTestimonials, useBrands, useServices } from "@/hooks/useModules";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";

const FALLBACK_SLIDES = [
  {
    image: "/hero-luxury-1.png",
    title: "Timeless Style, Modern Precision",
    subtitle: "Explore premium watches at best prices",
    cta1: "Shop Now",
    cta2: "Explore Collection",
  },
  {
    image: "/hero-luxury-2.png",
    title: "Engineered Excellence",
    subtitle: "Mastering the Art of Mechanical Perfection",
    cta1: "Shop Now",
    cta2: "View Technical Specs",
  },
  {
    image: "/hero-luxury-3.png",
    title: "The Heritage Legacy",
    subtitle: "A Testament to Horological Purity",
    cta1: "Discover",
    cta2: "Our Story",
  },
];

const FALLBACK_CATEGORIES = [
  { name: "Men Watches", img: "/cat-men.png", href: "/collection?category=men-watches" },
  { name: "Women Watches", img: "/cat-women.png", href: "/collection?category=women-watches" },
  { name: "Smart Watches", img: "/cat-smart.png", href: "/collection?category=smart-watches" },
  { name: "Luxury Watches", img: "/cat-luxury.png", href: "/collection?category=luxury-watches" },
  { name: "Sports Watches", img: "/cat-sport.png", href: "/collection?category=sports-watches" },
];

const FALLBACK_TRUST = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹5,000" },
  { icon: Lock, title: "Secure Payment", desc: "100% protected payments" },
  { icon: RotateCcw, title: "Easy Returns", desc: "15-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated expert help" },
  { icon: Award, title: "Premium Quality", desc: "Certified authentic brands" },
];

const FALLBACK_TESTIMONIALS = [
  { name: "Arjun Sharma", text: "The quality of the Montclair Heritage is beyond words. A truly premium experience from ordering to unboxing.", rating: 5 },
  { name: "Priya Patel", text: "Finally found a place that offers authentic luxury watches with great customer service in India.", rating: 5 },
  { name: "Vikram Singh", text: "The Smart watch I bought is sleek and functional. Delivery was super fast too!", rating: 4 },
];

const ICON_MAP = {
  'Truck': Truck, 'Lock': Lock, 'RotateCcw': RotateCcw, 'Headphones': Headphones, 'Award': Award, 'Star': Star
};

export default function HomePage() {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      return toast({
        title: "Communication Failure",
        description: "Please enter your email address.",
        variant: "destructive",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      return toast({
        title: "Communication Failure",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
    setSubmittingNewsletter(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Access Granted",
        description: "You have been registered for private boutique drops.",
      });
      setNewsletterEmail("");
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: "Could not register at this time.",
        variant: "destructive",
      });
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  const { data: dbProducts = [], isLoading: pLoad } = useProducts();
  const { data: rawBanners } = useBanners();
  const { data: rawTestimonials } = useTestimonials();
  const { data: rawBrands } = useBrands();
  const { data: rawServices } = useServices();
  const { data: rawCategories } = useQuery({ queryKey: ['categories'], queryFn: async () => { const res = await api.get('/categories'); return res.data || []; } });

  const products = dbProducts;
  const slides = (rawBanners && rawBanners.length > 0) ? rawBanners.map((b: any) => ({ image: b.image_url, title: b.title, subtitle: b.subtitle, cta1: b.cta_1_text, cta2: b.cta_2_text })) : FALLBACK_SLIDES;
  const categories = (rawCategories?.data && rawCategories.data.length > 0)
    ? rawCategories.data.map((c: any) => {
      const slugValue = c.slug || c.name.toLowerCase().replace(/\s+/g, '-');
      return {
        name: c.name,
        img: c.image_url || c.image || FALLBACK_CATEGORIES[0].img,
        href: `/collection?category=${slugValue}`
      };
    })
    : FALLBACK_CATEGORIES;
  const testimonials = (rawTestimonials && rawTestimonials.length > 0) ? rawTestimonials.map((t: any) => ({ name: t.user_name, text: t.content, rating: Math.round(t.rating) })) : FALLBACK_TESTIMONIALS;
  const trustPoints = (rawServices && rawServices.length > 0) ? rawServices.map((s: any) => ({ icon: ICON_MAP[s.icon_name as keyof typeof ICON_MAP] || Star, title: s.title, desc: s.description })) : FALLBACK_TRUST;
  const brandList = (rawBrands && rawBrands.length > 0) ? rawBrands.map((b: any) => ({ name: b.name, logo: b.logo_url, isPremium: b.is_premium === 1 })) : [
    { name: "Rolex", logo: "/Rolex.png", isPremium: true }, { name: "Titan", logo: "/titan.webp" }, { name: "Casio", logo: "/Casio.avif" }, { name: "Timex", logo: "/Timex.png" }, { name: "Fossil", logo: "/Fossil.webp" }, { name: "Fastrack", logo: "/Fastract.webp" }
  ];

  const isLoading = pLoad;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState<
    "new" | "bestseller" | "trending"
  >("new");
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hrs: 15,
    mins: 42,
    secs: 30,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0)
          return { ...prev, hrs: prev.hrs - 1, mins: 59, secs: 59 };
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hrs: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdown);
    };
  }, []);

  const filteredProducts = products
    .filter((p) => {
      if (activeFilter === "new") return true;
      if (activeFilter === "bestseller") return p.rating >= 4.8;
      if (activeFilter === "trending") return p.trending;
      return true;
    })
    .slice(0, 8);

  const newArrivals = products.slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary tracking-widest uppercase text-xs font-bold">
            Montclair Horology
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Hero Section */}
      <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? "scale(1.1)" : "scale(1)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="relative container h-full flex flex-col justify-center items-start px-4 sm:px-10 lg:px-20 pt-20">
              <div
                className={cn(
                  "max-w-3xl transition-all duration-1000 delay-300 transform",
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0",
                )}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 sm:w-12 h-px bg-primary/60" />
                  <span className="text-[10px] sm:text-xs font-label tracking-[0.4em] uppercase font-bold text-primary drop-shadow-md">
                    Exquisite Horology
                  </span>
                </div>
                <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading text-white leading-[1.05] mb-8 drop-shadow-2xl">
                  {slide.title.split(', ').map((part, i) => (
                    <span key={i} className="block italic first:not-italic first:font-bold">
                      {part}
                    </span>
                  ))}
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-10 font-light tracking-wide max-w-lg leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    to="/collection"
                    className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 sm:px-10 sm:py-5 text-xs sm:text-sm font-label font-bold tracking-[0.2em] uppercase rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-xl shadow-primary/20"
                  >
                    {slide.cta1}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center bg-white/5 backdrop-blur-xl text-white border border-white/20 hover:border-white hover:bg-white hover:text-black px-8 py-4 sm:px-10 sm:py-5 text-xs sm:text-sm font-label font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-lg"
                  >
                    {slide.cta2}
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-1 transition-all duration-500 rounded-full",
                    i === currentSlide ? "w-12 bg-primary" : "w-6 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="pt-12 pb-6 sm:pt-32 sm:pb-12 container px-4 sm:px-6">
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 sm:mb-16 lg:mb-20 gap-6 sm:gap-8">

          <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6 leading-tight tracking-tight">
              Watch <span className="italic font-light text-primary">Collections</span>
            </h2>

          </div>
          <Link
            to="/collection"
            className="group inline-flex items-center gap-3 border border-primary/30 hover:border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3.5 text-xs sm:text-sm font-label font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 self-start lg:self-auto shrink-0 shadow-sm hover:shadow-md"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-5 gap-3 sm:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={cat.href}
              className={cn(
                "group relative overflow-hidden bg-secondary rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
                i === 4 ? "col-span-2 aspect-[2/1]" : "col-span-1 aspect-[3/4]",
                "sm:aspect-[4/5]",
                i < 3 ? "sm:col-span-2" : "sm:col-span-3",
                "md:col-span-1"
              )}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 text-white translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-label tracking-[0.3em] uppercase mb-1 opacity-60">
                  Shop
                </p>
                <h3 className="text-sm sm:text-lg md:text-sm lg:text-lg xl:text-2xl font-heading font-medium tracking-wide leading-tight">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 border-y border-border/50 bg-secondary/5 overflow-hidden relative group hidden">
        <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap gap-16 sm:gap-32 group-hover:[animation-play-state:paused] items-center py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-16 sm:gap-32 items-center">
              {brandList.map((brand) => (
                <div
                  key={brand.name}
                  className="brand-item flex flex-col items-center gap-5 cursor-pointer"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <div className="brand-logo-container w-full h-full rounded-full bg-white border border-border/40 shadow-sm flex items-center justify-center p-6 sm:p-8 overflow-hidden">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="brand-logo w-full h-full object-contain"
                      />
                    </div>

                    {brand.isPremium && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-20 shadow-lg border border-white/20">
                        Elite
                      </div>
                    )}
                  </div>

                  <span className="brand-name text-[10px] font-label font-bold uppercase tracking-[0.3em] text-foreground">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="pt-12 pb-16 sm:pt-16 sm:pb-32 bg-secondary/20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto">

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-10 leading-tight">
              Watch <span className="italic font-light text-primary">Collection</span>
            </h2>

            <div className="flex justify-center gap-2 sm:gap-4 overflow-x-auto pb-6 no-scrollbar">
              {[
                { id: "new", label: "New", icon: Zap },
                { id: "bestseller", label: "Top Rated", icon: Star },
                { id: "trending", label: "Hot", icon: Flame },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={cn(
                    "flex items-center gap-2.5 px-8 py-4 text-[10px] font-label tracking-[0.2em] uppercase font-bold transition-all border rounded-full shrink-0",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-8 gap-y-8 sm:gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showAddToCart />
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link
              to="/collection"
              className="inline-flex items-center gap-4 bg-foreground text-background px-12 py-6 text-xs sm:text-sm font-label font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-all rounded-full shadow-2xl"
            >
              Discover New Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      <section className="pt-2 pb-12 sm:pt-4 sm:pb-24 px-4 sm:px-6">
        <div className="container p-0">
          <div className="relative overflow-hidden bg-black text-white p-6 sm:p-12 lg:p-20 rounded-[2rem] sm:rounded-[3.5rem] group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[60%] h-full bg-primary/5 -skew-x-12 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
              <div className="max-w-2xl text-center lg:text-left order-2 lg:order-1">

                <h2 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-heading mb-6 leading-[1.1] tracking-tight">
                  The <span className="italic text-primary font-light">Platinum</span>
                  <br />
                  Standard
                </h2>
                <p className="text-sm sm:text-lg text-white/60 mb-8 font-light italic leading-relaxed max-w-lg">
                  “Access our most prestigious calibers at an exceptional
                  acquisition value. A true testament to horological mastery.”
                </p>

                <div className="flex justify-center lg:justify-start gap-2 xs:gap-3 sm:gap-4 mb-10">
                  <CountdownBox value={timeLeft.days} unit="Days" />
                  <CountdownBox value={timeLeft.hrs} unit="Hrs" />
                  <CountdownBox value={timeLeft.mins} unit="Mins" />
                  <CountdownBox value={timeLeft.secs} unit="Secs" />
                </div>

                <Link
                  to="/collection?category=luxury-watches"
                  className="inline-block bg-primary text-white px-12 py-4 text-xs sm:text-sm font-label font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all shadow-2xl shadow-primary/40 rounded-full"
                >
                  Access Collection
                </Link>
              </div>

              <div className="relative w-full max-w-[280px] xs:max-w-sm sm:max-w-md aspect-square lg:scale-110 order-1 lg:order-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <img
                  src="/hero-luxury-2.png"
                  alt="Exclusive Timepiece"
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="pt-6 pb-12 sm:pt-12 sm:pb-24 bg-secondary/10 border-y border-border/40 px-4 sm:px-6">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-y-10 gap-x-6 sm:gap-10 lg:gap-16">
            {trustPoints.map((point, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group w-[calc(50%-0.75rem)] sm:w-[calc(33.33%-1.5rem)] lg:flex-1 max-w-[220px]"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-background border flex items-center justify-center mb-4 sm:mb-8 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-xl">
                  <point.icon size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-sm sm:text-xl mb-1.5 sm:mb-3 tracking-wide uppercase font-medium">
                  {point.title}
                </h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed px-2 sm:px-4 opacity-70 line-clamp-2">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Slider */}
      <section className="pt-6 pb-12 sm:pt-10 sm:pb-20 overflow-hidden px-4 sm:px-6 bg-[#FCFCFB] relative">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-primary/[0.02] -skew-x-12 translate-x-1/2 pointer-events-none" />

        <div className="container relative z-10">
          <div className="flex justify-between items-end mb-6 sm:mb-10">
            <div className="text-left">

              <h2 className="text-4xl sm:text-6xl font-heading leading-tight">
                New <span className="italic font-light text-primary">Arrivals</span>
              </h2>
            </div>
            <div className="flex gap-2 sm:gap-4 pb-2">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all active:scale-90"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all active:scale-90"
                aria-label="Next slide"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="embla" ref={emblaRef}>
            <div className="embla__container flex gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="embla__slide flex-[0_0_80%] xs:flex-[0_0_60%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_18.4%] min-w-0"
                >
                  <div className="relative group p-0.5">
                    <ProductCard product={product} />
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-white text-[6px] sm:text-[9px] font-label font-bold tracking-[0.3em] uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xl z-20 pointer-events-none">
                      New Arrival
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pt-8 pb-16 sm:pt-16 sm:pb-32 bg-zinc-50 text-zinc-900 relative overflow-hidden px-4 sm:px-6">
        <div className="container relative z-10">
          <div className="text-center mb-12 sm:mb-20 max-w-2xl mx-auto">

            <h2 className="text-3xl sm:text-5xl font-heading mb-4 tracking-tight">
              Customer <span className="italic font-light text-primary">Feedback</span>
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group relative p-[1px] flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 rounded-[1.5rem] sm:rounded-[2.5rem]"
              >

                <div className="absolute inset-0 bg-zinc-200/60 rounded-[1.5rem] sm:rounded-[2.5rem] transition-all duration-700" />
                <div className="absolute inset-0 bg-primary rounded-[1.5rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />


                <div className="relative bg-white w-full h-full p-6 md:p-8 lg:p-12 rounded-[1.44rem] sm:rounded-[2.44rem] flex flex-col items-center text-center z-10">
                  <span className="text-4xl sm:text-6xl font-serif text-primary/5 absolute top-6 left-6 italic pointer-events-none group-hover:text-primary/10 transition-colors">
                    &ldquo;
                  </span>

                  <div className="mb-6 flex gap-1 transform group-hover:scale-105 transition-transform duration-500">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-500",
                          j < t.rating
                            ? "fill-primary text-primary"
                            : "text-zinc-200",
                        )}
                      />
                    ))}
                  </div>

                  <p className="text-sm md:text-base lg:text-lg italic text-zinc-600 mb-8 font-light leading-relaxed relative z-10">
                    {t.text}
                  </p>

                  <div className="mt-auto w-full">
                    <div className="w-8 h-[1px] bg-primary/30 mx-auto mb-4 group-hover:w-16 transition-all duration-700" />
                    <p className="text-[10px] font-label tracking-[0.3em] uppercase font-extrabold text-zinc-900 mb-1">
                      {t.name}
                    </p>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="container px-4 sm:px-6 mb-10">
        <div className="relative overflow-hidden bg-zinc-950 text-white rounded-[2rem] sm:rounded-[3.5rem] border border-white/5 py-10 sm:py-16 px-4 sm:px-16 lg:px-24 group">
          {/* Elegant background texture & glows */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none transition-all duration-[2000ms] group-hover:scale-110" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />


          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 text-left">


              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6 tracking-tight leading-[1.1]">
                Join the <span className="italic font-light text-primary">Collectors Club</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-xl mb-8">
                Subscribe to our newsletter to receive updates on new watch arrivals, exclusive member offers, and early access to limited edition watch collections.
              </p>

              {/* VIP Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                {[
                  "New Arrival Notifications",
                  "Exclusive Member Pricing",
                  "Limited Edition Previews",
                  "Priority Customer Support",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs font-label uppercase tracking-widest text-zinc-300 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Form Card */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
                {/* Thin top gold border highlight */}
                <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <h3 className="text-sm sm:text-base font-heading font-medium tracking-wide text-white mb-6 uppercase text-center">
                  Subscribe to Updates
                </h3>

                <form
                  className="space-y-4"
                  onSubmit={handleSubscribeNewsletter}
                >
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-full pl-12 pr-6 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-label text-xs tracking-wider"
                      required
                      disabled={submittingNewsletter}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingNewsletter}
                    className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300 py-4 px-6 rounded-full text-xs font-label font-bold tracking-[0.2em] uppercase shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingNewsletter ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>


              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="h-10 sm:h-16" />
    </div>
  );
}

function CountdownBox({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-4 rounded-lg sm:rounded-xl min-w-[60px] sm:min-w-[70px]">
      <span className="text-lg sm:text-2xl font-heading font-bold">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[8px] sm:text-[10px] font-label tracking-widest uppercase opacity-60 mt-1">
        {unit}
      </span>
    </div>
  );
}
