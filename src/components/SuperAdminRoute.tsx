import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  const toasted = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !isSuperAdmin && !toasted.current) {
      toast.error("Access denied — super admin only");
      toasted.current = true;
    }
  }, [loading, isAuthenticated, isSuperAdmin]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default SuperAdminRoute;
