import { Check, Mail, MapPin, X } from "lucide-react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-rose-100 text-rose-700",
};

const AgentRequestsTable = ({
  requests,
  processingRequestId,
  onAccept,
  onReject,
}) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-foreground">
          Farmer Management Requests
        </h2>
        <p className="text-xs text-muted">
          Review pending requests from farmers in your region.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {[
                "Farmer",
                "Contact",
                "Region",
                "Requested",
                "Status",
                "Actions",
              ].map((label) => (
                <th
                  key={label}
                  className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  No requests available yet.
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                const isPending = request.status === "pending";
                const isSubmitting = processingRequestId === request.id;

                return (
                  <tr key={request.id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-foreground">
                        {request.farmerName}
                      </p>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="space-y-1 text-xs text-foreground/70">
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{request.farmerEmail || "-"}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-foreground/80">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {request.farmerRegion}
                      </span>
                    </td>

                    <td className="py-3 pr-4 text-foreground/70">
                      {request.createdLabel}
                    </td>

                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${statusStyles[request.status] || statusStyles.pending}`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3">
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onAccept(request.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {isSubmitting ? "Working..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(request.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentRequestsTable;
