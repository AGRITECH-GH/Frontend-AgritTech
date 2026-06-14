import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/lib";
import AdminLayout from "@/components/admin/AdminLayout";

const extractSubmissions = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.submissions,
    response.items,
    response.data?.submissions,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeSubmission = (submission, index) => ({
  id: submission.id || `submission-${index}`,
  fullName: submission.fullName || submission.name || "Unknown Farmer",
  email: submission.email || "No email",
  phoneNumber: submission.phoneNumber || "-",
  region: submission.region || "-",
  kycStatus: submission.kycStatus || "PENDING",
  kycSubmittedAt: submission.kycSubmittedAt || submission.createdAt || null,
  kycApprovedAt: submission.kycApprovedAt || null,
  kycRejectReason: submission.kycRejectReason || "",
  kycEmailLastSentAt: submission.kycEmailLastSentAt || null,
  kycEmailLastStatus: submission.kycEmailLastStatus || null,
  kycEmailLastAction: submission.kycEmailLastAction || null,
  kycEmailLastError: submission.kycEmailLastError || null,
  nationalIdImageUrl: submission.nationalIdImageUrl || "",
  farmRegistrationImageUrl: submission.farmRegistrationImageUrl || "",
  businessCertificateImageUrl: submission.businessCertificateImageUrl || "",
});

const queueConfig = {
  pending: {
    label: "Pending Queue",
    heading: "Pending farmers",
    emptyTitle: "No pending KYC submissions",
    emptyDescription: "New farmer uploads will appear here for review.",
  },
  reviewed: {
    label: "Decision History",
    heading: "Reviewed farmers",
    emptyTitle: "No reviewed KYC decisions",
    emptyDescription:
      "Approved and rejected KYC decisions will appear here after review.",
  },
};

const getStatusBadgeClass = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "APPROVED") {
    return "bg-green-100 text-green-800";
  }

  if (normalized === "REJECTED") {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
};

const getStatusLabel = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "APPROVED") return "Approved";
  if (normalized === "REJECTED") return "Rejected";
  return "Pending";
};

const getStatusIcon = (status) => {
  const normalized = String(status || "").toUpperCase();
  return normalized === "APPROVED" ? BadgeCheck : ShieldAlert;
};

const EmailDeliveryCard = ({ deliveryState, deliveryAction }) => {
  let toneClass = "border-slate-200 bg-slate-50 text-slate-900";
  let title = "Notification delivery unknown";
  let description =
    "No email delivery result has been recorded in this session for this submission.";

  if (deliveryState === true) {
    toneClass = "border-green-200 bg-green-50 text-green-900";
    title = "Notification delivered";
    description = deliveryAction
      ? `The ${deliveryAction} email was accepted by the email service.`
      : "The notification email was accepted by the email service.";
  }

  if (deliveryState === false) {
    toneClass = "border-red-200 bg-red-50 text-red-900";
    title = "Notification failed";
    description = deliveryAction
      ? `The ${deliveryAction} email could not be delivered. Use resend after checking your email configuration.`
      : "The notification email could not be delivered. Use resend after checking your email configuration.";
  }

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
};

const getEmailDeliveryState = (submission) => {
  if (!submission?.kycEmailLastSentAt) return null;

  return submission.kycEmailLastError ? false : true;
};

const getEmailDeliveryActionLabel = (action) => {
  const normalized = String(action || "").toUpperCase();

  if (normalized === "APPROVE") return "approval";
  if (normalized === "REJECT") return "rejection";
  if (normalized === "RESEND") return "resend";
  return "decision";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getPagination = (response) => {
  const pagination = response?.pagination || response?.data?.pagination || {};

  return {
    total: Number(pagination.total) || 0,
    page: Number(pagination.page) || 1,
    limit: Number(pagination.limit) || 20,
    totalPages: Number(pagination.totalPages) || 1,
  };
};

const isPdfDocument = (url) => /\.pdf($|\?)/i.test(String(url || ""));

const DocumentPreview = ({ title, url }) => {
  if (!url) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-surface/60 p-4 text-sm text-muted">
        {title} is missing.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted">Uploaded farmer document</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {isPdfDocument(url) ? (
        <iframe src={url} title={title} className="h-80 w-full bg-surface" />
      ) : (
        <img src={url} alt={title} className="h-80 w-full object-cover" />
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, tone = "default" }) => {
  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "success"
        ? "border-green-200 bg-green-50 text-green-900"
        : "border-border/60 bg-white text-foreground";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
};

