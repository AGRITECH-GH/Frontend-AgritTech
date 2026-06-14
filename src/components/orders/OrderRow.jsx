import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wallet, CheckCircle2, Package, AlertCircle } from "lucide-react";
import { paymentsService } from "@/lib";
import { transition } from "@/motionConfig";
import {
  getStatusMeta,
  formatDate,
  formatCurrency,
  LIFECYCLE,
  ALLOWED_TRANSITIONS,
} from "@/lib/orderUtils";

export function OrderRow({ order, onUpdateStatus, currentRole, forceOpen = false }) {
  const [open, setOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [statusError, setStatusError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const meta = getStatusMeta(order.status);
  const StatusIcon = meta.icon;
  const orderId = order.id;
  const paymentMethod = String(order.paymentMethod || "").toUpperCase();
  const showPaymentStatus = ["PAY_ONLINE"].includes(paymentMethod);

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

  const items = order.items ?? [];

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
                <div className="flex flex-col gap-1">
                  <span className="text-muted">Payment Method</span>
                  <p className="font-medium text-foreground capitalize">
                    {(order.paymentMethod || "—").replace(/_/g, " ").toLowerCase()}
                  </p>
                </div>
                {showPaymentStatus && (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Payment Status</span>
                    <p className="inline-flex items-center gap-1.5 font-medium text-foreground capitalize">
                      <Wallet className="h-4 w-4 text-primary" />
                      {paymentLoading
                        ? "Checking..."
                        : (paymentStatus || order.paymentStatus || "Pending").toLowerCase()}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-muted">Delivery Address</span>
                  <p className="font-medium text-foreground">
                    {order.deliveryAddress || "—"}
                  </p>
                </div>
                {(order.buyerName || order.sellerName) && (
                  <div className="flex flex-col gap-1">
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

              {currentRole === "BUYER" && order.status === "DELIVERED" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/reviews/new?orderId=${order.id}`}
                    className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface"
                  >
                    Leave Review
                  </Link>
                  <Link
                    to={`/disputes/new?orderId=${order.id}`}
                    className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Open Dispute
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
