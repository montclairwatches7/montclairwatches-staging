import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

import { useCategories } from "@/hooks/useModules";

const sortOptions = [
  { label: "Featured", value: "popular" },
  { label: "Price: Low-High", value: "price-asc" },
  { label: "Price: High-Low", value: "price-desc" },
];

export default function CollectionPage() {
  const { data: dbProducts = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [params] = useSearchParams();
  const categoryParam = params.get("category");
  const searchParam = params.get("search") || "";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "All">("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState(searchParam);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync with URL params
  useEffect(() => {
    if (categoryParam && Array.isArray(categories)) {
      const cat = categories.find(
        (c: any) =>
          String(c.slug) === String(categoryParam) ||
          String(c.id) === String(categoryParam) ||
          c.name.toLowerCase().replace(/\s+/g, "-") === String(categoryParam)
      );
      if (cat) setSelectedCategoryId(String(cat.id));
    }
  }, [categoryParam, categories]);

  const filtered = useMemo(() => {
    let result = dbProducts;

    if (selectedCategoryId !== "All") {
      result = result.filter(
        (p) => String(p.category) === String(selectedCategoryId),
      );
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      default:
        return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [
    dbProducts,
    selectedCategoryId,
    priceRange,
    sort,
    search,
  ]);

  const activeCategory = Array.isArray(categories)
    ? categories.find((c: any) => String(c.id) === String(selectedCategoryId))
    : null;
  const title = activeCategory ? activeCategory.name : "Luxury Collection";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col md:flex-row max-w-screen-2xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-border/60 px-5 py-7 gap-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide bg-background/95 backdrop-blur-sm">
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground/70">
              Search
            </h3>
            <div className="relative group">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Reference number..."
                className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-muted/80 border border-border/40 focus:border-primary/30 rounded-md pl-8 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="space-y-2.5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground/70">
              Categories
            </h3>
            <nav className="space-y-0.5">
              <button
                onClick={() => setSelectedCategoryId("All")}
                className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md transition-all duration-200 ${selectedCategoryId === "All"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
              >
                <span>All Watches</span>
                {selectedCategoryId === "All" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
              {Array.isArray(categories) && categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(String(c.id))}
                  className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md transition-all duration-200 ${String(selectedCategoryId) === String(c.id)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                >
                  <span>{c.name}</span>
                  {String(selectedCategoryId) === String(c.id) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="h-px bg-border/40" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground/70">
                Price Range
              </h3>
              <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                ₹{priceRange[1].toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1500000}
              step={10000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[9px] font-semibold text-muted-foreground/60 tracking-wide">
              <span>₹0</span>
              <span>₹15L+</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sticky Filters Bar */}
        <div className="md:hidden border-b border-border flex divide-x divide-border sticky top-16 z-20 bg-background/80 backdrop-blur-md">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>
          <div className="flex-1 relative flex items-center justify-center">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full h-full bg-transparent appearance-none text-[10px] font-bold uppercase tracking-[0.2em] text-center pr-6 outline-none cursor-pointer text-foreground"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-background text-foreground">
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Desktop Sort Header */}
          <div className="hidden md:flex items-center justify-end px-4 sm:px-6 md:px-8 lg:px-10 py-3 md:py-4 border-b border-border/60 bg-background/70 backdrop-blur-md sticky top-20 z-20 gap-4 md:gap-6 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3 group">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground/70 select-none">
                <ArrowUpDown className="w-3 h-3 opacity-60" />
                Sort By
              </span>

              <div className="relative flex items-center">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="
                    appearance-none cursor-pointer
                    bg-muted/40 hover:bg-muted/70
                    border border-border/50 hover:border-primary/40
                    text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em]
                    text-foreground/80 hover:text-primary
                    rounded-md
                    pl-2.5 md:pl-3 pr-7 md:pr-8 py-1.5 md:py-2
                    outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                    transition-all duration-200 ease-in-out
                    min-w-[100px] md:min-w-[120px]
                    shadow-sm
                  "
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-2 md:right-2.5 w-3 h-3 text-muted-foreground/60 group-hover:text-primary/60 transition-colors duration-200" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest">
                Loading Collections...
              </h2>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-fade-in">
              <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full mb-6">
                <Search size={24} className="text-muted-foreground/50" />
              </div>
              <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest">
                No Matches Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                Adjust your filters or search terms to discover our other
                instruments.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId("All");
                  setPriceRange([0, 1500000]);
                  setSearch("");
                }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 border border-[#EBEBEB] text-[#1A1714] text-[10px] font-bold tracking-widest uppercase rounded-xl hover:border-[#1A1714] hover:bg-[#F9F9F9] transition-all duration-300 active:scale-95 group"
              >
                <RotateCcw size={12} className="group-hover:rotate-[-45deg] transition-transform duration-300" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 p-3 sm:p-8 lg:p-10">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[110] md:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white" />
          <div className="relative h-full flex flex-col p-6 pb-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <h2 className="text-xs font-label font-bold uppercase tracking-[0.2em] text-foreground">
                Filter & Sort
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto mb-6 pr-1">
              <div>
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary mb-3">
                  Search
                </h3>
                <div className="flex items-center bg-secondary/30 border border-border/50 rounded-lg px-3 py-2 focus-within:border-primary/30 transition-all">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter model or series..."
                    className="w-full bg-transparent border-none outline-none text-xs px-2.5 placeholder:text-muted-foreground/40 text-foreground font-medium py-1"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary mb-4">
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedCategoryId("All")}
                    className={`h-11 w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${selectedCategoryId === "All"
                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "bg-secondary/40 border-transparent text-muted-foreground active:bg-secondary"
                      }`}
                  >
                    All Watches
                  </button>
                  {Array.isArray(categories) && categories.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryId(String(c.id))}
                      className={`h-11 w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${String(selectedCategoryId) === String(c.id)
                          ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                          : "bg-secondary/40 border-transparent text-muted-foreground active:bg-secondary"
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
                    Price Cap
                  </h3>
                  <span className="font-mono font-bold text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary">
                    ₹{priceRange[1].toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1500000}
                  step={10000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full h-2 bg-secondary rounded-full appearance-none accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-semibold text-muted-foreground/60 tracking-wide mt-2">
                  <span>₹0</span>
                  <span>₹15L+</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-black hover:border-black border border-transparent transition-all shadow-lg shadow-primary/10 animate-in fade-in slide-in-from-bottom duration-300"
            >
              View {filtered.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