const AdminKYC = () => {
  const { user: authUser } = useAuth();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [activeQueue, setActiveQueue] = useState("pending");
  const [reviewedStatus, setReviewedStatus] = useState("ALL");
  const [reloadToken, setReloadToken] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [emailDeliveryByUser, setEmailDeliveryByUser] = useState({});
  const [emailActionByUser, setEmailActionByUser] = useState({});

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl:
      authUser?.profilePhotoUrl ||
      authUser?.avatarUrl ||
      authUser?.profileImage ||
      null,
  };

  const pendingCount = submissions.length;
  const queueDetails = queueConfig[activeQueue];
  const selectedDeliveryState = selectedSubmission
    ? (emailDeliveryByUser[selectedSubmission.id] ?? getEmailDeliveryState(selectedSubmission))
    : undefined;
  const selectedDeliveryAction = selectedSubmission
    ? getEmailDeliveryActionLabel(
        emailActionByUser[selectedSubmission.id] || selectedSubmission.kycEmailLastAction,
      )
    : undefined;
  const submittedTodayCount = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    return submissions.filter((submission) => {
      const submittedAt = new Date(submission.kycSubmittedAt || "");
      return (
        !Number.isNaN(submittedAt.getTime()) &&
        submittedAt.getFullYear() === year &&
        submittedAt.getMonth() === month &&
        submittedAt.getDate() === day
      );
    }).length;
  }, [submissions]);

  useEffect(() => {
    let cancelled = false;

    const fetchSubmissions = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          activeQueue === "pending"
            ? await adminService.getPendingKYCSubmissions({
                search: query.trim() || undefined,
                page: 1,
                limit: 50,
              })
            : await adminService.getReviewedKYCSubmissions({
                search: query.trim() || undefined,
                status:
                  reviewedStatus === "ALL" ? undefined : reviewedStatus,
                page: 1,
                limit: 50,
              });

        if (cancelled) return;

        const normalized =
          extractSubmissions(response).map(normalizeSubmission);
        setSubmissions(normalized);
        setPagination(getPagination(response));
        setSelectedId((current) => {
          if (normalized.length === 0) return null;
          if (current && normalized.some((item) => item.id === current)) {
            return current;
          }
          return normalized[0].id;
        });
      } catch (err) {
        console.error("Failed to load KYC submissions:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load KYC submissions.");
          setSubmissions([]);
          setSelectedId(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchSubmissions();

    return () => {
      cancelled = true;
    };
  }, [query, reloadToken, activeQueue, reviewedStatus]);

  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async () => {
      if (!selectedId) {
        setSelectedSubmission(null);
        setRejectReason("");
        return;
      }

      setLoadingDetails(true);
      setActionError("");

      try {
        const response = await adminService.getKYCStatus(selectedId);
        if (cancelled) return;

        const normalized = normalizeSubmission(response?.user || response, 0);
        setSelectedSubmission(normalized);
        setRejectReason(normalized.kycRejectReason || "");
      } catch (err) {
        console.error("Failed to load KYC details:", err);
        if (!cancelled) {
          setActionError(err.message || "Failed to load KYC details.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
        }
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const refreshList = async () => {
    setRefreshing(true);
    setReloadToken((current) => current + 1);
  };

  const recordEmailDelivery = (userId, emailNotificationSent, emailAction) => {
    setEmailDeliveryByUser((current) => ({
      ...current,
      [userId]: emailNotificationSent,
    }));
    setEmailActionByUser((current) => ({
      ...current,
      [userId]: emailAction,
    }));
  };

  const removeSubmissionFromQueue = (userId) => {
    setSubmissions((current) => {
      const next = current.filter((item) => item.id !== userId);
      setSelectedId(next[0]?.id || null);
      return next;
    });
    setSelectedSubmission(null);
    setRejectReason("");
    setPagination((current) => ({
      ...current,
      total: Math.max(0, current.total - 1),
    }));
  };

  const handleApprove = async () => {
    if (!selectedSubmission?.id) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await adminService.approveKYC(selectedSubmission.id);
      const emailNotificationSent = response?.emailNotificationSent !== false;
      const nextUser = normalizeSubmission(response?.user || selectedSubmission, 0);

      recordEmailDelivery(
        selectedSubmission.id,
        emailNotificationSent,
        "approval",
      );
      setSelectedSubmission(nextUser);
      setSubmissions((current) =>
        current.filter((item) => item.id !== selectedSubmission.id),
      );
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
      setActiveQueue("reviewed");
      setReviewedStatus("APPROVED");
      setSelectedId(selectedSubmission.id);
      setReloadToken((current) => current + 1);
      setActionSuccess(
        emailNotificationSent
          ? "KYC approved and notification email delivered."
          : "KYC approved, but the notification email could not be delivered.",
      );
    } catch (err) {
      console.error("Failed to approve KYC:", err);
      setActionError(err.message || "Failed to approve KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission?.id) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setActionError("A rejection reason is required.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await adminService.rejectKYC(
        selectedSubmission.id,
        trimmedReason,
      );
      const emailNotificationSent = response?.emailNotificationSent !== false;
      const nextUser = normalizeSubmission(response?.user || selectedSubmission, 0);

      recordEmailDelivery(
        selectedSubmission.id,
        emailNotificationSent,
        "rejection",
      );
      setSelectedSubmission(nextUser);
      setSubmissions((current) =>
        current.filter((item) => item.id !== selectedSubmission.id),
      );
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
      setActiveQueue("reviewed");
      setReviewedStatus("REJECTED");
      setSelectedId(selectedSubmission.id);
      setReloadToken((current) => current + 1);
      setActionSuccess(
        emailNotificationSent
          ? "KYC rejected and notification email delivered."
          : "KYC rejected, but the notification email could not be delivered.",
      );
    } catch (err) {
      console.error("Failed to reject KYC:", err);
      setActionError(err.message || "Failed to reject KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!selectedSubmission?.id || selectedSubmission.kycStatus === "PENDING") {
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await adminService.resendKYCDecisionEmail(
        selectedSubmission.id,
      );
      const emailNotificationSent = response?.emailNotificationSent !== false;
      const nextUser = normalizeSubmission(response?.user || selectedSubmission, 0);

      recordEmailDelivery(
        selectedSubmission.id,
        emailNotificationSent,
        "resend",
      );
      setSelectedSubmission(nextUser);
      setSubmissions((current) =>
        current.map((item) => (item.id === nextUser.id ? nextUser : item)),
      );

      if (emailNotificationSent) {
        setActionSuccess(
          response?.message || "KYC decision email resent successfully.",
        );
      } else {
        setActionError(
          response?.message || "KYC decision email could not be delivered.",
        );
      }
    } catch (err) {
      console.error("Failed to resend KYC email:", err);
      setActionError(err.message || "Failed to resend KYC email.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl font-bold text-foreground">
              KYC Review Queue
            </h1>
            <p className="mt-1 text-sm text-muted">
              Review pending submissions, revisit past KYC decisions, and resend
              notification emails when needed.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
              <Search className="mr-2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setQuery(search);
                  }
                }}
                placeholder="Search farmer by name or email"
                className="w-full min-w-64 bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setQuery(search)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Search
            </button>

            <button
              type="button"
              onClick={refreshList}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-2xl border border-border/70 bg-white p-1 shadow-sm">
            {Object.entries(queueConfig).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveQueue(key);
                  setActionError("");
                  setActionSuccess("");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeQueue === key
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>

          {activeQueue === "reviewed" ? (
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReviewedStatus(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                    reviewedStatus === option.value
                      ? "bg-foreground text-white"
                      : "border border-border/70 bg-white text-muted hover:bg-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            label={activeQueue === "pending" ? "Pending reviews" : "Reviewed cases"}
            value={pendingCount}
            tone={activeQueue === "pending" ? "warning" : "success"}
          />
          <SummaryCard label="Submitted today" value={submittedTodayCount} />
          <SummaryCard
            label="Queue total"
            value={pagination.total}
            tone="success"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {actionSuccess ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {actionSuccess}
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  {queueDetails.heading}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`kyc-skeleton-${index}`}
                    className="h-24 animate-pulse rounded-2xl bg-surface"
                  />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {queueDetails.emptyTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {queueDetails.emptyDescription}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[72vh] space-y-3 overflow-y-auto p-4">
                {submissions.map((submission) => {
                  const isSelected = submission.id === selectedId;
                  const emailDeliveryState = getEmailDeliveryState(submission);
                  const emailDeliveryAction = getEmailDeliveryActionLabel(
                    submission.kycEmailLastAction,
                  );

                  return (
                    <button
                      key={submission.id}
                      type="button"
                      onClick={() => setSelectedId(submission.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 bg-white hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {submission.fullName}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {submission.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClass(
                            submission.kycStatus,
                          )}`}
                        >
                          {getStatusLabel(submission.kycStatus)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                        <span>Region: {submission.region}</span>
                        <span>Phone: {submission.phoneNumber}</span>
                      </div>

                      <p className="mt-3 text-xs text-muted">
                        Submitted {formatDateTime(submission.kycSubmittedAt)}
                      </p>

                      {submission.kycStatus !== "PENDING" ? (
                        <div className="mt-3 space-y-2">
                          <div
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClass(
                              submission.kycStatus,
                            )}`}
                          >
                            {getStatusLabel(submission.kycStatus)}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                            <span>Email: {emailDeliveryAction}</span>
                            <span>
                              {emailDeliveryState === true
                                ? "delivered"
                                : emailDeliveryState === false
                                  ? "failed"
                                  : "unknown"}
                            </span>
                            {submission.kycEmailLastSentAt ? (
                              <span>
                                {formatDateTime(submission.kycEmailLastSentAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            {selectedSubmission ? (
              <>
                <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClass(
                          selectedSubmission.kycStatus,
                        )}`}
                      >
                        {(() => {
                          const StatusIcon = getStatusIcon(
                            selectedSubmission.kycStatus,
                          );
                          return <StatusIcon className="h-3.5 w-3.5" />;
                        })()}
                        {getStatusLabel(selectedSubmission.kycStatus)}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-foreground">
                        {selectedSubmission.fullName}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {selectedSubmission.email}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                      <div>
                        <p className="font-medium text-foreground">Phone</p>
                        <p>{selectedSubmission.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Region</p>
                        <p>{selectedSubmission.region}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Submitted</p>
                        <p>
                          {formatDateTime(selectedSubmission.kycSubmittedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Status</p>
                        <p>{selectedSubmission.kycStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <EmailDeliveryCard
                      deliveryState={selectedDeliveryState}
                      deliveryAction={selectedDeliveryAction}
                    />
                  </div>

                  {selectedSubmission.kycStatus === "PENDING" ? (
                    <>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={actionLoading || loadingDetails}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve KYC
                        </button>

                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={actionLoading || loadingDetails}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject KYC
                        </button>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="kyc-reject-reason"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Rejection reason
                        </label>
                        <textarea
                          id="kyc-reject-reason"
                          value={rejectReason}
                          onChange={(event) =>
                            setRejectReason(event.target.value)
                          }
                          rows={4}
                          placeholder="Explain what is missing or invalid before rejecting this submission."
                          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={actionLoading || loadingDetails}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Resend decision email
                      </button>

                      {selectedSubmission.kycStatus === "REJECTED" ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                          <p className="font-semibold">Admin rejection reason</p>
                          <p className="mt-1">
                            {selectedSubmission.kycRejectReason ||
                              "No rejection reason was recorded."}
                          </p>
                          {selectedSubmission.kycEmailLastError ? (
                            <p className="mt-2 text-red-900/90">
                              Last email error: {selectedSubmission.kycEmailLastError}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`doc-skeleton-${index}`}
                        className="h-80 animate-pulse rounded-3xl bg-surface"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <DocumentPreview
                      title="National ID"
                      url={selectedSubmission.nationalIdImageUrl}
                    />
                    <DocumentPreview
                      title="Farm Registration"
                      url={selectedSubmission.farmRegistrationImageUrl}
                    />
                    <div className="lg:col-span-2">
                      <DocumentPreview
                        title="Business Certificate"
                        url={selectedSubmission.businessCertificateImageUrl}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-white px-6 text-center shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  Queue cleared
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  {activeQueue === "pending"
                    ? "There are no pending farmer submissions to review right now. When a farmer uploads KYC, the documents will appear here."
                    : "Select a reviewed KYC decision to inspect the submitted documents and resend the decision email if needed."}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminKYC;
