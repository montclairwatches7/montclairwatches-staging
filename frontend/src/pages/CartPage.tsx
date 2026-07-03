import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  Tag,
  ArrowRight,
  Package,
  Truck,
  IndianRupee,
  ChevronsDown,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useStore } from "@/store/useStore";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, coupon: couponApplied, setCoupon: setCouponApplied } = useStore();
  const [coupon, setCoupon] = useState("");
  const [atBottom, setAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: dbProducts = [], isLoading } = useProducts();
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    try {
      const response = await api.post("/store/validate-coupon", {
        code: coupon,
        amount: subtotal,
      });
      setCouponApplied(response.data.coupon);
      toast({
        title: "Coupon Applied",
        description: response.data.message,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid coupon code";
      toast({
        title: "Coupon Error",
        description: msg,
        variant: "destructive",
      });
      setCouponApplied(null);
    }
  };

  const cartItems = cart
    .map((ci) => {
      const product = dbProducts.find((p: any) => String(p.id) === String(ci.productId));
      return { ...ci, product };
    })
    .filter((ci) => ci.product);

  const subtotal = cartItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const discount = couponApplied?.discount_amount || 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const vat = Math.round(taxableAmount * 0.2);
  const total = taxableAmount + vat;
  const hasScroll = cartItems.length > 3;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(remaining < 10);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-xs mx-auto animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="font-heading text-xl mt-4">Loading Logistics...</h1>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-xs mx-auto">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#b87333]/20 to-[#b87333]/5 animate-pulse" />
            <div className="absolute inset-0 rounded-3xl border border-[#b87333]/20" />
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag
                size={40}
                className="text-[#b87333]/50"
                strokeWidth={1.2}
              />
            </div>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl mb-3 tracking-tight">
            Your bag is empty
          </h1>

          <Link
            to="/collection"
            className="inline-flex items-center gap-2.5 bg-[#b87333] text-white px-8 py-3.5 text-[10px] tracking-[0.25em] uppercase rounded-2xl hover:bg-[#9d6629] active:scale-95 transition-all duration-200 shadow-lg shadow-[#b87333]/25"
          >
            Browse Collection
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 md:py-14 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8 sm:mb-10 md:mb-14">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              Your <span className="text-[#b87333] italic">Cart</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] 2xl:grid-cols-[1fr_430px] gap-6 lg:gap-10 items-start">
          <div className="flex flex-col gap-5">
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-gradient-to-r from-[#b87333]/8 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#b87333]" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-medium">
                    Cart Items
                  </span>
                </div>
                <span className="text-[10px] tracking-[0.15em] text-muted-foreground">
                  {cartItems.length} of {cartItems.length}
                </span>
              </div>

              <div
                ref={scrollRef}
                className="overflow-y-auto"
                style={{
                  maxHeight: "528px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#b87333 transparent",
                }}
              >
                <style>{`
                  .cart-scroll::-webkit-scrollbar { width: 4px; }
                  .cart-scroll::-webkit-scrollbar-track { background: transparent; }
                  .cart-scroll::-webkit-scrollbar-thumb { background: #b87333; border-radius: 99px; }
                `}</style>

                <div className="cart-scroll flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
                  {cartItems.map(({ product, quantity }, idx) => (
                    <div
                      key={product.id}
                      className="group flex rounded-xl sm:rounded-2xl border border-border overflow-hidden hover:border-[#b87333]/30 hover:shadow-md hover:shadow-[#b87333]/6 transition-all duration-300 bg-background"
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="relative flex-shrink-0 w-24 sm:w-44 md:w-52 self-stretch bg-secondary overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#b87333]/6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img
                          src={product.image}
                          alt={product.name}
                          loading={idx < 3 ? "eager" : "lazy"}
                          className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-[1.04] transition-transform duration-500"
                          onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80"; }}
                        />
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between px-4 sm:px-5 py-4 sm:py-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">

                            <h3 className="font-heading text-base sm:text-lg md:text-xl mt-1 leading-snug line-clamp-2">
                              {product.name}
                            </h3>
                          </div>

                          <button
                            onClick={() => removeFromCart(String(product.id))}
                            className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
                            aria-label="Remove item"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                          <div>
                            <p className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
                              Total
                            </p>
                            <p className="text-[#b87333] font-semibold text-lg sm:text-xl md:text-2xl flex items-center gap-0.5 leading-none">
                              <IndianRupee size={15} strokeWidth={2.5} />
                              {(product.price * quantity).toLocaleString()}.00
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1">
                              ₹{product.price.toLocaleString("en-IN")} × {quantity}
                            </p>
                          </div>

                          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-secondary/60">
                            <button
                              onClick={() =>
                                updateQuantity(String(product.id), quantity - 1)
                              }
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-[#b87333]/12 hover:text-[#b87333] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 sm:w-10 text-center text-sm font-semibold tabular-nums">
                              {String(quantity).padStart(2, "0")}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(String(product.id), quantity + 1)
                              }
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-[#b87333]/12 hover:text-[#b87333] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hasScroll && !atBottom && (
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                  <div className="h-16 bg-gradient-to-t from-card via-card/80 to-transparent" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <ChevronsDown
                      size={18}
                      className="text-[#b87333] animate-bounce"
                    />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#b87333]/70">
                      Scroll
                    </span>
                  </div>
                </div>
              )}

              {hasScroll && atBottom && (
                <div className="px-5 py-3 border-t border-border bg-[#b87333]/5 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b87333]" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#b87333]/80">
                    All {cartItems.length} items shown
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Package, label: "Gift Wrapped", sub: "Complimentary" },
                { icon: Truck, label: "White Glove", sub: "Insured & Tracked" },
                { icon: Tag, label: "Authenticity", sub: "Certificate Incl." },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-secondary/50 border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 hover:border-[#b87333]/25 transition-colors text-center sm:text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#b87333]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#b87333]" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-semibold leading-tight">
                      {label}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:sticky xl:top-6">
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border bg-gradient-to-r from-[#b87333]/8 to-transparent">
                <h2 className="font-heading text-xl sm:text-2xl tracking-wide">
                  Order Summary
                </h2>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="space-y-3.5">
                  {[
                    {
                      label: "Subtotal",
                      node: (
                        <span className="flex items-center gap-0.5 font-semibold text-sm">
                          <IndianRupee size={11} strokeWidth={2.5} />
                          {subtotal.toLocaleString()}.00
                        </span>
                      ),
                    },
                    {
                      label: "Insurance & Delivery",
                      node: (
                        <span className="text-[11px] font-medium text-[#b87333]">
                          Complimentary
                        </span>
                      ),
                    },
                    {
                      label: "tax and Delivery charge",
                      node: (
                        <span className="flex items-center gap-0.5 font-semibold text-sm">
                          <IndianRupee size={11} strokeWidth={2.5} />
                          {vat.toLocaleString()}.00
                        </span>
                      ),
                    },
                    ...(couponApplied ? [{
                      label: "Discount",
                      node: (
                        <span className="flex items-center gap-0.5 font-semibold text-sm text-green-600">
                          - <IndianRupee size={11} strokeWidth={2.5} />
                          {discount.toLocaleString()}.00
                        </span>
                      ),
                    }] : []),
                  ].map(({ label, node }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                        {label}
                      </span>
                      {node}
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-border" />

                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">
                      Amount Due
                    </p>
                    <span className="font-heading text-base sm:text-lg">
                      Total
                    </span>
                  </div>
                  <span className="font-heading text-2xl sm:text-3xl flex items-center gap-0.5 text-[#b87333]">
                    <IndianRupee size={20} strokeWidth={2} />
                    {total.toLocaleString()}.00
                  </span>
                </div>

                <div className="bg-secondary/60 border border-border rounded-xl sm:rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag size={11} className="text-muted-foreground" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                      Coupon Code
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 min-w-0 bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-[#b87333]/50 focus:ring-1 focus:ring-[#b87333]/20 transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 sm:px-4 py-2.5 bg-[#b87333]/12 hover:bg-[#b87333]/22 text-[#b87333] text-[9px] tracking-[0.12em] uppercase rounded-xl transition-colors font-semibold whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-[#b87333] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#b87333]/15 inline-flex items-center justify-center text-[8px]">
                          ✓
                        </span>
                        Code {couponApplied.code} applied
                      </p>
                      <button
                        onClick={() => { setCouponApplied(null); setCoupon(""); }}
                        className="text-[9px] text-destructive hover:underline font-bold uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  to="/checkout"
                  className="w-full bg-[#b87333] text-white py-4 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase hover:bg-[#9d6629] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-[#b87333]/20 hover:shadow-xl hover:shadow-[#b87333]/30 hover:-translate-y-0.5 font-medium"
                >
                  Proceed to Checkout
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
