import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Search, User, Menu, X } from "lucide-react";
import logo from "@/assets/logo.svg";

const defaultNavLinks = [
  { label: "Dashboard", to: "/farmer/dashboard" },
  { label: "Ledger", to: "/farmer/ledger" },
  { label: "My Proposals", to: "/farmer/proposals" },
  { label: "Inventory", to: "/farmer/inventory" },
];

/**
 * DashboardNavbar – top navigation for authenticated/dashboard views.
 * Extends the landing Navbar's visual style while providing search,
 * app-level links and user controls relevant to logged-in farmers.
 *
 * @param {{ user: { name: string, avatarUrl: string | null } }} props
 */
const DashboardNavbar = ({
  user,
  navLinks = defaultNavLinks,
  showSearch = true,
  searchPlaceholder = "Search for crops, livestock, or farm supplies...",
}) => {
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
      <div className="container flex h-16 items-center gap-4">
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
        {showSearch && (
          <form
            onSubmit={handleSearch}
            className="hidden w-96 items-center rounded-xl border border-border bg-surface px-3 py-2 sm:flex ml-16"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </form>
        )}

        {/* Spacer – pushes nav links to the right */}
        <div className="flex-1" />

        {/* Desktop nav links - right aligned */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end
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
        <div className="flex shrink-0 items-center gap-3">
          {/* Avatar + User name */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-full pr-2 transition-opacity hover:opacity-80"
            aria-label="Profile"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-foreground transition-opacity">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            {user?.name && (
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
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
