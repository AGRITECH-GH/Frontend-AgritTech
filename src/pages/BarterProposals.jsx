import { useState } from "react";
import { Search, Plus } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Footer from "@/components/Footer";
import ProposalCard from "@/components/proposals/ProposalCard";
import NewExchangeCTA from "@/components/proposals/NewExchangeCTA";
import BarterProtocolBanner from "@/components/proposals/BarterProtocolBanner";

// ─── Static mock data ────────────────────────────────────────────────────────

const PROPOSALS = [
  {
    id: 1,
    status: "pending",
    user: { name: "Samuel Green", avatarEmoji: "🧑‍🌾" },
    farm: "Green Valley Orchards",
    giveItem: { emoji: "🌾", name: "50kg Organic Wheat" },
    getItem: { emoji: "🥚", name: "20 Dozen Fresh Eggs" },
    quote: "Good quality wheat for my chickens…",
  },
  {
    id: 2,
    status: "accepted",
    user: { name: "Elena Rivers", avatarEmoji: "👩‍🌾" },
    farm: "Riverside Livestock",
    giveItem: { emoji: "💧", name: "Solar Pump Repair Kit" },
    getItem: { emoji: "🌿", name: "5 Bags Organic Fertilizer" },
    reactions: ["🤝", "✅"],
    messageName: "Elena",
  },
  {
    id: 3,
    status: "rejected",
    user: { name: "John Miller", avatarEmoji: "👨‍🌾" },
    farm: "Miller's Grain Co.",
    giveItem: { emoji: "🚜", name: "1 Tractor Tire" },
    getItem: { emoji: "🛢️", name: "2 Barrels Fuel" },
    rejectReason: "Fuel prices increased significantly.",
  },
];

// ─── Navbar links for this page ───────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Dashboard", to: "/farmer/dashboard" },
  { label: "Ledger", to: "/farmer/ledger" },
  { label: "My Proposals", to: "/farmer/proposals" },
  { label: "Inventory", to: "/farmer/inventory" },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "all", label: "All Proposals", count: 12 },
  { key: "sent", label: "Sent", count: null },
  { key: "received", label: "Received", count: null },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const BarterProposals = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <DashboardNavbar
        user={{ name: "Farmer Joe", avatarUrl: null }}
        navLinks={NAV_LINKS}
        showSearch={false}
      />

      <main className="container py-6 lg:py-8">
        {/* ── Page Header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Barter Proposals
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Manage your active agricultural trades and requests.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Barter Offer
          </button>
        </div>

        {/* ── Tabs + Search row ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {TABS.map(({ key, label, count }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border border-primary bg-white text-primary shadow-sm"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {label}
                  {count !== null && (
                    <span
                      className={`ml-1.5 text-xs ${
                        isActive ? "text-primary" : "text-muted"
                      }`}
                    >
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 sm:w-64">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item or user…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </div>
        </div>

        {/* ── Proposals Grid ── */}
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left column – pending + rejected */}
          <div className="flex flex-col gap-5">
            <ProposalCard proposal={PROPOSALS[0]} />
            <ProposalCard proposal={PROPOSALS[2]} />
          </div>

          {/* Right column – accepted + new exchange CTA */}
          <div className="flex flex-col gap-5">
            <ProposalCard proposal={PROPOSALS[1]} />
            <NewExchangeCTA />
          </div>
        </div>

        {/* ── Protocol Banner ── */}
        <BarterProtocolBanner />
      </main>

      <Footer />
    </div>
  );
};

export default BarterProposals;
