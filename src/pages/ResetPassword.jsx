import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
import { authService } from "@/lib";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!token)
      return "Reset token is missing. Please use the link from your email.";
    if (!password) return "New password is required.";
    if (password.length < 8 || !/\d/.test(password)) {
      return "Password must be at least 8 characters and include a number.";
    }
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");
    try {
      const response = await authService.resetPassword({ token, password });
      setStatus(response?.message || "Password reset successfully");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(
        err?.message || "Unable to reset password. Please request a new link.",
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
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Set a new password
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Choose a strong password to secure your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-green-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-green-400"
              />
            </div>

            <p className="text-xs text-gray-400">
              Password must be at least 8 characters and include a number.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {loading ? "Updating..." : "Reset password"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {status && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 size={14} />
              {status}
            </p>
          )}
          {error && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-green-600 hover:text-green-700"
            >
              Need a new reset link?
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
