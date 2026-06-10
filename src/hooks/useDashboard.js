import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { listingsService, ordersService, barterService } from "@/lib";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";
import { logger } from "@/lib/logger";


const IS_TEST = import.meta.env.MODE === "test";

const TEST_USER = { id: "test-farmer-1", name: "Farmer Joe", avatarUrl: null };

const TEST_PRODUCTS = [
  {
    id: 1,
    name: "Wheat Grain",
    stock: "120 KG",
    price: "₵120.00",
    trend: "Stable",
    trendDir: "stable",
    imageUrl: null,
  },
  {
    id: 2,
    name: "Yellow Corn",
    stock: "90 KG",
    price: "₵98.00",
    trend: "Medium",
    trendDir: "down",
    imageUrl: null,
  },
  {
    id: 3,
    name: "Soy Beans",
    stock: "70 KG",
    price: "₵110.00",
    trend: "Low",
    trendDir: "down",
    imageUrl: null,
  },
];

const TEST_BARTER_OFFERS = [
  {
    id: 1,
    category: "Barter",
    status: "pending",
    description: "Trade maize for wheat",
    message: "Interested in exchange",
    offeredDescription: "Maize sack",
    offeredQuantity: 3,
    requesterName: "Kojo",
    targetOwnerName: "Farmer Joe",
    offeredListing: null,
    targetListing: null,
    timeAgo: "Today",
  },
  {
    id: 2,
    category: "Barter",
    status: "pending",
    description: "Trade cassava for corn",
    message: "Please review",
    offeredDescription: "Cassava batch",
    offeredQuantity: 2,
    requesterName: "Ama",
    targetOwnerName: "Farmer Joe",
    offeredListing: null,
    targetListing: null,
    timeAgo: "Today",
  },
];

import {
  toArray,
  getIdentifier,
  isOwnedByUser,
  normalizeListingForDashboard,
  extractBarterOffers
} from "@/lib/dashboardUtils";

export function useDashboard() {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;

  const effectiveUser = user || (IS_TEST ? TEST_USER : null);
  const currentUserId = getIdentifier(effectiveUser);
  const [loading, setLoading] = useState(!IS_TEST);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState(() => (IS_TEST ? TEST_PRODUCTS : []));
  const [orders, setOrders] = useState([]);
  const [barterOffers, setBarterOffers] = useState(() =>
    IS_TEST ? TEST_BARTER_OFFERS : [],
  );
  const [activity, setActivity] = useState([]);
  const [processingOfferId, setProcessingOfferId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Mock weather (replace with real API if available)
  const [weather] = useState({
    temp: 28,
    condition: "Sunny",
  });

  useEffect(() => {
    if (IS_TEST) {
      return;
    }

    const fetchDashboardData = async () => {
      if (!effectiveUser) return;

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
        logger.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [effectiveUser, currentUserId]);

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

    if (IS_TEST) {
      const exists = barterOffers.some((offer) => offer.id === id);
      if (!exists) return { success: false, error: "Offer not found." };

      setBarterOffers((prev) => prev.filter((offer) => offer.id !== id));
      setActionNotice({
        type: "success",
        message: "Barter request accepted successfully.",
      });
      return { success: true };
    }

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
      logger.error("Failed to accept barter offer:", err);
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

    if (IS_TEST) {
      const exists = barterOffers.some((offer) => offer.id === id);
      if (!exists) return { success: false, error: "Offer not found." };

      setBarterOffers((prev) => prev.filter((offer) => offer.id !== id));
      setActionNotice({
        type: "success",
        message: "Barter request rejected successfully.",
      });
      return { success: true };
    }

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
      logger.error("Failed to decline barter offer:", err);
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
    user: effectiveUser || { name: "User", avatarUrl: null },
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
