import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface GuestRouteProps {
  redirectPath?: string;
  adminOnly?: boolean;
}

const GuestRoute = ({
  redirectPath = "/",
  adminOnly = false,
}: GuestRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[10px] tracking-luxury uppercase animate-pulse">
          Checking Session Protocol...
        </p>
      </div>
    );
  }

  if (user) {
    if (adminOnly) {

      if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
      }

      return <Navigate to="/" replace />;
    }


    return (
      <Navigate to={user.role === "admin" ? "/admin" : redirectPath} replace />
    );
  }

  return <Outlet />;
};

export default GuestRoute;
