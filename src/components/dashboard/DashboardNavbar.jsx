import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Search, Bell, User, Menu, X } from "lucide-react";
import logo from "@/assets/logo.svg";

const navLinks = [
  { label: "Dashboard", to: "/farmer/dashboard" },
  { label: "Ledger", to: "/farmer/ledger" },
  { label: "Inventory", to: "/inventory" },
];

/**
 * DashboardNavbar – top navigation for authenticated/dashboard views.
 * Extends the landing Navbar's visual style while providing search,
 * app-level links and user controls relevant to logged-in farmers.
 *
 * @param {{ user: { name: string, avatarUrl: string | null } }} props
 */
const DashboardNavbar = ({ user }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: wire up search API / navigation
    console.log("Search:", searchValue);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex shrink-0 items-center gap-1.5 text-base font-semibold text-foreground"
        >
          <img src={logo} alt="AgriTech logo" className="h-6 w-6" />
          <span>AgriTech</span>
        </button>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-sm flex-1 items-center rounded-xl border border-border bg-surface px-3 py-2 sm:flex"
        >
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for crops, livestock, or farm supplies..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
          />
        </form>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? "border-b-2 border-primary pb-0.5 text-primary"
                    : "text-foreground/70"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            type="button"
            className="relative rounded-full p-2 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Avatar */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-green-100 text-primary transition-opacity hover:opacity-80"
            aria-label="Profile"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-full border border-border/70 bg-white p-2 text-foreground shadow-sm md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search + nav */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-white px-4 pb-4 pt-3 md:hidden">
          <form
            onSubmit={handleSearch}
            className="mb-3 flex items-center rounded-xl border border-border bg-surface px-3 py-2"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? "text-primary" : "text-foreground/70"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
