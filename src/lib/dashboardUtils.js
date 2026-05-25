import { getPrimaryListingImageUrl } from "@/lib/listingImages";

// ---------------------------------------------------------------------------
// General Utilities
// ---------------------------------------------------------------------------

export const toArray = (value) => (Array.isArray(value) ? value : []);

export const toNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

export const formatInteger = (value) => toNumber(value).toLocaleString();

export const formatCurrency = (value) =>
  `₵${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getIdentifier = (value) =>
  value?.id || value?._id || value?.userId || value?.ownerId || null;

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export const csvEscape = (value) => {
  const normalized = String(value ?? "");
  return `"${normalized.replace(/"/g, '""')}"`;
};

export const triggerCsvDownload = (filename, headers, rows) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const headerRow = headers.map(csvEscape).join(",");
  const bodyRows = rows.map((row) => row.map(csvEscape).join(","));
  const csv = [headerRow, ...bodyRows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// Admin Dashboard
// ---------------------------------------------------------------------------

export const normalizeStatsPayload = (response) => {
  const payload = response?.stats || response?.data?.stats || response || {};

  const totalUsers =
    payload.totalUsers ??
    payload.users ??
    payload.userCount ??
    payload.totalUser;
  const activeListings =
    payload.activeListings ??
    payload.totalListings ??
    payload.listings ??
    payload.listingCount;
  const revenue =
    payload.platformRevenue ??
    payload.revenue ??
    payload.totalRevenue ??
    payload.grossRevenue;

  return [
    {
      id: "users",
      label: "Total Users",
      value: formatInteger(totalUsers),
      icon: "users",
      trend: null,
      trendType: null,
    },
    {
      id: "listings",
      label: "Active Listings",
      value: formatInteger(activeListings),
      icon: "tag",
      trend: null,
      trendType: null,
    },
    {
      id: "revenue",
      label: "Platform Revenue",
      value: formatCurrency(revenue),
      icon: "dollar",
      trend: null,
      trendType: null,
    },
  ];
};

export const extractUsers = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.users,
    response.items,
    response.data?.users,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const normalizeUser = (user, index) => {
  const activeFromIsActive =
    typeof user.isActive === "boolean"
      ? user.isActive
      : typeof user.is_active === "boolean"
        ? user.is_active
        : undefined;
  const activeFromStatus =
    typeof user.status === "string"
      ? user.status.toLowerCase() === "active"
      : undefined;
  const isActive =
    activeFromIsActive !== undefined
      ? activeFromIsActive
      : activeFromStatus !== undefined
        ? activeFromStatus
        : false;

  const joinedAt =
    user.createdAt ||
    user.created_at ||
    user.dateJoined ||
    user.joinedAt ||
    null;
  const dateJoined = joinedAt
    ? new Date(joinedAt).toLocaleDateString()
    : "Unknown";

  return {
    id: user.id || user._id || `user-${index}`,
    name:
      user.fullName ||
      user.full_name ||
      user.name ||
      user.username ||
      "Unknown User",
    email: user.email || "No email",
    role: user.role || "UNKNOWN",
    dateJoined,
    status: isActive ? "active" : "suspended",
  };
};

export const getWeekStart = (baseDate) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
};

export const DEFAULT_CHART_DATA = [
  { day: "Mon", current: 0, previous: 0 },
  { day: "Tue", current: 0, previous: 0 },
  { day: "Wed", current: 0, previous: 0 },
  { day: "Thu", current: 0, previous: 0 },
  { day: "Fri", current: 0, previous: 0 },
  { day: "Sat", current: 0, previous: 0 },
  { day: "Sun", current: 0, previous: 0 },
];

export const buildChartDataFromListings = (listings) => {
  if (!Array.isArray(listings) || listings.length === 0) {
    return DEFAULT_CHART_DATA;
  }

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const current = [0, 0, 0, 0, 0, 0, 0];
  const previous = [0, 0, 0, 0, 0, 0, 0];

  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  listings.forEach((listing) => {
    const createdAt = new Date(
      listing.createdAt ||
        listing.created_at ||
        listing.updatedAt ||
        listing.updated_at ||
        listing.dateCreated ||
        "",
    );

    if (Number.isNaN(createdAt.getTime())) return;

    const normalizedDayIndex = (createdAt.getDay() + 6) % 7;

    if (createdAt >= currentWeekStart) {
      current[normalizedDayIndex] += 1;
      return;
    }

    if (createdAt >= previousWeekStart && createdAt < currentWeekStart) {
      previous[normalizedDayIndex] += 1;
    }
  });

  return labels.map((day, index) => ({
    day,
    current: current[index],
    previous: previous[index],
  }));
};

