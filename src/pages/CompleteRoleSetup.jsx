import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Phone, MapPin, UserCircle2 } from "lucide-react";
import { authService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

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

const MISSING_FIELD_LABELS = {
  phoneNumber: "Phone number",
  assignedRegion: "Assigned region",
  commissionRate: "Commission rate",
  bio: "Agent bio",
  region: "Region",
  nationalId: "National ID document",
  farmRegistration: "Farm registration document",
  businessCertificate: "Business certificate document",
};

const getDashboardPathByRole = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "AGENT") return "/agent/dashboard";
  if (role === "BUYER") return "/marketplace";
  return "/farmer/dashboard";
};

export default function CompleteRoleSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const isFarmer = role === "FARMER";
  const isAgent = role === "AGENT";

  const [statusLoading, setStatusLoading] = useState(true);
  const [missingFields, setMissingFields] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: user?.phoneNumber || "",
    region: user?.region || "",
    assignedRegion: user?.region || "",
    commissionRate: "",
    bio: "",
    nationalId: null,
    farmRegistration: null,
    businessCertificate: null,
  });

  const title = isFarmer
    ? "Complete your farmer profile"
    : "Complete your agent profile";

  const helperText = isFarmer
    ? "Add your contact details and KYC documents before using farmer screens."
    : "Add your contact details and agent information before using agent screens.";

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      if (!isFarmer && !isAgent) {
        navigate(getDashboardPathByRole(role), { replace: true });
        return;
      }

      try {
        const response = await authService.getRoleSetupStatus();
        if (!isMounted) return;

        const missing = Array.isArray(response?.missingFields)
          ? response.missingFields
          : [];

        setMissingFields(missing);

        if (response?.roleSetupComplete) {
          navigate(getDashboardPathByRole(role), { replace: true });
          return;
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load setup status.");
      } finally {
        if (isMounted) setStatusLoading(false);
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [isAgent, isFarmer, navigate, role]);

  const missingSummary = useMemo(() => {
    if (missingFields.length === 0) return "";

    const labels = missingFields.map(
      (field) => MISSING_FIELD_LABELS[field] || field,
    );

    return `Missing: ${labels.join(", ")}`;
  }, [missingFields]);

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onFileChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.files?.[0] || null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      let payload;

      if (isAgent) {
        payload = {
          phoneNumber: form.phoneNumber,
          assignedRegion: form.assignedRegion,
          commissionRate: form.commissionRate,
          bio: form.bio,
        };
      } else {
        payload = new FormData();
        payload.append("phoneNumber", form.phoneNumber);
        payload.append("region", form.region);
        if (form.nationalId) payload.append("nationalId", form.nationalId);
        if (form.farmRegistration) {
          payload.append("farmRegistration", form.farmRegistration);
        }
        if (form.businessCertificate) {
          payload.append("businessCertificate", form.businessCertificate);
        }
      }

      const response = await authService.completeRoleSetup(payload);

      if (response?.user) {
        updateUser(response.user);
      }

      if (!response?.roleSetupComplete) {
        setMissingFields(response?.missingFields || []);
        setError("Some required information is still missing.");
        return;
      }

      navigate(getDashboardPathByRole(role), { replace: true });
    } catch (err) {
      setError(err?.message || "Failed to complete setup.");
    } finally {
      setSaving(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Checking your setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{helperText}</p>

        {missingSummary && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            {missingSummary}
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={onChange("phoneNumber")}
                placeholder="e.g. +233 24 000 0000"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400"
              />
            </div>
          </div>

          {isAgent && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Assigned region
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={16} />
                  </span>
                  <select
                    value={form.assignedRegion}
                    onChange={onChange("assignedRegion")}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400"
                  >
                    <option value="">Select region</option>
                    {GHANA_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Commission rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.commissionRate}
                  onChange={onChange("commissionRate")}
                  placeholder="e.g. 5.0"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Agent bio
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-3 text-gray-400">
                    <UserCircle2 size={16} />
                  </span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={onChange("bio")}
                    placeholder="Tell users about your experience and services"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400"
                  />
                </div>
              </div>
            </>
          )}

          {isFarmer && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Region
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={16} />
                  </span>
                  <select
                    value={form.region}
                    onChange={onChange("region")}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400"
                  >
                    <option value="">Select region</option>
                    {GHANA_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  National ID document
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FileText size={16} />
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={onFileChange("nationalId")}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-green-700 focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Farm registration document
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={onFileChange("farmRegistration")}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-3 text-sm outline-none transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-green-700 focus:border-green-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Business certificate document
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={onFileChange("businessCertificate")}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-3 text-sm outline-none transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-green-700 focus:border-green-400"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-70"
          >
            {saving ? "Saving setup..." : "Complete setup"}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
