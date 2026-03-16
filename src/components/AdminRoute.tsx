import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const toasted = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin && !toasted.current) {
      toast.error("Access denied — admin only");
      toasted.current = true;
    }
  }, [loading, isAuthenticated, isAdmin]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
