import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  IndianRupee,
  Pencil,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";

const statusConfig = {
  processing: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-300",
    dot: "bg-amber-500",
    label: "Processing",
  },
  shipped: {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-300",
    dot: "bg-blue-500",
    label: "Shipped",
  },
  out_for_delivery: {
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    dot: "bg-indigo-500",
    label: "Out for Delivery",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
    label: "Delivered",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-400",
    label: "Cancelled",
  },
  refunded: {
    icon: XCircle,
    color: "text-stone-500",
    bg: "bg-stone-50",
    border: "border-stone-300",
    dot: "bg-stone-400",
    label: "Refunded",
  },
} as any;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: dbProducts = [] } = useProducts();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/myorders");
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.post(`/orders/${id}/cancel`, {
        reason: "User requested cancellation",
      });
      toast({ title: "Order Cancelled", description: "Success." });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Unable to cancel.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-[#B87333]/15 border-t-[#B87333] rounded-full animate-spin" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/30">
            Loading Orders…
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-[#FAFAF9] pb-24 selection:bg-[#B87333]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14">
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col items-start gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="group inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.3em] uppercase text-[#1A1A1A]/30 hover:text-[#B87333] transition-colors duration-300"
            >
              <ArrowLeft
                size={10}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
              Back to Profile
            </button>

            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] leading-tight tracking-[calc(-0.02em)]">
                Orders{" "}
                <span className="text-[#B87333] italic font-light">
                  History
                </span>
              </h1>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DDD3] shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#B87333] flex items-center justify-center shadow-md">
              <Package size={24} className="text-white" />
            </div>
            <p className="font-serif text-lg text-[#1A1A1A]/50 mb-1">
              No orders yet
            </p>
            <p className="text-[11px] text-[#1A1A1A]/30 mb-5">
              Your order history will appear here
            </p>
            <Link
              to="/collection"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#B87333] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-[#A0622A] hover:shadow-lg hover:shadow-[#B87333]/20 active:scale-[0.98] transition-all duration-300 group"
            >
              <span>Start Shopping</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order) => {
                const cfg = statusConfig[order.status] || {
                  icon: Package,
                  color: "text-gray-500",
                  bg: "bg-gray-50",
                  border: "border-gray-300",
                  dot: "bg-gray-400",
                  label: order.status,
                };
                const StatusIcon = cfg.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E8D5C0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="flex items-start justify-between px-5 pt-5 pb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#B87333] flex items-center justify-center shadow-sm flex-shrink-0">
                        <ShoppingBag size={20} className="text-white" />
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest",
                          cfg.bg,
                          cfg.color,
                          cfg.border,
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            cfg.dot,
                            order.status === "processing" && "animate-pulse",
                          )}
                        />
                        {cfg.label}
                      </div>
                    </div>

                    <div className="flex-1 px-5 pb-3 space-y-4">
                      <div>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-[#B87333] mb-0.5">
                          Order
                        </p>
                        <p className="text-base font-bold text-[#1A1A1A]">
                          #{order.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-[#B87333] mb-2">
                          Items
                        </p>
                        <div className="space-y-2.5">
                          {order.items?.map((item: any) => {
                            const localProduct = dbProducts.find(
                              (p: any) => String(p.id) === String(item.product_id),
                            );
                            const displayImage =
                              localProduct?.image || item.image;

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 group"
                              >
                                <div className="w-10 h-10 flex-shrink-0 bg-[#F8F5F1] rounded-xl border border-[#EDE8E1] overflow-hidden p-1">
                                  <img
                                    src={displayImage}
                                    alt={item.name}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-serif text-[13px] text-[#1A1A1A] truncate leading-snug">
                                    {item.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] text-[#1A1A1A]/35 font-bold uppercase tracking-wide">
                                      Qty {item.quantity}
                                    </span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-[#D4C9BC]" />
                                    <span className="text-[11px] text-[#B87333] font-bold flex items-center gap-0.5">
                                      <IndianRupee size={9} strokeWidth={3} />
                                      {parseFloat(item.price).toLocaleString(
                                        "en-IN",
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <Link
                                  to={`/product/${item.product_id}`}
                                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#1A1A1A]/20 hover:text-[#B87333] hover:bg-[#B87333]/8 transition-all duration-200"
                                >
                                  <ExternalLink size={12} />
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mx-5 h-px bg-[#F0EBE3]" />

                    <div className="flex items-center justify-between px-5 py-3.5">
                      <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/40 hover:text-[#B87333] transition-colors duration-200">
                        <StatusIcon size={11} />
                        Track Order
                      </button>

                      {order.status === "processing" ? (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-xl text-[#1A1A1A]/25 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {orders.length > ordersPerPage && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2.5 rounded-xl border border-[#E8D5C0] text-[10px] font-bold uppercase tracking-widest hover:bg-[#B87333] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all duration-300"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-8 h-8 rounded-full text-[10px] font-bold transition-all duration-300",
                        currentPage === i + 1 
                          ? "bg-[#B87333] text-white shadow-md shadow-[#B87333]/20" 
                          : "text-[#1A1A1A]/40 hover:text-[#B87333]"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(orders.length / ordersPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
                  className="px-6 py-2.5 rounded-xl border border-[#E8D5C0] text-[10px] font-bold uppercase tracking-widest hover:bg-[#B87333] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
