import { CheckCircle, XCircle, Clock, ArrowLeftRight } from "lucide-react";

/**
 * ProposalCard – renders a barter proposal in one of three states:
 *   "pending"  → orange badge, Cancel + View Details
 *   "accepted" → green border + badge, reactions + Message CTA
 *   "rejected" → red badge, strikethrough items, reject reason + Resubmit
 *
 * @param {{ proposal: object }} props
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
            className={`text-sm font-semibold text-foreground ${strikethrough ? "line-through text-muted" : ""
                }`}
        >
            {name}
        </p>
    </div>
);

const ProposalCard = ({ proposal }) => {
    const { status, user, farm, giveItem, getItem, quote, rejectReason, reactions, messageName } =
        proposal;

    const config = statusConfig[status];
    const isRejected = status === "rejected";
    const isAccepted = status === "accepted";

    return (
        <div
            className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${config.borderClass} ${isAccepted ? "border-2" : ""
                }`}
        >
            {/* Header: user info + status badge */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {user.avatarEmoji ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl">
                            {user.avatarEmoji}
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-base font-bold text-primary">
                            {user.name[0]}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">{user.name}</span>
                            <span className="h-2 w-2 rounded-full bg-green-400" />
                        </div>
                        <p className="text-xs text-muted">{farm}</p>
                    </div>
                </div>
                {config.badge}
            </div>

            {/* Trade items */}
            <div className="mb-4 flex items-center justify-center gap-4 rounded-xl bg-surface px-4 py-4">
                <ItemBox label="I Give" emoji={giveItem.emoji} name={giveItem.name} strikethrough={isRejected} />
                <div className="flex flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                        {isRejected ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                            <ArrowLeftRight className="h-4 w-4 text-primary" />
                        )}
                    </div>
                </div>
                <ItemBox label="I Get" emoji={getItem.emoji} name={getItem.name} strikethrough={isRejected} />
            </div>

            {/* Pending: quote + actions */}
            {status === "pending" && (
                <>
                    {quote && (
                        <p className="mb-4 text-xs italic text-muted">"{quote}"</p>
                    )}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            View Details
                        </button>
                    </div>
                </>
            )}

            {/* Accepted: reactions + message button */}
            {isAccepted && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {reactions?.map((r, i) => (
                            <span
                                key={i}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-sm"
                            >
                                {r}
                            </span>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                    >
                        Message {messageName}
                    </button>
                </div>
            )}

            {/* Rejected: reason + resubmit */}
            {isRejected && (
                <div className="flex items-center justify-between">
                    {rejectReason && (
                        <p className="text-xs text-red-500">Reason: {rejectReason}</p>
                    )}
                    <button
                        type="button"
                        className="ml-auto shrink-0 text-sm font-semibold text-foreground underline underline-offset-2 hover:text-primary"
                    >
                        Resubmit with Offer
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProposalCard;
