import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import * as negotiationsService from "@/lib/negotiationsService";
import { useToast } from "@/context/ToastContext";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "GH₵0.00";
  return `GH₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const MakeOfferModal = ({ isOpen, onClose, listingId, listingPrice, unit }) => {
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) return;
    setOfferSubmitting(true);
    try {
      await negotiationsService.makeOffer({
        listingId,
        offeredPrice: price,
        quantity: offerQty ? parseFloat(offerQty) : undefined,
        note: offerNote.trim() || undefined,
      });
      setOfferSuccess(true);
      toast.success("Offer Sent!", {
        message: "The seller will be notified.",
      });
    } catch (err) {
      toast.error(err.message || "Failed to submit offer. Please try again.");
      onClose();
    } finally {
      setOfferSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Make an Offer</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {offerSuccess ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-foreground">Offer Sent!</p>
            <p className="text-sm text-muted">
              The seller will be notified and can accept, decline, or counter
              your offer.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            <div>
              <p className="text-sm text-muted mb-3">
                Listed at{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(listingPrice)}
                </span>{" "}
                per {unit || "unit"}
              </p>
              <label className="block text-sm font-medium text-foreground mb-1">
                Your Offer Price (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder={`e.g. ${(Number(listingPrice) * 0.9).toFixed(2)}`}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Quantity ({unit || "unit"})
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Note to Seller
              </label>
              <textarea
                rows={3}
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                placeholder="E.g. willing to pay cash on delivery…"
                className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={offerSubmitting || !offerPrice}
                className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {offerSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Submit Offer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
