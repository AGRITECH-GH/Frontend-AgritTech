import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, animate } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
import { useAuth } from "@/context/AuthContext";
import { cartService } from "@/lib";

const navItems = [
  { label: "Solutions", id: "solutions" },
  { label: "Technology", id: "innovation" },
  { label: "About Us", id: "about" },
  { label: "Pricing", id: "pricing" },
];

const scrollToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return;

  const headerOffset = 80;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;
  const targetPosition = elementPosition - headerOffset;

  animate(window.scrollY, targetPosition, {
    ...transition,
    onUpdate: (latest) => window.scrollTo(0, latest),
  });
};

const Navbar = ({ minimal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);

  // Marketplace-specific state
  const [search, setSearch] = useState(() => {
    if (minimal) {
      const params = new URLSearchParams(location.search);
      return params.get("search") || "";
    }
    return "";
  });
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Fetch cart count when minimal (marketplace) mode
  useEffect(() => {
    if (!minimal || !user) return;
    cartService
      .getCart()
      .then((res) => {
        const items =
          res?.cart?.items ||
          res?.items ||
          res?.data?.items ||
          res?.data?.cart?.items ||
          [];
        setCartCount(Array.isArray(items) ? items.length : 0);
      })
      .catch(() => {});
  }, [minimal, user]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Landing page scroll effect
  useEffect(() => {
    if (minimal) return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [minimal]);

  // Landing page: switch logo color over light sections
  useEffect(() => {
    if (minimal) return;
    const lightSections = ["solutions", "innovation"];
    const navHeight = 80;
    const observers = lightSections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsLight(true);
          else {
            const anyLight = lightSections.some((sid) => {
              const s = document.getElementById(sid);
              if (!s) return false;
              const rect = s.getBoundingClientRect();
              return rect.top < navHeight && rect.bottom > 0;
            });
            setIsLight(anyLight);
          }
        },
        {
          rootMargin: `-0px 0px -${window.innerHeight - navHeight}px 0px`,
          threshold: 0,
        },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [minimal]);

  const handleNavClick = (id) => {
    setOpen(false);
    scrollToSection(id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    navigate(`/marketplace?${params.toString()}`);
    setOpen(false);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout();
    } catch {}
    navigate("/login");
  };

  const userInitial = (
    user?.fullName?.[0] ||
    user?.firstName?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Account";

  /* ─── Minimal: Marketplace Navbar ─────────────────────────────────────── */
  if (minimal) {
    return (
      <header className="sticky top-0 z-50">
        {/* Trust strip */}
        <div className="hidden bg-[#112b11] py-2 sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 text-xs text-white/60 sm:px-6 lg:px-8">
            <span className="hidden sm:block">🌱 100% Organic Produce</span>
            <span>🤝 Direct from Farmers</span>
            <span className="hidden sm:block">🔒 Secure Payments</span>
            <span className="hidden lg:block">🚚 Fast Nationwide Delivery</span>
          </div>
        </div>

        {/* Main nav bar */}
        <nav className="bg-[#1c3d1c] shadow-lg">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              to="/marketplace"
              className="flex shrink-0 items-center gap-2"
            >
              <img
                src={logo}
                alt="AgriTech"
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="hidden text-lg font-bold text-white sm:block">
                AgriTech
              </span>
            </Link>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mx-2 flex w-full max-w-[185px] flex-1 sm:mx-4 sm:max-w-none"
            >
              <div className="flex h-9 w-full items-center overflow-hidden rounded-full bg-white pl-3 pr-1 sm:h-10 sm:pl-4">
                <Search className="h-3.5 w-3.5 shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="min-w-0 flex-1 bg-transparent pl-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:pl-2"
                />
                <button
                  type="submit"
                  className="mr-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 sm:h-8 sm:w-8"
                  aria-label="Search"
                >
                  <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              {/* Cart */}
              <button
                onClick={() => navigate("/marketplace")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-400 px-0.5 text-[10px] font-bold text-[#1c3d1c]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400 text-sm font-bold text-[#1c3d1c]">
                      {userInitial}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-white md:block">
                      {userName}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-white/70 md:block" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg">
                      <div className="border-b border-border/40 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {userName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate("/marketplace");
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-[#f5f6f1]"
                      >
                        <User className="h-4 w-4 text-muted" />
                        My Account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full bg-green-500 text-white hover:bg-green-600"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu toggle */}
            </div>
          </div>
        </nav>
      </header>
    );
  }

  /* ─── Default: Landing Page Navbar ────────────────────────────────────── */
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transition}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-white/10 shadow-soft backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between md:h-20">
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="flex flex-1 items-center gap-1.5 text-base font-semibold text-foreground transition-colors duration-300"
        >
          <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
          <span>AgriTech</span>
        </button>

        {/* Desktop nav — centered */}
        {!minimal && (
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {!minimal && (
          <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="text-base text-foreground transition-colors hover:text-primary"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button size="sm" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </div>
        )}

        {/* Balance right side in minimal mode */}
        {minimal && <div className="flex-1" />}

        {/* Mobile toggle - only show if not minimal */}
        {!minimal && (
          <button
            className="rounded-full border border-border/70 bg-white/70 p-2 text-foreground shadow-sm backdrop-blur md:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {!minimal && (
        <motion.div
          initial={false}
          animate={open ? "open" : "closed"}
          variants={{
            open: { height: "auto", opacity: 1 },
            closed: { height: 0, opacity: 0 },
          }}
          transition={transition}
          className="overflow-hidden border-t border-border/60 bg-white/90 backdrop-blur md:hidden"
        >
          <div className="container flex flex-col gap-4 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="text-left text-sm font-medium text-muted hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted hover:text-foreground"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
