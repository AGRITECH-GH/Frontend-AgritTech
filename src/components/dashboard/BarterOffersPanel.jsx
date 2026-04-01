import { ArrowLeftRight } from "lucide-react";

/**
 * BarterOffersPanel – shows incoming barter offers with Review / Decline actions.
 *
 * @param {{ offers: Array, newCount: number, onReview: (offer) => void, onDecline: (id) => void, processingOfferId?: string|null }} props
 */
const BarterOffersPanel = ({
  offers,
  newCount,
  onReview,
  onDecline,
  processingOfferId = null,
}) => (
  <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Barter Offers</h2>
      </div>
      {newCount > 0 && (
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
          {newCount} NEW
        </span>
      )}
    </div>

    {/* Offer cards */}
    <div className="flex flex-col gap-3">
      {(Array.isArray(offers) ? offers : []).map((offer, index) => (
        <div
          key={offer?.id ?? index}
          onClick={() => onReview?.(offer)}
          className="cursor-pointer rounded-xl border border-border/60 bg-surface p-4"
        >
          {(() => {
            const isProcessing = processingOfferId === offer?.id;
            return (
              <>
                {/* Category + time */}
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {offer?.category || "Barter"}
                  </span>
                  <span className="text-xs text-muted">
                    {offer?.timeAgo || "Now"}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-3 text-sm text-foreground/80">
                  {offer?.description || "No description provided."}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onReview?.(offer);
                    }}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isProcessing ? "Processing..." : "Review"}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDecline(offer?.id);
                    }}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Decline
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      ))}

      {(Array.isArray(offers) ? offers : []).length === 0 && (
        <p className="text-center text-sm text-muted py-4">
          No pending offers.
        </p>
      )}
    </div>
  </div>
);

export default BarterOffersPanel;
