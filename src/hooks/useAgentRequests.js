import { useCallback, useEffect, useMemo, useState } from "react";
import { agentsService } from "@/lib";

const formatDateValue = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const normalizeRequests = (payload) => {
  const rawList =
    payload?.requests ||
    payload?.data?.requests ||
    payload?.data ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((request, index) => {
    const source = request || {};
    const farmer = source.farmer || source.requester || {};
    const status = String(source.status || "PENDING").toLowerCase();

    return {
      id: source.id || source._id || `request-${Date.now()}-${index}`,
      farmerName: farmer.fullName || farmer.name || "Unknown Farmer",
      farmerEmail: farmer.email || "-",
      farmerRegion: farmer.region || "Unknown Region",
      status: ["pending", "accepted", "rejected"].includes(status)
        ? status
        : "pending",
      createdAt: source.createdAt || source.created_on || null,
      createdLabel: formatDateValue(source.createdAt || source.created_on),
    };
  });
};

export function useAgentRequests() {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsLoadError, setRequestsLoadError] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState("");

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setRequestsLoadError("");

    try {
      const response = await agentsService.getAgentRequests();
      setRequests(normalizeRequests(response));
    } catch (err) {
      setRequestsLoadError(err?.message || "Unable to load agent requests.");
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }

    loadRequests();
  }, [loadRequests]);

  const updateRequestStatus = async (requestId, status) => {
    if (!requestId || !status) {
      return { success: false, message: "Invalid request update." };
    }

    const normalizedStatus = String(status).toUpperCase();
    if (!["ACCEPTED", "REJECTED"].includes(normalizedStatus)) {
      return { success: false, message: "Invalid status value." };
    }

    setProcessingRequestId(requestId);
    try {
      const response = await agentsService.handleAgentRequest(requestId, {
        status: normalizedStatus,
      });
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: normalizedStatus.toLowerCase() }
            : request,
        ),
      );

      return {
        success: true,
        message:
          response?.message ||
          `Request ${normalizedStatus === "ACCEPTED" ? "accepted" : "rejected"}.`,
      };
    } catch (err) {
      return {
        success: false,
        message: err?.message || "Unable to update request status.",
      };
    } finally {
      setProcessingRequestId("");
    }
  };

  const pendingRequestsCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );

  return {
    requests,
    pendingRequestsCount,
    loadingRequests,
    requestsLoadError,
    processingRequestId,
    refreshRequests: loadRequests,
    acceptRequest: (requestId) => updateRequestStatus(requestId, "ACCEPTED"),
    rejectRequest: (requestId) => updateRequestStatus(requestId, "REJECTED"),
  };
}
