import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { categoriesService, listingsService } from "@/lib";

const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const extractCategories = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.categories,
    response.items,
    response.data?.categories,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
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

const getListingId = (listing) =>
  String(listing?.id || listing?._id || "").trim();

const getListingTitle = (listing) =>
  listing?.title || listing?.name || listing?.productName || "Untitled listing";

const getListingPrice = (listing) => {
  const amount = Number(
    listing?.pricePerUnit ?? listing?.price ?? listing?.amount ?? 0,
  );
  return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "GH₵0.00";
  return `GH₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Marketplace = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const response = await categoriesService.getCategories();
        if (cancelled) return;
        setCategories(extractCategories(response));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listingsService.getListings({
          search: appliedSearch || undefined,
          category: appliedCategory || undefined,
          location: appliedRegion || undefined,
          minPrice: appliedMinPrice || undefined,
          maxPrice: appliedMaxPrice || undefined,
          page,
          limit,
        });

        if (cancelled) return;

        const receivedListings = Array.isArray(response?.listings)
          ? response.listings
          : [];

        const rawPagination =
          response?.pagination || response?.data?.pagination || {};
        const nextPage = Number(rawPagination.page) || page;
        const nextLimit = Number(rawPagination.limit) || limit;
        const total = Number(rawPagination.total) || receivedListings.length;
        const totalPages =
          Number(rawPagination.totalPages) ||
          Math.max(1, Math.ceil(total / Math.max(1, nextLimit)));

        setListings(receivedListings);
        setPagination({
          page: nextPage,
          limit: nextLimit,
          total,
          totalPages,
        });
      } catch (err) {
        console.error("Failed to fetch marketplace listings:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load marketplace listings.");
          setListings([]);
          setPagination({ page, limit, total: 0, totalPages: 1 });
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
  }, [
    appliedSearch,
    appliedCategory,
    appliedRegion,
    appliedMinPrice,
    appliedMaxPrice,
    page,
    limit,
  ]);

  const sortedListings = useMemo(() => {
    const copy = [...listings];

    if (sortBy === "price-asc") {
      copy.sort((a, b) => getListingPrice(a) - getListingPrice(b));
    } else if (sortBy === "price-desc") {
      copy.sort((a, b) => getListingPrice(b) - getListingPrice(a));
    } else {
      copy.sort((a, b) => {
        const timeA = new Date(a?.createdAt || a?.created_at || 0).getTime();
        const timeB = new Date(b?.createdAt || b?.created_at || 0).getTime();
        return timeB - timeA;
      });
    }

    return copy;
  }, [listings, sortBy]);

  const applyFilters = () => {
    setAppliedSearch(search.trim());
    setAppliedCategory(category);
    setAppliedRegion(region);
    setAppliedMinPrice(minPrice.trim());
    setAppliedMaxPrice(maxPrice.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setRegion("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");

    setAppliedSearch("");
    setAppliedCategory("");
    setAppliedRegion("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="pb-12 pt-24 md:pt-28">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,_#eef6e3_0%,_#f8faf4_45%,_#ffffff_100%)] p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Buyer Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Fresh Produce and Farm Goods
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
              Browse verified listings, compare offers, and buy directly from
              trusted farmers.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
          <aside className="h-fit rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Filters
              </h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">
                  Search
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tomatoes, yam, maize"
                    className="w-full rounded-xl border border-border px-3 py-2 pl-9 text-sm focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((item, idx) => (
                    <option
                      key={String(item?.id || item?._id || idx)}
                      value={item?.name || ""}
                    >
                      {item?.name || "Unknown"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">
                  Region
                </span>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All regions</option>
                  {GHANA_REGIONS.map((regionOption) => (
                    <option key={regionOption} value={regionOption}>
                      {regionOption}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">
                    Min (GH₵)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">
                    Max (GH₵)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none"
                  />
                </label>
              </div>

              <Button type="button" className="w-full" onClick={applyFilters}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </aside>

          <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {pagination.total} result{pagination.total === 1 ? "" : "s"}
              </p>
              <label className="flex items-center gap-2 text-sm text-muted">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
                Loading marketplace listings...
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-base font-medium text-foreground">
                  No products match your filters.
                </p>
                <p className="mt-1 text-sm text-muted">
                  Try widening your price range or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sortedListings.map((listing) => {
                  const listingId = getListingId(listing);
                  const imageUrl = getListingImage(listing);
                  const title = getListingTitle(listing);
                  const price = getListingPrice(listing);

                  return (
                    <article
                      key={listingId || Math.random()}
                      className="group overflow-hidden rounded-2xl border border-border/70 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/marketplace/${listingId}`)}
                        className="w-full text-left"
                      >
                        <div className="h-52 bg-[#f0f2ec]">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted">
                              No image available
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                            {title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-muted">
                            {listing?.location || listing?.region || "Ghana"}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(price)}
                            </p>
                            <span className="text-xs font-medium text-primary">
                              View details
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
              <p className="text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={loading || pagination.page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.totalPages || 1, prev + 1),
                    )
                  }
                  disabled={loading || pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-white p-5 text-sm text-muted shadow-sm md:flex md:items-center md:justify-between">
            <p>
              Need help finding specific produce? Connect with verified sellers
              and compare offers quickly.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline md:mt-0"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
