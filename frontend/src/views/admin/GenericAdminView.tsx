import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { GenericModal } from "./GenericModal";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (row: any) => React.ReactNode;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "richtext" | "textarea" | "image";
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  required?: boolean;
}

interface GenericAdminViewProps {
  moduleName: string;
  title: string;
  description?: string;
  addButtonText?: string;
  columns: Column[];
  formFields: FormField[];
  icon: any;
}

export default function GenericAdminView({
  moduleName,
  title,
  description,
  addButtonText,
  columns,
  formFields,
  icon: Icon,
}: GenericAdminViewProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: serverData, isLoading } = useQuery({
    queryKey: [moduleName, currentPage, searchQuery, statusFilter],
    queryFn: async () => {
      const response = await api.get(`/${moduleName}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      return response.data;
    },
  });

  const items = serverData?.data || [];
  const meta = serverData?.meta || { total: 0, pages: 1 };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/${moduleName}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [moduleName] });
      toast({
        title: "Record Deleted",
        description: `The ${moduleName} entry has been removed.`,
      });
    },
  });

  const totalPages = meta.pages;

  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-[#0a0a0b] pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
            {title.split(' ')[0]} <span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span>
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg font-medium">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              placeholder="Search items..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm 
    shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 
    outline-none transition-all h-[44px]"
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
            {addButtonText || "New Record"}
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        <div
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-premium"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest">{moduleName} Register</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-11 bg-background/50 border border-border/50 px-4 rounded-xl text-xs font-semibold outline-none focus:ring-2 ring-primary/20 cursor-pointer hover:bg-muted transition-all">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
                <SelectItem value="all" className="text-xs font-medium">Any Status</SelectItem>
                <SelectItem value="active" className="text-xs font-medium">Active / Published</SelectItem>
                <SelectItem value="inactive" className="text-xs font-medium">Inactive / Draft</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || searchQuery !== "") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="h-11 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300 gap-2 font-medium group rounded-xl"
              >
                <RotateCcw className="h-4 w-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.accessorKey} className="py-5 px-6">{col.header}</TableHead>
                ))}
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.accessorKey} className="py-4 px-6">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                    <TableCell className="text-right px-6">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length > 0 ? (
                items.map((item: any) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    {columns.map((col) => (
                      <TableCell key={col.accessorKey} className="py-4 px-6">
                        {col.cell ? col.cell(item) : (
                          <span className="font-medium text-sm">{item[col.accessorKey]}</span>
                        )}
                      </TableCell>
                    ))}
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
                        <DropdownMenuContent align="end" className="w-48 p-2">
                          <DropdownMenuItem
                            onClick={() => setEditingItem(item)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit2 size={16} /> Edit Entry
                          </DropdownMenuItem>
                          <div className="h-px bg-muted my-1" />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="gap-2 text-rose-500 cursor-pointer"
                              >
                                <Trash2 size={16} /> Delete Record
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black">
                                  CONFIRM DELETION
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-base text-muted-foreground pt-2">
                                  Are you sure you want to delete this record? This action is permanent.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="pt-6">
                                <AlertDialogCancel className="rounded-xl font-bold">
                                  CANCEL
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  className="bg-rose-500 hover:bg-rose-600 rounded-xl font-bold px-8 shadow-lg shadow-rose-500/20"
                                >
                                  DELETE
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
                  <TableCell colSpan={columns.length + 1} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Icon size={48} />
                      <p className="font-black uppercase tracking-tighter">No Records Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="rounded-xl"
            >
              <ChevronLeft size={18} className="mr-2" /> Previous
            </Button>
            <span className="text-xs font-black uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="rounded-xl"
            >
              Next <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      {(isAdding || editingItem) && (
        <GenericModal
          moduleName={moduleName}
          item={editingItem}
          fields={formFields}
          onClose={() => {
            setIsAdding(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setIsAdding(false);
            setEditingItem(null);
            queryClient.invalidateQueries({ queryKey: [moduleName] });
          }}
        />
      )}
    </div>
  );
}
