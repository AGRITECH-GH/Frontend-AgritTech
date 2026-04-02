import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";

/**
 * ProposalCard – renders a barter proposal in one of three states:
 *   "pending"  → orange badge, Accept/Reject buttons
 *   "accepted" → green border + badge
 *   "rejected" → red badge, strikethrough items
 *
 * @param {{ proposal: object, updating?: boolean, onStatusChange?: (status) => Promise }} props
 */

const statusConfig = {
  pending: {
    badge: (
      <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-500">
        <Clock className="h-3 w-3" />
        PENDING
      </span>
    ),
    borderClass: "border-border/60",
  },
  accepted: {
    badge: (
      <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
        <CheckCircle className="h-3 w-3" />
        ACCEPTED
      </span>
    ),
    borderClass: "border-primary/40",
  },
  rejected: {
    badge: (
      <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500">
        <XCircle className="h-3 w-3" />
        REJECTED
      </span>
    ),
    borderClass: "border-border/60",
  },
  cancelled: {
    badge: (
      <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        <XCircle className="h-3 w-3" />
        CANCELLED
      </span>
    ),
    borderClass: "border-border/60",
  },
};

const ItemBox = ({ label, emoji, name, strikethrough = false }) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-2xl">
      {emoji}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
      {label}
    </p>
    <p
      className={`text-sm font-semibold text-foreground ${
        strikethrough ? "line-through text-muted" : ""
      }`}
    >
      {name}
    </p>
  </div>
);

const ProposalCard = ({ proposal, updating = false, onStatusChange }) => {
  const {
    id,
    status,
    requesterName,
    requesterAvatar,
    targetListing,
    offeredListing,
    offeredDescription,
    offeredQuantity,
    message,
    canAcceptReject,
    canCancel,
  } = proposal;

  const config = statusConfig[status] || statusConfig.pending;
  const isRejected = status === "rejected";
  const isAccepted = status === "accepted";
  const isPending = status === "pending";

  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (newStatus) => {
    setActionError("");
    if (onStatusChange) {
      const result = await onStatusChange(newStatus);
      if (!result?.success) {
        setActionError(result?.error || "Failed to update status.");
      }
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${config.borderClass} ${
        isAccepted ? "border-2" : ""
      }`}
    >
      {/* Header: user info + status badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {requesterAvatar ? (
            <img
              src={requesterAvatar}
              alt={requesterName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-base font-bold text-primary">
              {requesterName?.[0] || "?"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">
                {requesterName}
              </span>
              <span className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <p className="text-xs text-muted">
              {targetListing?.location || "Location unknown"}
            </p>
          </div>
        </div>
        {config.badge}
      </div>

      {/* Trade items */}
      <div className="mb-4 flex items-center justify-center gap-4 rounded-xl bg-surface px-4 py-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl">
            {offeredListing?.title ? "📦" : "🌾"}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            I Give
          </p>
          <p
            className={`text-sm font-semibold text-foreground ${
              isRejected ? "line-through text-muted" : ""
            }`}
          >
            {offeredListing?.title ||
              `${offeredQuantity}kg ${offeredDescription}`}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            {isRejected ? (
              <XCircle className="h-4 w-4 text-red-400" />
            ) : (
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl">
            {targetListing?.title ? "📦" : "🥬"}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            I Get
          </p>
          <p
            className={`text-sm font-semibold text-foreground ${
              isRejected ? "line-through text-muted" : ""
            }`}
          >
            {targetListing?.title || "Items"}
          </p>
        </div>
      </div>

      {/* Message */}
      {message && <p className="mb-3 text-xs italic text-muted">"{message}"</p>}

      {/* Error message */}
      {actionError && (
        <p className="mb-3 text-xs text-red-600">{actionError}</p>
      )}

      {/* Pending: Accept/Reject buttons */}
      {isPending && canAcceptReject && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleStatusChange("rejected");
            }}
            disabled={updating}
            className="flex-1 rounded-lg border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleStatusChange("accepted");
            }}
            disabled={updating}
            className="flex-1 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                Accepting...
              </>
            ) : (
              "Accept"
            )}
          </button>
        </div>
      )}

      {isPending && canCancel && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleStatusChange("cancelled");
          }}
          disabled={updating}
          className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
        >
          {updating ? (
            <>
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel Request"
          )}
        </button>
      )}

      {/* Accepted: Message button */}
      {isAccepted && (
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Send Message
        </button>
      )}

      {/* Rejected: Resubmit option */}
      {isRejected && (
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="text-sm font-semibold text-foreground underline underline-offset-2 hover:text-primary"
        >
          Resubmit with Different Offer
        </button>
      )}
    </div>
  );
};

export default ProposalCard;
