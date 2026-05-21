import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import * as disputesService from "@/lib/disputesService";

const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export default function Disputes() {
  const [searchParams] = useSearchParams();
  const prefilledOrderId = searchParams.get("orderId") || "";

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderId, setOrderId] = useState(prefilledOrderId);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const loadDisputes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await disputesService.getDisputes({ limit: 50 });
      setDisputes(res.disputes || []);
    } catch (err) {
      setError(err?.message || "Failed to load disputes");
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const evidenceUrls = evidence
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      await disputesService.createDispute({
        orderId,
        reason,
        details,
        evidenceUrls,
      });

      setReason("");
      setDetails("");
      setEvidence("");
      setSubmitMessage("Dispute submitted successfully.");
      await loadDisputes();
    } catch (err) {
      setSubmitMessage(err?.message || "Failed to submit dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Disputes</h1>
          <p className="mt-1 text-sm text-muted">
            Open disputes for delivered orders within 7 days and track mediation
            updates.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Open a Dispute</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Order ID</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Paste order id"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="e.g. Damaged produce"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Describe the issue"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Evidence URLs (optional, one per line)
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Dispute"}
            </button>

            {submitMessage && (
              <p className="text-sm text-muted">{submitMessage}</p>
            )}
          </form>
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Disputes</h2>
            <Link to="/orders" className="text-sm text-primary hover:underline">
              Back to Orders
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Loading disputes...</p>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : disputes.length === 0 ? (
            <p className="text-sm text-muted">No disputes found.</p>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <article
                  key={dispute.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      Dispute #{dispute.id.slice(-8).toUpperCase()}
                    </p>
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold">
                      {STATUSES.includes(dispute.status)
                        ? dispute.status.replace("_", " ")
                        : dispute.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">
                    {dispute.reason}
                  </p>
                  {dispute.details && (
                    <p className="mt-1 text-xs text-muted">{dispute.details}</p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    Order: {dispute.orderId} • Opened:{" "}
                    {new Date(dispute.createdAt).toLocaleString()}
                  </p>
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
