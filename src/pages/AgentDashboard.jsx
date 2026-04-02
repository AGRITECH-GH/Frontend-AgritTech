import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { useAgentDashboard } from "@/hooks/useAgentDashboard";
import { useAuth } from "@/context/AuthContext";
import AgentLayout from "@/components/agent/AgentLayout";
import StatCard from "@/components/dashboard/StatCard";
import CommissionTransparency from "@/components/agent/CommissionTransparency";
import RegionalHubActivity from "@/components/agent/RegionalHubActivity";
import FarmersTable from "@/components/agent/FarmersTable";
import RegisterFarmerModal from "@/components/agent/RegisterFarmerModal";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    agent,
    stats,
    commissionTiers,
    hubActivity,
    farmers,
    searchQuery,
    setSearchQuery,
    registerFarmer,
    registeringFarmer,
    loadingFarmers,
    farmersLoadError,
    onExportData,
    onFarmerAction,
  } = useAgentDashboard();

  const sidebarAgent = {
    name:
      authUser?.fullName ||
      authUser?.name ||
      authUser?.username ||
      agent?.name ||
      "Agent",
    role:
      authUser?.role ||
      authUser?.userType ||
      authUser?.accountType ||
      agent?.role,
    avatarUrl:
      authUser?.avatarUrl || authUser?.profileImage || agent?.avatarUrl || null,
  };

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const handleRegisterFarmer = async (formData) => {
    const result = await registerFarmer(formData);
    if (result.success) {
      setIsRegisterModalOpen(false);
      setSuccessMessage(result.message || "Farmer registered successfully.");
    }
    return result;
  };

  return (
    <AgentLayout agent={sidebarAgent}>
      <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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

          <div className="flex w-full shrink-0 flex-wrap gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onExportData}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface sm:flex-none"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:flex-none"
            >
              <UserPlus className="h-4 w-4" />
              Register New Farmer
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {successMessage}
          </div>
        )}

        {farmersLoadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {farmersLoadError}. Showing cached farmers data for now.
          </div>
        )}

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
        {loadingFarmers && (
          <p className="mt-3 text-sm text-muted">Loading farmers...</p>
        )}
      </main>

      <RegisterFarmerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterFarmer}
        isSubmitting={registeringFarmer}
      />
    </AgentLayout>
  );
};

export default AgentDashboard;
