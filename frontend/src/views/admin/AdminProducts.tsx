import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  Watch,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  AlertTriangle,
  List,
  LayoutGrid,
  MoreVertical,
  RotateCcw,
  Tag,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import ProductModal from "./ProductModal";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
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
import { Card } from "@/components/ui/card";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { PAGINATION } = APP_CONFIG;
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const firstPageLimit = PAGINATION.ADMIN_USERS_FIRST_PAGE;
  const nextPagesLimit = PAGINATION.ADMIN_USERS_NEXT_PAGES;

  const { data: serverData, isLoading } = useQuery({
    queryKey: ["admin-products", currentPage, searchQuery, categoryFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get("/admin/products", {
        params: {
          page: currentPage,
          limit: PAGINATION.ADMIN_PRODUCTS_PER_PAGE,
          search: searchQuery,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined
        }
      });
      return response.data;
    },
  });

  const products = serverData?.data || [];
  const meta = serverData?.meta || { total: 0, pages: 1 };

  const stats = useMemo(
    () => [
      {
        label: "Total Products",
        value: products.length,
        icon: Package,
      },
      {
        label: "In Stock",
        value: products.filter((p: any) => p.stock_quantity > 0).length,
        icon: CheckCircle,
      },
      {
        label: "Low Stock",
        value: products.filter(
          (p: any) => p.stock_quantity > 0 && p.stock_quantity <= 10,
        ).length,
        icon: AlertTriangle,
      },
      {
        label: "Out of Stock",
        value: products.filter((p: any) => p.stock_quantity <= 0).length,
        icon: X,
      },
    ],
    [products],
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });
  const categories = categoriesData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: "Product Removed",
        description: "Unit has been decommissioned from the registry.",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/admin/products/${id}`, {
        status: status === "active" ? "inactive" : "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: "Status Updated",
        description: "Product operational status changed.",
      });
    },
  });

  const totalPages = meta.pages;
  const totalItems = meta.total;
  const paginatedProducts = products;
  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-[#0a0a0b] pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
            Product <span className="text-primary italic">Management</span>
          </h1>
         
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              placeholder="Search serials, brands..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm shadow-sm 
    focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-[48px]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-primary text-primary-foreground h-[52px] px-8 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-premium hover:shadow-primary/40 transition-all active:scale-95 group shrink-0"
          >
            <Plus
              size={18}
              className="mr-2 group-hover:rotate-90 transition-transform duration-300"
            />
            ADD NEW PRODUCT
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-[#e2e8f0] 
            bg-white p-5 shadow-sm hover:shadow-md 
            transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748b] font-medium">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-[#0f172a] mt-1">
                    {stat.value}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-[#f3e8e2] group-hover:bg-[#b87333]/10 transition">
                  <stat.icon className="text-[#b87333]" size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8 bg-background/50 backdrop-blur-sm p-6 rounded-[2rem] border border-border/50 shadow-premium animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary whitespace-nowrap">
              <Filter size={14} /> Refine Inventory
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background/50 border border-border/50 px-4 rounded-xl text-xs font-semibold outline-none focus:ring-2 ring-primary/20 cursor-pointer hover:bg-muted transition-all">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
                  <SelectItem value="all" className="text-xs font-medium">All Categories</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs font-medium">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background/50 border border-border/50 px-4 rounded-xl text-xs font-semibold outline-none focus:ring-2 ring-primary/20 cursor-pointer hover:bg-muted transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Any Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
                  <SelectItem value="all" className="text-xs font-medium">Any Status</SelectItem>
                  <SelectItem value="active" className="text-xs font-medium">Active Only</SelectItem>
                  <SelectItem value="inactive" className="text-xs font-medium">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="h-11 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300 gap-2 font-medium group rounded-xl"
                >
                  <RotateCcw className="h-4 w-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                  <span className="text-xs">Reset Filters</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-secondary/30 dark:bg-secondary/10 rounded-2xl self-end lg:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2.5 rounded-xl transition-all flex items-center gap-2",
                viewMode === "table"
                  ? "bg-white dark:bg-[#111114] shadow-md text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Table View"
            >
              <List size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest pr-1">
                List
              </span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-xl transition-all flex items-center gap-2",
                viewMode === "grid"
                  ? "bg-white dark:bg-[#111114] shadow-md text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Grid View"
            >
              <LayoutGrid size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest pr-1">
                Grid
              </span>
            </button>
          </div>
        </div>

        <div
          className="bg-transparent animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white dark:bg-[#111114] animate-pulse rounded-[2rem] border border-border/50"
                />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            viewMode === "table" ? (
              <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="py-5 px-6">Product</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">
                        Category
                      </TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="hidden lg:table-cell text-center">
                        Stock
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product: any) => (
                      <TableRow
                        key={product.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/30 transition-colors">
                              {getDisplayImage(product) ? (
                                <img
                                  src={getDisplayImage(product)}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <Watch
                                  className="text-muted-foreground/30"
                                  size={18}
                                />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">
                                {product.name}
                              </span>
                              <span className="text-xs text-muted-foreground tracking-wide uppercase font-medium">
                                {product.brand}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <Badge
                            variant="secondary"
                            className="capitalize font-medium"
                          >
                            {product.category_name || product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                "text-xs font-bold",
                                product.stock_quantity <= 5
                                  ? "text-amber-500"
                                  : product.stock_quantity === 0
                                    ? "text-rose-500"
                                    : "text-foreground",
                              )}
                            >
                              {product.stock_quantity}{" "}
                              <span className="text-[10px] opacity-60">
                                units
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              product.status === "active"
                                ? "border-emerald-500 text-emerald-500 bg-emerald-50/10"
                                : "border-rose-500 text-rose-500 bg-rose-50/10",
                            )}
                          >
                            {product.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="group-hover:bg-muted"
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 p-2"
                            >

                              <DropdownMenuItem
                                onClick={() => setEditingProduct(product)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 size={16} /> Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    id: product.id,
                                    status: product.status,
                                  })
                                }
                                className={cn(
                                  "gap-2 cursor-pointer",
                                  product.status === "active"
                                    ? "text-amber-600"
                                    : "text-emerald-600",
                                )}
                              >
                                <Package size={16} />
                                {product.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <div className="h-px bg-muted my-1" />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="gap-2 text-rose-500 cursor-pointer"
                                  >
                                    <Trash2 size={16} /> Delete Product
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black">
                                      CRITICAL DEPLETION
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-base text-muted-foreground pt-2">
                                      You are about to permanently decommission{" "}
                                      <strong>{product.name}</strong> from the
                                      registry. This action will terminate all
                                      associated stock data.
                                      <br />
                                      <br />
                                      <span className="font-bold text-rose-500 underline uppercase tracking-tighter italic">
                                        This protocol is irreversible.
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="pt-6">
                                    <AlertDialogCancel className="rounded-xl font-bold">
                                      CANCEL
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteMutation.mutate(product.id)
                                      }
                                      className="bg-rose-500 hover:bg-rose-600 rounded-xl font-bold px-8 shadow-lg shadow-rose-500/20"
                                    >
                                      CONFIRM DELETION
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {paginatedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}

                    onEdit={() => setEditingProduct(product)}
                    onDelete={() => deleteMutation.mutate(product.id)}
                    onToggleStatus={() =>
                      toggleStatusMutation.mutate({
                        id: product.id,
                        status: product.status,
                      })
                    }
                  />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6 bg-white dark:bg-[#111114] rounded-[3rem] border border-border/50">
              <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6 border border-border/30">
                <Search size={40} className="text-muted-foreground/20" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                No Masterpieces Found
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm italic">
                Adjust your filters to locate the specific horological assets
                within the registry.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-6 border-t border-border/50 bg-secondary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Showing Page{" "}
                <span className="text-foreground">
                  {currentPage}
                </span>{" "}
                of {totalPages} ({totalItems} Absolute Units)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-2.5 rounded-xl border border-border/50 hover:bg-white dark:hover:bg-[#111114] disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Only show first, last, and pages around current to prevent overflow if many pages
                    if (totalPages > 7 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                      return null;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0",
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "hover:bg-secondary/50 text-muted-foreground",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2.5 rounded-xl border border-border/50 hover:bg-white dark:hover:bg-[#111114] disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {(isAdding || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsAdding(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setIsAdding(false);
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          }}
        />
      )}


    </div>
  );
}

const getDisplayImage = (product: any) => {
  if (!product) return null;
  if (product.image) return product.image;
  if (product.images) {
    try {
      const imgs =
        typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images;
      return Array.isArray(imgs) ? imgs[0] : imgs;
    } catch (e) {
      return null;
    }
  }
  return null;
};

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: any) {
  return (
    <div className="group bg-white dark:bg-[#111114] rounded-[2.5rem] border border-border/50 p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col h-full">
      <div className="relative aspect-square rounded-[2rem] bg-secondary/5 mb-6 overflow-hidden border border-border/10 group-hover:border-primary/20 transition-colors">
        {getDisplayImage(product) ? (
          <img
            src={getDisplayImage(product)}
            alt={product.name}
            className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/10">
            <Watch className="text-muted-foreground/20" size={64} />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 shadow-sm",
              product.status === "active"
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-rose-500 text-white border-rose-400",
            )}
          >
            {product.status}
          </Badge>
          <Badge className="bg-black/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest border border-white/20 px-3 py-1">
            {product.category_name || product.category}
          </Badge>
        </div>

        <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-2 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">

            <button
              onClick={onEdit}
              className="flex-1 py-2.5 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex justify-center text-amber-500"
              title="Edit Specifications"
            >
              <Edit2 size={18} />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex-1 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex justify-center text-rose-500"
                  title="Purge From Registry"
                >
                  <Trash2 size={18} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black">
                    CRITICAL DEPLETION
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base text-muted-foreground pt-2">
                    Are you certain you want to permanently decommission{" "}
                    <strong>{product.name}</strong>?
                    <br />
                    <br />
                    <span className="font-bold text-rose-500 underline uppercase tracking-tighter italic">
                      This action cannot be undone.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6">
                  <AlertDialogCancel className="rounded-xl font-bold">
                    CANCEL
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete()}
                    className="bg-rose-500 hover:bg-rose-600 rounded-xl font-bold px-8 shadow-lg shadow-rose-500/20"
                  >
                    CONFIRM DELETION
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1 leading-none">
              {product.brand}
            </p>
            <h3 className="font-heading text-xl leading-tight truncate px-0 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl font-black font-heading tracking-tighter">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground border-t border-border/30 pt-4 mt-auto">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                product.stock_quantity <= 5
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500",
              )}
            />
            <span>Stock Level</span>
          </div>
          <span
            className={cn(
              "font-black text-xs",
              product.stock_quantity <= 5
                ? "text-amber-500"
                : "text-foreground",
            )}
          >
            {product.stock_quantity}{" "}
            <span className="text-[9px] opacity-60">UNITS</span>
          </span>
        </div>
      </div>
    </div>
  );
}


