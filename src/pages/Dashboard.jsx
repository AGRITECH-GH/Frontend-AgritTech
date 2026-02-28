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
    activity,
    reviewOffer,
    declineOffer,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <DashboardNavbar user={user} />

      <main className="container py-6 lg:py-8">
        {/* ── Welcome Row ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Here&apos;s what is happening on your farm today.
            </p>
          </div>
          <WeatherWidget temp={weather.temp} condition={weather.condition} />
        </div>

        {/* ── Stats Row ── */}
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
            onAddProduct={() => navigate("/add-product")}
            onViewLedger={() => navigate("/farmer/ledger")}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <ActiveProductsTable
            products={products}
            onViewAll={() => navigate("/products")}
          />

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <BarterOffersPanel
              offers={barterOffers}
              newCount={newBarterCount}
              onReview={reviewOffer}
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

      <Footer />
    </div>
  );
};

export default Dashboard;
