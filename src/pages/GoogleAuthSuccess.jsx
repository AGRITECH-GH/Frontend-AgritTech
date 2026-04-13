import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const getDashboardPathByRole = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "AGENT") return "/agent/dashboard";
  if (role === "BUYER") return "/marketplace";
  return "/farmer/dashboard";
};

export default function GoogleAuthSuccess() {
  const { completeGoogleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  const code = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("code") || "";
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const finalizeGoogleLogin = async () => {
      if (!code) {
        if (isMounted) {
          setError("Google sign-in code was not found. Please try again.");
        }
        return;
      }

      try {
        const result = await completeGoogleAuth(code);
        if (!isMounted) return;

        const targetPath = getDashboardPathByRole(result?.user?.role);
        navigate(targetPath, { replace: true });
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Google sign-in failed. Please try again.");
        }
      }
    };

    finalizeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [code, completeGoogleAuth, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Completing Google Sign-In
        </h1>

        {error ? (
          <>
            <p className="text-sm text-red-600 mb-5">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
            >
              Return to Login
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-5">
              Please wait while we finalize your account access.
            </p>
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          </>
        )}
      </div>
    </div>
  );
}
