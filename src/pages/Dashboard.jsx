import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import StatCard from "@/components/dashboard/StatCard";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import ActiveProductsTable from "@/components/dashboard/ActiveProductsTable";
import BarterOffersPanel from "@/components/dashboard/BarterOffersPanel";
import RecentActivity from "@/components/dashboard/RecentActivity";
import HelpBanner from "@/components/dashboard/HelpBanner";
import TradeDetailsModal from "@/components/proposals/TradeDetailsModal";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    weather,
    stats,
    products,
    barterOffers,
    newBarterCount,
    processingOfferId,
    actionNotice,
    activity,
    reviewOffer,
    declineOffer,
    clearActionNotice,
  } = useDashboard();
  const closeAfterStatusRef = useRef(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const [detailsStatusPreview, setDetailsStatusPreview] = useState("");

  const handleAcceptFromDetails = async () => {
    if (!selectedTrade?.id) return;

    setDetailsError("");
    const result = await reviewOffer(selectedTrade.id);
    if (result?.success) {
      setSelectedTrade((prev) =>
        prev ? { ...prev, status: "accepted" } : prev,
      );
      setDetailsStatusPreview("accepted");
      if (closeAfterStatusRef.current) {
        clearTimeout(closeAfterStatusRef.current);
      }
      closeAfterStatusRef.current = setTimeout(() => {
        setDetailsStatusPreview("");
        setSelectedTrade(null);
      }, 750);
      return;
    }

    setDetailsError(result?.error || "Failed to accept barter offer.");
  };

  const handleDeclineFromDetails = async () => {
    if (!selectedTrade?.id) return;

    setDetailsError("");
    const result = await declineOffer(selectedTrade.id);
    if (result?.success) {
      setSelectedTrade((prev) =>
        prev ? { ...prev, status: "rejected" } : prev,
      );
      setDetailsStatusPreview("rejected");
      if (closeAfterStatusRef.current) {
        clearTimeout(closeAfterStatusRef.current);
      }
      closeAfterStatusRef.current = setTimeout(() => {
        setDetailsStatusPreview("");
        setSelectedTrade(null);
      }, 750);
      return;
    }

    setDetailsError(result?.error || "Failed to decline barter offer.");
  };

  useEffect(() => {
    if (!actionNotice) return;

    const timeoutId = setTimeout(() => {
      clearActionNotice();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [actionNotice, clearActionNotice]);

  const displayName = user?.name || user?.fullName || "Farmer Joe";
  const navbarUser = {
    name: displayName,
    avatarUrl: user?.avatarUrl || null,
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <DashboardNavbar user={navbarUser} />

      <main className="container py-6 lg:py-8">
        {/* ── Welcome Row ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Here&apos;s what is happening on your farm today.
            </p>
          </div>
          <WeatherWidget temp={weather.temp} condition={weather.condition} />
        </div>

        {/* ── Stats Row ── */}
        {actionNotice && (
          <div
            className={`mb-6 rounded-xl border p-3 text-sm ${
              actionNotice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {actionNotice.message}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-6">
          <QuickActions
            onAddProduct={() => navigate("/farmer/inventory/add-product")}
            onViewLedger={() => navigate("/farmer/ledger")}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <ActiveProductsTable
            products={products}
            onViewAll={() => navigate("/farmer/inventory")}
          />

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <BarterOffersPanel
              offers={barterOffers}
              newCount={newBarterCount}
              processingOfferId={processingOfferId}
              onReview={(offer) => setSelectedTrade(offer)}
              onDecline={declineOffer}
            />
            <RecentActivity
              items={activity}
              onViewHistory={() => navigate("/activity")}
            />
          </div>
        </div>

        {/* ── Help Banner ── */}
        <HelpBanner
          onCallAgent={() => console.log("Call agent")}
          onKnowledgeBase={() => navigate("/help")}
        />
      </main>

      <TradeDetailsModal
        isOpen={Boolean(selectedTrade)}
        trade={selectedTrade}
        onClose={() => {
          setDetailsError("");
          setDetailsStatusPreview("");
          setSelectedTrade(null);
        }}
        canAccept
        canDecline
        isSubmitting={processingOfferId === selectedTrade?.id}
        actionError={detailsError}
        previewStatus={detailsStatusPreview}
        onAccept={handleAcceptFromDetails}
        onDecline={handleDeclineFromDetails}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
