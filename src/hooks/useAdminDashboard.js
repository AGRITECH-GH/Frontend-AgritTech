import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Mock data – replace with API calls when backend is ready
// ---------------------------------------------------------------------------

const MOCK_ADMIN = {
  name: "Super Admin",
  email: "admin@agrimarket.io",
  avatarUrl: null,
};

const MOCK_STATS = [
  {
    id: "users",
    label: "Total Users",
    value: "12,482",
    icon: "users",
    trend: "↑ +12%",
    trendType: "positive",
  },
  {
    id: "listings",
    label: "Active Listings",
    value: "3,892",
    icon: "tag",
    trend: "↑ +8%",
    trendType: "positive",
  },
  {
    id: "revenue",
    label: "Platform Revenue",
    value: "$54,210.00",
    icon: "dollar",
    trend: "↑ +15.3%",
    trendType: "positive",
  },
];

const MOCK_CHART_DATA = [
  { day: "Mon", current: 42, previous: 30 },
  { day: "Tue", current: 68, previous: 50 },
  { day: "Wed", current: 55, previous: 70 },
  { day: "Thu", current: 90, previous: 60 },
  { day: "Fri", current: 75, previous: 55 },
  { day: "Sat", current: 38, previous: 45 },
  { day: "Sun", current: 25, previous: 35 },
];

const MOCK_REGIONAL_FOCUS = {
  badge: "REGIONAL FOCUS",
  title: "Expanding Northern Region",
  description:
    "Farmer onboarding in the Northern Region has increased by 40% this quarter. Consider allocating more server resources for weekend peak loads.",
  imageUrl:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
};

const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "FARMER",
    dateJoined: "Oct 12, 2023",
    status: "active",
  },
  {
    id: 2,
    name: "Anne Smith",
    email: "anne.s@provider.net",
    role: "BUYER",
    dateJoined: "Oct 14, 2023",
    status: "active",
  },
  {
    id: 3,
    name: "Robert King",
    email: "rking@farmco.com",
    role: "FARMER",
    dateJoined: "Oct 15, 2023",
    status: "suspended",
  },
  {
    id: 4,
    name: "Grace Mensah",
    email: "grace.m@agri.gh",
    role: "AGENT",
    dateJoined: "Nov 01, 2023",
    status: "active",
  },
  {
    id: 5,
    name: "Kwame Adu",
    email: "kwame.adu@farm.gh",
    role: "FARMER",
    dateJoined: "Nov 18, 2023",
    status: "active",
  },
];

const PAGE_SIZE = 3;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdminDashboard() {
  const [admin] = useState(MOCK_ADMIN);
  const [stats] = useState(MOCK_STATS);
  const [chartData] = useState(MOCK_CHART_DATA);
  const [regionalFocus] = useState(MOCK_REGIONAL_FOCUS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange] = useState("Last 30 Days");
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
