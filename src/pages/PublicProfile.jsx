import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, BadgeCheck, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { profileService, getPrimaryListingImageUrl } from "@/lib";

const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "GH₵0.00";

  return `GH₵${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const PublicProfile = () => {
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, reviewsResponse] = await Promise.all([
          profileService.getPublicProfile(userId),
          profileService.getPublicReviews(userId, { page: 1, limit: 5 }),
        ]);

        if (cancelled) return;

        setProfile(profileResponse?.profile || null);
        setStats(profileResponse?.stats || null);
        setPortfolio(
          Array.isArray(profileResponse?.portfolio)
            ? profileResponse.portfolio
            : [],
        );
        setReviews(
          Array.isArray(reviewsResponse?.reviews)
            ? reviewsResponse.reviews
            : [],
        );
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Failed to load public profile.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const memberSince = useMemo(() => formatDate(profile?.createdAt), [profile]);

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted">
            Loading profile...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted">
            Profile not found.
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={profile.fullName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-3xl font-bold text-white">
                    {(profile.fullName?.[0] || "U").toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-bold">
                      {profile.fullName}
                    </h1>
                    {profile.verificationBadge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{profile.role}</p>
                  {profile.region && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.region}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="text-xs text-muted">Total Listings</p>
                <p className="mt-1 text-2xl font-bold">
                  {stats?.totalListings ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="text-xs text-muted">Completed Sales</p>
                <p className="mt-1 text-2xl font-bold">
                  {stats?.completedSales ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="text-xs text-muted">Average Rating</p>
                <p className="mt-1 flex items-center gap-1 text-2xl font-bold">
                  <Star className="h-5 w-5 text-amber-500" />
                  {(Number(stats?.averageRating || 0) || 0).toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="text-xs text-muted">Reviews</p>
                <p className="mt-1 text-2xl font-bold">
                  {stats?.totalReviews ?? 0}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Product Portfolio</h2>
              {portfolio.length === 0 ? (
                <p className="text-sm text-muted">No listings yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((item) => (
                    <Link
                      key={item.id}
                      to={`/marketplace/${item.id}`}
                      className="overflow-hidden rounded-xl border border-border/60 transition hover:shadow-md"
                    >
                      <div className="h-40 bg-[#f0f2ec]">
                        {getPrimaryListingImageUrl(item) ? (
                          <img
                            src={getPrimaryListingImageUrl(item)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {item.category?.name || "Uncategorized"}
                        </p>
                        <p className="mt-2 text-sm font-bold text-primary">
                          {formatCurrency(item.pricePerUnit)} / {item.unit}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Recent Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-xl border border-border/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {review.reviewer?.fullName || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                        <Star className="h-4 w-4" />
                        {Number(review.rating || 0).toFixed(1)}
                      </p>
                      <p className="mt-2 text-sm text-foreground/90">
                        {review.comment || "No comment provided."}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfile;
