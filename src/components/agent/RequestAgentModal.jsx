import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Star, UserRound, X } from "lucide-react";

const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const RequestAgentModal = ({
  isOpen,
  onClose,
  agents,
  loadingAgents,
  agentsLoadError,
  selectedRegion,
  onRegionChange,
  page,
  totalPages,
  onPageChange,
  onRequestAgent,
  requestingAgentId,
  requestedAgentIds,
  hasAssignedAgent,
}) => {
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const pageLabel = useMemo(
    () => `Page ${page} of ${Math.max(totalPages || 1, 1)}`,
    [page, totalPages],
  );

  const handleRequest = async (agentId) => {
    setActionMessage("");
    setActionError("");

    const result = await onRequestAgent(agentId);
    if (result?.success) {
      setActionMessage(result.message || "Request sent.");
      return;
    }

    setActionError(result?.message || "Unable to send request right now.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-agent-title"
        className="relative z-[101] w-full max-w-4xl rounded-2xl border border-border/60 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="request-agent-title" className="text-lg font-bold text-foreground">
              Request a Field Agent
            </h2>
            <p className="mt-1 text-sm text-muted">
              Browse available agents and send a management request.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {hasAssignedAgent && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            You already have an assigned agent on your account. New requests are disabled.
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-xs">
            <label
              htmlFor="agent-region"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Filter by region
            </label>
            <select
              id="agent-region"
              value={selectedRegion}
              onChange={(event) => onRegionChange(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All regions</option>
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page <= 1 || loadingAgents}
              className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </span>
            </button>
            <span className="text-xs font-medium text-muted">{pageLabel}</span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(page + 1, Math.max(totalPages || 1, 1)))}
              disabled={page >= Math.max(totalPages || 1, 1) || loadingAgents}
              className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {agentsLoadError && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {agentsLoadError}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto">
          {loadingAgents ? (
            <p className="py-6 text-sm text-muted">Loading agents...</p>
          ) : agents.length === 0 ? (
            <p className="py-6 text-sm text-muted">
              No agents found for the selected filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {agents.map((agent) => {
                const isRequesting = requestingAgentId === agent.id;
                const isRequested = requestedAgentIds.has(agent.id);
                const requestDisabled = hasAssignedAgent || isRequested || isRequesting;

                return (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-border/60 bg-surface/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{agent.fullName}</p>
                        <p className="mt-0.5 text-xs text-muted">{agent.email}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
                        <Star className="h-3 w-3" />
                        {agent.ratingAvg.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-foreground/80">
                      <p>Region: {agent.region}</p>
                      <p>Commission: {agent.commissionRate}%</p>
                      <p>Orders handled: {agent.totalOrdersHandled}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRequest(agent.id)}
                      disabled={requestDisabled}
                      className="mt-4 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-primary/50"
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      {hasAssignedAgent
                        ? "Already assigned"
                        : isRequesting
                          ? "Sending..."
                          : isRequested
                            ? "Request sent"
                            : "Request this agent"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAgentModal;
