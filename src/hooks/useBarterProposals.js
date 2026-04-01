import { useEffect, useState } from "react";
import { barterService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

const getIdentifier = (value) =>
  value?.id || value?._id || value?.userId || value?.ownerId || null;

const normalizeId = (value) =>
  value === undefined || value === null ? null : String(value);

const getListingOwnerId = (listing) => {
  if (!listing) return null;

  return normalizeId(
    getIdentifier(listing.owner) ||
      listing.ownerId ||
      listing.farmerId ||
      listing.sellerId ||
      getIdentifier(listing.farmer) ||
      getIdentifier(listing.seller) ||
      (typeof listing.owner === "string" || typeof listing.owner === "number"
        ? listing.owner
        : null),
  );
};

const extractBarterRequests = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const candidates = [
    response.barterRequests,
    response.barters,
    response.requests,
    response.items,
    response.data?.barterRequests,
    response.data?.barters,
    response.data?.requests,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeBarterRequest = (request, currentUserId) => {
  const requester =
    request.requester || request.requestedBy || request.sender || {};
  const targetListing = request.targetListing || request.listing || {};
  const targetOwner =
    targetListing.owner || request.targetOwner || request.listingOwner || {};
  const offeredListing = request.offeredListing || request.sourceListing || {};

  const requesterId = normalizeId(
    getIdentifier(requester) ||
      request.requesterId ||
      request.requestedById ||
      request.senderId ||
      null,
  );
  const targetOwnerId = normalizeId(
    getIdentifier(targetOwner) ||
      getListingOwnerId(targetListing) ||
      request.targetOwnerId ||
      null,
  );

  const status = (request.status || "PENDING").toLowerCase();
  const normalizedCurrentUserId = normalizeId(currentUserId);
  const isSent = Boolean(
    normalizedCurrentUserId && requesterId === normalizedCurrentUserId,
  );
  const isReceived = Boolean(
    normalizedCurrentUserId && targetOwnerId === normalizedCurrentUserId,
  );
  const direction = isSent ? "sent" : isReceived ? "received" : "all";

  return {
    id: request.id || request._id,
    status,
    direction,
    isSent,
    isReceived,
    canAcceptReject: isReceived && status === "pending",
    canCancel: isSent && status === "pending",
    requesterId,
    targetOwnerId,
    targetListing,
    offeredListing,
    offeredDescription: request.offeredDescription || "",
    offeredQuantity: request.offeredQuantity || 0,
    message:
      request.message ||
      request.note ||
      request.notes ||
      request.requestMessage ||
      request.comment ||
      "",
    requesterName:
      requester.fullName || requester.name || requester.username || "Unknown",
    requesterAvatar: requester.avatarUrl || requester.avatar || null,
    targetOwnerName:
      targetOwner.fullName ||
      targetOwner.name ||
      targetOwner.username ||
      "Unknown",
    createdAt:
      request.createdAt || request.updatedAt || new Date().toISOString(),
  };
};

/**
 * useBarterProposals – manage barter requests and status updates
 */
export function useBarterProposals() {
  const { user } = useAuth();
  const [barterRequests, setBarterRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(null); // Track which request is being updated

  const currentUserId = normalizeId(getIdentifier(user));

  const fetchBarterRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await barterService.getBarterRequests();
      const requests = extractBarterRequests(response);

      const normalized = requests
        .map((req) => normalizeBarterRequest(req, currentUserId))
        .filter((req) => req.id);

      setBarterRequests(normalized);
    } catch (err) {
      console.error("Failed to fetch barter requests:", err);
      setError(err.message || "Unable to load barter requests.");
      setBarterRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all barter requests on mount
  useEffect(() => {
    fetchBarterRequests();
  }, [currentUserId]);

  // Filter by status tab
  const filteredByStatus = barterRequests.filter((req) => {
    if (activeTab === "all") return true;
    if (activeTab === "sent") return req.direction === "sent";
    if (activeTab === "received") return req.direction === "received";
    return true;
  });

  // Filter by search query
  const filteredProposals = filteredByStatus.filter((req) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      req.targetListing?.title?.toLowerCase()?.includes(q) ||
      req.offeredListing?.title?.toLowerCase()?.includes(q) ||
      req.offeredDescription?.toLowerCase()?.includes(q) ||
      req.requesterName?.toLowerCase()?.includes(q) ||
      req.targetOwnerName?.toLowerCase()?.includes(q) ||
      req.message?.toLowerCase()?.includes(q)
    );
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Update barter status (accept/reject/cancel)
  const updateBarterStatus = async (barterRequestId, newStatus) => {
    setUpdating(barterRequestId);

    try {
      await barterService.updateBarterStatus(barterRequestId, {
        status: newStatus.toUpperCase(),
      });

      // Update local state
      setBarterRequests((prev) =>
        prev.map((req) =>
          req.id === barterRequestId
            ? { ...req, status: newStatus.toLowerCase() }
            : req,
        ),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to update barter status:", err);
      return {
        success: false,
        error: err.message || "Failed to update request status.",
      };
    } finally {
      setUpdating(null);
    }
  };

  return {
    barterRequests: sortedProposals,
    allBarterRequests: barterRequests,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    updating,
    updateBarterStatus,
    refreshBarterRequests: fetchBarterRequests,
    stats: {
      total: barterRequests.length,
      sent: barterRequests.filter((r) => r.direction === "sent").length,
      received: barterRequests.filter((r) => r.direction === "received").length,
      pending: barterRequests.filter((r) => r.status === "pending").length,
      accepted: barterRequests.filter((r) => r.status === "accepted").length,
      rejected: barterRequests.filter((r) => r.status === "rejected").length,
    },
  };
}
