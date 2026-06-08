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
  Award,
  X,
  DollarSign,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { addGuestCartItem, cartService, listingsService } from "@/lib";
import {
  getPrimaryListingImageUrl,
  getListingImageGalleryUrls,
} from "@/lib/listingImages";
import * as chatService from "@/lib/chatService";
import * as negotiationsService from "@/lib/negotiationsService";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";


const normalizeListing = (response) => {
  if (!response || typeof response !== "object") return null;
  return (
    response.listing || response.data?.listing || response.data || response
  );
};

const getListingImage = (listing) => {
  return getPrimaryListingImageUrl(listing);
};

const getAllImages = (listing) => {
  return getListingImageGalleryUrls(listing);
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [message, setMessage] = useState(null);

  // Negotiation offer modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

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

  const allImages = useMemo(() => getAllImages(listing), [listing]);
  const listingImage = useMemo(
    () => allImages[selectedImageIndex] || getListingImage(listing),
    [allImages, selectedImageIndex, listing],
  );
  const listingPrice = Number(
    listing?.pricePerUnit ?? listing?.price ?? listing?.amount ?? 0,
  );

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
      setMessage({ type: "success", text: "Item added to cart successfully." });
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 4000);
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

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) return;
    setOfferSubmitting(true);
    try {
      await negotiationsService.makeOffer({
        listingId: id,
        offeredPrice: price,
        quantity: offerQty ? parseFloat(offerQty) : undefined,
        note: offerNote.trim() || undefined,
      });
      setOfferSuccess(true);
    } catch {
      setMessage({
        type: "error",
        text: "Failed to submit offer. Please try again.",
      });
      setOfferModalOpen(false);
    } finally {
      setOfferSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f1]">
      <Navbar minimal />
      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
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
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="mb-6 flex items-center gap-2 text-sm">
              <Link
                to="/marketplace"
                className="text-primary hover:underline font-medium"
              >
                Marketplace
              </Link>
              <ChevronRight className="h-4 w-4 text-muted" />
              <Link
                to={`/marketplace?category=${getCategoryName(listing?.category) || getCategoryName(listing?.categoryName)}`}
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
              <div className="space-y-4">
                {/* Main Image */}
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#f0f2ec] aspect-square flex items-center justify-center">
                  {listingImage ? (
                    <img
                      src={listingImage}
                      alt={listing?.title || listing?.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-sm text-muted">
                      No image available
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {getAllImages(listing).length > 1 && (
                  <div className="flex gap-3 overflow-x-auto">
                    {getAllImages(listing).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          selectedImageIndex === idx
                            ? "border-primary"
                            : "border-border/40 hover:border-border/60"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                        setOfferSuccess(false);
                        setOfferPrice("");
                        setOfferQty("");
                        setOfferNote("");
                      }}
                      className="w-full h-12 border-2 border-amber-500 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition flex items-center justify-center"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Make an Offer
                    </button>
                  )}
                </div>

                {/* Cart confirmation banner */}
                {cartAdded && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Added to cart!
                    </div>
                    <Link
                      to="/cart"
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      View Cart
                    </Link>
                  </div>
                )}
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
                <div className="flex gap-3 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Shield className="h-4 w-4 text-green-600" />
                    Escrow Protected
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Award className="h-4 w-4 text-green-600" />
                    Lab Tested
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

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleMessageSeller}
                  disabled={msgStarting}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-primary font-semibold text-primary transition hover:bg-[#f5f6f1] disabled:opacity-60"
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
                    className="flex h-10 flex-1 items-center justify-center rounded-lg bg-green-600 font-semibold text-white transition hover:bg-green-700"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </button>
                )}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Product Specifications
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Available Stock
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.quantityAvailable ?? listing?.quantity ?? "-"}{" "}
                    {listing?.unit || ""}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Min Order
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.minimumOrderQty ||
                      listing?.minOrder ||
                      listing?.min_order ||
                      "1"}{" "}
                    {listing?.unit || ""}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Certification
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.certification || "-"}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Packaging
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.packaging || "-"}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Moisture Content
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.moistureContent || "-"}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Category
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {getCategoryName(listing?.category) ||
                      getCategoryName(listing?.categoryName) ||
                      "-"}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Listed
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {new Date(
                      listing?.createdAt || listing?.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

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
                <div className="text-center text-muted text-sm">
                  Loading similar products...
                </div>
              ) : similarProducts && similarProducts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-4">
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

      {/* Cart toast notification */}
      <AnimatePresence>
        {cartAdded && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:bottom-6 sm:left-auto sm:right-6 sm:px-0 sm:pb-0"
          >
            <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-white px-5 py-4 shadow-2xl w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-sm font-semibold text-foreground">
                  Added to cart!
                </p>
                <p className="text-xs text-muted">Item added successfully.</p>
              </div>
              <Link
                to="/cart"
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                View Cart
              </Link>
              <button
                onClick={() => setCartAdded(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-[#f5f6f1] hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Make Offer Modal ─────────────────────────────────────────── */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Make an Offer
              </h3>
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
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
                  The seller will be notified and can accept, decline, or
                  counter your offer.
                </p>
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
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
                    per {listing?.unit || "unit"}
                  </p>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Your Offer Price (GHS){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={`e.g. ${(listingPrice * 0.9).toFixed(2)}`}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Quantity ({listing?.unit || "unit"})
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
                    onClick={() => setOfferModalOpen(false)}
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
      )}
    </div>
  );
};

export default MarketplaceDetails;
