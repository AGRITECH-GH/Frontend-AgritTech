import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Skeleton from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import * as reviewsService from "@/lib/reviewsService";

const Stars = ({ value }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-500" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const InteractiveStars = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= (hovered || value) ? "fill-amber-400 text-amber-500" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function Reviews() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const direction = "all";

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewsService.getReviews({ direction, limit: 50 });
      setReviews(res.reviews || []);
    } catch (err) {
      setError(err?.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId) {
      setSubmitMessage("Open this page with an orderId to submit a review.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    try {
      await reviewsService.createReview({ orderId, rating, comment });
      setComment("");
      setSubmitMessage("Review submitted successfully.");
      await loadReviews();
    } catch (err) {
      setSubmitMessage(err?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="mt-1 text-sm text-muted">
            Leave a review after delivery and track your review history.
          </p>
          <p className="mt-2 text-xs text-muted">
            Signed in as {user?.fullName || user?.email || "User"}
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Leave a Review</h2>
          <p className="mt-1 text-sm text-muted">
            {orderId ? (
            `Order: ${orderId}`
          ) : (
            <>
              Tip: navigate here from{" "}
              <Link to="/orders" className="text-primary underline hover:text-green-700">
                your Orders
              </Link>{" "}
              to auto-fill the order ID.
            </>
          )}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Rating</label>
              <InteractiveStars value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Share your experience"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {submitMessage && (
              <p className={`text-sm ${submitMessage.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>
                {submitMessage}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Review History</h2>
            <Link to="/orders" className="text-sm text-primary hover:underline">
              Back to Orders
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading reviews">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/60 p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {review.reviewedUser?.fullName || "User"}
                      </p>
                      <p className="text-xs text-muted">
                        by {review.reviewer?.fullName || "Reviewer"} •{" "}
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-foreground/90">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
