import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  MapPin,
  CreditCard,
  Shield,
  ChevronRight,
  Truck,
  CheckCircle2,
  Navigation,
  Plus,
  IndianRupee,
  Lock,
  ArrowRight,
  Clock,
  Headphones,
} from "lucide-react";

import { X } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { user, refreshUser, isLoading } = useAuth();
  const { cart, clearCart, coupon: couponApplied } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const { data: dbProducts = [] } = useProducts();

  const cartItems = cart
    .map((ci) => {
      const product = dbProducts.find(
        (p: any) => String(p.id) === String(ci.productId),
      );
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

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/auth", { state: { redirectTo: "/checkout" } });
      return;
    }
    if (cart.length === 0 && !loading) {
      navigate("/cart");
      return;
    }

    refreshUser();
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.addresses) {
      if (user.addresses.length === 0) {
        navigate("/addresses", { state: { from: "checkout" } });
        return;
      }
      const def = user.addresses.find((a: any) => a.is_default);
      if (def) setSelectedAddressId(def.id);
      else if (user.addresses.length > 0 && !selectedAddressId)
        setSelectedAddressId(user.addresses[0].id);
    }
  }, [user?.addresses]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      return toast({
        title: "Missing Information",
        description: "Please select a logistics transmission point.",
        variant: "destructive",
      });
    }

    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      toast({
        title: "Configuration Error",
        description: "Razorpay SDK failed to initialize. Please check your connection.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const address = user?.addresses?.find(
        (a: any) => a.id === selectedAddressId,
      );

      // 1. Create order in backend
      const { data } = await api.post("/payment/razorpay/order", {
        amount: total,
      });

      if (!data.success) {
        throw new Error("Failed to create Razorpay order");
      }

      const options = {
        key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Montclair Luxury",
        description: "Horological Acquisition",
        image: "/logo.png",
        order_id: data.order.id,
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verifyRes = await api.post("/payment/razorpay/verify", {
              ...response,
              totalAmount: total,
              shippingAddress: address,
              cartItems: cartItems.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.product.price,
              })),
            });

            if (verifyRes.data.success) {
              await clearCart();
              toast({
                title: "Acquisition Finalized",
                description: "Your timepiece has been reserved and secured.",
              });
              navigate(`/order-confirmation/${verifyRes.data.orderId}`);
            }
          } catch (error: any) {
            toast({
              title: "Verification Failed",
              description: error.response?.data?.message || "Payment verification failed",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#B87333", // Luxury copper/gold
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FCFCFC] pt-20 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-12 animate-fade-in relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] flex items-center justify-center">
        <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <nav className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-xs font-label uppercase tracking-luxury text-black mb-8 md:mb-12 overflow-x-auto whitespace-nowrap no-scrollbar pb-2 md:pb-0">
          <span
            className="hover:text-primary transition-colors cursor-pointer opacity-60 hover:opacity-100"
            onClick={() => navigate("/")}
          >
            Boutique
          </span>
          <ChevronRight size={10} className="shrink-0 opacity-20" />
          <span
            className="hover:text-primary transition-colors cursor-pointer opacity-60 hover:opacity-100"
            onClick={() => navigate("/cart")}
          >
            Procurement
          </span>
          <ChevronRight size={10} className="shrink-0 opacity-20" />
          <span className="text-primary font-bold border-b-2 border-primary/20 pb-0.5">
            Checkout
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          <div className="lg:col-span-7 xl:col-span-7 space-y-10 md:space-y-14">
            <section
              className="animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-black/5 pb-6 gap-6 sm:gap-0">
                <div className="space-y-2">
                  <h2 className="font-headline text-3xl md:text-4xl italic tracking-tight text-black">
                    Delivery <span className="text-primary">Address</span>
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/addresses", { state: { from: "checkout" } })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-label uppercase tracking-widest text-white bg-black hover:bg-primary transition-all duration-500 font-bold px-8 py-4 rounded-2xl md:rounded-full shadow-xl shadow-black/5 group"
                >
                  <Plus
                    size={14}
                    className="group-hover:rotate-90 transition-transform duration-500"
                  />
                  <span>Update Address</span>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5">
                {user?.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr: any, idx: number) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative overflow-hidden group border-2 rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-500 ${selectedAddressId === addr.id
                          ? "border-primary bg-white shadow-2xl shadow-primary/10 ring-1 ring-primary/5"
                          : "border-black/5 bg-white/60 hover:border-primary/40 hover:bg-white/80"
                        }`}
                      style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
                        <div className="flex gap-6 items-start">
                          <div
                            className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedAddressId === addr.id
                                ? "bg-primary text-white shadow-xl shadow-primary/30 rotate-3"
                                : "bg-black/5 text-black/40 group-hover:bg-black/10"
                              }`}
                          >
                            <Navigation size={22} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-headline text-xl md:text-2xl font-bold text-black tracking-tight">
                              {addr.full_name}
                            </h3>
                            <p className="text-black/60 text-sm md:text-base font-body leading-relaxed max-w-md">
                              {addr.street}, {addr.city}, {addr.zip_code}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              {addr.is_default && (
                                <span className="text-[10px] font-label uppercase tracking-widest text-black/40 font-bold bg-black/5 px-4 py-2 rounded-lg">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`transition-all duration-500 ${selectedAddressId === addr.id ? "opacity-100 scale-100" : "opacity-0 scale-90 md:block invisible md:visible md:opacity-10"}`}
                        >
                          <div
                            className={`flex items-center gap-2 text-[10px] font-label uppercase tracking-luxury font-bold bg-primary/10 px-6 py-3 rounded-2xl border-2 border-primary/20 shadow-sm ${selectedAddressId === addr.id ? "text-primary" : "text-black"}`}
                          >
                            <CheckCircle2 size={14} />
                            <span className="whitespace-nowrap">
                              Selected Node
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-black/10 rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 bg-white/40 backdrop-blur-md shadow-inner animate-pulse-subtle">
                    <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2 text-black/20">
                      <MapPin size={32} />
                    </div>
                    <p className="font-headline text-2xl md:text-3xl text-black/40 italic">
                      No delivery nodes detected.
                    </p>
                    <button
                      onClick={() => navigate("/addresses")}
                      className="bg-black text-white px-10 md:px-14 py-5 md:py-6 text-sm font-label tracking-widest uppercase hover:bg-primary transition-all duration-500 rounded-2xl md:rounded-full flex items-center gap-4 mx-auto shadow-2xl group"
                    >
                      Initialize New Node
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section
              className="animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-end justify-between border-b-2 border-black/5 pb-6">
                <div className="space-y-2">
                  <h2 className="font-headline text-3xl md:text-4xl italic tracking-tight text-black">
                    Service <span className="text-primary">Provide</span>
                  </h2>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                {[
                  {
                    icon: Truck,
                    title: "Express Dispatch",
                    desc: "Priority handling with global tracking on every transmission.",
                  },
                  {
                    icon: Shield,
                    title: "Authentication",
                    desc: "Certified authenticity guaranteed for every timepiece acquired.",
                  },
                  {
                    icon: Clock,
                    title: "Timeline",
                    desc: "Expected arrival within 3-5 business cycles globally.",
                  },
                  {
                    icon: Headphones,
                    title: "Concierge",
                    desc: "Dedicated elite support for your collection management.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/40 backdrop-blur-md border-2 border-black/5 p-8 md:p-10 rounded-[2.5rem] hover:border-primary/40 hover:bg-white transition-all duration-700 group"
                  >
                    <div className="flex flex-col gap-6">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-black/5 rounded-2xl flex items-center justify-center text-black/60 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-700 shrink-0 shadow-sm">
                        <item.icon size={24} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-headline text-xl font-bold text-black group-hover:text-primary transition-colors duration-500">
                          {item.title}
                        </h4>
                        <p className="text-black/50 text-xs md:text-sm font-body leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div
            className="lg:col-span-5 xl:col-span-5 h-fit lg:sticky lg:top-28 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="bg-white border-2 border-black/5 rounded-[40px] md:rounded-[50px] p-8 md:p-10 xl:p-12 shadow-2xl shadow-black/5 space-y-8 md:space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-8 translate-x-8"></div>

              <div className="relative">
                <h2 className="font-headline text-3xl md:text-4xl font-bold border-b-2 border-black/5 pb-5 text-black tracking-tight">
                  Order{" "}
                  <em className="text-primary not-italic font-medium">
                    Summary
                  </em>
                </h2>
              </div>
              <div className="space-y-8 max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar relative">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center group gap-4"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-black/[0.02] border-2 border-black/5 rounded-2xl md:rounded-[2rem] p-3 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-1000 flex items-center justify-center relative overflow-hidden shrink-0">
                        <img
                          src={item.product.image}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                          alt={item.product.name}
                        />
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        <p className="font-headline text-base md:text-lg font-bold text-black group-hover:text-primary transition-colors duration-500 line-clamp-1 tracking-tight">
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="font-label text-[10px] md:text-xs uppercase tracking-widest text-black/40 font-bold">
                            Procured Qty:
                          </span>
                          <span className="bg-black/5 text-black text-[10px] md:text-xs font-bold px-3 py-1 rounded-full">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-headline text-base md:text-lg font-bold text-black shrink-0">
                      <IndianRupee
                        size={14}
                        className="text-black/40 font-normal"
                      />
                      <span>
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6 pt-8 border-t-2 border-black/5 relative">
                <div className="flex justify-between text-xs md:text-sm font-label uppercase tracking-widest text-black/60 font-bold group">
                  <span>Subtotal Matrix</span>
                  <div className="flex items-center gap-1.5 text-black font-bold group-hover:text-primary transition-colors">
                    <IndianRupee
                      size={14}
                      strokeWidth={2.5}
                      className="opacity-40"
                    />
                    <span className="tracking-tight">
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-xs md:text-sm font-label uppercase tracking-widest text-green-600 font-bold group">
                    <span>Coupon Discount ({couponApplied.code})</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      - <IndianRupee
                        size={14}
                        strokeWidth={2.5}
                        className="opacity-40"
                      />
                      <span className="tracking-tight">
                        {discount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs md:text-sm font-label uppercase tracking-widest text-black/60 font-bold group">
                  <span>Logistics Protocol</span>
                  <span className="text-primary font-bold tracking-luxury uppercase bg-primary/5 px-4 py-1.5 rounded-full text-[10px] md:text-xs border border-primary/10">
                    Complimentary
                  </span>
                </div>

                <div className="flex justify-between text-xs md:text-sm font-label uppercase tracking-widest text-black/60 font-bold group">
                  <span>Tax Registry (20%)</span>
                  <div className="flex items-center gap-1.5 text-black font-bold group-hover:text-primary transition-colors">
                    <IndianRupee
                      size={14}
                      strokeWidth={2.5}
                      className="opacity-40"
                    />
                    <span className="tracking-tight">
                      {vat.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t-2 border-black/10 mt-6">
                  <span className="font-label text-sm md:text-base uppercase tracking-[0.2em] font-bold text-black">
                    Final Liquidation
                  </span>
                  <div className="flex items-center gap-2 text-primary">
                    <IndianRupee
                      size={24}
                      className="translate-y-[1px]"
                      strokeWidth={3}
                    />
                    <span className="font-headline text-3xl md:text-5xl font-bold tracking-tighter">
                      {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-8 relative">
                <button
                  disabled={loading || !selectedAddressId}
                  onClick={handlePlaceOrder}
                  className="w-full bg-black text-white py-6 md:py-8 rounded-[2rem] font-label text-xs md:text-sm uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all duration-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-5 group relative overflow-hidden border border-black/10 active:scale-[0.99]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                  {loading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>TRANSMITTING DATA...</span>
                    </div>
                  ) : (
                    <>
                      <span>Secure Finalization</span>
                      <ArrowRight
                        size={22}
                        className="group-hover:translate-x-3 transition-transform duration-700 ease-out"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-2 md:px-6">
              {[
                { icon: Shield, label: "Insured" },
                { icon: CheckCircle2, label: "Verified" },
                { icon: CreditCard, label: "Secure" },
              ].map((marker, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center space-y-4 p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-white border-2 border-black/5 shadow-xl shadow-black/5 hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 ${i === 2 ? "col-span-2 md:col-span-1" : ""}`}
                >
                  <marker.icon
                    size={26}
                    className="text-primary"
                    strokeWidth={2.5}
                  />
                  <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-black">
                    {marker.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
