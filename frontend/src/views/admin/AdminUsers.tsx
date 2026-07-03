import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Search,
  User as UserIcon,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle2,
  Clock,
  Mail,
  Package,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  UserCog,
  UserCircle,
  RotateCcw,
  Download,
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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  last_login: string | null;
  created_at: string;
}

interface UserProfile extends User {
  phone?: string;
  orders: Array<{
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { PAGINATION } = APP_CONFIG;

  const firstPageLimit = PAGINATION.ADMIN_USERS_FIRST_PAGE;
  const nextPagesLimit = PAGINATION.ADMIN_USERS_NEXT_PAGES;

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const { data: userProfile, isLoading: isLoadingProfile } =
    useQuery<UserProfile>({
      queryKey: ["admin-user-profile", selectedUser],
      queryFn: async () => {
        const { data } = await api.get(`/admin/users/${selectedUser}`);
        return data;
      },
      enabled: !!selectedUser,
    });

  const blockMutation = useMutation({
    mutationFn: async ({
      id,
      is_blocked,
    }: {
      id: number;
      is_blocked: boolean;
    }) => {
      await api.put(`/admin/users/${id}/block`, { is_blocked });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      if (selectedUser === variables.id) {
        queryClient.invalidateQueries({
          queryKey: ["admin-user-profile", variables.id],
        });
      }
      toast({
        title: variables.is_blocked ? "User Suspended" : "User Re-activated",
        description: `Access levels updated for ${variables.is_blocked ? "banned" : "active"} user.`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
      toast({
        title: "Account Deleted",
        description: "User data has been permanently removed from the system.",
      });
    },
  });
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !user.is_blocked) ||
      (statusFilter === "suspended" && user.is_blocked);

    let matchesDate = true;
    if (dateFilter !== "all") {
      const joinedDate = new Date(user.created_at);
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      if (dateFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        matchesDate = joinedDate >= today;
      } else if (dateFilter === "last7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        matchesDate = joinedDate >= sevenDaysAgo;
      } else if (dateFilter === "last30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        matchesDate = joinedDate >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no users matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Last Login",
      "Joined Date",
    ];
    const csvRows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.is_blocked ? "Suspended" : "Active",
      user.last_login
        ? format(new Date(user.last_login), "MMM dd, yyyy HH:mm")
        : "Never",
      format(new Date(user.created_at), "MMM dd, yyyy"),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row
          .map((cell) => {
            const cellValue =
              cell === null || cell === undefined ? "" : String(cell);
            return `"${cellValue.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `montclair_users_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Data for ${filteredUsers.length} users has been exported.`,
    });
  };

  const startIndex =
    currentPage === 1 ? 0 : firstPageLimit + (currentPage - 2) * nextPagesLimit;
  const currentLimit = currentPage === 1 ? firstPageLimit : nextPagesLimit;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + currentLimit,
  );

  const totalPages =
    filteredUsers.length <= firstPageLimit
      ? 1
      : 1 + Math.ceil((filteredUsers.length - firstPageLimit) / nextPagesLimit);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: UserIcon,
      color: "text-blue-500",
    },
    {
      label: "Active",
      value: users.filter((u) => !u.is_blocked).length,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Suspended",
      value: users.filter((u) => u.is_blocked).length,
      icon: ShieldAlert,
      color: "text-rose-500",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: ShieldCheck,
      color: "text-amber-500",
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
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
          Client <span className="text-primary italic">Management</span>
        </h1>
       
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-11 rounded-xl bg-background/50 border-[#e2e8f0] focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {(searchTerm ||
            roleFilter !== "all" ||
            statusFilter !== "all" ||
            dateFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setDateFilter("all");
                  setCurrentPage(1);
                }}
                className="h-11 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300 gap-2 font-medium group shrink-0 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
        </div>

        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-11 bg-background/50 border-[#e2e8f0] rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Role" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
              <SelectItem value="all" className="text-xs font-medium">All Roles</SelectItem>
              <SelectItem value="admin" className="text-xs font-medium">Admins</SelectItem>
              <SelectItem value="user" className="text-xs font-medium">Users</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-11 bg-background/50 border-[#e2e8f0] rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
              <SelectItem value="all" className="text-xs font-medium">All Status</SelectItem>
              <SelectItem value="active" className="text-xs font-medium">Active</SelectItem>
              <SelectItem value="suspended" className="text-xs font-medium">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={(val) => {
              setDateFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] h-11 bg-background/50 border-[#e2e8f0] rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Joined" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-2xl backdrop-blur-md">
              <SelectItem value="all" className="text-xs font-medium">All Time</SelectItem>
              <SelectItem value="today" className="text-xs font-medium">Today</SelectItem>
              <SelectItem value="last7days" className="text-xs font-medium">Last 7 Days</SelectItem>
              <SelectItem value="last30days" className="text-xs font-medium">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportToCSV}
            className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 gap-2 font-bold shadow-xl shadow-emerald-500/20 active:scale-95 group border-none rounded-xl shrink-0 text-xs"
          >
            <Download className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
            <span className="tracking-tight">Export</span>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-black">User</TableHead>
              <TableHead className="hidden sm:table-cell text-black">
                Role
              </TableHead>
              <TableHead className="text-black">Status</TableHead>
              <TableHead className="hidden lg:table-cell text-black">
                Last Login
              </TableHead>
              <TableHead className="hidden md:table-cell text-black">
                Joined
              </TableHead>
              <TableHead className="text-right text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">
                          {user.name}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        user.is_blocked
                          ? "border-rose-500 text-rose-500 bg-rose-50/10"
                          : "border-emerald-500 text-emerald-500 bg-emerald-50/10",
                      )}
                    >
                      {user.is_blocked ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
                    {user.last_login
                      ? format(new Date(user.last_login), "MMM dd, HH:mm")
                      : "Never"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
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
                          onClick={() => setSelectedUser(user.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Eye size={16} /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newStatus = !user.is_blocked;
                            blockMutation.mutate({
                              id: user.id,
                              is_blocked: newStatus,
                            });
                          }}
                          className={cn(
                            "gap-2 cursor-pointer",
                            user.is_blocked
                              ? "text-emerald-500"
                              : "text-rose-500",
                          )}
                        >
                          {user.is_blocked ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Ban size={16} />
                          )}
                          {user.is_blocked
                            ? "Lift Suspension"
                            : "Suspend Account"}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="gap-2 text-rose-500 cursor-pointer"
                            >
                              <Trash2 size={16} /> Delete Account
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete{" "}
                                <strong>{user.name}'s</strong> account and all
                                associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(user.id)}
                                className="bg-rose-500 hover:bg-rose-600"
                              >
                                Delete Account
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
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                    <Search size={48} className="text-muted-foreground" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/50 bg-secondary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Showing{" "}
              <span className="text-foreground">
                {startIndex + 1}-
                {Math.min(filteredUsers.length, startIndex + currentLimit)}
              </span>{" "}
              of {filteredUsers.length} Users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-10 w-10 rounded-xl transition-all active:scale-95"
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
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all active:scale-95",
                      currentPage === i + 1 && "shadow-lg shadow-primary/20",
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
                className="h-10 w-10 rounded-xl transition-all active:scale-95"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Sheet
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <SheetContent className="sm:max-w-xl w-full p-0 border-l shadow-2xl flex flex-col bg-background h-[100dvh]">
          <SheetHeader className="sr-only">
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              Detailed information and activity history for the selected user.
            </SheetDescription>
          </SheetHeader>
          {isLoadingProfile ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userProfile ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b bg-muted/20 shrink-0">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold shadow-inner flex-shrink-0">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="text-3xl font-bold truncate">
                        {userProfile.name}
                      </SheetTitle>
                      <SheetDescription
                        className="text-base flex items-center gap-2 mt-1 cursor-pointer hover:text-primary transition-colors truncate"
                        onClick={() => {
                          navigator.clipboard.writeText(userProfile.email);
                          toast({
                            title: "Email Copied",
                            description: "Email address copied to clipboard.",
                          });
                        }}
                      >
                        <Mail size={14} /> {userProfile.email}
                      </SheetDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 font-bold tracking-tight"
                        >
                          {userProfile.role.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1 font-bold",
                            userProfile.is_blocked
                              ? "border-rose-500 text-rose-500 bg-rose-500/5 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]"
                              : "border-emerald-500 text-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]",
                          )}
                        >
                          {userProfile.is_blocked ? "SUSPENDED" : "ACTIVE"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      Total Spent
                    </p>
                    <p className="text-2xl font-black text-primary">
                      $
                      {userProfile.orders
                        .reduce((acc, o) => acc + Number(o.total_amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      Orders Count
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {userProfile.orders.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Activity Timeline
                  </h3>

                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    <div className="relative">
                      <div className="absolute -left-[32px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                        <Clock size={12} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Last Account Access</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {userProfile.last_login
                            ? `Active session detected on ${format(new Date(userProfile.last_login), "PPP")} at ${format(new Date(userProfile.last_login), "p")}`
                            : "No login history found yet."}
                        </p>
                      </div>
                    </div>

                    {userProfile.orders.length > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[32px] top-0 w-6 h-6 rounded-full bg-background border-2 border-emerald-500 flex items-center justify-center z-10">
                          <Package size={12} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            Latest Order Placed
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Order #{userProfile.orders[0].id} worth $
                            {Number(userProfile.orders[0].total_amount).toFixed(
                              2,
                            )}{" "}
                            was placed.
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                            {format(
                              new Date(userProfile.orders[0].created_at),
                              "PPP",
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute -left-[32px] top-0 w-6 h-6 rounded-full bg-background border-2 border-muted-foreground flex items-center justify-center z-10">
                        <UserIcon size={12} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Account Created</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Joined the Montclair registry as a {userProfile.role}.
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                          {format(new Date(userProfile.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Package size={20} className="text-primary" />
                      Detailed History
                    </h3>
                  </div>

                  {userProfile.orders && userProfile.orders.length > 0 ? (
                    <div className="grid gap-3">
                      {userProfile.orders.map((order) => (
                        <div
                          key={order.id}
                          className="group p-5 rounded-2xl border bg-background hover:border-primary/50 hover:shadow-lg transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center font-mono text-xs font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              #{order.id}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-lg">
                                ${Number(order.total_amount).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(order.created_at),
                                  "MMM dd, yyyy",
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest",
                              order.status === "delivered" &&
                              "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]",
                              order.status === "processing" &&
                              "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]",
                              order.status === "shipped" &&
                              "bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_10px_-2px_rgba(59,130,246,0.2)]",
                              order.status === "refunded" &&
                              "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_10px_-2px_rgba(244,63,94,0.2)]",
                            )}
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-[2rem] bg-muted/5 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <Package
                          className="text-muted-foreground/30"
                          size={32}
                        />
                      </div>
                      <p className="text-muted-foreground font-bold italic">
                        Clean Archives
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        No transaction history detected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t bg-muted/10 shrink-0">
                <div className="flex gap-4">
                  <Button
                    variant={userProfile.is_blocked ? "default" : "destructive"}
                    className={cn(
                      "flex-1 h-12 rounded-2xl font-bold transition-all shadow-xl active:scale-95",
                      !userProfile.is_blocked &&
                      "hover:bg-rose-600 shadow-rose-500/20",
                    )}
                    onClick={() =>
                      blockMutation.mutate({
                        id: userProfile.id,
                        is_blocked: !userProfile.is_blocked,
                      })
                    }
                  >
                    {userProfile.is_blocked ? (
                      <ShieldCheck size={18} className="mr-2" />
                    ) : (
                      <ShieldAlert size={18} className="mr-2" />
                    )}
                    {userProfile.is_blocked ? "RESTORE ACCESS" : "SUSPEND USER"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl border-2 border-rose-500/20 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-rose-500/5"
                      >
                        <Trash2 size={18} className="mr-2" /> PURGE DATA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black">
                          CRITICAL ACTION
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground pt-2">
                          You are about to permanently delete{" "}
                          <strong>{userProfile.name}</strong> from the Montclair
                          ecosystem. All orders, preferences, and activity logs
                          will be annihilated.
                          <br />
                          <br />
                          <span className="font-bold text-rose-500 underline uppercase tracking-tighter italic">
                            This cannot be reversed.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-xl font-bold">
                          CANCEL
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(userProfile.id)}
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
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
