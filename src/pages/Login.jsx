import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Sprout } from "lucide-react";
import logo from "@/assets/logo.svg";
import signInBg from "@/assets/SignIn.png";
import { transition } from "@/motionConfig";

/* ─── Google "G" SVG ─── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/* ─── Animation variants ─── */
const formVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transition, staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition },
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleChange = (field) => (ev) => {
    setForm((prev) => ({ ...prev, [field]: ev.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* ════════════════════════════════════
          Left — image panel
      ════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-10"
        style={{
          backgroundImage: `url(${signInBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Brand + tagline */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src={logo} alt="AgriTech logo" className="h-7 w-7 shrink-0" />
            <span className="text-white font-semibold text-lg tracking-tight">
              AgriTech
            </span>
          </Link>

          <h2 className="text-white font-bold text-4xl leading-[1.15] mb-4">
            Design your future
            <br />
            with speed and
            <br />
            precision.
          </h2>

          <p className="text-white/70 text-sm leading-relaxed">
            Connecting farmers and buyers directly
            <br />
            through trust and transparency.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════
          Right — form panel
      ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Minimal top bar — logo visible on mobile only */}
        <header className="flex items-center px-8 pt-6 pb-2 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
            <span className="font-semibold text-gray-900 text-base">
              AgriTech
            </span>
          </Link>
        </header>

        {/* Center the form vertically */}
        <main className="flex-1 flex items-center justify-center px-8 py-10">
          <AnimatePresence mode="wait">
            {success ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transition}
                className="w-full max-w-sm text-center"
              >
                <div className="flex justify-center mb-5">
                  <span className="bg-green-100 text-green-500 rounded-full p-4">
                    <Sprout size={32} />
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back!
                </h2>
                <p className="text-gray-500 text-sm mb-7">
                  You&apos;ve successfully signed in.
                </p>
                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full bg-green-500 hover:bg-green-600 transition-colors text-white font-bold text-sm"
                >
                  Go to Home <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : (
              /* ── Login form ── */
              <motion.div
                key="form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-sm"
              >
                {/* Heading */}
                <motion.div variants={itemVariants} className="mb-7">
                  <h1 className="text-[1.75rem] font-bold text-gray-900 mb-1.5 leading-tight">
                    Welcome back
                  </h1>
                  <p className="text-sm text-gray-500">
                    Please enter your details to continue.
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* ── Email ── */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="name@company.com"
                        autoComplete="email"
                        className={[
                          "w-full pl-10 pr-4 py-3 rounded-2xl border text-sm bg-gray-50 outline-none transition-colors placeholder:text-gray-400",
                          errors.email
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-green-400",
                        ].join(" ")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.email}
                      </p>
                    )}
                  </motion.div>

                  {/* ── Password ── */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-xs font-semibold text-green-500 hover:text-green-600 hover:underline transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange("password")}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={[
                          "w-full pl-10 pr-4 py-3 rounded-2xl border text-sm bg-gray-50 outline-none transition-colors placeholder:text-gray-400",
                          errors.password
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-green-400",
                        ].join(" ")}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.password}
                      </p>
                    )}
                  </motion.div>

                  {/* ── Remember me ── */}
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="accent-green-500 w-4 h-4 cursor-pointer rounded"
                      />
                      <span className="text-sm text-gray-600">
                        Remember me for 30 days
                      </span>
                    </label>
                  </motion.div>

                  {/* ── Sign In ── */}
                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-70 transition-colors text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* ── Divider ── */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 my-5"
                >
                  <span className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">
                    or continue with
                  </span>
                  <span className="flex-1 h-px bg-gray-200" />
                </motion.div>

                {/* ── Google ── */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <GoogleIcon />
                  Google
                </motion.button>

                {/* ── Sign up link ── */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-sm text-gray-500 mt-6"
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-green-500 font-bold hover:text-green-600 hover:underline transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.p>

                {/* ── Footer links ── */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-5 mt-8"
                >
                  {["Privacy Policy", "Terms of Service", "Support"].map(
                    (item) => (
                      <a
                        key={item}
                        href="#"
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {item}
                      </a>
                    ),
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
