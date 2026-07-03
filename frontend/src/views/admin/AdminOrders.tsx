import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Search,
  MoreVertical,
  Eye,
  Filter,
  Calendar,
  RotateCcw,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  ClipboardList,
  Edit3,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: number;
  user_id: number;
  customer: string;
  email: string;
  phone?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
}

export default function AdminOrders() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    dateStart: "",
    dateEnd: "",
    priceMin: "",
    priceMax: "",
  });
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { PAGINATION } = APP_CONFIG;

  const firstPageLimit = PAGINATION.ADMIN_ORDERS_FIRST_PAGE;
  const nextPagesLimit = PAGINATION.ADMIN_ORDERS_NEXT_PAGES;

  const {
    data,
    isPending: isLoading,
    isPlaceholderData,
  } = useQuery<{ orders: Order[]; stats: OrderStats }>({
    queryKey: ["admin-orders", filters],
    queryFn: async () => {
      const { data } = await api.get("/admin/orders", {
        params: {
          status: filters.status,
          payment_status: filters.paymentStatus,
          payment_method: filters.paymentMethod,
          date_start: filters.dateStart,
          date_end: filters.dateEnd,
          price_min: filters.priceMin,
          price_max: filters.priceMax,
        },
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
  };

  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery<Order>({
    queryKey: ["admin-order-details", selectedOrder],
    queryFn: async () => {
      const { data } = await api.get(`/admin/orders/${selectedOrder}`);
      return data;
    },
    enabled: !!selectedOrder,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      payment_status,
    }: {
      id: number;
      status?: string;
      payment_status?: string;
    }) => {
      await api.put(`/admin/orders/${id}/status`, { status, payment_status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (selectedOrder) {
        queryClient.invalidateQueries({
          queryKey: ["admin-order-details", selectedOrder],
        });
      }
      setUpdatingOrder(null);
      toast({
        title: "Order Updated",
        description:
          "Order status and payment details have been successfully updated.",
      });
    },
  });

  const filteredOrders = orders.filter((order) => {
    const searchLower = filters.search.toLowerCase();
    const customer = (order.customer || "").toLowerCase();
    const email = (order.email || "").toLowerCase();
    const id = (order.id || "").toString();

    return (
      customer.includes(searchLower) ||
      email.includes(searchLower) ||
      id.includes(searchLower)
    );
  });

  const startIndex =
    currentPage === 1 ? 0 : firstPageLimit + (currentPage - 2) * nextPagesLimit;
  const currentLimit = currentPage === 1 ? firstPageLimit : nextPagesLimit;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + currentLimit,
  );

  const totalPages =
    filteredOrders.length <= firstPageLimit
      ? 1
      : 1 +
        Math.ceil((filteredOrders.length - firstPageLimit) / nextPagesLimit);

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Processing",
      value: stats.processingOrders,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Cancelled",
      value: stats.cancelledOrders,
      icon: XCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Returned",
      value: stats.returnedOrders,
      icon: AlertCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200"
          >
            Confirmed
          </Badge>
        );
      case "packed":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-600 border-indigo-200"
          >
            Packed
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-600 border-purple-200"
          >
            Shipped
          </Badge>
        );
      case "out for delivery":
        return (
          <Badge
            variant="outline"
            className="bg-cyan-50 text-cyan-600 border-cyan-200"
          >
            Out for Delivery
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-600 border-emerald-200"
          >
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-600 border-rose-200"
          >
            Cancelled
          </Badge>
        );
      case "returned":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-600 border-orange-200"
          >
            Returned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold"
          >
            PAID
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold"
          >
            PENDING
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold"
          >
            FAILED
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 text-[10px] font-bold"
          >
            REFUNDED
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-bold">
            {status?.toUpperCase() || "UNKNOWN"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
          Order <span className="text-primary italic">Management</span>
        </h1>
       
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-[2rem] border border-slate-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black text-slate-800 tabular-nums">
                  {stat.value}
                </h3>
              </div>
              <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-[2.5rem] p-5 sm:p-7 lg:p-9 space-y-6 lg:space-y-10 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-4 duration-1000">
        {/* Search & Reset Header */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="relative w-full xl:max-w-2xl group flex-1">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110" />
            </div>
            <Input
              placeholder="Search by ID, customer name or email address..."
              className="pl-14 h-16 bg-white/60 border-slate-200 focus:bg-white focus:ring-8 focus:ring-primary/5 rounded-[1.25rem] transition-all duration-500 shadow-sm text-base placeholder:text-slate-400"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>

          {(filters.search ||
            filters.status !== "all" ||
            filters.paymentStatus !== "all" ||
            filters.paymentMethod !== "all" ||
            filters.dateStart ||
            filters.dateEnd ||
            filters.priceMin ||
            filters.priceMax) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({
                  search: "",
                  status: "all",
                  paymentStatus: "all",
                  paymentMethod: "all",
                  dateStart: "",
                  dateEnd: "",
                  priceMin: "",
                  priceMax: "",
                });
                setCurrentPage(1);
              }}
              className="w-full xl:w-auto h-14 px-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-[1.25rem] transition-all duration-300 gap-3 font-black group shadow-sm bg-white/40"
            >
              <RotateCcw className="h-5 w-5 group-hover:rotate-[-180deg] transition-transform duration-700 ease-in-out" />
              Reset All Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-8">
         
          <div className="space-y-3 group md:col-span-2 lg:col-span-1 xl:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block group-focus-within:text-primary transition-colors">
              Date Range
            </label>
            <div className="flex items-center gap-3 bg-white/60 border border-slate-200 rounded-2xl px-4 h-16 shadow-inner-sm transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-primary/5">
              <Calendar className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:rotate-3" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="date"
                  className="bg-transparent border-none text-[11px] font-bold focus:outline-none w-full appearance-none text-slate-700 min-w-0"
                  value={filters.dateStart}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateStart: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
                <span className="text-slate-300 font-light">—</span>
                <input
                  type="date"
                  className="bg-transparent border-none text-[11px] font-bold focus:outline-none w-full appearance-none text-slate-700 min-w-0"
                  value={filters.dateEnd}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateEnd: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 group md:col-span-2 lg:col-span-1 xl:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block group-focus-within:text-primary transition-colors">
              Amount (₹)
            </label>
            <div className="flex items-center gap-3 bg-white/60 border border-slate-200 rounded-2xl px-4 h-16 shadow-inner-sm transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-primary/5">
              <IndianRupee className="h-4 w-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="number"
                  placeholder="Min"
                  className="bg-transparent border-none text-xs font-bold w-full focus:outline-none text-slate-700 placeholder:text-slate-300 min-w-0"
                  value={filters.priceMin}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      priceMin: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
                <span className="text-slate-300 font-light">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="bg-transparent border-none text-xs font-bold w-full focus:outline-none text-slate-700 placeholder:text-slate-300 min-w-0"
                  value={filters.priceMax}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      priceMax: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3 group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block group-focus-within:text-primary transition-colors">
              Order Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, status: val }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-16 bg-white/60 border-slate-200 rounded-2xl shadow-sm focus:ring-primary/20 hover:bg-white transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:ring-8 group-focus-within:ring-primary/5">
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-primary shrink-0" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl backdrop-blur-xl bg-white/95">
                <SelectItem value="all" className="rounded-xl font-medium ">All Orders</SelectItem>
                <SelectItem value="pending" className="rounded-xl text-black focus:bg-primary">Pending</SelectItem>
                <SelectItem value="confirmed" className="rounded-xl text-black focus:bg-primary">Confirmed</SelectItem>
                <SelectItem value="packed" className="rounded-xl text-black focus:bg-primary">Packed</SelectItem>
                <SelectItem value="shipped" className="rounded-xl text-black focus:bg-primary">Shipped</SelectItem>
                <SelectItem value="out for delivery" className="rounded-xl text-black focus:bg-primary">Out for Delivery</SelectItem>
                <SelectItem value="delivered" className="rounded-xl text-black focus:bg-primary">Delivered</SelectItem>
                <SelectItem value="cancelled" className="rounded-xl text-black focus:bg-primary">Cancelled</SelectItem>
                <SelectItem value="returned" className="rounded-xl text-black focus:bg-primary">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block group-focus-within:text-primary transition-colors">
              Payment
            </label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, paymentStatus: val }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-16 bg-white/60 border-slate-200 rounded-2xl shadow-sm focus:ring-primary/20 hover:bg-white transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:ring-8 group-focus-within:ring-primary/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  <SelectValue placeholder="Payment" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl backdrop-blur-xl bg-white/95">
                <SelectItem value="all" className="rounded-xl font-medium">All Status</SelectItem>
                <SelectItem value="paid" className="rounded-xl text-black focus:bg-primary">Paid</SelectItem>
                <SelectItem value="pending" className="rounded-xl text-black focus:bg-primary">Pending</SelectItem>
                <SelectItem value="failed" className="rounded-xl text-black focus:bg-primary">Failed</SelectItem>
                <SelectItem value="refunded" className="rounded-xl text-black focus:bg-primary">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block w-fit px-2 py-0.5 rounded-full  group-hover:text-primary group-focus-within:text-primary transition-all duration-300">
              Method
            </label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, paymentMethod: val }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-16 bg-white/60 border-slate-200 rounded-2xl shadow-sm focus:ring-primary/20 hover:bg-white transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:ring-8 group-focus-within:ring-primary/5">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-primary shrink-0" />
                  <SelectValue placeholder="Method" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl backdrop-blur-xl bg-white/95">
                <SelectItem value="all" className="rounded-xl font-medium">All Methods</SelectItem>
                <SelectItem value="COD" className="rounded-xl">COD</SelectItem>
                <SelectItem value="Card" className="rounded-xl">Debit/Credit Card</SelectItem>
                <SelectItem value="UPI" className="rounded-xl">UPI / QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block">
          <Card className="border-none shadow-premium overflow-hidden bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6 pl-8">
                    Order Details
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6">
                    Customer
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6 text-center">
                    Payment
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6">
                    Date
                  </TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-slate-400 py-6 pr-8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50"
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-mono text-[11px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg w-fit">
                            #{order.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {order.customer}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {order.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-5">
                        {getPaymentBadge(order.payment_status)}
                      </TableCell>
                      <TableCell className="py-5">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            ₹
                            {Number(order.total_amount).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            TOTAL PAYABLE
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                            {format(new Date(order.created_at), "HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical size={16} className="text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-slate-200 shadow-2xl backdrop-blur-xl bg-white/90">
                              <DropdownMenuItem
                                onClick={() => setSelectedOrder(order.id)}
                                className="gap-3 cursor-pointer py-2.5 rounded-xl font-medium focus:bg-primary/5 focus:text-primary transition-colors"
                              >
                                <Eye size={16} /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setUpdatingOrder(order);
                                  setNewStatus(order.status);
                                  setNewPaymentStatus(
                                    order.payment_status || "pending",
                                  );
                                }}
                                className="gap-3 cursor-pointer py-2.5 rounded-xl font-medium text-primary focus:bg-primary/5 focus:text-primary transition-colors"
                              >
                                <Edit3 size={16} /> Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-1000">
                        <div className="p-6 bg-slate-50 rounded-[2rem]">
                          <Package size={48} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800">No orders found</p>
                          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters to see more results</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/60 p-6 space-y-6 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full w-fit block">
                      #{order.id}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 leading-tight">{order.customer}</h4>
                      <p className="text-xs text-slate-500 font-medium">{order.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-slate-50">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-200 shadow-2xl">
                      <DropdownMenuItem onClick={() => setSelectedOrder(order.id)} className="gap-3 py-3 rounded-xl">
                        <Eye size={18} /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setUpdatingOrder(order);
                          setNewStatus(order.status);
                          setNewPaymentStatus(order.payment_status || "pending");
                        }}
                        className="gap-3 py-3 rounded-xl text-primary"
                      >
                        <Edit3 size={18} /> Update Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hoverblock text-right">Payment</span>
                    <div className="flex justify-end">{getPaymentBadge(order.payment_status)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Amount</span>
                    <span className="text-lg font-black text-slate-900 tabular-nums">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ordered At</span>
                    <span className="text-xs font-bold text-slate-700 block">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full rounded-2xl h-12 font-bold text-xs gap-2 bg-slate-50 text-slate-600 hover:bg-primary/5 hover:text-primary border-none"
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <Eye size={16} /> View Full Details
                </Button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 border-dashed">
              <Package size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="font-bold text-slate-800">No Orders Found</p>
              <p className="text-xs text-slate-500 mt-1">Adjust your filters</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 bg-white/70 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-2">
              Showing <span className="text-primary">{startIndex + 1}-{Math.min(filteredOrders.length, startIndex + currentLimit)}</span> of {filteredOrders.length} Orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-10 w-10 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                      currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white"
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="h-10 w-10 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-3xl animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">
                Updating Results...
              </p>
            </div>
          </div>
        )}
      </div>

      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent className="sm:max-w-xl w-full p-0 border-l shadow-2xl flex flex-col overflow-hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              View order items and status history
            </SheetDescription>
          </SheetHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orderDetails ? (
            <div className="flex flex-col h-full bg-[#f8fafc]">
              <div className="p-8 border-b bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge className="mb-2 bg-primary/10 text-primary border-none text-xs font-black px-3 py-1">
                      ORDER #{orderDetails.id}
                    </Badge>
                    <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">
                      Order <span className="text-primary">Details</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">
                      {format(
                        new Date(orderDetails.created_at),
                        "MMM dd, yyyy",
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(orderDetails.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(orderDetails.status)}
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  {getPaymentBadge(orderDetails.payment_status)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#64748b] flex items-center gap-2">
                    <User size={14} className="text-primary" /> Customer Info
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-sm text-slate-500 font-medium">
                        Name
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {orderDetails.customer}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-sm text-slate-500 font-medium">
                        Email
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {orderDetails.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 font-medium">
                        Phone
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {orderDetails.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#64748b] flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Shipping
                    Address
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-600 leading-relaxed font-medium">
                    {orderDetails.shipping_address
                      ? (() => {
                          try {
                            const addr = JSON.parse(
                              orderDetails.shipping_address,
                            );
                            return `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}`;
                          } catch (e) {
                            return orderDetails.shipping_address;
                          }
                        })()
                      : "No address provided"}
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#64748b] flex items-center gap-2">
                    <Package size={14} className="text-primary" /> Products
                    Ordered
                  </h3>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                      {orderDetails.items?.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex gap-4 items-center group hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {item.product_name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 font-medium">
                              Qty:{" "}
                              <span className="text-slate-900 font-bold">
                                {item.quantity}
                              </span>{" "}
                              × ₹{Number(item.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-slate-900">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN",
                                { minimumFractionDigits: 2 },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50/50 p-6 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Subtotal</span>
                        <span className="text-slate-900">
                          ₹
                          {Number(orderDetails.total_amount).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                          Total Amount
                        </span>
                        <span className="text-2xl font-black text-primary tracking-tighter">
                          ₹
                          {Number(orderDetails.total_amount).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#64748b] flex items-center gap-2">
                    <CreditCard size={14} className="text-primary" /> Payment
                    Info
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-sm text-slate-500 font-medium">
                        Method
                      </span>
                      <div className="flex items-center gap-2">
                        {orderDetails.payment_method === "COD" ? (
                          <Wallet size={14} className="text-slate-400" />
                        ) : (
                          <CreditCard size={14} className="text-slate-400" />
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {orderDetails.payment_method || "COD"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 font-medium">
                        Status
                      </span>
                      {getPaymentBadge(orderDetails.payment_status)}
                    </div>
                  </div>
                </section>
                <section className="space-y-4 pb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#64748b] flex items-center gap-2">
                    <Clock size={14} className="text-primary" /> Order Timeline
                  </h3>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
                    <div className="flex justify-between relative z-10">
                      {[
                        {
                          label: "Ordered",
                          icon: ClipboardList,
                          status: "pending",
                        },
                        { label: "Packed", icon: Package, status: "packed" },
                        { label: "Shipped", icon: Truck, status: "shipped" },
                        {
                          label: "Delivered",
                          icon: CheckCircle2,
                          status: "delivered",
                        },
                      ].map((step, idx, arr) => {
                        const statusOrder = [
                          "pending",
                          "processing",
                          "confirmed",
                          "packed",
                          "shipped",
                          "out for delivery",
                          "delivered",
                        ];
                        const currentIdx = statusOrder.indexOf(
                          orderDetails.status.toLowerCase(),
                        );
                        const stepIdx = statusOrder.indexOf(step.status);
                        const isActive = currentIdx >= stepIdx;

                        return (
                          <div
                            key={step.label}
                            className="flex flex-col items-center gap-2 group transition-all"
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                isActive
                                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                                  : "bg-slate-100 text-slate-400",
                              )}
                            >
                              <step.icon size={18} />
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-tighter",
                                isActive ? "text-slate-900" : "text-slate-400",
                              )}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-100 -z-0">
                        <div
                          className="h-full bg-primary transition-all duration-1000 ease-in-out"
                          style={{
                            width: (() => {
                              const statusOrder = [
                                "pending",
                                "packed",
                                "shipped",
                                "delivered",
                              ];
                              let s = orderDetails.status.toLowerCase();
                              if (s === "processing" || s === "confirmed")
                                s = "pending";
                              if (s === "out for delivery") s = "shipped";
                              const idx = statusOrder.indexOf(s);
                              return idx === -1
                                ? "0%"
                                : `${(idx / (statusOrder.length - 1)) * 100}%`;
                            })(),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 bg-white border-t flex gap-4">
                <Button
                  className="flex-1 h-12 rounded-xl font-bold gap-2"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
                  onClick={() => {
                    setUpdatingOrder(orderDetails);
                    setNewStatus(orderDetails.status);
                    setNewPaymentStatus(
                      orderDetails.payment_status || "pending",
                    );
                  }}
                >
                  Update Status <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!updatingOrder}
        onOpenChange={(open) => !open && setUpdatingOrder(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-premium">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-3xl font-black tracking-tight">
              Update <span className="text-primary italic">Status</span>
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Manage order #{updatingOrder?.id} workflow state and payment
              status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[#64748b]">
                Order Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-12 rounded-xl border-[#e2e8f0] bg-[#f8fafc] text-slate-900 font-bold">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out for delivery">
                    Out for Delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[#64748b]">
                Payment Status
              </label>
              <Select
                value={newPaymentStatus}
                onValueChange={setNewPaymentStatus}
              >
                <SelectTrigger className="h-12 rounded-xl border-[#e2e8f0] bg-[#f8fafc] text-slate-900 font-bold">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setUpdatingOrder(null)}
              className="h-12 rounded-xl font-bold flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex-1 sm:flex-none shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={() => {
                if (updatingOrder) {
                  updateMutation.mutate({
                    id: updatingOrder.id,
                    status: newStatus,
                    payment_status: newPaymentStatus,
                  });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
