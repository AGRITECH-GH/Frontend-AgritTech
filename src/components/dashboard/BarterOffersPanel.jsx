import { ArrowLeftRight } from "lucide-react";

/**
 * BarterOffersPanel – shows incoming barter offers with Review / Decline actions.
 *
 * @param {{ offers: Array, newCount: number, onReview: (id) => void, onDecline: (id) => void }} props
 */
const BarterOffersPanel = ({ offers, newCount, onReview, onDecline }) => (
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
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="rounded-xl border border-border/60 bg-surface p-4"
        >
          {/* Category + time */}
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {offer.category}
            </span>
            <span className="text-xs text-muted">{offer.timeAgo}</span>
          </div>

          {/* Description */}
          <p className="mb-3 text-sm text-foreground/80">{offer.description}</p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReview(offer.id)}
              className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => onDecline(offer.id)}
              className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface"
            >
              Decline
            </button>
          </div>
        </div>
      ))}

      {offers.length === 0 && (
        <p className="text-center text-sm text-muted py-4">
          No pending offers.
        </p>
      )}
    </div>
  </div>
);

export default BarterOffersPanel;
