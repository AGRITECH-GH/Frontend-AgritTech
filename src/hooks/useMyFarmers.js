import { useEffect, useMemo, useState } from "react";
import { agentsService } from "@/lib";

const formatDateValue = (value) => {
  if (!value) return "Recently";

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

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "₵0.00";
  return `₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeFarmersList = (payload) => {
  const rawList =
    payload?.farmers ||
    payload?.data?.farmers ||
    payload?.data ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((farmer, index) => {
    const source = farmer || {};
    const rawStatus = String(
      source.status || source.verificationStatus || "pending",
    ).toLowerCase();

    return {
      id: source.id || source._id || `farmer-${Date.now()}-${index}`,
      name:
        source.fullName || source.name || source.farmerName || "Unknown Farmer",
      registeredDate: formatDateValue(
        source.registeredDate || source.createdAt || source.created_on,
      ),
      location:
        source.region ||
        source.location ||
        source.assignedRegion ||
        "Unknown Region",
      status: ["verified", "processing", "pending"].includes(rawStatus)
        ? rawStatus
        : "pending",
      lastActivity: formatDateValue(
        source.lastActivity || source.updatedAt || source.lastSeen,
      ),
      totalCommission: formatCurrency(
        source.totalCommission || source.commission || source.commissionEarned,
      ),
      avatarUrl: source.avatarUrl || source.profileImage || null,
      phoneNumber: source.phoneNumber || source.phone || "",
      email: source.email || "",
    };
  });
};

export function useMyFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [farmersLoadError, setFarmersLoadError] = useState("");

  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }

    let cancelled = false;

    const loadFarmers = async () => {
      setLoadingFarmers(true);
      setFarmersLoadError("");

      try {
        const response = await agentsService.getMyFarmers();
        if (cancelled) return;
        setFarmers(normalizeFarmersList(response));
      } catch (err) {
        if (cancelled) return;
        setFarmersLoadError(
          err?.message || "Unable to load your farmers right now.",
        );
      } finally {
        if (!cancelled) {
          setLoadingFarmers(false);
        }
      }
    };

    loadFarmers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFarmers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return farmers;

    return farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(query) ||
        farmer.location.toLowerCase().includes(query) ||
        farmer.status.toLowerCase().includes(query) ||
        farmer.email.toLowerCase().includes(query) ||
        farmer.phoneNumber.toLowerCase().includes(query),
    );
  }, [farmers, searchQuery]);

  return {
    farmers: filteredFarmers,
    totalFarmers: farmers.length,
    searchQuery,
    setSearchQuery,
    loadingFarmers,
    farmersLoadError,
  };
}
