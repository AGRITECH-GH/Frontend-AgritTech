import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loader from "@/components/ui/loader";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib";

export default function RoleSetupRequired({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkRoleSetup = async () => {
      const role = String(user?.role || "").toUpperCase();

      if (!isAuthenticated || (role !== "AGENT" && role !== "FARMER")) {
        if (isMounted) {
          setIsComplete(true);
          setLoading(false);
        }
        return;
      }

      try {
        const status = await authService.getRoleSetupStatus();
        if (!isMounted) return;
        setIsComplete(Boolean(status?.roleSetupComplete));
      } catch (error) {
        // Do not block routes on transient API errors.
        if (isMounted) setIsComplete(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkRoleSetup();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  if (loading) return <Loader />;

  if (!isComplete) {
    return <Navigate to="/complete-role-setup" replace />;
  }

  return children;
}
