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
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { Formik } from "formik";
import { categoriesSchema, validateWithZod } from "./validationSchemas";

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

interface Category {
  id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
  created_at: string;
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPopUpOpen, setIsAddPopUpOpen] = useState(false);
  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);


  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { PAGINATION } = APP_CONFIG;

  const firstPageLimit = PAGINATION.ADMIN_CATEGORIES_FIRST_PAGE;
  const nextPagesLimit = PAGINATION.ADMIN_CATEGORIES_NEXT_PAGES;

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-categories-stats"],
    queryFn: async () => {
      const { data } = await api.get("/categories/stats");
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (categoryData: { name: string; slug: string; status: string }) => {
      await api.post("/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-stats"] });
      setIsAddPopUpOpen(false);
      toast({
        title: "Category Created",
        description: "New category has been added successfully.",
      });
    },
    onError: (error: any) => {
      if (!isAddPopUpOpen) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to create category",
          variant: "destructive",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; slug: string; status: string };
    }) => {
      await api.put(`/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-stats"] });
      setIsEditPopUpOpen(false);
      setEditingCategory(null);
      toast({
        title: "Category Updated",
        description: "Category details have been updated.",
      });
    },
    onError: (error: any) => {
      if (!isEditPopUpOpen) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to update category",
          variant: "destructive",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-stats"] });
      toast({
        title: "Category Deleted",
        description: "Category has been removed from the database.",
      });
    },
  });

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || cat.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    : [];


  const startIndex =
    currentPage === 1 ? 0 : firstPageLimit + (currentPage - 2) * nextPagesLimit;
  const currentLimit = currentPage === 1 ? firstPageLimit : nextPagesLimit;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + currentLimit,
  );

  const totalPages =
    filteredCategories.length <= firstPageLimit
      ? 1
      : 1 +
      Math.ceil(
        (filteredCategories.length - firstPageLimit) / nextPagesLimit,
      );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Categories",
      value: stats?.total || 0,
      icon: Tag,
    },
    {
      label: "Active Categories",
      value: stats?.active || 0,
      icon: CheckCircle2,
    },
    {
      label: "Inactive Categories",
      value: stats?.inactive || 0,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
            Category <span className="text-primary italic">Management</span>
          </h1>

        </div>
        <Button
          onClick={() => setIsAddPopUpOpen(true)}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2"
        >
          <Plus size={20} />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-[#e2e8f0] 
            bg-white p-5 shadow-sm hover:shadow-md 
            transition-all duration-300"
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

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8 bg-background/50 backdrop-blur-sm p-6 rounded-[2rem] border border-border/50 shadow-premium animate-slide-up">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories..."
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
            <SelectTrigger className="w-[180px] h-11 bg-background/50 border-[#e2e8f0] rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
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
              className="h-11 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300 gap-2 font-medium group rounded-xl"
            >
              <RotateCcw className="h-4 w-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
              <span className="text-xs">Reset Filters</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="text-black font-bold">
                Category Name
              </TableHead>
              <TableHead className="text-black font-bold">Status</TableHead>
              <TableHead className="text-black font-bold hidden md:table-cell">
                Created Date
              </TableHead>
              <TableHead className="text-right text-black font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{cat.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag size={14} className="text-primary" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {cat.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium rounded-full px-3",
                        cat.status === "active"
                          ? "border-emerald-500 text-emerald-500 bg-emerald-50/10"
                          : "border-rose-500 text-rose-500 bg-rose-50/10",
                      )}
                    >
                      {cat.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {format(new Date(cat.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
                        >
                          <MoreVertical
                            size={16}
                            className="text-muted-foreground hover:text-foreground"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 p-2 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingCategory({ ...cat });
                            setIsEditPopUpOpen(true);
                          }}
                          className="gap-2 cursor-pointer rounded-lg"
                        >
                          <Edit2 size={14} /> Edit
                        </DropdownMenuItem>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="gap-2 text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the category{" "}
                                <strong>{cat.name}</strong>. This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(cat.id)}
                                className="bg-rose-500 hover:bg-rose-600 rounded-xl"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                    <Tag size={48} className="text-muted-foreground" />
                    <p className="text-lg font-medium">No categories found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Showing {paginatedCategories.length} of{" "}
              {filteredCategories.length} Categories
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
            name: "",
            slug: "",
            status: "active" as "active" | "inactive",
          }}
          validate={validateWithZod(categoriesSchema)}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            setStatus(null);
            createMutation.mutate(values, {
              onSuccess: () => setSubmitting(false),
              onError: (err: any) => {
                setSubmitting(false);
                setStatus(err.response?.data?.message || "Failed to create category");
              }
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, submitForm, status }) => (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-[480px] max-h-[90vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">
                <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Plus size={20} className="text-white" />
                    </div>
                    <div>

                      <h3 className="text-xl font-bold text-white leading-tight">
                        Add New Category
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g. Luxury, Sports, Minimalist"
                      value={values.name}
                      onChange={(e) => {
                        setFieldValue("name", e.target.value);
                        setFieldValue("slug", e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                      }}
                      onBlur={handleBlur}
                      className={cn(
                        "h-11 rounded-2xl bg-slate-50/50 transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                        touched.name && errors.name ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      )}
                    />
                    {touched.name && errors.name && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Slug (URL Path)</label>
                    <Input
                      name="slug"
                      placeholder="e.g. luxury-watches"
                      value={values.slug}
                      onChange={(e) => setFieldValue("slug", e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))}
                      onBlur={handleBlur}
                      className={cn(
                        "h-11 rounded-2xl bg-slate-50/50 font-mono text-xs focus:border-[#b87333] focus:ring-[#b87333]/10",
                        touched.slug && errors.slug ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      )}
                    />
                    {touched.slug && errors.slug && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.slug}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                    <Select
                      value={values.status}
                      onValueChange={(val: any) => setFieldValue("status", val)}
                    >
                      <SelectTrigger className="h-11 rounded-2xl bg-slate-50/50 border-slate-200 transition-all focus:ring-[#b87333]/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 z-[110] shadow-2xl p-1.5">
                        <SelectItem value="active" className="rounded-xl my-0.5 py-2.5 px-3 focus:bg-[#b87333] focus:text-white cursor-pointer">Active</SelectItem>
                        <SelectItem value="inactive" className="rounded-xl my-0.5 py-2.5 px-3 focus:bg-[#b87333] focus:text-white cursor-pointer">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {createMutation.isPending ? "Creating..." : "Save Category"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Formik>
      )}

      {isEditPopUpOpen && editingCategory && (
        <Formik
          initialValues={{
            name: editingCategory.name,
            slug: editingCategory.slug || "",
            status: editingCategory.status,
          }}
          validate={validateWithZod(categoriesSchema)}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            setStatus(null);
            updateMutation.mutate({
              id: editingCategory.id,
              data: values
            }, {
              onSuccess: () => setSubmitting(false),
              onError: (err: any) => {
                setSubmitting(false);
                setStatus(err.response?.data?.message || "Failed to update category");
              }
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, submitForm, status }) => (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-[480px] max-h-[90vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">
                <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Edit2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none mb-1">
                        Category Management
                      </p>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        Edit Category
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        "h-11 rounded-2xl bg-slate-50/50 transition-all focus:border-[#b87333] focus:ring-[#b87333]/10",
                        touched.name && errors.name ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      )}
                    />
                    {touched.name && errors.name && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Slug (URL Path)</label>
                    <Input
                      name="slug"
                      value={values.slug}
                      onChange={(e) =>
                        setFieldValue("slug", e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
                      }
                      onBlur={handleBlur}
                      className={cn(
                        "h-11 rounded-2xl bg-slate-50/50 font-mono text-xs focus:border-[#b87333] focus:ring-[#b87333]/10",
                        touched.slug && errors.slug ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      )}
                    />
                    {touched.slug && errors.slug && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.slug}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                    <Select
                      value={values.status}
                      onValueChange={(val: any) => setFieldValue("status", val)}
                    >
                      <SelectTrigger className="h-11 rounded-2xl bg-slate-50/50 border-slate-200 transition-all focus:ring-[#b87333]/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 z-[110] shadow-2xl p-1.5">
                        <SelectItem value="active" className="rounded-xl my-0.5 py-2.5 px-3 focus:bg-[#b87333] focus:text-white cursor-pointer">Active</SelectItem>
                        <SelectItem value="inactive" className="rounded-xl my-0.5 py-2.5 px-3 focus:bg-[#b87333] focus:text-white cursor-pointer">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                  <Button
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
                    {updateMutation.isPending ? "Updating..." : "Update Category"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Formik>
      )}
    </div>
  );
}
