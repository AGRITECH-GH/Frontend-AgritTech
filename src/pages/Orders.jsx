import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  Package,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { OrdersFarmerSkeleton } from "@/components/ui/OrdersSkeleton";
import { paymentsService } from "@/lib";
import { transition } from "@/motionConfig";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { OrderRow } from "@/components/orders/OrderRow";
import { FarmerOrderTableRow } from "@/components/orders/FarmerOrderTableRow";
import {
  getStatusMeta,
  formatDate,
  formatCurrency,
  normalizeOrder,
  LIFECYCLE,
  ALLOWED_TRANSITIONS,
  STATUS_META,
} from "@/lib/orderUtils";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function Orders() {
  const { id: routeOrderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { orders, loading, error, fetchOrders, updateStatus, getOrderById } =
    useOrders();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState({ type: "", message: "" });

  const currentRole = String(user?.role || "BUYER").toUpperCase();

  useEffect(() => {
    if (!routeOrderId) {
      setSelectedOrder(null);
      return;
    }

    let active = true;
    const loadOrder = async () => {
      try {
        const response = await getOrderById(routeOrderId);
        if (!active) return;
        setSelectedOrder(
          normalizeOrder(response?.order || response?.data?.order || {}),
        );
      } catch {
        if (!active) return;
        setSelectedOrder(null);
      }
    };

    loadOrder();
    return () => {
      active = false;
    };
  }, [getOrderById, routeOrderId]);

  useEffect(() => {
    const presetStatus = searchParams.get("status");
    if (currentRole !== "FARMER") return;

    if (!presetStatus) {
      setStatusFilter("");
      return;
    }

    const upperPreset = presetStatus.toUpperCase();
    const allowedStatuses = STATUS_FILTERS.map((f) => f.value);
    if (allowedStatuses.includes(upperPreset)) {
      setStatusFilter(upperPreset);
    }
  }, [currentRole, searchParams]);

  useEffect(() => {
    const urlReference = searchParams.get("reference");
    const storedReference = sessionStorage.getItem("pendingPaymentReference");
    const reference = urlReference || storedReference;

    if (!reference || currentRole !== "BUYER") return;

    let active = true;
    const verify = async () => {
      try {
        const response = await paymentsService.verifyPayment(reference);
        if (!active) return;

        setPaymentNotice({
          type: response?.status === "SUCCESS" ? "success" : "error",
          message: response?.message || "Payment verification completed.",
        });
        sessionStorage.removeItem("pendingPaymentReference");
        await fetchOrders();
        if (!active) return;

        if (urlReference) {
          searchParams.delete("reference");
          setSearchParams(searchParams, { replace: true });
        }
      } catch (err) {
        if (!active) return;
        setPaymentNotice({
          type: "error",
          message: err?.message || "Failed to verify payment.",
        });
      }
    };

    verify();
    return () => {
      active = false;
    };
  }, [currentRole, fetchOrders, searchParams, setSearchParams]);

  const filteredOrders = useMemo(() => {
    const source = routeOrderId
      ? [
          selectedOrder || orders.find((order) => order.id === routeOrderId),
        ].filter(Boolean)
      : orders;

    if (!statusFilter) return source;
    return source.filter((o) => o?.status === statusFilter);
  }, [orders, routeOrderId, selectedOrder, statusFilter]);

  const handleUpdateStatus = useCallback(
    async (id, status) => {
      await updateStatus(id, status);
    },
    [updateStatus],
  );

  const navbarUser = {
    name: user?.fullName || user?.name || "Farmer",
    avatarUrl: user?.profilePhotoUrl || user?.avatarUrl || null,
  };

  if (currentRole === "FARMER") {
    return (
      <div className="flex min-h-screen flex-col bg-surface text-foreground">
        <DashboardNavbar user={navbarUser} showSearch={false} />
        <main className="container flex-1 py-6 lg:py-8">
          <section className="mb-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Farmer Orders Dashboard
                </h1>
                <p className="text-sm text-muted">
                  Clear outline of your incoming orders and the items in each
                  order.
                </p>
              </div>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
                {orders.length} total
              </span>
            </div>
          </section>

          <div className="mb-5 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  const next = new URLSearchParams(searchParams);
                  if (f.value) {
                    next.set("status", f.value);
                  } else {
                    next.delete("status");
                  }
                  setSearchParams(next, { replace: true });
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-border bg-surface/60">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Order
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Buyer
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Items
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, idx) => (
                    <tr key={`farmer-orders-skeleton-${idx}`}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-14" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-16 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-white py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-foreground">
                No orders found
              </h3>
              <p className="mt-2 text-sm text-muted">
                {statusFilter
                  ? `No ${STATUS_META[statusFilter]?.label?.toLowerCase()} orders.`
                  : "You have no orders yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-border bg-surface/60">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Order
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Buyer
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Items
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <FarmerOrderTableRow
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      currentRole={currentRole}
                      forceOpen={routeOrderId === order.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 overflow-hidden rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  My Orders
                </h1>
                <p className="text-sm text-muted">
                  {currentRole === "BUYER"
                    ? "Track and manage your orders"
                    : "Orders for your listings"}
                </p>
              </div>
            </div>
            {currentRole === "BUYER" && (
              <Link to="/marketplace">
                <Button size="sm">
                  Shop More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </motion.section>

        {/* Status filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {f.label}
              {f.value === "" && orders.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {paymentNotice.message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
              paymentNotice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {paymentNotice.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span className="flex-1">{paymentNotice.message}</span>
            <button
              type="button"
              onClick={() => setPaymentNotice({ type: "", message: "" })}
              className="ml-auto shrink-0 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Items
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, idx) => (
                  <tr key={`buyer-orders-skeleton-${idx}`}>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-3xl border border-border/60 bg-white py-16 text-center"
          >
            <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-foreground">
              No orders found
            </h3>
            <p className="mt-2 text-sm text-muted">
              {statusFilter
                ? `No ${STATUS_META[statusFilter]?.label?.toLowerCase()} orders.`
                : "You have no orders yet."}
            </p>
            {currentRole === "BUYER" && (
              <Link to="/marketplace" className="mt-5">
                <Button size="sm">Browse Marketplace</Button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Order list */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                currentRole={currentRole}
                forceOpen={routeOrderId === order.id}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
