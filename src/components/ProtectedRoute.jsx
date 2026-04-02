import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import Loader from "@/components/ui/loader";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // This ensures the component re-evaluates when auth state changes
    if (!loading && !isAuthenticated) {
      console.log(
        "ProtectedRoute: User not authenticated, will redirect to login",
      );
    }
  }, [isAuthenticated, loading]);

  if (loading) return <Loader />;
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const currentRole = user?.role;
    if (!currentRole || !allowedRoles.includes(currentRole)) {
      // Redirect authenticated users to their proper dashboard if role doesn't match route.
      if (currentRole === "ADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (currentRole === "AGENT") {
        return <Navigate to="/agent/dashboard" replace />;
      }
      if (currentRole === "BUYER") {
        return <Navigate to="/marketplace" replace />;
      }
      return <Navigate to="/farmer/dashboard" replace />;
    }
  }

  return children;
}
