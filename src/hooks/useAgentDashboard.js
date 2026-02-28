import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Mock data – swap fetch() calls in place of useState initialisers when ready
// ---------------------------------------------------------------------------

const MOCK_AGENT = {
  name: "Samuel K. Mensah",
  role: "Regional Agent",
  avatarUrl: null,
};

const MOCK_STATS = [
  {
    id: "commission",
    label: "Total Earned Commission",
    value: "$4,852.40",
    icon: "dollar",
    trend: "↑ +12.5% this month",
    trendType: "positive",
  },
  {
    id: "farmers",
    label: "Registered Farmers",
    value: "128",
    icon: "tag",
    trend: "+ 8 new this week",
    trendType: "positive",
  },
  {
    id: "payouts",
    label: "Pending Payouts",
    value: "$320.15",
    icon: "clock",
    trend: "⏱ Processing (ETA 2 days)",
    trendType: "warning",
  },
];

const MOCK_COMMISSION_TIERS = [
  { id: "seed", label: "Seed Sales", rate: "2.5%", icon: "seedling" },
  { id: "equipment", label: "Equipment Hire", rate: "5.0%", icon: "tractor" },
  { id: "grain", label: "Grain Procurement", rate: "1.2%", icon: "box" },
  { id: "insurance", label: "Crop Insurance", rate: "4.0%", icon: "shield" },
];

const MOCK_HUB_ACTIVITY = {
  message:
    "High activity detected in the Northern Sector. More farmers are seeking irrigation equipment.",
  mapCenter: [9.4034, -0.8424], // Tamale, Northern Region, Ghana
  mapZoom: 5,
};

const MOCK_FARMERS = [
  {
    id: 1,
    name: "Amara Okafor",
    registeredDate: "May 12, 2023",
    location: "Enugu North",
    status: "verified",
    lastActivity: "2 hrs ago",
    totalCommission: "$1,240.50",
    avatarUrl: null,
  },
  {
    id: 2,
    name: "John Dlamini",
    registeredDate: "June 05, 2023",
    location: "Western Cape",
    status: "verified",
    lastActivity: "Yesterday",
    totalCommission: "$892.20",
    avatarUrl: null,
  },
  {
    id: 3,
    name: "Fatima Bello",
    registeredDate: "Aug 20, 2023",
    location: "Kano City Hub",
    status: "processing",
    lastActivity: "4 days ago",
    totalCommission: "$145.00",
    avatarUrl: null,
  },
  {
    id: 4,
    name: "Kwame Asante",
    registeredDate: "Jan 15, 2024",
    location: "Accra Region",
    status: "verified",
    lastActivity: "3 hrs ago",
    totalCommission: "$2,102.75",
    avatarUrl: null,
  },
  {
    id: 5,
    name: "Lindiwe Dube",
    registeredDate: "Mar 03, 2024",
    location: "Durban South",
    status: "pending",
    lastActivity: "1 week ago",
    totalCommission: "$0.00",
    avatarUrl: null,
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAgentDashboard() {
  const [agent] = useState(MOCK_AGENT);
  const [stats] = useState(MOCK_STATS);
  const [commissionTiers] = useState(MOCK_COMMISSION_TIERS);
  const [hubActivity] = useState(MOCK_HUB_ACTIVITY);
  const [farmers] = useState(MOCK_FARMERS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFarmers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q),
    );
  }, [farmers, searchQuery]);

  const onRegisterFarmer = () => {
    // TODO: navigate to /agent/register-farmer
    console.log("Register new farmer");
  };

  const onExportData = () => {
    // TODO: trigger CSV/PDF export
    console.log("Export data");
  };

  const onFarmerAction = (farmerId, action) => {
    // TODO: handle farmer row actions (view, edit, remove)
    console.log("Farmer action", farmerId, action);
  };

  return {
    agent,
    stats,
    commissionTiers,
    hubActivity,
    farmers: filteredFarmers,
    searchQuery,
    setSearchQuery,
    onRegisterFarmer,
    onExportData,
    onFarmerAction,
  };
}
