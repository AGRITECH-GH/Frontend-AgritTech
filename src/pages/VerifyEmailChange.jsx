import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
import { authService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailChange() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();

  const token = (searchParams.get("token") || "").trim();
  const newEmail = (searchParams.get("email") || "").trim();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !newEmail) {
      setStatus("error");
      setMessage("Invalid link. The token or email is missing.");
      return;
    }

    let active = true;

    const run = async () => {
      try {
        const response = await authService.confirmEmailChange({
          token,
          newEmail,
        });
        if (!active) return;

        setStatus("success");
        setMessage(
          response?.message ||
            "Your email has been updated. Please sign in with your new address.",
        );

        // Clear auth state — the stored email is now stale
        try {
          await logout();
        } catch {
          // ignore
        }

        setTimeout(() => {
          if (!active) return;
          navigate("/login", { replace: true });
        }, 2500);
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage(err?.message || "This link is invalid or has expired.");
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [token, newEmail, logout, navigate]);

  const iconBg =
    status === "success"
      ? "bg-green-100 text-green-600"
      : status === "error"
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f0f2ec" }}
    >
      <nav className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="container flex h-12 items-center justify-between md:h-14">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-base font-semibold text-foreground"
          >
            <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
            <span>AgriTech</span>
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-green-100 px-5 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-green-200"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8"
        >
          <div className="mb-4 flex justify-center">
            <span className={`rounded-full p-4 ${iconBg}`}>
              {status === "success" ? (
                <CheckCircle2 size={30} />
              ) : status === "error" ? (
                <AlertCircle size={30} />
              ) : (
                <MailCheck size={30} />
              )}
            </span>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {status === "success"
              ? "Email updated"
              : status === "error"
                ? "Link invalid"
                : "Confirming email change"}
          </h1>

          <p className="mb-6 text-sm text-gray-500">
            {status === "verifying" ? (
              <span className="inline-flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                Please wait while we confirm your new email address…
              </span>
            ) : (
              message
            )}
          </p>

          {status === "success" && (
            <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Redirecting to sign in…
            </div>
          )}

          {status === "error" && (
            <Link
              to="/profile"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600"
            >
              Back to profile to re-request
            </Link>
          )}
        </motion.section>
      </main>
    </div>
  );
}
