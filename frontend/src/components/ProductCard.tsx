import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, IndianRupee } from "lucide-react";
import { Product } from "@/data/products";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const addToCart = useStore((s) => s.addToCart);

  const productId = String(product.id);
  const isWished = wishlist.includes(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please register or login to save items to your archive.",
      });
      return navigate("/auth");
    }
    toggleWishlist(productId);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(productId);
  };

  return (
    <article className="group relative flex flex-col bg-white rounded-3xl border border-zinc-100 hover:border-primary/30 transition-all duration-700 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
      <Link
        to={`/product/${product.id}`}
        className="relative block w-full aspect-square bg-white overflow-hidden group/img"
        onMouseLeave={() => setActiveImageIndex(0)}
      >
        {images.slice(0, 3).map((imgUrl, idx) => (
          <img
            key={idx}
            src={imgUrl}
            alt={product.name}
            className={cn(
              "absolute inset-0 w-full h-full object-contain p-0 transition-all duration-700 ease-out",
              activeImageIndex === idx ? "opacity-100 scale-105" : "opacity-0 scale-100 pointer-events-none"
            )}
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80";
            }}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute inset-0 z-20 flex">
            <div
              className="w-1/2 h-full cursor-pointer"
              onMouseEnter={() => setActiveImageIndex(images.length >= 2 ? 1 : 0)}
            />
            <div
              className="w-1/2 h-full cursor-pointer"
              onMouseEnter={() => setActiveImageIndex(images.length >= 3 ? 2 : (images.length === 2 ? 1 : 0))}
            />
          </div>
        )}
      </Link>

      <button
        onClick={handleWishlist}
        className={cn(
          "absolute top-2 sm:top-4 right-2 sm:right-4 w-8 sm:w-9 h-8 sm:h-9 rounded-full z-10 flex items-center justify-center transition-all duration-500 shadow-sm border border-zinc-100/50",
          isWished
            ? "bg-primary text-white border-primary"
            : "bg-white/90 backdrop-blur-md text-foreground/40 hover:text-red-500 hover:bg-white md:opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={isWished ? "currentColor" : "none"} />
      </button>

      <div className="flex flex-col p-3 sm:p-5 gap-2 sm:gap-3.5">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[8px] sm:text-[9px] font-label font-bold uppercase tracking-[0.25em] text-primary">
            {product.brand || 'Montclair'}
          </p>
          <h3 className="text-xs sm:text-sm font-heading font-medium leading-snug line-clamp-2 h-8 sm:h-10 group-hover:text-primary transition-colors text-zinc-950">
            <Link to={`/product/${product.id}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-primary mr-0.5">₹</span>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-zinc-950">
                {product.price.toLocaleString("en-IN")}
              </span>
            </div>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-light">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

      </div>
    </article>
  );
}
