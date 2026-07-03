import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ShoppingBag,
  ExternalLink,
  Grid,
  ImageIcon,
  Download,
  X,
  Share2,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useProducts } from "@/hooks/useProducts";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const { data: dbProducts = [] } = useProducts();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get("/store/wishlist");
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch gallery items");
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };
  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      fetchWishlist();
      toast({
        title: "Exhibit Removed",
        description: "Item has been purged from your Private Gallery.",
      });
    } catch (error: any) {
      toast({
        title: "Protocol Failure",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
    toast({
      title: "Item Projected",
      description: "Moving exhibit to procurement cart.",
    });
  };
  if (loading)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-label uppercase tracking-widest text-outline animate-pulse">
            Loading Gallery…
          </p>
        </div>
      </div>
    );
  return (
    <main className="min-h-screen bg-surface">
      <section className="pt-28 pb-10 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-light text-on-surface leading-none">
              My <span className="text-[#B87333]">Wishlist</span>
            </h1>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-2 bg-surface-container rounded-2xl px-5 py-3 self-start sm:self-auto border border-outline-variant/20">
              <Heart size={14} className="text-primary fill-primary" />
              <span className="font-label text-[11px] tracking-widest text-on-surface uppercase">
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "Collection" : "Collections"}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gradient-to-r from-outline-variant/40 via-outline-variant/10 to-transparent mt-8" />
      </section>
      {wishlist.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-32">
          <div className="flex flex-col items-center justify-center py-32 sm:py-44 border border-dashed border-outline-variant/30 rounded-3xl gap-8">
            <div className="w-20 h-20 rounded-full border border-outline-variant/30 flex items-center justify-center">
              <Heart size={28} className="text-outline/40" />
            </div>
            <div className="text-center">
              <p className="font-headline text-2xl sm:text-3xl italic text-on-surface opacity-40 mb-2">
                Your gallery is currently empty
              </p>

            </div>
            <Link
              to="/collection"
              className="inline-flex items-center gap-2.5 bg-[#1A1714] text-white px-8 py-3.5 font-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B87333] hover:shadow-lg hover:shadow-[#B87333]/15 active:scale-95 transition-all duration-300 rounded-xl group"
            >
              <span>Explore Archives</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-32">
          <div
            className="
              grid gap-5
              grid-cols-1
              xs:grid-cols-2
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {wishlist.map((item, i) => {
              const localProd = dbProducts.find(
                (p: any) => String(p.id) === String(item.product_id),
              );
              const displayImg = localProd ? localProd.image : item.image;

              return (
                <article
                  key={item.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="
                  group relative flex flex-col
                  bg-surface-container rounded-2xl
                  border border-outline-variant/20
                  hover:border-outline-variant/50
                  hover:shadow-xl hover:shadow-black/5
                  overflow-hidden
                  transition-all duration-300
                  animate-fade-up
                "
                >
                  <Link
                    to={`/product/${item.product_id}`}
                    className="relative aspect-[4/5] bg-surface-container-lowest overflow-hidden flex items-center justify-center cursor-pointer group/img"
                  >
                    <img
                      src={displayImg}
                      alt={item.name}
                      className="
                      w-4/5 h-4/5 object-contain
                      transition-transform duration-700
                      group-hover/img:scale-110
                    "
                      onError={(e: any) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80";
                      }}
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    aria-label="Remove from wishlist"
                    className="
                    absolute top-3 right-3
                    w-8 h-8 rounded-full
                    z-10
                    bg-surface/80 backdrop-blur-sm
                    flex items-center justify-center
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                    hover:bg-red-50 hover:text-red-500
                    transition-all duration-200
                    border border-outline-variant/20
                  "
                  >
                    <X size={14} />
                  </button>

                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-headline text-base sm:text-lg font-light text-on-surface leading-snug line-clamp-2 flex-1">
                        <Link to={`/product/${item.product_id}`}>
                          {item.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <IndianRupee
                          size={13}
                          strokeWidth={3}
                          className="text-primary group-hover:text-white"
                        />
                        <span className="font-label text-sm font-bold tracking-tight">
                          {Number(item.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1" />

                    <button
                      onClick={() => handleAddToCart(item.product_id)}
                      className="
                      w-full flex items-center justify-center gap-2
                      bg-primary text-white
                      py-3 rounded-xl
                      font-label text-[10px] uppercase tracking-[0.18em] font-medium
                      hover:bg-primary/90 active:scale-[0.98]
                      transition-all duration-200
                    "
                    >
                      <ShoppingBag size={13} />
                      Add to Cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