export const DEFAULT_REGIONAL_FOCUS = {
  badge: "REGIONAL FOCUS",
  title: "No regional listing activity yet",
  description:
    "Regional insights will appear after listings include location data.",
  imageUrl: null,
};

export const getListingImageUrl = (listing) => {
  const firstImage = Array.isArray(listing?.images) ? listing.images[0] : null;

  if (typeof firstImage === "string") return firstImage;
  if (firstImage?.url) return firstImage.url;
  if (listing?.imageUrl) return listing.imageUrl;
  if (listing?.image) return listing.image;

  return null;
};

export const buildRegionalFocusFromListings = (listings) => {
  if (!Array.isArray(listings) || listings.length === 0) {
    return DEFAULT_REGIONAL_FOCUS;
  }

  const locationCounts = listings.reduce((acc, listing) => {
    const location = listing.location?.trim();
    if (!location) return acc;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  const rankedLocations = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1],
  );

  if (rankedLocations.length === 0) {
    return DEFAULT_REGIONAL_FOCUS;
  }

  const [topLocation, topCount] = rankedLocations[0];
  const secondCount = rankedLocations[1]?.[1] || 0;
  const delta = topCount - secondCount;

  const topLocationListing = listings.find(
    (listing) => listing.location?.trim() === topLocation,
  );

  return {
    badge: "REGIONAL FOCUS",
    title: `Top Listing Region: ${topLocation}`,
    description:
      delta > 0
        ? `${topLocation} leads with ${topCount} listings, ${delta} ahead of the next location.`
        : `${topLocation} has ${topCount} listings and is tied with other regions.`,
    imageUrl: getListingImageUrl(topLocationListing),
  };
};

// ---------------------------------------------------------------------------
// Farmer/User Dashboard
// ---------------------------------------------------------------------------

export const isOwnedByUser = (entity, userId) => {
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

export const normalizeListingForDashboard = (listing) => {
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

export const extractBarterOffers = (response) => {
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

// ---------------------------------------------------------------------------
// Agent Dashboard
// ---------------------------------------------------------------------------

export const formatRegistrationDate = () =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const normalizeFarmer = (payload, fallbackData) => {
  const source = payload?.farmer || payload?.data || payload || {};
  const fullName = source.fullName || source.name || fallbackData.fullName;
  const region = source.region || source.location || fallbackData.region;
  const rawStatus = (source.status || "pending").toLowerCase();

  return {
    id: source.id || source._id || `temp-${Date.now()}`,
    name: fullName,
    registeredDate: formatRegistrationDate(),
    location: region,
    status: ["verified", "processing", "pending"].includes(rawStatus)
      ? rawStatus
      : "pending",
    lastActivity: "Just now",
    totalCommission: "₵0.00",
    avatarUrl: source.profilePhotoUrl || source.avatarUrl || null,
  };
};

export const normalizeFarmersList = (payload) => {
  const rawList =
    payload?.farmers ||
    payload?.data?.farmers ||
    payload?.data ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return [];
  }

  return rawList.map((farmer, index) => {
    const source = farmer || {};
    const rawStatus = (source.status || "pending").toLowerCase();

    return {
      id: source.id || source._id || `farmer-${Date.now()}-${index}`,
      name: source.fullName || source.name || "Unknown Farmer",
      registeredDate:
        source.registeredDate ||
        source.createdAt ||
        source.created_on ||
        formatRegistrationDate(),
      location: source.region || source.location || "Unknown Region",
      status: ["verified", "processing", "pending"].includes(rawStatus)
        ? rawStatus
        : "pending",
      lastActivity:
        source.lastActivity ||
        source.updatedAt ||
        source.lastSeen ||
        "Recently active",
      totalCommission: source.totalCommission || "₵0.00",
      avatarUrl: source.profilePhotoUrl || source.avatarUrl || null,
    };
  });
};
