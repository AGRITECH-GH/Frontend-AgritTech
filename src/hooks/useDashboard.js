<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { listingsService, ordersService, barterService } from "@/lib";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";
>>>>>>> dev

// ---------------------------------------------------------------------------
// Mock data – replace the values / fetch calls with real API responses later
// ---------------------------------------------------------------------------

const MOCK_USER = {
  name: "Farmer Joe",
  avatarUrl: null, // swap with a real URL when available
};

<<<<<<< HEAD
const MOCK_WEATHER = {
  temp: 28,
  condition: "Sunny",
=======
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
>>>>>>> dev
};

const MOCK_STATS = [
  {
    id: "listings",
    label: "Active Listings",
    value: "12 Products",
    icon: "tag",
  },
  { id: "sales", label: "Total Sales", value: "$4,520.00", icon: "dollar" },
  { id: "barter", label: "Barter Offers", value: "5 Pending", icon: "repeat" },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Organic Carrots",
    imageUrl: null,
    stock: "450 kg",
    price: "$2.50/kg",
    trend: "+5%",
    trendDir: "up",
  },
  {
    id: 2,
    name: "Russet Potatoes",
    imageUrl: null,
    stock: "1,200 kg",
    price: "$1.20/kg",
    trend: "Stable",
    trendDir: "stable",
  },
  {
    id: 3,
    name: "Premium Wheat",
    imageUrl: null,
    stock: "2,500 kg",
    price: "$0.85/kg",
    trend: "-2%",
    trendDir: "down",
  },
];

const MOCK_BARTER_OFFERS = [
  {
    id: 1,
    category: "Offer for Corn",
    timeAgo: "2h ago",
    description:
      "Agent Smith wants to trade 200kg Fertilizer for 150kg Sweet Corn.",
  },
  {
    id: 2,
    category: "Offer for Wheat",
    timeAgo: "5h ago",
    description: "Buyer Jane offers 10 Solar Lamps for 500kg Premium Wheat.",
  },
];

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "payment",
    title: "Payment Received",
    detail: "$1,200.00 for Potatoes Order #5542",
    timeAgo: "10 mins ago",
  },
  {
    id: 2,
    type: "order",
    title: "Order Completed",
    detail: "200kg Carrots delivered to Central Market",
    timeAgo: "1 hour ago",
  },
  {
    id: 3,
    type: "price",
    title: "Price Update",
    detail: "Wheat prices rose by 2% in your region",
    timeAgo: "6 hours ago",
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboard() {
  // Future: replace initial state with API-fetched data
  const [user] = useState(MOCK_USER);
  const [weather] = useState(MOCK_WEATHER);
  const [stats] = useState(MOCK_STATS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [barterOffers, setBarterOffers] = useState(MOCK_BARTER_OFFERS);
  const [activity] = useState(MOCK_ACTIVITY);

  const newBarterCount = barterOffers.length;

  /**
   * Review / decline a barter offer.
   * Replace with API call when backend is ready.
   */
  const reviewOffer = (id) => {
    // TODO: navigate to offer detail page or open modal
    console.log("Reviewing offer", id);
  };

  const declineOffer = (id) => {
    // TODO: call DELETE /barter-offers/:id
    setBarterOffers((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    user,
    weather,
    stats,
    products,
    barterOffers,
    newBarterCount,
    activity,
    reviewOffer,
    declineOffer,
  };
}
