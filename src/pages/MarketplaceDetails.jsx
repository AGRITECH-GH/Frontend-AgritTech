import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageCircle, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cartService, listingsService } from "@/lib";

const normalizeListing = (response) => {
  if (!response || typeof response !== "object") return null;
  return (
    response.listing || response.data?.listing || response.data || response
  );
};

const getListingImage = (listing) => {
  const images = listing?.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return first;
    return first?.url || first?.secure_url || first?.src || "";
  }
  return listing?.imageUrl || listing?.image || "";
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "GH₵0.00";
  return `GH₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const MarketplaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchListing = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listingsService.getListingById(id);
        if (cancelled) return;

        const extracted = normalizeListing(response);
        if (!extracted) {
          setError("Listing not found.");
          setListing(null);
          return;
        }

        setListing(extracted);
      } catch (err) {
        console.error("Failed to fetch listing details:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load listing details.");
          setListing(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const listingImage = useMemo(() => getListingImage(listing), [listing]);
  const listingPrice = Number(
    listing?.pricePerUnit ?? listing?.price ?? listing?.amount ?? 0,
  );

  const handleAddToCart = async () => {
    if (!id) return;
    setIsAddingToCart(true);
    setMessage(null);
    try {
      await cartService.addItemToCart({
        listingId: id,
        quantity: Number(quantity) || 1,
      });
      setMessage({ type: "success", text: "Item added to cart." });
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to add item to cart.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleMessageSeller = () => {
    setMessage({
      type: "info",
      text: "Messaging is coming soon. You can continue browsing or add this item to cart.",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 md:pt-28">
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to marketplace
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted">
            Loading listing details...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : !listing ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <p className="text-base font-medium text-foreground">
              Listing not available.
            </p>
            <Link
              to="/marketplace"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <section className="grid gap-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm md:grid-cols-[1.1fr_1fr] md:p-6">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#f0f2ec]">
              {listingImage ? (
                <img
                  src={listingImage}
                  alt={listing?.title || listing?.name || "Listing image"}
                  className="h-full max-h-[560px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-sm text-muted">
                  No image available
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Marketplace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {listing?.title || listing?.name || "Untitled listing"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {listing?.location || listing?.region || "Ghana"}
              </p>

              <p className="mt-4 text-2xl font-semibold text-foreground">
                {formatCurrency(listingPrice)}
              </p>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
                  <dt className="text-muted">Quantity available</dt>
                  <dd className="font-medium text-foreground">
                    {listing?.quantityAvailable ?? listing?.quantity ?? "-"}{" "}
                    {listing?.unit || ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
                  <dt className="text-muted">Category</dt>
                  <dd className="font-medium text-foreground">
                    {listing?.category || listing?.categoryName || "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
                  <dt className="text-muted">Listed</dt>
                  <dd className="font-medium text-foreground">
                    {new Date(
                      listing?.createdAt || listing?.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 rounded-xl bg-[#f7f8f2] p-3 text-sm text-muted">
                {listing?.description || "No description provided by seller."}
              </p>

              <div className="mt-5 flex items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">
                    Quantity
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="w-24 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none"
                  />
                </label>

                <Button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </Button>

                <button
                  type="button"
                  onClick={handleMessageSeller}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send message
                </button>
              </div>

              {message && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-sm ${
                    message.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : message.type === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MarketplaceDetails;
