import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { barterService, listingsService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

const getIdentifier = (value) =>
  value?.id || value?._id || value?.userId || value?.ownerId || null;

const normalizeId = (value) =>
  value === undefined || value === null ? null : String(value);

const getOwnerId = (listing) => {
  if (!listing) return null;

  return normalizeId(
    getIdentifier(listing.owner) ||
      listing.ownerId ||
      listing.farmerId ||
      listing.sellerId ||
      getIdentifier(listing.farmer) ||
      getIdentifier(listing.seller) ||
      (typeof listing.owner === "string" || typeof listing.owner === "number"
        ? listing.owner
        : null),
  );
};

const getListingId = (listing) => listing?.id || listing?._id || null;
const getListingTitle = (listing) =>
  listing?.title || listing?.name || listing?.productName || "Untitled Listing";

const CreateBarterModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [formStep, setFormStep] = useState(1); // 1: Select listing, 2: Enter barter details
  const [targetListings, setTargetListings] = useState([]);
  const [ownListings, setOwnListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    targetListingId: "",
    offeredListingId: "",
    offeredQuantity: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentUserId = normalizeId(getIdentifier(user));

  const resetModalState = () => {
    setFormStep(1);
    setSelectedListing(null);
    setSearchTerm("");
    setErrors({});
    setSubmitError("");
    setFormData({
      targetListingId: "",
      offeredListingId: "",
      offeredQuantity: "",
      message: "",
    });
  };

  // Fetch available listings
  useEffect(() => {
    if (!isOpen) return;

    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const [allResponse, ownResponse] = await Promise.all([
          listingsService.getListings({ limit: 100 }),
          listingsService.getListings({
            limit: 100,
            ownerId: currentUserId,
            mine: true,
          }),
        ]);

        const all = Array.isArray(allResponse?.listings)
          ? allResponse.listings
          : [];
        const ownFromApi = Array.isArray(ownResponse?.listings)
          ? ownResponse.listings
          : [];

        // Keep only user-owned listings in the offer dropdown.
        const own = ownFromApi.filter(
          (listing) => getOwnerId(listing) === currentUserId,
        );

        const ownIds = new Set(
          own
            .map((listing) => normalizeId(getListingId(listing)))
            .filter(Boolean),
        );

        // Target listings must exclude the current farmer's listings.
        const filteredTargets = all.filter((listing) => {
          const listingId = normalizeId(getListingId(listing));
          const ownerId = getOwnerId(listing);
          const isOwnById = Boolean(listingId && ownIds.has(listingId));
          const isOwnByOwner = Boolean(
            currentUserId && ownerId === currentUserId,
          );
          return !isOwnById && !isOwnByOwner;
        });

        setOwnListings(own);
        setTargetListings(filteredTargets);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setOwnListings([]);
        setTargetListings([]);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, [isOpen, currentUserId]);

  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.targetListingId) {
      newErrors.targetListingId = "Please select a listing to barter for.";
    }

    if (!formData.offeredListingId) {
      newErrors.offeredListingId = "Please select one of your listings.";
    }

    if (!formData.offeredQuantity) {
      newErrors.offeredQuantity = "Quantity is required.";
    }

    if (formData.offeredQuantity && Number(formData.offeredQuantity) <= 0) {
      newErrors.offeredQuantity = "Quantity must be greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        targetListingId: formData.targetListingId,
        offeredListingId: formData.offeredListingId,
        offeredQuantity: Number(formData.offeredQuantity),
        ...(formData.message?.trim()
          ? { message: formData.message.trim() }
          : {}),
      };

      await barterService.createBarterRequest(payload);

      resetModalState();
      await onCreated?.();
      onClose();
    } catch (err) {
      setSubmitError(
        err.message || "Failed to create barter request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filtered listings for search
  const filteredListings = targetListings.filter((listing) => {
    const matchesSearch = getListingTitle(listing)
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-barter-title"
        className="relative z-[101] w-full max-w-2xl rounded-2xl border border-border/60 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-barter-title"
              className="text-lg font-bold text-foreground"
            >
              {formStep === 1 ? "Create Barter Request" : "Specify Your Offer"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {formStep === 1
                ? "Find a listing you'd like to barter for."
                : "Select one of your listings and set your offered quantity."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetModalState();
              onClose();
            }}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Select target listing */}
        {formStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Search for an item to barter for
              </label>
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {loadingListings ? (
              <p className="text-sm text-muted py-4 text-center">
                Loading listings...
              </p>
            ) : filteredListings.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">
                {searchTerm ? "No listings found." : "No listings available."}
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border/40 p-3">
                {filteredListings.map((listing) => (
                  <button
                    key={getListingId(listing)}
                    type="button"
                    onClick={() => {
                      const listingId = getListingId(listing);
                      setFormData((prev) => ({
                        ...prev,
                        targetListingId: listingId,
                      }));
                      setSelectedListing(listing);
                      setFormStep(2);
                    }}
                    className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                      selectedListing?.id === listing.id
                        ? "border border-primary bg-primary/10"
                        : "hover:bg-surface"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {getListingTitle(listing)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {listing.location || "Unknown location"} •{" "}
                      {listing.quantityAvailable ?? listing.quantity ?? 0}{" "}
                      {listing.unit || "KG"}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Enter barter details */}
        {formStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected listing summary */}
            {selectedListing && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-muted">
                  You want to exchange for:
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {selectedListing.title}
                </p>
              </div>
            )}

            {/* Offering listing + quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Listing you are offering
              </label>
              <select
                value={formData.offeredListingId}
                onChange={(e) =>
                  handleInputChange("offeredListingId", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Select one of your listings...</option>
                {ownListings.map((listing) => (
                  <option
                    key={getListingId(listing)}
                    value={getListingId(listing)}
                  >
                    {getListingTitle(listing)} (
                    {listing.quantityAvailable ?? listing.quantity ?? 0}{" "}
                    {listing.unit || "KG"})
                  </option>
                ))}
              </select>
              {errors.offeredListingId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.offeredListingId}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Offered quantity
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter quantity from your offered listing"
                value={formData.offeredQuantity}
                onChange={(e) =>
                  handleInputChange("offeredQuantity", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              {errors.offeredQuantity && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.offeredQuantity}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Message (optional)
              </label>
              <textarea
                placeholder="Add a message to your barter request..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Error */}
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                disabled={submitting}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-70"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  resetModalState();
                  onClose();
                }}
                disabled={submitting}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              >
                {submitting ? "Creating..." : "Send Barter Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateBarterModal;
