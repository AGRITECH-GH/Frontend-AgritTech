import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Footer from "@/components/Footer";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sprout,
  Handshake,
  ShoppingBasket,
} from "lucide-react";
import logo from "@/assets/logo.svg";
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

/* ─── Roles ─── */
const roles = [
  { label: "Farmer", Icon: Sprout },
  { label: "Agent", Icon: Handshake },
  { label: "Buyer", Icon: ShoppingBasket },
];

/* ─── Animation helpers ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transition, staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition },
};

/* ─── Main component ─── */
export default function SignUp() {
  const [role, setRole] = useState("Farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8 || !/\d/.test(form.password))
      e.password = "Must be at least 8 characters long and include a number.";
    if (!agreed) e.terms = "You must agree to the terms to continue.";
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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
    /* Simulated async submission */
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f0f2ec" }}
    >
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container flex h-12 items-center justify-between md:h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-base font-semibold text-foreground"
          >
            <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
            <span>AgriTech</span>
          </Link>

          {/* Desktop: nav links + Sign In */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-8">
              {["Features", "Pricing", "Support"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  {label}
                </a>
              ))}
            </div>
            <Link
              to="/login"
              className="text-sm font-bold px-5 py-2 rounded-full bg-green-100 text-gray-900 hover:bg-green-200 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="rounded-full border border-border/70 bg-white p-2 text-foreground shadow-sm md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={menuOpen ? "open" : "closed"}
          variants={{
            open: { height: "auto", opacity: 1 },
            closed: { height: 0, opacity: 0 },
          }}
          transition={transition}
          className="overflow-hidden border-t border-border/60 bg-white md:hidden"
        >
          <div className="container flex flex-col gap-4 py-4">
            {["Features", "Pricing", "Support"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className="mt-2 text-sm font-bold px-5 py-2 rounded-full bg-green-100 text-center text-gray-900 hover:bg-green-200 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
              className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center"
            >
              <div className="flex justify-center mb-4">
                <span className="bg-green-100 text-green-600 rounded-full p-4">
                  <Sprout size={32} />
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account created!
              </h2>
              <p className="text-gray-500 mb-6">
                Welcome to AgriTech, <strong>{form.name}</strong>. Your journey
                starts now.
              </p>
              <Link
                to="/"
                className="inline-block w-full py-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors text-white font-bold text-sm text-center"
              >
                Go to Home
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md"
            >
              {/* Heading */}
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-gray-500">
                  Start your journey with us today
                </p>
              </motion.div>

              {/* Google button */}
              <motion.button
                variants={itemVariants}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-5"
              >
                <GoogleIcon />
                Sign up with Google
              </motion.button>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 mb-5"
              >
                <span className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 tracking-widest font-medium">
                  OR CONTINUE WITH
                </span>
                <span className="flex-1 h-px bg-gray-200" />
              </motion.div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Role selector */}
                <motion.div variants={itemVariants} className="mb-5">
                  <p className="text-sm text-gray-700 mb-2">I am a...</p>
                  <div className="flex gap-3">
                    {roles.map(({ label, Icon }) => {
                      const active = role === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setRole(label)}
                          className={[
                            "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                            active
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Full Name */}
                <motion.div variants={itemVariants} className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Enter your full name"
                      className={[
                        "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                        errors.name
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-green-400",
                      ].join(" ")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="name@example.com"
                      className={[
                        "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                        errors.email
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-green-400",
                      ].join(" ")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="mb-2">
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="••••••••"
                      className={[
                        "w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                        errors.password
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-green-400",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Must be at least 8 characters long and include a number.
                    </p>
                  )}
                </motion.div>

                {/* Terms */}
                <motion.div variants={itemVariants} className="mt-4 mb-5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (errors.terms)
                          setErrors((prev) => ({ ...prev, terms: undefined }));
                      }}
                      className="mt-0.5 accent-green-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      By creating an account, you agree to our{" "}
                      <a
                        href="#"
                        className="text-green-500 hover:underline font-medium"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-green-500 hover:underline font-medium"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-red-500 mt-1 ml-6">
                      {errors.terms}
                    </p>
                  )}
                </motion.div>

                {/* Submit */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-70 transition-colors text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
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
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>

              {/* Login link */}
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-gray-600 mt-5"
              >
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-green-600 font-bold hover:underline"
                >
                  Log In
                </Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
