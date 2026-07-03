import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Trash2,
  Search,
  MoreVertical,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ticket,
  Filter,
  ChevronLeft,
  ChevronRight,
  Percent,
  IndianRupee,
  Calendar,
  Users,
  ShoppingBag,
  Eye,
  Settings,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Formik } from "formik";
import { couponsSchema, validateWithZod } from "./validationSchemas";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Coupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount_limit: number | null;
  start_date: string;
  expiry_date: string;
  usage_limit_total: number | null;
  usage_limit_per_user: number;
  used_count: number;
  status: "active" | "inactive" | "disabled";
  created_at: string;
}

interface UsageTracking {
  id: number;
  user_name: string;
  user_email: string;
  order_id: number;
  discount_amount: number;
  order_total: number;
  order_status: string;
  used_at: string;
}

export default function AdminCoupons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPopUpOpen, setIsAddPopUpOpen] = useState(false);
  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCouponForUsage, setSelectedCouponForUsage] =
    useState<Coupon | null>(null);


  const queryClient = useQueryClient();
  const { toast } = useToast();

  const firstPageLimit = 5;
  const nextPagesLimit = 6;

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await api.get("/admin/coupons");
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-coupons-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/coupons/stats");
      return data;
    },
  });

  const { data: usageData = [], isLoading: isUsageLoading } = useQuery<
    UsageTracking[]
  >({
    queryKey: ["admin-coupon-usage", selectedCouponForUsage?.id],
    queryFn: async () => {
      if (!selectedCouponForUsage) return [];
      const { data } = await api.get(
        `/admin/coupons/${selectedCouponForUsage.id}/usage`,
      );
      return data;
    },
    enabled: !!selectedCouponForUsage && isUsageModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post("/admin/coupons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-stats"] });
      setIsAddPopUpOpen(false);
      toast({ title: "Success", description: "Coupon created successfully." });
    },
    onError: (err: any) => {
      if (!isAddPopUpOpen) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to create coupon",
          variant: "destructive",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await api.put(`/admin/coupons/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-stats"] });
      setIsEditPopUpOpen(false);
      setEditingCoupon(null);
      toast({ title: "Success", description: "Coupon updated successfully." });
    },
    onError: (err: any) => {
      if (!isEditPopUpOpen) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to update coupon",
          variant: "destructive",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-stats"] });
      toast({ title: "Deleted", description: "Coupon removed successfully." });
    },
  });



  const toggleStatus = (coupon: Coupon) => {
    const newStatus = coupon.status === "disabled" ? "active" : "disabled";
    updateMutation.mutate({ id: coupon.id, data: { status: newStatus } });
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch = c.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isExpired = new Date(c.expiry_date) < new Date();
    let currentStatus = c.status;
    if (c.status !== "disabled" && isExpired) currentStatus = "inactive";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && currentStatus === "active") ||
      (statusFilter === "inactive" && currentStatus === "inactive") ||
      (statusFilter === "disabled" && currentStatus === "disabled");

    return matchesSearch && matchesStatus;
  });

  const startIndex =
    currentPage === 1 ? 0 : firstPageLimit + (currentPage - 2) * nextPagesLimit;
  const currentLimit = currentPage === 1 ? firstPageLimit : nextPagesLimit;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + currentLimit,
  );
  const totalPages =
    filteredCoupons.length <= firstPageLimit
      ? 1
      : 1 +
      Math.ceil((filteredCoupons.length - firstPageLimit) / nextPagesLimit);

  const statCards = [
    {
      label: "Total Coupons",
      value: stats?.total || 0,
      icon: Ticket,
      color: "bg-[#b87333]",
    },
    {
      label: "Active",
      value: stats?.active || 0,
      icon: CheckCircle2,
      color: "bg-[#b87333]",
    },
    {
      label: "Inactive / Expired",
      value: stats?.inactive || 0,
      icon: XCircle,
      color: "bg-[#b87333]",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
            Coupon <span className="text-primary italic">Management</span>
          </h1>

        </div>
        <Button
          onClick={() => {
            setIsAddPopUpOpen(true);
          }}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2"
        >
          <Plus size={20} />
          Add New Coupon
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b] font-medium">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-[#0f172a] mt-1">
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-4 rounded-2xl transition-colors",
                  stat.color,
                  "bg-opacity-10",
                )}
              >
                <stat.icon
                  size={24}
                  className={cn(stat.color.replace("bg-", "text-"))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search coupon codes..."
            className="pl-10 h-11 bg-background/50 border-[#e2e8f0] focus:ring-primary/20 rounded-xl"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] h-11 bg-background/50 border-[#e2e8f0] rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="h-11 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300 gap-2 font-medium group"
            >
              <RotateCcw className="h-4 w-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Discount</TableHead>
              <TableHead className="font-bold">Usage</TableHead>
              <TableHead className="font-bold">Expiry Date</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCoupons.length > 0 ? (
              paginatedCoupons.map((coupon) => {
                const isExpired = new Date(coupon.expiry_date) < new Date();
                const displayStatus =
                  coupon.status === "disabled"
                    ? "disabled"
                    : isExpired
                      ? "expired"
                      : "active";

                return (
                  <TableRow
                    key={coupon.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Ticket size={18} className="text-primary" />
                        </div>
                        <span className="font-black text-slate-800 dark:text-slate-200 tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-bold rounded-lg px-2 flex items-center gap-1 w-fit"
                      >
                        {coupon.discount_type === "percentage" ? (
                          <>
                            <Percent size={12} /> {coupon.discount_value}%
                          </>
                        ) : (
                          <>
                            <IndianRupee size={12} /> {coupon.discount_value}
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">
                          {coupon.used_count} used
                        </span>
                        {coupon.usage_limit_total && (
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Limit: {coupon.usage_limit_total}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(coupon.expiry_date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full px-3",
                          displayStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            : displayStatus === "expired"
                              ? "bg-amber-500/10 text-amber-600 border-amber-200"
                              : "bg-slate-500/10 text-slate-600 border-slate-200",
                        )}
                        variant="outline"
                      >
                        {displayStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={coupon.status === "active"}
                          onCheckedChange={() => toggleStatus(coupon)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 p-2 rounded-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCoupon({ ...coupon });
                                setIsEditPopUpOpen(true);
                              }}
                              className="gap-2 cursor-pointer rounded-lg"
                            >
                              <Edit2 size={14} /> Edit Coupon
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCouponForUsage(coupon);
                                setIsUsageModalOpen(true);
                              }}
                              className="gap-2 cursor-pointer rounded-lg"
                            >
                              <Eye size={14} /> View Usage
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 text-rose-500 cursor-pointer rounded-lg"
                                >
                                  <Trash2 size={14} /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Coupon?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete the{" "}
                                    <strong>{coupon.code}</strong> coupon code
                                    permanently.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteMutation.mutate(coupon.id)
                                    }
                                    className="bg-rose-500 hover:bg-rose-600 rounded-xl"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    <Ticket size={48} />
                    <p className="text-lg font-medium">No coupons found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Showing {paginatedCoupons.length} of {filteredCoupons.length}{" "}
              Coupons
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-xl"
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
                      "w-10 h-10 rounded-xl font-bold",
                      currentPage === i + 1 && "shadow-md",
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
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-xl"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {isAddPopUpOpen && (
        <Formik
          initialValues={{
            code: "",
            discount_type: "percentage" as "percentage" | "fixed",
            discount_value: "",
            min_order_value: "0",
            max_discount_limit: "",
            start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            expiry_date: "",
            usage_limit_total: "",
            usage_limit_per_user: "1",
            status: "active" as "active" | "inactive" | "disabled",
          }}
          validate={validateWithZod(couponsSchema)}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            setStatus(null);
            createMutation.mutate(values, {
              onSuccess: () => setSubmitting(false),
              onError: (err: any) => {
                setSubmitting(false);
                setStatus(err.response?.data?.message || "Failed to create coupon");
              }
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, submitForm, status }) => {
            const blockNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            };
            const todayMin = format(new Date(), "yyyy-MM-dd'T'HH:mm");
            return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-[580px] max-h-[90vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">
                <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Ticket size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none mb-1">
                        Coupon Management
                      </p>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        Create New Coupon
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddPopUpOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                  {status && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
                      <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                      <span>{status}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Coupon Code <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        name="code"
                        placeholder="e.g. SUMMER2024"
                        value={values.code}
                        onChange={(e) => setFieldValue("code", e.target.value.toUpperCase())}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm font-semibold bg-slate-50/50 transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                          touched.code && errors.code ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.code && errors.code && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.code}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Discount Type
                      </label>
                      <Select
                        value={values.discount_type}
                        onValueChange={(val: any) => setFieldValue("discount_type", val)}
                      >
                        <SelectTrigger className="h-11 rounded-2xl text-sm border-slate-200 bg-slate-50/50 transition-all focus:ring-[#b87333]/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl z-[150]">
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Price (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Value <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          name="discount_value"
                          type="number"
                          min="0"
                          max={values.discount_type === "percentage" ? "100" : undefined}
                          onKeyDown={blockNegativeInput}
                          value={values.discount_value}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "h-11 rounded-2xl text-sm border-slate-200 pl-8 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                            touched.discount_value && errors.discount_value ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                          )}
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                          {values.discount_type === "percentage" ? (
                            <Percent size={12} />
                          ) : (
                            <IndianRupee size={12} />
                          )}
                        </div>
                      </div>
                      {touched.discount_value && errors.discount_value && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.discount_value}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Min Order (₹)
                      </label>
                      <Input
                        name="min_order_value"
                        type="number"
                        min="0"
                        onKeyDown={blockNegativeInput}
                        placeholder="No minimum"
                        value={values.min_order_value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm border-slate-200 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                          touched.min_order_value && errors.min_order_value ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.min_order_value && errors.min_order_value && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.min_order_value}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Max Cap (₹)
                      </label>
                      <Input
                        name="max_discount_limit"
                        type="number"
                        min="0"
                        onKeyDown={blockNegativeInput}
                        placeholder="Unlimited"
                        disabled={values.discount_type === "fixed"}
                        value={values.max_discount_limit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm border-slate-200 disabled:opacity-40 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                          touched.max_discount_limit && errors.max_discount_limit ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.max_discount_limit && errors.max_discount_limit && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.max_discount_limit}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Start Date
                      </label>
                      <Input
                        name="start_date"
                        type="datetime-local"
                        min={todayMin}
                        value={values.start_date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="h-11 rounded-2xl text-sm border-slate-200 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10"
                      />
                    </div>
                    <div className="space-y-1 bg-rose-50/60 border border-rose-100 rounded-xl px-3 py-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
                        Expiry Date *
                      </label>
                      <Input
                        name="expiry_date"
                        type="datetime-local"
                        min={values.start_date || todayMin}
                        value={values.expiry_date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm border-rose-200 bg-white shadow-sm transition-all focus:border-rose-400 focus:ring-rose-400/20",
                          touched.expiry_date && errors.expiry_date ? "border-rose-300 bg-rose-50/20" : "border-rose-200"
                        )}
                      />
                      {touched.expiry_date && errors.expiry_date && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{String(errors.expiry_date)}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Total Usage Limit
                      </label>
                      <Input
                        name="usage_limit_total"
                        type="number"
                        min="1"
                        onKeyDown={blockNegativeInput}
                        placeholder="No limit"
                        value={values.usage_limit_total}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm border-slate-200 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                          touched.usage_limit_total && errors.usage_limit_total ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.usage_limit_total && errors.usage_limit_total && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.usage_limit_total}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Limit Per User
                      </label>
                      <Input
                        name="usage_limit_per_user"
                        type="number"
                        min="1"
                        onKeyDown={blockNegativeInput}
                        value={values.usage_limit_per_user}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-11 rounded-2xl text-sm border-slate-200 bg-slate-50/50 shadow-sm transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                          touched.usage_limit_per_user && errors.usage_limit_per_user ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.usage_limit_per_user && errors.usage_limit_per_user && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.usage_limit_per_user}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddPopUpOpen(false)}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitForm}
                    disabled={isSubmitting || createMutation.isPending}
                    className="flex-[1.5] h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold shadow-xl shadow-zinc-200 transition-all active:scale-95"
                  >
                    {createMutation.isPending ? "Creating..." : "Save Coupon"}
                  </Button>
                </div>
              </div>
            </div>
          );}
          }
        </Formik>
      )}
      {isEditPopUpOpen && editingCoupon && (
        <Formik
          initialValues={{
            code: editingCoupon.code,
            discount_type: editingCoupon.discount_type,
            discount_value: editingCoupon.discount_value,
            min_order_value: editingCoupon.min_order_value,
            max_discount_limit: editingCoupon.max_discount_limit || "",
            start_date: editingCoupon.start_date ? format(new Date(editingCoupon.start_date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            expiry_date: editingCoupon.expiry_date ? format(new Date(editingCoupon.expiry_date), "yyyy-MM-dd'T'HH:mm") : "",
            usage_limit_total: editingCoupon.usage_limit_total || "",
            usage_limit_per_user: editingCoupon.usage_limit_per_user,
            status: editingCoupon.status,
          }}
          validate={validateWithZod(couponsSchema)}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            setStatus(null);
            updateMutation.mutate({
              id: editingCoupon.id,
              data: values
            }, {
              onSuccess: () => setSubmitting(false),
              onError: (err: any) => {
                setSubmitting(false);
                setStatus(err.response?.data?.message || "Failed to update coupon");
              }
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, submitForm, status }) => {
            const blockNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            };
            return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-[580px] max-h-[90vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">
                <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Settings size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none mb-1">
                        Coupon Management
                      </p>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        Edit Coupon Record
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditPopUpOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                  {status && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
                      <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                      <span>{status}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Coupon Code
                      </label>
                      <Input
                        value={values.code}
                        disabled
                        className="h-11 rounded-2xl text-sm opacity-50 bg-slate-100/50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Discount Type
                      </label>
                      <Select
                        value={values.discount_type}
                        onValueChange={(val: any) => setFieldValue("discount_type", val)}
                      >
                        <SelectTrigger className="h-10 rounded-2xl text-sm border-slate-200 w-full bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl z-[150]">
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Price (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Value <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          name="discount_value"
                          type="number"
                          min="0"
                          max={values.discount_type === "percentage" ? "100" : undefined}
                          onKeyDown={blockNegativeInput}
                          value={values.discount_value}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "h-10 rounded-2xl text-sm bg-slate-50/50 pl-8",
                            touched.discount_value && errors.discount_value ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                          )}
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                          {values.discount_type === "percentage" ? (
                            <Percent size={12} />
                          ) : (
                            <IndianRupee size={12} />
                          )}
                        </div>
                      </div>
                      {touched.discount_value && errors.discount_value && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.discount_value}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Min Order
                      </label>
                      <Input
                        name="min_order_value"
                        type="number"
                        min="0"
                        onKeyDown={blockNegativeInput}
                        value={values.min_order_value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                          "h-10 rounded-2xl text-sm border-slate-200 bg-slate-50/50",
                          touched.min_order_value && errors.min_order_value ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                      />
                      {touched.min_order_value && errors.min_order_value && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.min_order_value}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Status
                      </label>
                      <Select
                        value={values.status}
                        onValueChange={(val: any) => setFieldValue("status", val)}
                      >
                        <SelectTrigger className="h-10 rounded-2xl text-sm border-slate-200 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl z-[150]">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200 rounded-[32px] px-5 py-4">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[10px] uppercase tracking-widest mb-2.5">
                      <AlertCircle size={13} />
                      Critical Dates
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                          Expiry Date *
                        </label>
                        <Input
                          name="expiry_date"
                          type="datetime-local"
                          value={values.expiry_date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "h-10 rounded-2xl text-sm border-amber-200 bg-white shadow-sm",
                            touched.expiry_date && errors.expiry_date ? "border-rose-300 bg-rose-50/20" : "border-amber-200"
                          )}
                        />
                        {touched.expiry_date && errors.expiry_date && (
                          <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{String(errors.expiry_date)}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                          Usage Limit
                        </label>
                        <Input
                          name="usage_limit_total"
                          type="number"
                          min="1"
                          onKeyDown={blockNegativeInput}
                          value={values.usage_limit_total}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "h-10 rounded-2xl text-sm border-amber-200 bg-white shadow-sm",
                            touched.usage_limit_total && errors.usage_limit_total ? "border-rose-300 bg-rose-50/20" : "border-amber-200"
                          )}
                        />
                        {touched.usage_limit_total && errors.usage_limit_total && (
                          <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.usage_limit_total}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditPopUpOpen(false)}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitForm}
                    disabled={isSubmitting || updateMutation.isPending}
                    className="flex-[1.5] h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold shadow-xl shadow-zinc-200 transition-all active:scale-95"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Coupon"}
                  </Button>
                </div>
              </div>
            </div>
          );}
          }
        </Formik>
      )}

      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[700px] max-h-[85vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">


            <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none mb-1">
                    Coupon Tracking
                  </p>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Usage History
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedCouponForUsage && (
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-xl">
                    Uses: {selectedCouponForUsage.used_count}
                  </Badge>
                )}
                <button
                  onClick={() => setIsUsageModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full px-5 py-4">

                {isUsageLoading ? (
                  <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#96723b]" />
                  </div>

                ) : usageData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Customer
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Order Info
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Saved
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Date
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageData.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{usage.user_name}</span>
                              <span className="text-[11px] text-muted-foreground">{usage.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] text-muted-foreground">
                                #{usage.order_id}
                              </span>
                              <Badge
                                variant="outline"
                                className="w-fit text-[10px] mt-1 rounded-md px-1.5 py-0"
                              >
                                ₹{usage.order_total}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-emerald-600 font-bold text-sm">
                              -₹{usage.discount_amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(usage.used_at), "MMM dd, HH:mm")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                            >
                              <ShoppingBag size={14} className="text-indigo-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                ) : (
                  <div className="flex flex-col items-center justify-center p-20 opacity-30 gap-3">
                    <ShoppingBag size={56} />
                    <p className="text-base font-bold uppercase tracking-wide">
                      No orders used this coupon yet
                    </p>
                  </div>
                )}

              </ScrollArea>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
