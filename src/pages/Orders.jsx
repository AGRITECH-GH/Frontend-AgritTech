import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  AlertCircle,
  ChevronDown,
  Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { paymentsService } from "@/lib";
import { transition } from "@/motionConfig";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";

/* ─── Status helpers ─────────────────────────────────────────────── */
const STATUS_META = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  DISPATCHED: {
    label: "Dispatched",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    dot: "bg-purple-400",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
};

const LIFECYCLE = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED"];

/* What each role can set */
const ALLOWED_TRANSITIONS = {
  FARMER: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
  AGENT: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
  BUYER: ["CANCELLED"], // only while PENDING
  ADMIN: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
};

const getStatusMeta = (status) =>
  STATUS_META[status] || {
    label: status,
    icon: Package,
    color: "text-muted",
    bg: "",
    dot: "bg-gray-300",
  };

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) =>
  `GH₵${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getEntityName = (entity, fallback = "") => {
  if (!entity) return fallback;
  if (typeof entity === "string") return entity;
  return (
    entity.fullName ||
    entity.name ||
    entity.businessName ||
    entity.title ||
    entity.email ||
    fallback
  );
};

const getOrderItems = (order) => {
  const candidates = [
    order?.items,
    order?.orderItems,
    order?.lineItems,
    order?.products,
  ];
  const list = candidates.find(Array.isArray) || [];

  return list.map((item) => {
    const listing = item?.listing || item?.product || item?.productId || {};
    const unitPrice = Number(
      item?.unitPrice ??
        item?.price ??
        listing?.pricePerUnit ??
        listing?.price ??
        0,
    );
    const quantity = Number(item?.quantity ?? item?.qty ?? 1);
    const firstImage = listing?.images?.[0] || item?.images?.[0];
    const image =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url ||
          firstImage?.secure_url ||
          firstImage?.src ||
          listing?.imageUrl ||
          listing?.image ||
          "";

    return {
      id: String(item?._id || item?.id || listing?._id || listing?.id || ""),
      name:
        item?.productName ||
        listing?.title ||
        listing?.name ||
        item?.name ||
        "Product",
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      totalPrice:
        Number(item?.totalPrice ?? item?.subtotal ?? unitPrice * quantity) || 0,
      image,
    };
  });
};

const normalizeOrder = (order) => {
  const items = getOrderItems(order);

  return {
    raw: order,
    id: String(order?._id || order?.id || order?.orderId || ""),
    status: String(
      order?.status || order?.orderStatus || "PENDING",
    ).toUpperCase(),
    createdAt:
      order?.createdAt ||
      order?.created_at ||
      order?.updatedAt ||
      order?.updated_at ||
      null,
    total:
      Number(
        order?.totalPrice ??
          order?.totalAmount ??
          order?.total ??
          order?.amount,
      ) || items.reduce((sum, item) => sum + item.totalPrice, 0),
    paymentMethod:
      order?.paymentMethod ||
      order?.payment?.method ||
      order?.paymentType ||
      "",
    paymentStatus:
      order?.paymentStatus ||
      order?.payment?.status ||
      order?.payment?.state ||
      "",
    deliveryAddress:
      order?.deliveryAddress ||
      order?.shippingAddress ||
      order?.address ||
      order?.delivery?.address ||
      "",
    notes: order?.notes || order?.customerNotes || order?.deliveryNotes || "",
    buyerName:
      getEntityName(order?.buyer) ||
      getEntityName(order?.customer) ||
      order?.buyerName ||
      order?.customerName ||
      "",
    sellerName:
      getEntityName(order?.seller) ||
      getEntityName(order?.farmer) ||
      getEntityName(order?.agent) ||
      order?.sellerName ||
      order?.farmerName ||
      order?.agentName ||
      "",
    items,
  };
};

/* ─── Order Row ──────────────────────────────────────────────────── */
function OrderRow({ order, onUpdateStatus, currentRole, forceOpen = false }) {
  const [open, setOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [statusError, setStatusError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const meta = getStatusMeta(order.status);
  const StatusIcon = meta.icon;
  const orderId = order.id;
  const paymentMethod = String(order.paymentMethod || "").toUpperCase();
  const showPaymentStatus = ["MOMO", "CREDIT"].includes(paymentMethod);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!open || !showPaymentStatus || !orderId) return;

    let active = true;
    const loadPaymentStatus = async () => {
      setPaymentLoading(true);
      try {
        const response = await paymentsService.getPaymentStatus(orderId);
        if (!active) return;
        setPaymentStatus(
          response?.status ||
            response?.payment?.status ||
            response?.paymentStatus ||
            "",
        );
      } catch {
        if (!active) return;
        setPaymentStatus("");
      } finally {
        if (active) {
          setPaymentLoading(false);
        }
      }
    };

    loadPaymentStatus();
    return () => {
      active = false;
    };
  }, [open, orderId, showPaymentStatus]);

  const allowedTransitions = (ALLOWED_TRANSITIONS[currentRole] || []).filter(
    (s) => {
      if (currentRole === "BUYER" && order.status !== "PENDING") return false;
      if (s === order.status) return false;
      return true;
    },
  );

  const handleStatusChange = async (status) => {
    setUpdatingStatus(status);
    setStatusError("");
    try {
      await onUpdateStatus(order.id, status);
    } catch (err) {
      setStatusError(err?.message || "Failed to update status");
    } finally {
      setUpdatingStatus("");
    }
  };

  const items = order.items;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8faf4]"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${meta.bg}`}
        >
          <StatusIcon className={`h-4 w-4 ${meta.color}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            Order #
            {String(order.id || "")
              .slice(-8)
              .toUpperCase()}
          </p>
          <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(order.total)}
          </p>
          <p className="text-xs text-muted">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ChevronDown
          className={`ml-1 hidden h-4 w-4 shrink-0 text-muted transition-transform sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-5 pb-5 pt-4">
              {/* Status lifecycle stepper */}
              {order.status !== "CANCELLED" && (
                <div className="mb-5 flex items-center gap-0">
                  {LIFECYCLE.map((step, idx) => {
                    const stepMeta = getStatusMeta(step);
                    const currentIdx = LIFECYCLE.indexOf(order.status);
                    const done = idx <= currentIdx;
                    const isLast = idx === LIFECYCLE.length - 1;
                    return (
                      <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              done
                                ? "border-primary bg-primary text-white"
                                : "border-border bg-white text-muted"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className={`mt-1 hidden whitespace-nowrap text-[10px] font-medium sm:block ${done ? "text-primary" : "text-muted"}`}
                          >
                            {stepMeta.label}
                          </span>
                        </div>
                        {!isLast && (
                          <div
                            className={`mx-1 h-0.5 flex-1 rounded ${done && idx < currentIdx ? "bg-primary" : "bg-border"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order info */}
              <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted">Payment Method</span>
                  <p className="font-medium text-foreground capitalize">
                    {(order.paymentMethod || "—").toLowerCase()}
                  </p>
                </div>
                {showPaymentStatus && (
                  <div>
                    <span className="text-muted">Payment Status</span>
                    <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Wallet className="h-4 w-4 text-primary" />
                      {paymentLoading
                        ? "Checking..."
                        : paymentStatus || order.paymentStatus || "Pending"}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted">Delivery Address</span>
                  <p className="font-medium text-foreground">
                    {order.deliveryAddress || "—"}
                  </p>
                </div>
                {(order.buyerName || order.sellerName) && (
                  <div>
                    <span className="text-muted">
                      {currentRole === "BUYER" ? "Seller" : "Buyer"}
                    </span>
                    <p className="font-medium text-foreground">
                      {currentRole === "BUYER"
                        ? order.sellerName || "—"
                        : order.buyerName || "—"}
                    </p>
                  </div>
                )}
                {order.notes && (
                  <div className="sm:col-span-2">
                    <span className="text-muted">Notes</span>
                    <p className="font-medium text-foreground">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Items
                  </p>
                  {items.map((item, idx) => {
                    return (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-3"
                      >
                        {item.image ? (
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0f4e5] text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted">
                            Qty: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {statusError && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {statusError}
                </div>
              )}

              {/* Status actions */}
              {allowedTransitions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.map((status) => {
                    const sm = getStatusMeta(status);
                    const isLoading = updatingStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        disabled={!!updatingStatus}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${sm.bg} ${sm.color} hover:opacity-80`}
                      >
                        {isLoading ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sm.dot}`}
                          />
                        )}
                        Mark {sm.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Orders Page ────────────────────────────────────────────────── */
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
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {paymentNotice.message}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-green-200 border-t-green-500" />
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
