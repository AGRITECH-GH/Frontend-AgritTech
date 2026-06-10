import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  RefreshCw,
  MapPin,
  CheckCircle2,
  Gift,
  Eye,
  Shield,
  X,
  DollarSign,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoMeta from "@/components/SeoMeta";
import { Button } from "@/components/ui/button";
import MarketplaceDetailsSkeleton from "@/components/ui/MarketplaceDetailsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { addGuestCartItem, cartService, listingsService } from "@/lib";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";
import * as chatService from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";

import { useToast } from "@/context/ToastContext";
import { ProductGallery } from "@/components/marketplace/ProductGallery";
import { MakeOfferModal } from "@/components/proposals/MakeOfferModal";

const normalizeListing = (response) => {
  if (!response || typeof response !== "object") return null;
  return (
    response.listing || response.data?.listing || response.data || response
  );
};

const getListingImage = (listing) => {
  return getPrimaryListingImageUrl(listing);
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "GH₵0.00";
  return `GH₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category.name) return category.name;
  return "";
};

const hasMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const getListingId = (item) => String(item?.id || item?._id || "").trim();

const MarketplaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const toast = useToast();

  // Negotiation offer modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  // Messaging
  const [msgStarting, setMsgStarting] = useState(false);

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

        // Fetch similar products by category ID
        setSimilarLoading(true);
        try {
          const categoryObj =
            extracted?.category || extracted?.categoryName || {};
          const categoryId =
            (typeof categoryObj === "object" && categoryObj?.id) ||
            (typeof categoryObj === "string" && categoryObj) ||
            extracted?.categoryId ||
            "";



          if (categoryId) {
            const similarRes = await listingsService.getListings({
              category: categoryId,
              limit: 8,
            });
            const similar = Array.isArray(similarRes?.listings)
              ? similarRes.listings.filter(
                  (item) => (item.id || item._id) !== id,
                )
              : [];
            setSimilarProducts(similar.slice(0, 4));
          } else {
            setSimilarProducts([]);
          }
        } catch (err) {
          logger.error("Failed to fetch similar products:", err);
        } finally {
          setSimilarLoading(false);
        }
      } catch (err) {
        logger.error("Failed to fetch listing details:", err);
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
  const listingPrice = Number(
    listing?.pricePerUnit ?? listing?.price ?? listing?.amount ?? 0,
  );
  const listingTitle = listing?.title || listing?.name || "Product";
  const listingDescription =
    listing?.description ||
    `View ${listingTitle} details, pricing, and seller information on FarmBridge.`;
  const listingCategory =
    getCategoryName(listing?.category) ||
    getCategoryName(listing?.categoryName);
  const listingSpecifications = useMemo(() => {
    if (!listing) return [];

    const stockValue = Number(listing?.quantityAvailable ?? listing?.quantity);
    const minimumOrderValue = Number(
      listing?.minimumOrderQty ?? listing?.minOrder ?? listing?.min_order,
    );
    const categoryName =
      getCategoryName(listing?.category) ||
      getCategoryName(listing?.categoryName);

    const specs = [
      Number.isFinite(stockValue) && stockValue > 0
        ? {
            label: "Available Stock",
            value: `${stockValue} ${listing?.unit || ""}`.trim(),
          }
        : null,
      Number.isFinite(minimumOrderValue) && minimumOrderValue > 0
        ? {
            label: "Min Order",
            value: `${minimumOrderValue} ${listing?.unit || ""}`.trim(),
          }
        : null,
      hasMeaningfulValue(listing?.harvestDate)
        ? { label: "Harvest Date", value: formatDate(listing.harvestDate) }
        : null,
      hasMeaningfulValue(categoryName)
        ? { label: "Category", value: categoryName }
        : null,
      hasMeaningfulValue(listing?.location || listing?.region)
        ? {
            label: "Storage Location",
            value: listing.location || listing.region,
          }
        : null,
      hasMeaningfulValue(listing?.createdAt || listing?.created_at)
        ? {
            label: "Listed Date",
            value: formatDate(listing?.createdAt || listing?.created_at),
          }
        : null,
    ];

    return specs.filter((item) => item && hasMeaningfulValue(item.value));
  }, [listing]);
  const productJsonLd = useMemo(() => {
    if (!listing) return null;

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const listingUrl = origin && id ? `${origin}/marketplace/${id}` : undefined;
    const imageUrl = getListingImage(listing);
    const numericPrice = Number(
      listing?.pricePerUnit ?? listing?.price ?? listing?.amount,
    );

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: listingTitle,
      description: listingDescription,
      ...(imageUrl ? { image: [imageUrl] } : {}),
      ...(listingCategory ? { category: listingCategory } : {}),
      ...(listingUrl ? { url: listingUrl } : {}),
      ...(Number.isFinite(numericPrice)
        ? {
            offers: {
              "@type": "Offer",
              priceCurrency: "GHS",
              price: numericPrice,
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
    };
  }, [listing, id, listingTitle, listingDescription, listingCategory]);

  const handleAddToCart = async () => {
    if (!id) return;
    setIsAddingToCart(true);
    setMessage(null);
    try {
      if (!user) {
        addGuestCartItem(id, Number(quantity) || 1, listing);
      } else {
        await cartService.addItemToCart({
          listingId: id,
          quantity: Number(quantity) || 1,
        });
      }
      toast.success("Added to cart!", {
        message: "Item added successfully.",
        action: {
          label: "View Cart",
          href: "/cart",
          icon: <ShoppingCart className="h-3.5 w-3.5" />,
        },
      });
    } catch (err) {
      logger.error("Failed to add item to cart:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to add item to cart.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProposeBarter = () => {
    navigate("/farmer/proposals");
  };

  const handleMessageSeller = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!listing?.seller?.id) return;
    setMsgStarting(true);
    try {
      const conv = await chatService.getOrCreateConversation(
        listing.seller.id,
        id,
      );
      navigate(`/messages/${conv.id}`);
    } catch {
      setMessage({
        type: "error",
        text: "Could not open conversation. Please try again.",
      });
    } finally {
      setMsgStarting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f1]">
      <SeoMeta
        title={`${listingTitle} | FarmBridge Ghana`}
        description={listingDescription}
        canonicalPath={id ? `/marketplace/${id}` : "/"}
        jsonLd={productJsonLd}
      />
      <Navbar minimal />
      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {loading ? (
          <MarketplaceDetailsSkeleton />
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
              to="/"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
              <Link
                to="/"
                className="text-primary hover:underline font-medium shrink-0"
              >
                Marketplace
              </Link>
              <ChevronRight className="h-4 w-4 text-muted shrink-0" />
              <Link
                to={`/?category=${getCategoryName(listing?.category) || getCategoryName(listing?.categoryName)}`}
                className="text-primary hover:underline font-medium"
              >
                {getCategoryName(listing?.category) ||
                  getCategoryName(listing?.categoryName) ||
                  "Products"}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted" />
              <span className="text-foreground font-medium">
                {listing?.title || listing?.name || "Product"}
              </span>
            </nav>

            {/* Main Grid: Image Gallery + Product Info */}
            <div className="grid gap-6 rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-6 md:grid-cols-[1.2fr_1fr]">
              {/* Left: Image Gallery */}
              <ProductGallery listing={listing} />

              {/* Right: Product Info */}
              <div className="space-y-6">
                {/* Badge + Title + Location */}
                <div>
                  <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-2">
                    <CheckCircle2 className="inline mr-1 h-3 w-3" />
                    Verified Organic
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mt-3">
                    {listing?.title || listing?.name || "Untitled"}
                  </h1>
                  <div className="flex items-center gap-1 text-sm text-muted mt-2">
                    <MapPin className="h-4 w-4" />
                    {listing?.location || listing?.region || "Ghana"}
                  </div>
                </div>

                {/* Price Box */}
                <div className="rounded-xl border border-border/40 bg-[#f9faf7] p-4">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">
                    Price
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatCurrency(listingPrice)}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    per {listing?.unit || "unit"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eef5e5] px-2 py-0.5 text-[11px] font-medium text-[#365b2b]">
                      MOQ{" "}
                      {listing?.minimumOrderQty ||
                        listing?.minOrder ||
                        listing?.min_order ||
                        1}{" "}
                      {listing?.unit || "unit"}
                    </span>
                    {listing?.negotiable && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Price Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setQuantity(Math.max(1, Number(quantity) - 1))
                      }
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-[#f5f6f1] transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-20 text-center rounded-lg border border-border px-2 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => setQuantity(Number(quantity) + 1)}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-[#f5f6f1] transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                  </Button>

                  <button
                    type="button"
                    onClick={handleProposeBarter}
                    className="w-full h-12 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-[#f5f6f1] transition flex items-center justify-center"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Propose Barter Exchange
                  </button>

                  {listing?.negotiable && listing?.seller?.id !== user?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfferModalOpen(true);
                      }}
                      className="w-full h-12 border-2 border-amber-500 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition flex items-center justify-center"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Make an Offer
                    </button>
                  )}
                </div>

                {message && message.type !== "success" && (
                  <div
                    className={`rounded-lg border p-3 text-sm ${
                      message.type === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex flex-col gap-3 sm:flex-row pt-4 border-t border-border/40">
                  <div className="flex flex-1 items-center gap-2 text-xs text-muted">
                    <Shield className="h-4 w-4 text-green-600 shrink-0" />
                    Escrow Protected
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">
                Seller Information
              </h2>

              {/* Identity row */}
              <div className="flex items-center gap-4">
                {listing?.seller?.profilePhotoUrl ? (
                  <img
                    src={listing.seller.profilePhotoUrl}
                    alt={listing.seller.fullName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xl font-bold text-white">
                    {(listing?.seller?.fullName?.[0] || "S").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">
                    {listing?.seller?.fullName || "Seller"}
                  </p>
                  {listing?.seller?.email && (
                    <p className="truncate text-xs text-muted">
                      {listing.seller.email}
                    </p>
                  )}
                  {(listing?.location || listing?.region) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {listing.location || listing.region}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleMessageSeller}
                  disabled={msgStarting}
                  className="flex h-10 w-full sm:flex-1 items-center justify-center rounded-lg border border-primary font-semibold text-primary transition hover:bg-[#f5f6f1] disabled:opacity-60"
                >
                  {msgStarting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 h-4 w-4" />
                  )}
                  Contact Seller
                </button>
                {listing?.seller?.id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${listing.seller.id}`)}
                    className="flex h-10 w-full sm:flex-1 items-center justify-center rounded-lg bg-green-600 font-semibold text-white transition hover:bg-green-700"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </button>
                )}
              </div>
            </div>

            {/* Specifications Section */}
            {listingSpecifications.length > 0 && (
              <div className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Product Specifications
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {listingSpecifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="bg-[#f5f6f1] rounded-lg p-3"
                    >
                      <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                        {spec.label}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-1">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {listing?.description || "No description provided by seller."}
              </p>
            </div>

            {/* Similar Products Section */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Similar Commodities
              </h2>
              {similarLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-lg border border-border/40"
                    >
                      <Skeleton className="aspect-square w-full" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4 rounded-full" />
                        <Skeleton className="h-3 w-1/2 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : similarProducts && similarProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {similarProducts.slice(0, 4).map((product) => {
                    const img = getListingImage(product) || "/placeholder.png";
                    const price = product?.pricePerUnit ?? product?.price ?? 0;
                    const title = product?.title || product?.name || "Product";
                    const location =
                      product?.location || product?.region || "Ghana";
                    return (
                      <Link
                        key={getListingId(product)}
                        to={`/marketplace/${getListingId(product)}`}
                        className="group rounded-lg border border-border/40 overflow-hidden hover:shadow-md transition"
                      >
                        <div className="aspect-square bg-[#f0f2ec] overflow-hidden">
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {title}
                          </p>
                          <p className="text-xs text-muted mt-1">{location}</p>
                          <p className="font-bold text-sm text-primary mt-2">
                            {formatCurrency(price)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted text-sm">
                  No similar products found.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* ── Make Offer Modal ─────────────────────────────────────────── */}
      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        listingId={id}
        listingPrice={listingPrice}
        unit={listing?.unit}
      />
    </div>
  );
};

export default MarketplaceDetails;
