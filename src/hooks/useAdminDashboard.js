import { useEffect, useMemo, useState } from "react";
import { adminService, listingsService } from "@/lib";

// ---------------------------------------------------------------------------
// Mock data – replace with API calls when backend is ready
// ---------------------------------------------------------------------------

const DEFAULT_ADMIN = {
  name: "Super Admin",
  email: "admin@agrimarket.io",
  avatarUrl: null,
};

const DEFAULT_STATS = [
  {
    id: "users",
    label: "Total Users",
    value: "0",
    icon: "users",
    trend: null,
    trendType: null,
  },
  {
    id: "listings",
    label: "Active Listings",
    value: "0",
    icon: "tag",
    trend: null,
    trendType: null,
  },
  {
    id: "revenue",
    label: "Platform Revenue",
    value: "₵0.00",
    icon: "dollar",
    trend: null,
    trendType: null,
  },
];

const toNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const formatInteger = (value) => toNumber(value).toLocaleString();
const formatCurrency = (value) =>
  `₵${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const normalizeStatsPayload = (response) => {
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

const DEFAULT_CHART_DATA = [
  { day: "Mon", current: 0, previous: 0 },
  { day: "Tue", current: 0, previous: 0 },
  { day: "Wed", current: 0, previous: 0 },
  { day: "Thu", current: 0, previous: 0 },
  { day: "Fri", current: 0, previous: 0 },
  { day: "Sat", current: 0, previous: 0 },
  { day: "Sun", current: 0, previous: 0 },
];

const DEFAULT_REGIONAL_FOCUS = {
  badge: "REGIONAL FOCUS",
  title: "No regional listing activity yet",
  description:
    "Regional insights will appear after listings include location data.",
  imageUrl: null,
};

const extractUsers = (response) => {
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

const normalizeUser = (user, index) => {
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

const getListingImageUrl = (listing) => {
  const firstImage = Array.isArray(listing?.images) ? listing.images[0] : null;

  if (typeof firstImage === "string") return firstImage;
  if (firstImage?.url) return firstImage.url;
  if (listing?.imageUrl) return listing.imageUrl;
  if (listing?.image) return listing.image;

  return null;
};

const getWeekStart = (baseDate) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
};

const buildChartDataFromListings = (listings) => {
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

const buildRegionalFocusFromListings = (listings) => {
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

const PAGE_SIZE = 3;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdminDashboard() {
  const [admin] = useState(DEFAULT_ADMIN);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [regionalFocus, setRegionalFocus] = useState(DEFAULT_REGIONAL_FOCUS);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange] = useState("Last 30 Days");

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    let cancelled = false;

    const fetchAdminData = async () => {
      setLoadingStats(true);
      setStatsError(null);

      try {
        const [statsResult, usersResult, listingsResult] =
          await Promise.allSettled([
            adminService.getDashboardStats(),
            adminService.getAllUsers({ page: 1, limit: 200 }),
            listingsService.getListings({ page: 1, limit: 200 }),
          ]);

        if (cancelled) return;

        if (statsResult.status === "fulfilled") {
          setStats(normalizeStatsPayload(statsResult.value));
        } else {
          console.error("Failed to fetch admin stats:", statsResult.reason);
          setStats(DEFAULT_STATS);
        }

        if (usersResult.status === "fulfilled") {
          setUsers(extractUsers(usersResult.value).map(normalizeUser));
        } else {
          console.error("Failed to fetch admin users:", usersResult.reason);
          setUsers([]);
        }

        const listings =
          listingsResult.status === "fulfilled" &&
          Array.isArray(listingsResult.value?.listings)
            ? listingsResult.value.listings
            : [];
        if (listingsResult.status !== "fulfilled") {
          console.error(
            "Failed to fetch listings for admin activity:",
            listingsResult.reason,
          );
        }

        setChartData(buildChartDataFromListings(listings));
        setRegionalFocus(buildRegionalFocusFromListings(listings));

        if (
          statsResult.status !== "fulfilled" &&
          usersResult.status !== "fulfilled" &&
          listingsResult.status !== "fulfilled"
        ) {
          setStatsError("Failed to load admin dashboard data.");
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        if (!cancelled) {
          setStatsError(err.message || "Failed to load admin dashboard data.");
          setStats(DEFAULT_STATS);
          setUsers([]);
          setChartData(DEFAULT_CHART_DATA);
          setRegionalFocus(DEFAULT_REGIONAL_FOCUS);
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    };

    fetchAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
  };

  const onViewUser = (id) => {
    // TODO: navigate to /admin/users/:id
    console.log("View user", id);
  };

  const onGenerateReport = () => {
    // TODO: trigger report generation / download
    console.log("Generate report");
  };

  const onReviewRegion = () => {
    // TODO: navigate to /admin/regions
    console.log("Review region data");
  };

  return {
    admin,
    stats,
    loadingStats,
    statsError,
    chartData,
    regionalFocus,
    paginatedUsers,
    totalUsers,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    dateRange,
    toggleUserStatus,
    onViewUser,
    onGenerateReport,
    onReviewRegion,
  };
}
