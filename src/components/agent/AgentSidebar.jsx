import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart2,
  HelpCircle,
  User,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/logo.svg";

const navItems = [
  { label: "Dashboard", to: "/agent/dashboard", icon: LayoutDashboard },
  { label: "My Farmers", to: "/agent/farmers", icon: Users },
  { label: "Earnings History", to: "/agent/earnings", icon: Receipt },
  { label: "Market Insights", to: "/agent/insights", icon: BarChart2 },
  { label: "Support", to: "/agent/support", icon: HelpCircle },
];

/**
 * AgentSidebar – collapsible left sidebar for the agent portal.
 *
 * @param {{ agent: { name: string, role: string, avatarUrl: string|null } }} props
 */
const AgentSidebar = ({ agent }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <button
        type="button"
        onClick={() => {
          navigate("/agent/dashboard");
          setMobileOpen(false);
        }}
        className="flex items-center gap-2 px-5 py-5 text-base font-bold text-primary"
      >
        <img src={logo} alt="AgriTech" className="h-6 w-6" />
        <span>AgriTech</span>
      </button>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-surface hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-primary">
            {agent?.avatarUrl ? (
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {agent?.name}
            </p>
            <p className="truncate text-xs text-muted">{agent?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden h-screen w-56 shrink-0 flex-col overflow-hidden border-r border-border/60 bg-white lg:flex">
        <NavContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* ── Mobile: overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 flex-col border-r border-border/60 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-full p-1 text-muted hover:bg-surface"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        <NavContent />
      </aside>
    </>
  );
};

export default AgentSidebar;
