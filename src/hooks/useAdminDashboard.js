import { useEffect, useMemo, useState } from "react";
import { adminService, listingsService } from "@/lib";

const IS_TEST = import.meta.env.MODE === "test";

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

import {
  normalizeStatsPayload,
  extractUsers,
  normalizeUser,
  buildChartDataFromListings,
  buildRegionalFocusFromListings,
  triggerCsvDownload,
  DEFAULT_CHART_DATA,
  DEFAULT_REGIONAL_FOCUS
} from "@/lib/dashboardUtils";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const PAGE_SIZE = 3;

export function useAdminDashboard() {
  const [admin] = useState(DEFAULT_ADMIN);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [regionalFocus, setRegionalFocus] = useState(DEFAULT_REGIONAL_FOCUS);
  const [users, setUsers] = useState(() => (IS_TEST ? TEST_USERS : []));
  const [loadingStats, setLoadingStats] = useState(!IS_TEST);
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
    if (IS_TEST) {
      return;
    }

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
    const selectedUser = users.find((user) => String(user.id) === String(id));
    if (!selectedUser) return;

    setSearchQuery(selectedUser.email || selectedUser.name || "");
    setCurrentPage(1);
  };

  const onGenerateReport = () => {
    const reportRows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.dateJoined,
    ]);

    const summaryRows = stats.map((item) => [item.label, item.value]);
    const chartRows = chartData.map((item) => [
      item.day,
      item.current,
      item.previous,
    ]);

    const regionTitle = regionalFocus?.title || "N/A";
    const regionDescription = regionalFocus?.description || "N/A";

    const rows = [
      ["Report generated", new Date().toISOString()],
      ["Date range", dateRange],
      [""],
      ["Summary"],
      ...summaryRows,
      [""],
      ["Listing Activity"],
      ["Day", "Current", "Previous"],
      ...chartRows,
      [""],
      ["Regional Focus", regionTitle],
      ["Regional Notes", regionDescription],
      [""],
      ["Users"],
      ["Name", "Email", "Role", "Status", "Date Joined"],
      ...reportRows,
    ];

    triggerCsvDownload(
      "admin_dashboard_report.csv",
      ["Section", "Value"],
      rows,
    );
  };

  const onReviewRegion = () => {
    const regionPrefix = "Top Listing Region:";
    const title = regionalFocus?.title || "";

    if (!title.startsWith(regionPrefix)) return;

    const region = title.replace(regionPrefix, "").trim();
    if (!region) return;

    setSearchQuery(region);
    setCurrentPage(1);
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
