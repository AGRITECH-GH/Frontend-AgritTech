import { useEffect, useState } from "react";
import { ChevronDown, Package, AlertCircle } from "lucide-react";
import {
  getStatusMeta,
  formatCurrency,
  formatDate,
  ALLOWED_TRANSITIONS,
} from "@/lib/orderUtils";

export function FarmerOrderTableRow({
  order,
  onUpdateStatus,
  forceOpen = false,
  currentRole,
}) {
  const [open, setOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const meta = getStatusMeta(order.status);
  const allowedTransitions = (ALLOWED_TRANSITIONS[currentRole] || []).filter(
    (status) => status !== order.status,
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

  return (
    <>
      <tr className="border-b border-border/50 align-top">
        <td className="px-4 py-3 text-sm font-semibold text-foreground">
          #
          {String(order.id || "")
            .slice(-8)
            .toUpperCase()}
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          {order.buyerName || "-"}
        </td>
        <td className="px-4 py-3 text-sm text-muted">
          {formatDate(order.createdAt)}
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          {order.items.length}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-foreground">
          {formatCurrency(order.total)}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            {open ? "Hide" : "View"} items
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-border/50 bg-surface/40">
          <td colSpan={7} className="px-4 py-4">
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Items in this order
              </p>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
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
                        Quantity: {item.quantity} @ Unit Price:{" "}
                        {formatCurrency(item.unitPrice)} ={" "}
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {statusError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {statusError}
                </div>
              )}

              {allowedTransitions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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
          </td>
        </tr>
      )}
    </>
  );
}
