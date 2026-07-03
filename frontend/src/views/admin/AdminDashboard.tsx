import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Activity,
  ArrowRight,
  Package,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";

const COLORS = ["#b87333", "#1e293b", "#64748b", "#94a3b8", "#cbd5e1", "#f1f5f9"];

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  const [activeTab, setActiveTab] = useState<"revenue" | "sales">("revenue");
  const [timeRange, setTimeRange] = useState("1w");

  const { data: graphData, isLoading: isGraphLoading } = useQuery({
    queryKey: ["admin-graph-stats", timeRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/graph-stats?range=${timeRange}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${Number(stats.totalSales).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Order Volume",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrdersCount,
      icon: AlertCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Cancelled",
      value: stats.cancelledOrdersCount,
      icon: XCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#1e293b] dark:text-white">
            Dashboard <span className="text-primary italic">Overview</span>
          </h1>
        </div>

        <Button
          onClick={async () => {
            try {
              const response = await api.get("/admin/orders/export", {
                responseType: "blob",
              });
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `intelligence_report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
            } catch (error) {
              toast({
                title: "Export Failed",
                description: "Authentication expired or server error. Please log in again.",
                variant: "destructive",
              });
            }
          }}
          className="bg-primary text-primary-foreground h-[52px] px-8 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-premium hover:shadow-primary/40 transition-all active:scale-95 group shrink-0 flex items-center gap-3"
        >
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          Download Report (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative z-10">
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
                  "p-4 rounded-2xl transition-all group-hover:scale-110",
                  stat.bgColor,
                )}
              >
                <stat.icon className={stat.color} size={28} />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-muted/5 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-muted/20 p-1 rounded-2xl border border-muted/30">
            <button
              onClick={() => setActiveTab("revenue")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === "revenue"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              Revenue Graph
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === "sales"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              Sales Graph
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "1D", value: "1d" },
              { label: "1W", value: "1w" },
              { label: "1M", value: "1m" },
              { label: "3M", value: "3m" },
              { label: "6M", value: "6m" },
              { label: "1Y", value: "1y" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                  timeRange === range.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white border-muted/30 text-muted-foreground hover:border-primary/50"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-premium bg-white dark:bg-[#111114]/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 uppercase">
                    <Activity className="text-primary" size={24} /> {activeTab === "revenue" ? "Revenue" : "Orders"}{" "}
                    <span className="text-primary italic">Intelligence</span>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 h-[400px]">
              {isGraphLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData?.trend}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b87333" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#b87333" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                      dy={10}
                      tickFormatter={(val) => {
                        if (!val) return "";
                        if (timeRange === "1d") return val.split(" ")[1];
                        if (timeRange === "6m" || timeRange === "1y") {
                          const parts = val.split("-");
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          return parts[1] ? months[parseInt(parts[1]) - 1] : val;
                        }
                        return val.split("-").slice(1).join("/");
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                      tickFormatter={(val) => activeTab === "revenue" ? `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}` : val}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) => {
                        if (timeRange === "1d") return `Time: ${label}`;
                        return `Date: ${label}`;
                      }}
                      formatter={(val: any) => activeTab === "revenue" ? [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"] : [val, "Orders"]}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeTab === "revenue" ? "revenue" : "orders"}
                      stroke="#b87333"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-premium bg-white dark:bg-[#111114]/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase">
                <Box className="text-primary" size={20} /> Category{" "}
                <span className="text-primary italic">Mix</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 h-[400px] relative">
              {isGraphLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : graphData?.categorySales?.length > 0 ? (
                <div className="relative h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={graphData?.categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey={activeTab === "revenue" ? "revenue" : "count"}
                        nameKey="category"
                        animationDuration={1500}
                      >
                        {graphData?.categorySales?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => activeTab === "revenue" ? `₹${Number(val).toLocaleString("en-IN")}` : `${val} items`}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        content={({ payload }) => (
                          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                            {payload?.map((entry: any, index: number) => (
                              <li key={`item-${index}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.value}
                              </li>
                            ))}
                          </ul>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-slate-900">
                      {activeTab === "revenue" 
                        ? `₹${(graphData.categorySales.reduce((acc: number, curr: any) => acc + curr.revenue, 0) / 1000).toFixed(1)}k`
                        : graphData.categorySales.reduce((acc: number, curr: any) => acc + curr.count, 0)
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                    <Box className="text-muted-foreground/40" size={24} />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">No Category Data</p>
                  <p className="text-[10px] text-muted-foreground/60 max-w-[150px]">No sales recorded in the selected timeframe.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/20 border-b border-muted/30">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Recent Orders
              </CardTitle>
             
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-primary hover:bg-primary/5"
              asChild
            >
              <Link to="/admin/orders">
                View All <ArrowRight size={14} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-black font-bold">Order</TableHead>
                  <TableHead className="text-black font-bold">
                    Customer
                  </TableHead>
                  <TableHead className="text-black text-center font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-black text-right font-bold">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((order: any) => (
                  <TableRow
                    key={order.id}
                    className="group hover:bg-muted/30 transition-colors border-muted/20"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">#{order.id}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />{" "}
                          {format(new Date(order.created_at), "MMM dd, HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                          {order.customer.charAt(0)}
                        </div>
                        <span className="font-medium text-sm truncate max-w-[120px]">
                          {order.customer}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-[9px] uppercase tracking-wider px-2 py-0",
                          order.status === "delivered"
                            ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                            : order.status === "cancelled"
                              ? "border-rose-500 text-rose-600 bg-rose-50"
                              : "border-amber-500 text-amber-600 bg-amber-50",
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-muted/20 border-b border-muted/30">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Top Products
            </CardTitle>
           
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted/20">
              {stats.topProducts.map((product: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-300 italic">
                    0{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.sold} units sold
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-black">TOP</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
