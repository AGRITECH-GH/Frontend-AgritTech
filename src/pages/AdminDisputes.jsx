import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AdminLayout from "@/components/admin/AdminLayout";
import * as disputesService from "@/lib/disputesService";

const STATUS_FILTERS = ["", "OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];
const MEDIATION_ACTIONS = ["UNDER_REVIEW", "RESOLVED", "REJECTED"];

export default function AdminDisputes() {
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  const sidebarAdmin = {
    name: user?.fullName || "Admin",
    email: user?.email || "",
    avatarUrl: user?.profilePhotoUrl || null,
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await disputesService.getAdminDisputes({
        status: status || undefined,
        limit: 100,
      });
      setDisputes(res.disputes || []);
    } catch (err) {
      setError(err?.message || "Failed to load disputes");
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const summary = useMemo(() => {
    const counts = { OPEN: 0, UNDER_REVIEW: 0, RESOLVED: 0, REJECTED: 0 };
    disputes.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status] += 1;
    });
    return counts;
  }, [disputes]);

  const updateStatus = async (disputeId, nextStatus, note) => {
    setBusyId(disputeId + nextStatus);
    try {
      await disputesService.mediateDispute(disputeId, {
        status: nextStatus,
        resolutionNote: note,
        mediationNote: note,
      });
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update dispute.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="container py-6 lg:py-8">
        <section className="mb-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Dispute Mediation Queue</h1>
          <p className="mt-1 text-sm text-muted">
            Review, mediate, and resolve buyer disputes.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-2 py-1">
              Open: {summary.OPEN}
            </span>
            <span className="rounded-full border px-2 py-1">
              Under Review: {summary.UNDER_REVIEW}
            </span>
            <span className="rounded-full border px-2 py-1">
              Resolved: {summary.RESOLVED}
            </span>
            <span className="rounded-full border px-2 py-1">
              Rejected: {summary.REJECTED}
            </span>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((value) => (
            <button
              key={value || "ALL"}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status === value ? "bg-primary text-white" : "bg-white text-foreground"}`}
            >
              {value || "ALL"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading disputes...</p>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : disputes.length === 0 ? (
          <p className="text-sm text-muted">
            No disputes found for this filter.
          </p>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <article
                key={dispute.id}
                className="rounded-xl border border-border/60 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Dispute #{dispute.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted">
                      Order #
                      {String(dispute.order?.id || dispute.orderId || "")
                        .slice(-8)
                        .toUpperCase()}{" "}
                      • {new Date(dispute.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-semibold">
                    {(dispute.status || "OPEN").replace("_", " ")}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium">{dispute.reason}</p>
                {dispute.details && (
                  <p className="mt-1 text-sm text-muted">{dispute.details}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {MEDIATION_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setPendingAction({ disputeId: dispute.id, nextStatus: action })}
                      disabled={busyId !== ""}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-surface disabled:opacity-60"
                    >
                      {busyId === dispute.id + action
                        ? "Saving..."
                        : action.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-foreground">
              Set status to {pendingAction.nextStatus.replace("_", " ")}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dispute #{pendingAction.disputeId.slice(-8).toUpperCase()}
            </p>
            <label className="mt-3 block text-sm text-foreground">
              Resolution note (optional)
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a note for this decision..."
              />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const { disputeId, nextStatus } = pendingAction;
                  const note = noteInput.trim();
                  setPendingAction(null);
                  setNoteInput("");
                  await updateStatus(disputeId, nextStatus, note);
                }}
                disabled={busyId !== ""}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => { setPendingAction(null); setNoteInput(""); }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
