import { useEffect, useMemo, useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listingsService } from "@/lib";
import AdminLayout from "@/components/admin/AdminLayout";

const getListingImageUrl = (listing) => {
  const firstImage = Array.isArray(listing?.images) ? listing.images[0] : null;

  if (typeof firstImage === "string") return firstImage;
  if (firstImage?.url) return firstImage.url;
  if (listing?.imageUrl) return listing.imageUrl;
  if (listing?.image) return listing.image;

  return null;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeListings = (listings) =>
  (Array.isArray(listings) ? listings : []).map((listing, index) => ({
    id: listing.id || listing._id || `listing-${index}`,
    title: listing.title || listing.name || "Untitled Listing",
    category:
      listing.category?.name ||
      listing.categoryName ||
      listing.category ||
      "General",
    listingType: listing.listingType || "SELL",
    location: listing.location || "Unknown",
    pricePerUnit: toNumber(listing.pricePerUnit),
    quantityAvailable:
      listing.quantityAvailable ?? listing.quantity ?? listing.stockLevel ?? 0,
    unit: listing.unit || "KG",
    imageUrl: getListingImageUrl(listing),
  }));

const getPagination = (response, fallbackPage, fallbackLimit, totalItems) => {
  const pagination = response?.pagination || response?.data?.pagination || {};

  const page = toNumber(pagination.page) || fallbackPage;
  const limit = toNumber(pagination.limit) || fallbackLimit;
  const total = toNumber(pagination.total) || totalItems;
  const totalPages =
    toNumber(pagination.totalPages) || Math.max(1, Math.ceil(total / limit));

  return { total, page, limit, totalPages };
};

const AdminListings = () => {
  const { user: authUser } = useAuth();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [listingType, setListingType] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl: authUser?.avatarUrl || authUser?.profileImage || null,
  };

  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category.trim() || undefined,
      listingType: listingType || undefined,
      location: location.trim() || undefined,
      minPrice: minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
      page,
      limit,
    }),
    [search, category, listingType, location, minPrice, maxPrice, page, limit],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listingsService.getListings(queryParams);
        if (cancelled) return;

        const normalized = normalizeListings(response?.listings);
        setListings(normalized);
        setPagination(getPagination(response, page, limit, normalized.length));
      } catch (err) {
        console.error("Failed to load listings:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load listings.");
          setListings([]);
          setPagination({ total: 0, page, limit, totalPages: 1 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, [queryParams, page, limit]);

  const onApplyFilters = () => {
    setPage(1);
  };

  const onClearFilters = () => {
    setSearch("");
    setCategory("");
    setListingType("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    setLimit(20);
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 pl-12 lg:pl-0">
          <h1 className="text-2xl font-bold text-foreground">All Listings</h1>
          <p className="mt-1 text-sm text-muted">
            Browse marketplace listings using API filters and pagination.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center rounded-xl border border-border px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
              />
            </div>

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category ID"
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="">All Listing Types</option>
              <option value="SELL">SELL</option>
              <option value="BARTER">BARTER</option>
              <option value="BOTH">BOTH</option>
            </select>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApplyFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border bg-surface/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Available
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    Loading listings...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-border/50 hover:bg-surface/30"
                  >
                    <td className="px-4 py-3">
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                          📦
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {listing.title}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {listing.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {listing.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {listing.location}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      ₵{listing.pricePerUnit.toFixed(2)} / {listing.unit}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {listing.quantityAvailable} {listing.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing page {pagination.page} of {pagination.totalPages}. Total
            listings: {pagination.total}.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.min(pagination.totalPages || 1, prev + 1),
                )
              }
              disabled={pagination.page >= pagination.totalPages || loading}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminListings;
