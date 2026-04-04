import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBarterProposals } from "@/hooks/useBarterProposals";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Footer from "@/components/Footer";
import ProposalCard from "@/components/proposals/ProposalCard";
import NewExchangeCTA from "@/components/proposals/NewExchangeCTA";
import BarterProtocolBanner from "@/components/proposals/BarterProtocolBanner";
import CreateBarterModal from "@/components/proposals/CreateBarterModal";
import TradeDetailsModal from "@/components/proposals/TradeDetailsModal";

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
  const location = useLocation();
  const highlightedTimeoutRef = useRef(null);
  const closeAfterStatusRef = useRef(null);
  const hasFocusedRef = useRef(false);
  const { user } = useAuth();
  const {
    barterRequests,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    updating,
    updateBarterStatus,
    refreshBarterRequests,
    stats,
  } = useBarterProposals();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [highlightedBarterId, setHighlightedBarterId] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const [detailsStatusPreview, setDetailsStatusPreview] = useState("");

  const focusBarterId =
    location.state?.focusBarterId !== undefined &&
    location.state?.focusBarterId !== null
      ? String(location.state.focusBarterId)
      : null;

  useEffect(() => {
    if (location.state?.fromDashboardReview) {
      setActiveTab("received");
    }
  }, [location.state, setActiveTab]);

  useEffect(() => {
    if (!focusBarterId) return;
    hasFocusedRef.current = false;
  }, [focusBarterId]);

  useEffect(() => {
    if (loading || !focusBarterId || hasFocusedRef.current) return;

    const cardElement = document.querySelector(
      `[data-barter-id="${focusBarterId}"]`,
    );

    if (!cardElement) return;

    hasFocusedRef.current = true;
    cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedBarterId(focusBarterId);

    if (highlightedTimeoutRef.current) {
      clearTimeout(highlightedTimeoutRef.current);
    }

    highlightedTimeoutRef.current = setTimeout(() => {
      setHighlightedBarterId(null);
    }, 2500);

    return () => {
      if (highlightedTimeoutRef.current) {
        clearTimeout(highlightedTimeoutRef.current);
      }
    };
  }, [loading, focusBarterId, barterRequests]);

  const displayName = user?.name || user?.fullName || "Farmer Joe";
  const navbarUser = {
    name: displayName,
    avatarUrl: user?.profilePhotoUrl || user?.avatarUrl || null,
  };

  const proposals = loading ? [] : barterRequests;

  const handleDetailsAction = async (newStatus) => {
    if (!selectedTrade?.id) return;

    setDetailsError("");
    const result = await updateBarterStatus(selectedTrade.id, newStatus);
    if (result?.success) {
      setSelectedTrade((prev) =>
        prev ? { ...prev, status: newStatus.toLowerCase() } : prev,
      );
      setDetailsStatusPreview(newStatus.toLowerCase());
      if (closeAfterStatusRef.current) {
        clearTimeout(closeAfterStatusRef.current);
      }
      closeAfterStatusRef.current = setTimeout(() => {
        setDetailsStatusPreview("");
        setSelectedTrade(null);
      }, 750);
      return;
    }

    setDetailsError(result?.error || "Failed to update barter request.");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <DashboardNavbar
        user={navbarUser}
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
            onClick={() => setShowCreateModal(true)}
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
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              let count = null;
              if (key === "all") count = stats.total;
              else if (key === "sent") count = stats.sent;
              else if (key === "received") count = stats.received;

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

        {/* ── Error State ── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div className="mb-8 text-center py-12">
            <p className="text-sm text-muted">Loading barter proposals...</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && proposals.length === 0 && (
          <div className="mb-8 rounded-2xl border border-border/60 bg-surface p-12 text-center">
            <p className="text-sm text-muted">No barter proposals yet.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create Your First Offer
            </button>
          </div>
        )}

        {/* ── Proposals Grid ── */}
        {!loading && proposals.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              {proposals
                .slice(0, Math.ceil(proposals.length / 2))
                .map((proposal) => (
                  <div
                    key={proposal.id}
                    data-barter-id={String(proposal.id)}
                    onClick={() => setSelectedTrade(proposal)}
                    className={`rounded-2xl transition-shadow duration-300 ${
                      highlightedBarterId === String(proposal.id)
                        ? "ring-2 ring-primary/60 shadow-lg"
                        : ""
                    }`}
                  >
                    <ProposalCard
                      proposal={proposal}
                      updating={updating === proposal.id}
                      onStatusChange={(newStatus) =>
                        updateBarterStatus(proposal.id, newStatus)
                      }
                    />
                  </div>
                ))}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">
              {proposals
                .slice(Math.ceil(proposals.length / 2))
                .map((proposal) => (
                  <div
                    key={proposal.id}
                    data-barter-id={String(proposal.id)}
                    onClick={() => setSelectedTrade(proposal)}
                    className={`rounded-2xl transition-shadow duration-300 ${
                      highlightedBarterId === String(proposal.id)
                        ? "ring-2 ring-primary/60 shadow-lg"
                        : ""
                    }`}
                  >
                    <ProposalCard
                      proposal={proposal}
                      updating={updating === proposal.id}
                      onStatusChange={(newStatus) =>
                        updateBarterStatus(proposal.id, newStatus)
                      }
                    />
                  </div>
                ))}
              <NewExchangeCTA />
            </div>
          </div>
        )}

        {/* ── Protocol Banner ── */}
        <BarterProtocolBanner />
      </main>

      {/* Create Barter Modal */}
      <CreateBarterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={refreshBarterRequests}
      />

      <TradeDetailsModal
        isOpen={Boolean(selectedTrade)}
        trade={selectedTrade}
        onClose={() => {
          setDetailsError("");
          setDetailsStatusPreview("");
          setSelectedTrade(null);
        }}
        canAccept={Boolean(selectedTrade?.canAcceptReject)}
        canDecline={Boolean(
          selectedTrade?.canAcceptReject || selectedTrade?.canCancel,
        )}
        isSubmitting={updating === selectedTrade?.id}
        actionError={detailsError}
        previewStatus={detailsStatusPreview}
        onAccept={() => handleDetailsAction("accepted")}
        onDecline={() =>
          handleDetailsAction(
            selectedTrade?.canCancel ? "cancelled" : "rejected",
          )
        }
      />

      <Footer />
    </div>
  );
};

export default BarterProposals;
