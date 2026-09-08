import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useStore } from "@/store/useStore";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GENERIC_CARE = `Preserve your timepiece's finish by cleaning it occasionally with a soft, dry microfibre cloth. Wipe the case and bracelet or strap with a lightly dampened microfibre cloth after exposure to dust, salt air, or sweat.

Always ensure the crown is pushed in fully before cleaning to maintain water resistance.

Avoid adjusting the date between 9 PM and 3 AM, as the date-change mechanism may be engaged during this window and forcing it can damage the movement.`;

function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-border last:border-b-0 transition-colors duration-200",
        isOpen ? "bg-secondary/5" : "bg-transparent"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between py-5 sm:py-6 text-left group",
          "px-4 sm:px-6 relative"
        )}
      >
        {/* Active left accent bar */}
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300",
            isOpen ? "h-8 bg-primary" : "h-0 bg-transparent"
          )}
        />
        <span
          className={cn(
            "text-sm sm:text-[15px] font-semibold tracking-wide transition-colors duration-200",
            isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "ml-4 shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen
              ? "bg-primary text-primary-foreground rotate-180"
              : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          <ChevronDown size={15} strokeWidth={2.5} />
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 sm:px-6 pb-7 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SpecTable({ specGroups }: { specGroups: { title: string; items: { label: string; value: any }[] }[] }) {
  const hasAny = specGroups.some((g) => g.items.some((item) => item.value));
  if (!hasAny) return <p className="text-sm text-muted-foreground">No specifications available.</p>;
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <tbody>
          {specGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.value);
            if (!visibleItems.length) return null;
            return (
              <React.Fragment key={group.title}>
                <tr className="bg-primary/5">
                  <td colSpan={2} className="py-2.5 px-4 sm:px-6 text-[10px] tracking-[0.22em] uppercase font-bold text-primary border-b border-t border-border">
                    {group.title}
                  </td>
                </tr>
                {visibleItems.map((item, i) => (
                  <tr key={i} className={cn("border-b border-border/60 last:border-b-0", i % 2 === 0 ? "bg-background" : "bg-secondary/5")}>
                    <td className="py-3.5 px-4 sm:px-6 text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium w-2/5 sm:w-1/3 align-top">
                      {item.label}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground text-xs sm:text-sm leading-relaxed">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: dbProducts = [] } = useProducts();
  const [imgIndex, setImgIndex] = useState(0);
  const [openTab, setOpenTab] = useState<string | null>("description");
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);

  const handleAddToCart = () => {
    if (product) addToCart(product.id);
  };

  const handleWishlist = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please register or login to save items to your archive." });
      return navigate("/auth");
    }
    if (product) toggleWishlist(product.id);
  };

  const toggleTab = (key: string) => setOpenTab((prev) => (prev === key ? null : key));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">Querying Archive…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-muted-foreground text-sm mb-4">Product not found.</p>
        <Link to="/collection" className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary hover:underline">← Back to Collection</Link>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const related = dbProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  const specGroups = [
    {
      title: "Case & Dial",
      items: [
        { label: "Diameter", value: product.case_diameter },
        { label: "Material", value: product.case_material },
        { label: "Thickness", value: product.case_thickness },
        { label: "Lug Width", value: product.lug_width },
        { label: "Dial Colour", value: product.dial_colour },
        { label: "Crystal", value: product.crystal },
      ],
    },
    {
      title: "Movement & Power",
      items: [
        { label: "Type", value: product.movement_type },
        { label: "Caliber", value: product.caliber },
        { label: "Power Reserve", value: product.power_reserve },
        { label: "Water Resistance", value: product.water_resistance },
      ],
    },
    {
      title: "Additional Details",
      items: [
        { label: "Strap Material", value: product.strap_material },
        { label: "Warranty", value: product.warranty },
        { label: "Model Number", value: product.model_number },
      ],
    },
  ];

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const description = product.fullDescription || product.shortDescription || product.description || null;
  const boxContents = product.boxContents || product.whats_in_the_box || null;
  const functions = product.functions || null;

  const ACCORDION_TABS = [
    description && { key: "description", title: "Description" },
    { key: "specifications", title: "Specifications" },
    (boxContents || functions) && { key: "details", title: "Functions & What's In The Box" },
    { key: "warranty", title: "Warranty & Returns" },
    { key: "care", title: "Care and Maintenance" },
  ].filter(Boolean) as { key: string; title: string }[];

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-16 lg:py-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-primary transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[160px]">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-20 items-start lg:items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden aspect-square ring-1 ring-border group">
              <img
                src={images[imgIndex]}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain p-6 sm:p-10 transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {product.mrp && (
                <div className="absolute top-4 left-4 bg-green-600 text-white text-[9px] tracking-widest uppercase font-bold px-3 py-1 rounded-full shadow">
                  Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </div>
              )}
              <div className={cn(
                "absolute top-4 right-4 flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-bold px-3 py-1 rounded-full shadow",
                product.stock_quantity > 0 ? "bg-background/80 backdrop-blur-sm text-foreground" : "bg-red-50 text-red-600"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", product.stock_quantity > 0 ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                    aria-label="Previous image"
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-md p-2.5 sm:p-3 rounded-full border border-border hover:bg-background hover:border-primary transition-all duration-200 shadow-sm z-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                    aria-label="Next image"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-md p-2.5 sm:p-3 rounded-full border border-border hover:bg-background hover:border-primary transition-all duration-200 shadow-sm z-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 justify-start flex-wrap pt-1">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-white p-2 outline-none transition-all duration-200",
                    i === imgIndex
                      ? "border-2 border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] opacity-100 scale-105"
                      : "border border-zinc-200 opacity-50 hover:opacity-80 hover:border-primary/50 hover:scale-[1.02]"
                  )}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            {images.length > 1 && (
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                {imgIndex + 1} / {images.length}
              </p>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-8 sm:gap-10">

            {/* Header */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-bold">{product.brand}</span>
                <span className="h-3 w-px bg-border" />
                <Link
                  to={`/collection?category=${product.category_slug || product.category}`}
                  className="text-[10px] tracking-[0.2em] uppercase text-primary font-bold hover:underline"
                >
                  {product.category_name}
                </Link>
                {product.collection && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{product.collection}</span>
                  </>
                )}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight">{product.name}</h1>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-2 pt-1">
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-semibold tabular-nums">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  {product.mrp && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="line-through">₹{Number(product.mrp).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                        Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                      </span>
                    </p>
                  )}
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.stock_quantity > 0 ? "bg-green-500 animate-pulse" : "bg-red-400")} />
                  <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-muted-foreground">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} Units Available` : "Out of Stock"}
                  </span>
                </div>
              </div>
            </header>

            {/* Key Highlights */}
            {product.key_highlights && (
              <div className="rounded-2xl border border-border bg-secondary/10 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles size={14} strokeWidth={2.5} />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold">Key Highlights</span>
                </div>
                <ul className="space-y-3">
                  {product.key_highlights.split("\n").filter(Boolean).map((point: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="text-primary mt-1.5 shrink-0 text-[8px]">◆</span>
                      <span>{point.replace(/^[•●◆*-]\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2.5 py-4 sm:py-5 rounded-full",
                  "text-[10px] tracking-[0.22em] uppercase font-bold transition-all duration-300",
                  "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                  "hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
                  "active:translate-y-0 active:shadow-md",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                )}
              >
                {product.stock_quantity > 0 ? "Add To Cart" : "Out Of Stock"}
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleWishlist}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "w-14 h-14 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 hover:-translate-y-0.5",
                  isWished ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border bg-background hover:border-primary hover:bg-primary/5"
                )}
              >
                <Heart
                  size={17}
                  strokeWidth={2}
                  fill={isWished ? "hsl(var(--primary))" : "none"}
                  className={cn("transition-colors duration-300", isWished ? "text-primary" : "text-muted-foreground")}
                />
              </button>
            </div>

            <div className="flex items-center gap-4 py-4 sm:py-5 border-y border-border">
              <ShieldCheck className="text-primary shrink-0" size={20} strokeWidth={1.75} />
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold">Certified Protection</p>
                <p className="text-xs text-muted-foreground mt-0.5">{product.warranty || "Standard Manufacturer Warranty"}</p>
              </div>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden">
              {ACCORDION_TABS.map((tab, i) => (
                <AccordionItem
                  key={tab.key}
                  title={tab.title}
                  isOpen={i === 0 ? openTab === tab.key || !ACCORDION_TABS.some((t) => t.key === openTab) : openTab === tab.key}
                  onToggle={() => toggleTab(tab.key)}
                >
                  {tab.key === "description" && description && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  )}

                  {tab.key === "specifications" && (
                    <SpecTable specGroups={specGroups} />
                  )}

                  {tab.key === "details" && (
                    <div className="space-y-6">
                      {functions && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Functions</h4>
                          <ul className="space-y-2 pl-1">
                            {functions.split("\n").filter(Boolean).map((line: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                <span className="text-primary mt-1.5 shrink-0 text-[8px]">◆</span>
                                <span>{line.replace(/^[•●◆*-]\s*/, "")}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {boxContents && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">What's In The Box</h4>
                          <ul className="space-y-2 pl-1">
                            {boxContents.split("\n").filter(Boolean).map((line: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                <span className="text-primary mt-1.5 shrink-0 text-[8px]">◆</span>
                                <span>{line.replace(/^[•●◆*-]\s*/, "")}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {tab.key === "warranty" && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Products can be replaced within 3 days of delivery if unused and in original packaging.{" "}
                          <Link to="/shipping" className="text-primary underline underline-offset-2 hover:text-primary/80">
                            Read our full policy →
                          </Link>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Warranty Coverage</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {product.warranty || "Standard manufacturer warranty applies. Contact our support team for details specific to this timepiece."}
                        </p>
                      </div>
                    </div>
                  )}

                  {tab.key === "care" && (
                    <div className="space-y-3">
                      {GENERIC_CARE.split("\n\n").filter(Boolean).map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </AccordionItem>
              ))}
            </div>
          </div>
        </div>


        {related.length > 0 && (
          <section className="mt-20 sm:mt-32 pt-12 sm:pt-20 border-t border-border">
            <div className="flex items-center justify-between mb-10 sm:mb-14">
              <h2 className="text-[10px] tracking-[0.25em] uppercase font-bold text-muted-foreground">Related Archives</h2>
              <Link to="/collection" className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary hover:underline">
                View Full Registry →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="lg:hidden fixed bottom-14 sm:bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tabular-nums truncate">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
          <p className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground truncate">
            {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-full shrink-0",
            "text-[10px] tracking-[0.18em] uppercase font-bold transition-all duration-300",
            "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
            "active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {product.stock_quantity > 0 ? "Add To Cart" : "Out Of Stock"}
        </button>
      </div>
      <div className="lg:hidden h-16" />
    </div>
  );
}