import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MailCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
import { authService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();

  const tokenParam = (searchParams.get("token") || "").trim();
  const emailParam = (searchParams.get("email") || "").trim();

  const isTokenFlow = !!tokenParam;
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const getRedirectPath = useMemo(
    () => (role) => {
      if (role === "ADMIN") return "/admin/dashboard";
      if (role === "AGENT") return "/agent/dashboard";
      if (role === "BUYER") return "/marketplace";
      return "/farmer/dashboard";
    },
    [],
  );

  useEffect(() => {
    if (!isTokenFlow) return;

    let active = true;
    const runVerification = async () => {
      setVerifying(true);
      setStatus("");
      setError("");

      try {
        const response = await verifyEmail(tokenParam);
        if (!active) return;

        setVerified(true);
        setStatus(response?.message || "Email verified successfully.");

        const role = response?.user?.role;
        setTimeout(() => {
          if (!active) return;
          navigate(getRedirectPath(role), { replace: true });
        }, 1000);
      } catch (err) {
        if (!active) return;
        setError(
          err?.message ||
            "Verification failed. Please request a new verification email.",
        );
      } finally {
        if (active) setVerifying(false);
      }
    };

    runVerification();
    return () => {
      active = false;
    };
  }, [getRedirectPath, isTokenFlow, navigate, tokenParam, verifyEmail]);

  const handleResend = async () => {
    if (!emailParam || loading) return;
    setLoading(true);
    setStatus("");
    setError("");
    try {
      const res = await authService.resendVerificationEmail(emailParam);
      setStatus(
        res?.message || "Verification link sent. Please check your inbox.",
      );
    } catch (err) {
      setError(
        err?.message ||
          "Could not resend verification email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
            <span
              className={`rounded-full p-4 ${
                verified
                  ? "bg-green-100 text-green-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {verified ? <CheckCircle2 size={30} /> : <MailCheck size={30} />}
            </span>
          </div>

          {isTokenFlow ? (
            <>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Verifying your email
              </h1>
              <p className="mb-6 text-sm text-gray-500">
                Please wait while we confirm your account.
              </p>

              {(verifying || verified) && (
                <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {verifying && (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Verifying token...
                    </span>
                  )}
                  {!verifying &&
                    verified &&
                    "Success. Redirecting to your dashboard..."}
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Check your email
              </h1>
              <p className="mb-2 text-sm text-gray-600">
                We sent a verification link to:
              </p>
              <p className="mb-6 truncate rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
                {emailParam || "your email address"}
              </p>

              <p className="mb-6 text-sm text-gray-500">
                Open your inbox and click the verification link to activate your
                account.
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading || !emailParam}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {loading ? "Sending..." : "Resend verification email"}
              </button>
            </>
          )}

          {status && <p className="mt-3 text-xs text-green-600">{status}</p>}

          {error && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1 font-semibold text-green-600 hover:text-green-700"
            >
              Continue to Sign In <ArrowRight size={14} />
            </Link>
            <Link to="/signup" className="text-gray-500 hover:text-gray-700">
              Wrong email? Sign up again
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
