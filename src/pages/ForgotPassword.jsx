import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
import { authService } from "@/lib";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");
    try {
      const response = await authService.forgotPassword(trimmedEmail);
      setStatus(
        response?.message || "If that email exists, a reset link has been sent",
      );
    } catch (err) {
      setError(err?.message || "Unable to send reset link. Please try again.");
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
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-green-100 p-4 text-green-600">
              <Mail size={28} />
            </span>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Forgot password?
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Enter your email and we will send you a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-green-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {loading ? "Sending..." : "Send reset link"}
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
              to="/login"
              className="text-sm font-semibold text-green-600 hover:text-green-700"
            >
              Back to Sign In
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
