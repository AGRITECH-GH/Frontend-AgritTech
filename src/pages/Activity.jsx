import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Repeat,
  ArrowLeft,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersService, barterService } from "@/lib";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Footer from "@/components/Footer";

// ── Activity type config ────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  order: {
    Icon: CheckCircle2,
    iconClass: "text-green-600",
    bgClass: "bg-green-50",
  },
  payment: {
    Icon: CreditCard,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
  },
  barter_pending: {
    Icon: Repeat,
    iconClass: "text-purple-500",
    bgClass: "bg-purple-50",
  },
  barter_accepted: {
    Icon: PackageCheck,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
  barter_rejected: {
    Icon: XCircle,
    iconClass: "text-red-400",
    bgClass: "bg-red-50",
  },
  price: {
    Icon: TrendingUp,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-50",
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "order", label: "Orders" },
  { id: "payment", label: "Payments" },
  { id: "barter", label: "Barter" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const toArray = (value) => (Array.isArray(value) ? value : []);

const extractOrders = (res) =>
  toArray(res?.orders ?? res?.data?.orders ?? res?.data ?? res);

const extractBarter = (res) => {
  if (Array.isArray(res)) return res;
  return toArray(
    res?.barterRequests ??
      res?.barters ??
      res?.requests ??
      res?.items ??
      res?.data?.barterRequests ??
      res?.data?.requests ??
      res?.data ??
      [],
  );
};

const fmt = (iso) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
    raw: d,
  };
};

function buildActivityItems(orders, barterOffers) {
  const items = [];

  orders.forEach((order) => {
    const shortId = (order.id || "").slice(0, 8).toUpperCase();
    const total = `₵${Number(order.totalPrice ?? order.totalAmount ?? 0).toFixed(2)}`;
    items.push({
      id: `order-${order.id}`,
      filterKey: "order",
      configKey: "order",
      title: "Order Confirmed",
      detail: `Order #${shortId} · ${total}`,
      iso: order.createdAt || order.updatedAt || new Date().toISOString(),
    });
  });

  barterOffers.forEach((barter) => {
    const status = (barter.status || "PENDING").toUpperCase();
    const configKey =
      status === "ACCEPTED"
        ? "barter_accepted"
        : status === "REJECTED"
          ? "barter_rejected"
          : "barter_pending";
    const titleMap = {
      ACCEPTED: "Barter Accepted",
      REJECTED: "Barter Declined",
      CANCELLED: "Barter Cancelled",
      PENDING: "Barter Request",
    };
    items.push({
      id: `barter-${barter.id}`,
      filterKey: "barter",
      configKey,
      title: titleMap[status] ?? "Barter Request",
      detail:
        barter.message ||
        barter.offeredDescription ||
        barter.description ||
        "Barter exchange proposal",
      iso: barter.createdAt || barter.updatedAt || new Date().toISOString(),
    });
  });

  return items.sort((a, b) => new Date(b.iso) - new Date(a.iso));
}

// ── Page ────────────────────────────────────────────────────────────────────
const Activity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navbarUser = {
    name: user?.name || user?.fullName || "Farmer",
    avatarUrl: user?.profilePhotoUrl || user?.avatarUrl || null,
  };

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, barterRes] = await Promise.allSettled([
          ordersService.getMyOrders({ limit: 50 }),
          barterService.getBarterRequests({ limit: 50 }),
        ]);

        const orders =
          ordersRes.status === "fulfilled"
            ? extractOrders(ordersRes.value)
            : [];
        const barterOffers =
          barterRes.status === "fulfilled"
            ? extractBarter(barterRes.value)
            : [];

        setItems(buildActivityItems(orders, barterOffers));
      } catch {
        setError("Failed to load activity history.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const filteredItems =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.filterKey === activeFilter);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardNavbar user={navbarUser} />

      <main className="container py-6 lg:py-8">
        {/* ── Back + heading ── */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-1 text-2xl font-bold text-foreground">
          Activity History
        </h1>
        <p className="mb-6 text-sm text-muted">
          All your farm events and transactions, newest first.
        </p>

        {/* ── Filter chips ── */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === f.id
                  ? "bg-primary text-white"
                  : "bg-white text-muted ring-1 ring-border hover:text-foreground"
              }`}
            >
              {f.label}
              {f.id !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {items.filter((i) => i.filterKey === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Activity list ── */}
        <div className="rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-muted">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              No activity found
              {activeFilter !== "all" ? " for this filter" : ""}.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredItems.map((item) => {
                const config =
                  ACTIVITY_CONFIG[item.configKey] ?? ACTIVITY_CONFIG.order;
                const { Icon, iconClass, bgClass } = config;
                const { date, time } = fmt(item.iso);

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-6 py-5"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bgClass}`}
                    >
                      <Icon className={`h-4 w-4 ${iconClass}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {item.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-foreground">
                        {date}
                      </p>
                      <p className="text-xs text-muted">{time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Activity;
