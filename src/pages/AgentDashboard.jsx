import { useNavigate } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { useAgentDashboard } from "@/hooks/useAgentDashboard";
import AgentLayout from "@/components/agent/AgentLayout";
import StatCard from "@/components/dashboard/StatCard";
import CommissionTransparency from "@/components/agent/CommissionTransparency";
import RegionalHubActivity from "@/components/agent/RegionalHubActivity";
import FarmersTable from "@/components/agent/FarmersTable";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const {
    agent,
    stats,
    commissionTiers,
    hubActivity,
    farmers,
    searchQuery,
    setSearchQuery,
    onRegisterFarmer,
    onExportData,
    onFarmerAction,
  } = useAgentDashboard();

  return (
    <AgentLayout agent={agent}>
      <main className="flex-1 overflow-auto px-6 py-6 lg:px-8 lg:py-8">
        {/* ── Page header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl font-bold text-foreground">
              Agent Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Welcome back! Here&apos;s your performance overview.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={onExportData}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <button
              type="button"
              onClick={onRegisterFarmer}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Register New Farmer
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendType={stat.trendType}
            />
          ))}
        </div>

        {/* ── Commission + Regional hub ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <CommissionTransparency tiers={commissionTiers} />
          <RegionalHubActivity
            message={hubActivity.message}
            mapCenter={hubActivity.mapCenter}
            mapZoom={hubActivity.mapZoom}
            onViewTrends={() => navigate("/agent/insights")}
          />
        </div>

        {/* ── Farmers table ── */}
        <FarmersTable
          farmers={farmers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAction={onFarmerAction}
        />
      </main>
    </AgentLayout>
  );
};

export default AgentDashboard;
