import { X } from "lucide-react";

const getListingTitle = (listing) =>
  listing?.title || listing?.name || listing?.productName || "Not specified";

const getListingQuantity = (listing, fallbackQuantity) => {
  const quantity =
    listing?.quantityAvailable ?? listing?.quantity ?? fallbackQuantity ?? null;
  const unit = listing?.unit || "KG";

  if (
    quantity === null ||
    quantity === undefined ||
    Number.isNaN(Number(quantity))
  ) {
    return "Not specified";
  }

  return `${quantity} ${unit}`;
};

const getListingImage = (listing) => {
  if (!listing) return null;

  const firstImage = Array.isArray(listing.images) ? listing.images[0] : null;
  if (typeof firstImage === "string") return firstImage;
  if (firstImage?.url) return firstImage.url;
  if (listing.imageUrl) return listing.imageUrl;
  if (listing.image) return listing.image;
  return null;
};

const getBarterImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) return null;

  const first = images[0];
  if (typeof first === "string") return first;
  if (first?.imageUrl) return first.imageUrl;
  if (first?.url) return first.url;
  return null;
};

const ItemPreview = ({
  label,
  listing,
  images,
  fallbackQuantity,
  fallbackName,
}) => {
  const imageUrl = getListingImage(listing) || getBarterImage(images);
  const title = listing
    ? getListingTitle(listing)
    : fallbackName || "Not specified";

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
        {label}
      </p>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="mb-3 h-36 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-white text-4xl">
          📦
        </div>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted">
        Quantity: {getListingQuantity(listing, fallbackQuantity)}
      </p>
    </div>
  );
};

const TradeDetailsModal = ({
  isOpen,
  onClose,
  trade,
  canAccept = false,
  canDecline = false,
  onAccept,
  onDecline,
  isSubmitting = false,
  actionError = "",
  previewStatus = "",
}) => {
  if (!isOpen || !trade) return null;

  const {
    requesterName,
    offeredListing,
    offeredImages,
    targetListing,
    offeredDescription,
    offeredQuantity,
    message,
    status,
  } = trade;

  const displayedStatus = (previewStatus || status || "pending").toLowerCase();
  const statusBadgeClass =
    displayedStatus === "accepted"
      ? "border-green-200 bg-green-50 text-green-700"
      : displayedStatus === "rejected" || displayedStatus === "cancelled"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-orange-200 bg-orange-50 text-orange-700";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-[121] w-full max-w-3xl rounded-2xl border border-border/60 bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Trade Details</h2>
            <p className="mt-1 text-sm text-muted">
              Review items, quantity, and request message before taking action.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close details modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground/90">
          <p>
            <span className="font-semibold text-foreground">Requester:</span>{" "}
            {requesterName || "Unknown"}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-foreground">Status:</span>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-all ${statusBadgeClass} ${
                previewStatus ? "animate-pulse" : ""
              }`}
            >
              {displayedStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ItemPreview
            label="Item Offered"
            listing={offeredListing}
            images={offeredImages}
            fallbackQuantity={offeredQuantity}
            fallbackName={offeredDescription}
          />
          <ItemPreview label="Item Requested" listing={targetListing} />
        </div>

        <div className="mt-4 rounded-xl border border-border/60 bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Message
          </p>
          <p className="mt-1 text-sm text-foreground/90">
            {message?.trim() || "No message provided."}
          </p>
        </div>

        {actionError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {(canAccept || canDecline) && (
          <div className="mt-5 flex items-center justify-end gap-3">
            {canDecline && (
              <button
                type="button"
                onClick={onDecline}
                disabled={isSubmitting}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Decline"}
              </button>
            )}
            {canAccept && (
              <button
                type="button"
                onClick={onAccept}
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Accept"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetailsModal;
