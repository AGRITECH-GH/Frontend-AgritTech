import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";
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

const getAllImages = (listing) => {
  const images = listing?.images;
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      if (typeof img === "string") return img;
      return img?.url || img?.secure_url || img?.src || "";
    })
    .filter(Boolean);
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

  const [listing, setListing] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

        // Fetch similar products
        setSimilarLoading(true);
        try {
          const categoryObj =
            extracted?.category || extracted?.categoryName || "";
          const categoryName = getCategoryName(categoryObj);
          const similarRes = await listingsService.getListings({
            category: categoryName || undefined,
            limit: 8,
          });
          const similar = Array.isArray(similarRes?.listings)
            ? similarRes.listings.filter((item) => (item.id || item._id) !== id)
            : [];
          setSimilarProducts(similar.slice(0, 4));
        } catch (err) {
          console.error("Failed to fetch similar products:", err);
        } finally {
          setSimilarLoading(false);
        }
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
      await cartService.addItemToCart({
        listingId: id,
        quantity: Number(quantity) || 1,
      });
      setMessage({ type: "success", text: "Item added to cart successfully." });
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

  const handleProposeBarter = () => {
    navigate("/farmer/proposals");
  };

  const handleMessageSeller = () => {
    setMessage({
      type: "info",
      text: "Messaging is coming soon. You can continue browsing or add this item to cart.",
    });
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
            <div className="grid gap-8 rounded-3xl border border-border/60 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_1fr]">
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
                    {isAddingToCart ? "Adding to Cart..." : "Buy Now"}
                  </Button>

                  <button
                    type="button"
                    onClick={handleProposeBarter}
                    className="w-full h-12 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-[#f5f6f1] transition flex items-center justify-center"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Propose Barter Exchange
                  </button>
                </div>

                {/* Message Display */}
                {message && (
                  <div
                    className={`rounded-lg border p-3 text-sm ${
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
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Seller Information
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {(
                      listing?.farmerName?.[0] ||
                      listing?.sellerName?.[0] ||
                      "S"
                    ).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {listing?.farmerName || listing?.sellerName || "Seller"}
                    </p>
                    <p className="text-xs text-muted">Verified Seller</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-xs text-muted">Rating</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.floor(Math.random() * 500) + 100}
                  </p>
                  <p className="text-xs text-muted">Sales</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleMessageSeller}
                  className="flex-1 h-10 border border-primary text-primary font-semibold rounded-lg hover:bg-[#f5f6f1] transition flex items-center justify-center"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Seller
                </button>
                <button
                  type="button"
                  className="flex-1 h-10 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </button>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
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
                    Harvest Date
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.harvestDate
                      ? formatDate(listing.harvestDate)
                      : listing?.harvest_date
                        ? formatDate(listing.harvest_date)
                        : "-"}
                  </p>
                </div>
                <div className="bg-[#f5f6f1] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Min Order
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {listing?.minOrder || listing?.min_order || "1"}{" "}
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
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {listing?.description || "No description provided by seller."}
              </p>
            </div>

            {/* Similar Products Section */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
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
                    const img =
                      product?.images?.[0]?.url ||
                      product?.image ||
                      "/placeholder.png";
                    const price = product?.price || 0;
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
    </div>
  );
};

export default MarketplaceDetails;
