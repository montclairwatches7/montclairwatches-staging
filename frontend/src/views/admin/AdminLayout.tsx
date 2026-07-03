import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Watch,
  ShoppingBag,
  Users,
  LogOut,
  Tag,
  Ticket,
  Image,
  FileText,
  HelpCircle,
  Quote,
  Scroll,
  Settings,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Products", icon: Watch, href: "/admin/products" },
  { name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Categories", icon: Tag, href: "/admin/categories" },
  { name: "Coupons", icon: Ticket, href: "/admin/coupons" },
  { name: "Banners", icon: Image, href: "/admin/banners" },
  { name: "Blogs", icon: FileText, href: "/admin/blogs" },
  { name: "FAQ", icon: HelpCircle, href: "/admin/faq" },
  { name: "Pages", icon: Scroll, href: "/admin/pages" },
  { name: "Testimonials", icon: Quote, href: "/admin/testimonials" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
  { name: "Support", icon: Headphones, href: "/admin/support" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, isLoading, adminLogout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!adminUser || adminUser.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [adminUser, isLoading, navigate]);

  if (isLoading || !adminUser || adminUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[10px] tracking-luxury uppercase animate-pulse">
          Checking Authorization Protocol...
        </p>
      </div>
    );
  }

  const currentPage =
    sidebarLinks.find(
      (l) =>
        location.pathname === l.href ||
        (l.href !== "/admin" && location.pathname.startsWith(l.href)),
    )?.name ?? "Dashboard";

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <aside className="w-16 sm:w-20 lg:w-64 shrink-0 sticky top-0 h-screen border-r border-border flex flex-col bg-background z-10">
        <div className="flex items-center justify-center lg:justify-start h-16 px-0 lg:px-6 border-b border-border shrink-0">
          <h2 className="hidden lg:block font-heading text-sm tracking-[0.2em] uppercase font-semibold">
            Admin Panel
          </h2>
          <span className="lg:hidden font-heading text-xs font-bold tracking-widest uppercase">
            AP
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-3 space-y-0.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.href ||
              (link.href !== "/admin" &&
                location.pathname.startsWith(link.href));

            return (
              <Link
                key={link.name}
                to={link.href}
                title={link.name}
                className={cn(
                  "flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-md",
                  "text-[10px] tracking-[0.15em] uppercase font-medium",
                  "transition-all duration-150",
                  isActive
                    ? "text-primary bg-primary/10 border-l-2 border-primary lg:pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                )}
              >
                <Icon size={15} strokeWidth={1.75} className="shrink-0" />
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 px-2 lg:px-3 py-4 border-t border-border space-y-1">


          <button
            onClick={handleLogout}
            title="Logout"
            className={cn(
              "w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-md",
              "text-[10px] tracking-[0.15em] uppercase font-medium",
              "transition-all duration-150",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            )}
          >
            <LogOut size={15} strokeWidth={1.75} className="shrink-0" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <h1 className="font-heading text-sm sm:text-base tracking-wide">
            {currentPage}
          </h1>

        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
