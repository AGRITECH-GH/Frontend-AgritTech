import { useMemo, useState } from "react";
import { UserPlus, Users, Phone, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AgentLayout from "@/components/agent/AgentLayout";
import FarmersTable from "@/components/agent/FarmersTable";
import AgentRequestsTable from "@/components/agent/AgentRequestsTable";
import { useMyFarmers } from "@/hooks/useMyFarmers";
import { useAgentRequests } from "@/hooks/useAgentRequests";

const AgentFarmers = () => {
  const { user: authUser } = useAuth();
  const {
    farmers,
    totalFarmers,
    searchQuery,
    setSearchQuery,
    loadingFarmers,
    farmersLoadError,
  } = useMyFarmers();
  const {
    requests,
    pendingRequestsCount,
    loadingRequests,
    requestsLoadError,
    processingRequestId,
    acceptRequest,
    rejectRequest,
  } = useAgentRequests();
  const [activeTab, setActiveTab] = useState("farmers");
  const [requestActionNotice, setRequestActionNotice] = useState("");

  const sidebarAgent = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Agent",
    role:
      authUser?.role || authUser?.userType || authUser?.accountType || "AGENT",
    avatarUrl:
      authUser?.profilePhotoUrl ||
      authUser?.avatarUrl ||
      authUser?.profileImage ||
      null,
  };

  const farmerStats = useMemo(() => {
    const verifiedCount = farmers.filter(
      (farmer) => farmer.status === "verified",
    ).length;
    const farmersWithPhone = farmers.filter(
      (farmer) => farmer.phoneNumber,
    ).length;
    const farmersWithEmail = farmers.filter((farmer) => farmer.email).length;

    return [
      {
        label: "Total Farmers",
        value: totalFarmers,
        Icon: Users,
      },
      {
        label: "Verified Farmers",
        value: verifiedCount,
        Icon: UserPlus,
      },
      {
        label: "With Phone",
        value: farmersWithPhone,
        Icon: Phone,
      },
      {
        label: "With Email",
        value: farmersWithEmail,
        Icon: Mail,
      },
      {
        label: "Pending Requests",
        value: pendingRequestsCount,
        Icon: UserPlus,
      },
    ];
  }, [farmers, totalFarmers, pendingRequestsCount]);

  const handleAcceptRequest = async (requestId) => {
    const result = await acceptRequest(requestId);
    setRequestActionNotice(result.message || "");
  };

  const handleRejectRequest = async (requestId) => {
    const result = await rejectRequest(requestId);
    setRequestActionNotice(result.message || "");
  };

  return (
    <AgentLayout agent={sidebarAgent}>
      <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl font-bold text-foreground">My Farmers</h1>
            <p className="mt-0.5 text-sm text-muted">
              View and manage the farmers assigned to your agent account.
            </p>
          </div>
        </div>

        {farmersLoadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {farmersLoadError}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {farmerStats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {value}
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-2 rounded-xl bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("farmers")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === "farmers"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:bg-white/70"
            }`}
          >
            Farmers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === "requests"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:bg-white/70"
            }`}
          >
            Requests ({pendingRequestsCount})
          </button>
        </div>

        {requestActionNotice && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            {requestActionNotice}
          </div>
        )}

        {requestsLoadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {requestsLoadError}
          </div>
        )}

        {activeTab === "farmers" ? (
          <>
            <FarmersTable
              farmers={farmers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAction={() => {}}
            />

            {loadingFarmers && (
              <p className="mt-3 text-sm text-muted">Loading farmers...</p>
            )}
          </>
        ) : (
          <>
            <AgentRequestsTable
              requests={requests}
              processingRequestId={processingRequestId}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
            {loadingRequests && (
              <p className="mt-3 text-sm text-muted">Loading requests...</p>
            )}
          </>
        )}
      </main>
    </AgentLayout>
  );
};

export default AgentFarmers;
