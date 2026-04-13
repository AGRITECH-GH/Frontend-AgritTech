import { useCallback, useEffect, useMemo, useState } from "react";
import { agentsService } from "@/lib";

const normalizeAgents = (payload) => {
  const rawAgents =
    payload?.agents ||
    payload?.data?.agents ||
    payload?.data ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(rawAgents)) {
    return [];
  }

  return rawAgents.map((agent, index) => {
    const source = agent || {};
    const user = source.user || {};
    const commissionRate = Number(source.commissionRate ?? 0);

    return {
      id: source.id || source._id || `agent-${Date.now()}-${index}`,
      fullName: user.fullName || source.fullName || "Unnamed Agent",
      email: user.email || source.email || "-",
      region: source.assignedRegion || user.region || "Unknown Region",
      ratingAvg: Number(source.ratingAvg ?? 0),
      totalOrdersHandled: Number(source.totalOrdersHandled ?? 0),
      commissionRate: Number.isFinite(commissionRate) ? commissionRate : 0,
    };
  });
};

const normalizePagination = (payload, page, limit, totalItems) => {
  const pagination = payload?.pagination || payload?.data?.pagination || {};
  const safeTotal = Number(pagination.total ?? totalItems ?? 0);
  const safePage = Number(pagination.page ?? page ?? 1);
  const safeLimit = Number(pagination.limit ?? limit ?? 6);
  const fallbackTotalPages = Math.ceil(safeTotal / safeLimit) || 1;
  const computedPages = Math.max(
    1,
    Number(pagination.totalPages ?? fallbackTotalPages),
  );

  return {
    total: safeTotal,
    page: safePage,
    limit: safeLimit,
    totalPages: computedPages,
  };
};

export function useAvailableAgents({
  initialRegion = "",
  initialPage = 1,
  limit = 6,
  enabled = true,
} = {}) {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [page, setPage] = useState(initialPage);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsLoadError, setAgentsLoadError] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    limit,
    totalPages: 1,
  });
  const [requestingAgentId, setRequestingAgentId] = useState("");
  const [requestedAgentIds, setRequestedAgentIds] = useState(() => new Set());

  useEffect(() => {
    setPage(1);
  }, [selectedRegion]);

  const loadAgents = useCallback(async () => {
    if (!enabled) {
      setAgents([]);
      setAgentsLoadError("");
      return;
    }

    setLoadingAgents(true);
    setAgentsLoadError("");

    try {
      const response = await agentsService.getAllAgents({
        region: selectedRegion || undefined,
        page,
        limit,
      });
      const normalized = normalizeAgents(response);
      setAgents(normalized);
      setPagination(
        normalizePagination(response, page, limit, normalized.length),
      );
    } catch (err) {
      setAgentsLoadError(err?.message || "Unable to load available agents.");
    } finally {
      setLoadingAgents(false);
    }
  }, [enabled, selectedRegion, page, limit]);

  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }

    loadAgents();
  }, [loadAgents]);

  const requestAgent = async (agentId) => {
    if (!agentId) {
      return { success: false, message: "Invalid agent selected." };
    }

    setRequestingAgentId(agentId);
    try {
      const response = await agentsService.requestAgent(agentId);
      setRequestedAgentIds((prev) => {
        const next = new Set(prev);
        next.add(agentId);
        return next;
      });

      return {
        success: true,
        message: response?.message || "Agent request sent successfully.",
      };
    } catch (err) {
      return {
        success: false,
        message: err?.message || "Unable to send agent request.",
      };
    } finally {
      setRequestingAgentId("");
    }
  };

  const requestedIds = useMemo(
    () => new Set(requestedAgentIds),
    [requestedAgentIds],
  );

  return {
    agents,
    loadingAgents,
    agentsLoadError,
    selectedRegion,
    setSelectedRegion,
    page,
    setPage,
    pagination,
    requestingAgentId,
    requestedAgentIds: requestedIds,
    requestAgent,
    refreshAgents: loadAgents,
  };
}
