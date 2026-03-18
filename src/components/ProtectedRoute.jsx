import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import Loader from "@/components/ui/loader";

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Shows a full-screen loader while Clerk is initialising.
 */
export default function ProtectedRoute({ children }) {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) return <Navigate to="/login" replace />;

    return children;
}
