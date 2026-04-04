import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { listingsService, ordersService, barterService } from "@/lib";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";

const toArray = (value) => (Array.isArray(value) ? value : []);
const getIdentifier = (value) =>
  value?.id || value?._id || value?.userId || value?.ownerId || null;

const isOwnedByUser = (entity, userId) => {
  if (!userId || !entity) return false;

  const ownerId =
    getIdentifier(entity.owner) ||
    entity.ownerId ||
    entity.farmerId ||
    entity.sellerId ||
    getIdentifier(entity.seller) ||
    getIdentifier(entity.farmer) ||
    null;

  return ownerId === userId;
};

const normalizeListingForDashboard = (listing) => {
  const quantity = Number(listing.quantity) || 0;
  const available = Number(listing.quantityAvailable) || 0;
  const percentRemaining = quantity > 0 ? (available / quantity) * 100 : 0;

  return {
    id: listing.id || listing._id,
    name: listing.title || "Unnamed Product",
    stock: `${available} ${listing.unit || "KG"}`,
    price: `₵${(Number(listing.pricePerUnit) || 0).toFixed(2)}`,
    trend:
      percentRemaining >= 70
        ? "Stable"
        : percentRemaining >= 30
          ? "Medium"
          : "Low",
    trendDir:
      percentRemaining >= 70
        ? "stable"
        : percentRemaining >= 30
          ? "down"
          : "down",
    imageUrl: getPrimaryListingImageUrl(listing) || null,
  };
};

const extractBarterOffers = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.barter,
    response.barterRequests,
    response.barters,
    response.requests,
    response.items,
    response.data?.barterRequests,
    response.data?.requests,
    response.data,
  ];

  const firstArray = candidates.find(Array.isArray);
  return firstArray || [];
};

export function useDashboard() {
  const { user } = useAuth();
  const currentUserId = getIdentifier(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [barterOffers, setBarterOffers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [processingOfferId, setProcessingOfferId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Mock weather (replace with real API if available)
  const [weather] = useState({
    temp: 28,
    condition: "Sunny",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch listings
        const listingsRes = await listingsService.getListings({
          limit: 100,
          ownerId: currentUserId,
          mine: true,
        });
        const scopedListings = toArray(listingsRes?.listings)
          .filter((listing) => isOwnedByUser(listing, currentUserId))
          .slice(0, 5)
          .map(normalizeListingForDashboard);
        setListings(scopedListings);

        // Fetch orders
        const ordersRes = await ordersService.getMyOrders({
          limit: 10,
        });
        setOrders(toArray(ordersRes?.orders));

        // Fetch barter requests
        const barterRes = await barterService.getBarterRequests({
          status: "PENDING",
        });
        const scopedBarterOffers = extractBarterOffers(barterRes)
          .filter((request) => {
            const listing = request.targetListing || request.listing || {};
            const owner =
              listing.owner ||
              request.targetOwner ||
              request.listingOwner ||
              {};
            return isOwnedByUser({ owner, ...listing }, currentUserId);
          })
          .map((request) => ({
            id: request.id || request._id,
            category: "Barter",
            status: (request.status || "PENDING").toLowerCase(),
            description:
              request.message ||
              request.offeredDescription ||
              "Incoming barter request",
            message: request.message || request.note || request.notes || "",
            offeredDescription: request.offeredDescription || "",
            offeredQuantity: request.offeredQuantity || 0,
            requesterName:
              request.requester?.fullName ||
              request.requester?.name ||
              request.requestedBy?.fullName ||
              request.requestedBy?.name ||
              request.sender?.fullName ||
              request.sender?.name ||
              "Unknown",
            targetOwnerName:
              request.targetOwner?.fullName ||
              request.targetOwner?.name ||
              request.listingOwner?.fullName ||
              request.listingOwner?.name ||
              "Unknown",
            offeredListing:
              request.offeredListing || request.sourceListing || null,
            targetListing: request.targetListing || request.listing || null,
            timeAgo: new Date(
              request.createdAt || request.updatedAt || Date.now(),
            ).toLocaleDateString(),
          }));
        setBarterOffers(scopedBarterOffers);

        // Build activity list
        const recentActivity = [];
        const recentOrders = toArray(ordersRes?.orders);
        if (recentOrders.length > 0) {
          recentOrders.slice(0, 2).forEach((order) => {
            recentActivity.push({
              id: order.id,
              type: "order",
              title: "Order Confirmed",
              detail: `Order #${order.id.slice(0, 8)} - ${order.totalPrice} GHS`,
              timeAgo: new Date(order.createdAt).toLocaleDateString(),
            });
          });
        }
        setActivity(recentActivity);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, currentUserId]);

  const stats = [
    {
      id: "listings",
      label: "Active Listings",
      value: `${listings.length} Products`,
      icon: "tag",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: `${orders.length} Orders`,
      icon: "dollar",
    },
    {
      id: "barter",
      label: "Barter Offers",
      value: `${barterOffers.length} Pending`,
      icon: "repeat",
    },
  ];

  const reviewOffer = async (id) => {
    if (!id) return { success: false, error: "Invalid barter request." };

    setActionNotice(null);
    setProcessingOfferId(id);
    try {
      await barterService.updateBarterStatus(id, { status: "ACCEPTED" });
      setBarterOffers((prev) => prev.filter((o) => o.id !== id));
      setActionNotice({
        type: "success",
        message: "Barter request accepted successfully.",
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to accept barter offer:", err);
      setError(err.message || "Failed to accept barter offer.");
      setActionNotice({
        type: "error",
        message: err.message || "Failed to accept barter offer.",
      });
      return {
        success: false,
        error: err.message || "Failed to accept barter offer.",
      };
    } finally {
      setProcessingOfferId(null);
    }
  };

  const declineOffer = async (id) => {
    if (!id) return { success: false, error: "Invalid barter request." };

    setActionNotice(null);
    setProcessingOfferId(id);
    try {
      await barterService.updateBarterStatus(id, { status: "REJECTED" });
      setBarterOffers((prev) => prev.filter((o) => o.id !== id));
      setActionNotice({
        type: "success",
        message: "Barter request rejected successfully.",
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to decline barter offer:", err);
      setError(err.message || "Failed to decline barter offer.");
      setActionNotice({
        type: "error",
        message: err.message || "Failed to decline barter offer.",
      });
      return {
        success: false,
        error: err.message || "Failed to decline barter offer.",
      };
    } finally {
      setProcessingOfferId(null);
    }
  };

  const clearActionNotice = () => setActionNotice(null);

  return {
    user: user || { name: "User", avatarUrl: null },
    weather,
    stats,
    products: listings,
    barterOffers,
    newBarterCount: barterOffers.length,
    processingOfferId,
    actionNotice,
    activity,
    reviewOffer,
    declineOffer,
    clearActionNotice,
    loading,
    error,
  };
}
