import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  Camera,
  UserRoundPlus,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { authService } from "@/lib";
import { useAuth } from "@/context/AuthContext";
import { validateImageFiles, isValidEmail } from "@/lib/utils";
import RequestAgentModal from "@/components/agent/RequestAgentModal";
import { useAvailableAgents } from "@/hooks/useAvailableAgents";
import { ProfileDetailsForm } from "@/components/forms/ProfileDetailsForm";

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

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    region: user?.region || "",
    bio: user?.bio || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  const [deletePassword, setDeletePassword] = useState("");
  const photoInputRef = useRef(null);
  const photoSuccessTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(photoSuccessTimerRef.current), []);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileState, setProfileState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [passwordState, setPasswordState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [emailState, setEmailState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [deleteState, setDeleteState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [photoState, setPhotoState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [verificationState, setVerificationState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [kycState, setKycState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [kycForm, setKycForm] = useState({
    nationalId: null,
    farmRegistration: null,
    businessCertificate: null,
  });
  const [isRequestAgentOpen, setIsRequestAgentOpen] = useState(false);

  const isAgent = String(user?.role || "").toUpperCase() === "AGENT";
  const isFarmer = String(user?.role || "").toUpperCase() === "FARMER";

  const {
    agents,
    loadingAgents,
    agentsLoadError,
    selectedRegion,
    setSelectedRegion,
    page,
    setPage,
    pagination,
    requestingAgentId,
    requestedAgentIds,
    requestAgent,
  } = useAvailableAgents({
    initialRegion: user?.region || "",
    limit: 6,
    enabled: isFarmer,
  });

  const displayRole = useMemo(() => {
    const role = String(user?.role || "").toUpperCase();
    if (!role) return "User";
    return role.charAt(0) + role.slice(1).toLowerCase();
  }, [user?.role]);

  const isEmailVerified = useMemo(
    () =>
      Boolean(
        user?.isVerified ??
        user?.isEmailVerified ??
        user?.emailVerified ??
        user?.verified,
      ),
    [user],
  );

  const profilePhotoSrc =
    user?.profilePhotoUrl ||
    user?.avatarUrl ||
    user?.profileImage ||
    user?.photoUrl ||
    null;

  const initials = useMemo(() => {
    const value = user?.fullName || user?.name || "User";
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [user?.fullName, user?.name]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileState({ loading: true, message: "", error: "" });

    try {
      const payload = {
        fullName: profileForm.fullName.trim() || undefined,
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        region: profileForm.region.trim() || undefined,
        ...(isAgent ? { bio: profileForm.bio.trim() || undefined } : {}),
      };

      const response = await authService.editProfile(payload);
      const nextUser = response?.user || {};
      updateUser(nextUser);

      setProfileState({
        loading: false,
        message: response?.message || "Profile updated successfully",
        error: "",
      });
    } catch (err) {
      setProfileState({
        loading: false,
        message: "",
        error: err?.message || "Failed to update profile.",
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordState({ loading: true, message: "", error: "" });

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordState({
        loading: false,
        message: "",
        error: "Current password and new password are required.",
      });
      return;
    }

    if (
      passwordForm.newPassword.length < 8 ||
      !/\d/.test(passwordForm.newPassword)
    ) {
      setPasswordState({
        loading: false,
        message: "",
        error:
          "New password must be at least 8 characters and include a number.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordState({
        loading: false,
        message: "",
        error: "New passwords do not match.",
      });
      return;
    }

    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordState({
        loading: false,
        message: response?.message || "Password changed successfully",
        error: "",
      });
    } catch (err) {
      setPasswordState({
        loading: false,
        message: "",
        error: err?.message || "Failed to change password.",
      });
    }
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailState({ loading: true, message: "", error: "" });

    const newEmail = emailForm.newEmail.trim();
    if (!newEmail || !emailForm.password) {
      setEmailState({
        loading: false,
        message: "",
        error: "New email and current password are required.",
      });
      return;
    }

    if (!isValidEmail(newEmail)) {
      setEmailState({
        loading: false,
        message: "",
        error: "Enter a valid new email address.",
      });
      return;
    }

    try {
      const response = await authService.requestEmailChange({
        newEmail,
        password: emailForm.password,
      });

      setEmailForm({ newEmail: "", password: "" });
      setEmailState({
        loading: false,
        message:
          response?.message ||
          "Verification email sent to your new email address",
        error: "",
      });
    } catch (err) {
      setEmailState({
        loading: false,
        message: "",
        error: err?.message || "Failed to request email change.",
      });
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteState({ loading: true, message: "", error: "" });

    if (!deletePassword) {
      setDeleteState({
        loading: false,
        message: "",
        error: "Password is required to delete your account.",
      });
      return;
    }

    try {
      const response = await authService.deleteAccount({
        password: deletePassword,
      });
      setDeleteState({
        loading: false,
        message: response?.message || "Account deleted successfully",
        error: "",
      });

      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteState({
        loading: false,
        message: "",
        error: err?.message || "Failed to delete account.",
      });
    }
  };

  const handleUploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoState({ loading: true, message: "", error: "" });

    const { isValid, error } = validateImageFiles([file], {
      maxFiles: 1,
      maxSizeBytes: 3 * 1024 * 1024,
      allowedTypesError: "Please upload a JPG, PNG, or WEBP image.",
      maxSizeError: "Image must be 3MB or smaller.",
      maxFilesError: "Only one profile image is allowed.",
    });

    if (!isValid) {
      setPhotoState({
        loading: false,
        message: "",
        error,
      });
      event.target.value = "";
      return;
    }

    try {
      const response = await authService.uploadProfilePhoto(file);
      if (response?.user) {
        updateUser(response.user);
      }

      setPhotoState({
        loading: false,
        message: response?.message || "Profile photo updated successfully.",
        error: "",
      });
      clearTimeout(photoSuccessTimerRef.current);
      photoSuccessTimerRef.current = setTimeout(
        () => setPhotoState((p) => (p.message ? { ...p, message: "" } : p)),
        3000,
      );
    } catch (err) {
      setPhotoState({
        loading: false,
        message: "",
        error: err?.message || "Failed to upload profile photo.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteProfilePhoto = async () => {
    setPhotoState({ loading: true, message: "", error: "" });

    try {
      const response = await authService.deleteProfilePhoto();
      if (response?.user) {
        updateUser(response.user);
      } else {
        updateUser({
          profilePhotoUrl: null,
          avatarUrl: null,
          profileImage: null,
          photoUrl: null,
        });
      }

      setPhotoState({
        loading: false,
        message: response?.message || "Profile photo removed.",
        error: "",
      });
    } catch (err) {
      setPhotoState({
        loading: false,
        message: "",
        error: err?.message || "Failed to remove profile photo.",
      });
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email || verificationState.loading) return;

    setVerificationState({ loading: true, message: "", error: "" });

    try {
      const response = await authService.resendVerificationEmail(user.email);
      setVerificationState({
        loading: false,
        message:
          response?.message ||
          "Verification link sent. Please check your inbox.",
        error: "",
      });
    } catch (err) {
      setVerificationState({
        loading: false,
        message: "",
        error: err?.message || "Could not resend verification email.",
      });
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycState({ loading: true, message: "", error: "" });
    try {
      if (!kycForm.nationalId || !kycForm.farmRegistration || !kycForm.businessCertificate) {
        setKycState({ loading: false, message: "", error: "All three documents are required." });
        return;
      }
      const payload = new FormData();
      payload.append("nationalId", kycForm.nationalId);
      payload.append("farmRegistration", kycForm.farmRegistration);
      payload.append("businessCertificate", kycForm.businessCertificate);

      const response = await authService.resubmitKYC(payload);
      if (response?.user) {
        updateUser(response.user);
      }
      setKycState({
        loading: false,
        message: response?.message || "KYC documents resubmitted successfully.",
        error: "",
      });
      setKycForm({ nationalId: null, farmRegistration: null, businessCertificate: null });
    } catch (err) {
      setKycState({
        loading: false,
        message: "",
        error: err?.message || "Failed to resubmit KYC documents.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="container flex h-12 items-center justify-between md:h-14">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-base font-semibold text-foreground"
          >
            <img
              src={logo}
              alt="FarmBridge logo"
              className="h-6 w-6 shrink-0"
            />
            <span>FarmBridge</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-300"
          >
            <X size={18} />
          </button>
        </div>
      </nav>

      <main className="container py-6 sm:py-8">
        <div>
          <section className="w-full rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
            <div className="mb-6 flex flex-col gap-1 border-b border-border/60 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-sm text-gray-500">
                Manage your profile, security, and account preferences.
              </p>
              <p className="text-xs font-medium text-gray-600">
                Signed in as {displayRole}
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-border/60 bg-surface/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Email verification
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={
                        isEmailVerified
                          ? "font-semibold text-green-700"
                          : "font-semibold text-amber-700"
                      }
                    >
                      {isEmailVerified ? "Verified" : "Not verified"}
                    </span>
                  </p>
                </div>

                {!isEmailVerified && (
                  <button
                    type="button"
                    disabled={verificationState.loading || !user?.email}
                    onClick={handleResendVerification}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verificationState.loading
                      ? "Sending..."
                      : "Send verification link"}
                  </button>
                )}
              </div>

              {verificationState.message && (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 size={14} />
                  {verificationState.message}
                </p>
              )}
              {verificationState.error && (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={14} />
                  {verificationState.error}
                </p>
              )}
            </div>

            {isFarmer && (
              <div className="mb-5 rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      KYC Verification
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Status:{" "}
                      <span
                        className={
                          user?.kycStatus === "APPROVED"
                            ? "font-semibold text-green-700"
                            : user?.kycStatus === "REJECTED"
                            ? "font-semibold text-red-700"
                            : "font-semibold text-amber-700"
                        }
                      >
                        {user?.kycStatus || "Not submitted"}
                      </span>
                    </p>
                    {user?.kycStatus === "REJECTED" && user?.kycRejectReason && (
                      <p className="mt-2 text-sm text-red-600">
                        Reason: {user.kycRejectReason}
                      </p>
                    )}
                  </div>

                  {user?.kycStatus === "PENDING" && (
                    <p className="mt-2 text-sm text-amber-700">
                      Your documents are under review. Resubmission is available after a decision.
                    </p>
                  )}

                  {user?.kycStatus === "REJECTED" && (
                    <form onSubmit={handleKycSubmit} className="mt-4 border-t border-border/60 pt-4">
                      <p className="mb-4 text-sm font-medium text-gray-700">Resubmit Documents</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            National ID
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setKycForm(p => ({ ...p, nationalId: e.target.files?.[0] || null }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary/50"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Farm Registration
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setKycForm(p => ({ ...p, farmRegistration: e.target.files?.[0] || null }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary/50"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Business Certificate
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setKycForm(p => ({ ...p, businessCertificate: e.target.files?.[0] || null }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={
                          kycState.loading ||
                          !kycForm.nationalId ||
                          !kycForm.farmRegistration ||
                          !kycForm.businessCertificate
                        }
                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {kycState.loading ? "Submitting..." : "Resubmit KYC"}
                      </button>
                      
                      {kycState.message && (
                        <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 size={14} />
                          {kycState.message}
                        </p>
                      )}
                      {kycState.error && (
                        <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle size={14} />
                          {kycState.error}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}

            {isFarmer && (
              <div className="mb-5 rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Agent support
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Need hands-on support managing listings or barter
                      activity?
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRequestAgentOpen(true)}
                    disabled={Boolean(user?.agentId)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserRoundPlus size={15} />
                    {user?.agentId
                      ? "Agent already assigned"
                      : "Request an agent"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5">
                <ProfileDetailsForm 
                  user={user}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  profileState={profileState}
                  handleProfileSave={handleProfileSave}
                  isAgent={isAgent}
                  photoInputRef={photoInputRef}
                  photoState={photoState}
                  profilePhotoSrc={profilePhotoSrc}
                  initials={initials}
                  handleUploadProfilePhoto={handleUploadProfilePhoto}
                  handleDeleteProfilePhoto={handleDeleteProfilePhoto}
                  regions={GHANA_REGIONS}
                />

                <form
                  onSubmit={handleRequestEmailChange}
                  className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Change Email
                  </h2>
                  <p className="mb-3 text-xs text-gray-500">
                    Current email: {user?.email || "-"}
                  </p>

                  <div className="space-y-3">
                    <label className="block text-sm text-gray-700">
                      New Email
                      <div className="relative mt-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={(e) =>
                            setEmailForm((p) => ({
                              ...p,
                              newEmail: e.target.value,
                            }))
                          }
                          autoComplete="email"
                          spellCheck={false}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                        />
                      </div>
                    </label>

                    <label className="block text-sm text-gray-700">
                      Current Password
                      <input
                        type="password"
                        value={emailForm.password}
                        onChange={(e) =>
                          setEmailForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        autoComplete="current-password"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus:border-primary/50"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={emailState.loading}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emailState.loading ? "Sending..." : "Request email change"}
                    {!emailState.loading && <ArrowRight size={15} />}
                  </button>

                  {emailState.message && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={14} />
                      {emailState.message}
                    </p>
                  )}
                  {emailState.error && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={14} />
                      {emailState.error}
                    </p>
                  )}
                </form>
              </div>

              <div className="space-y-5">
                <form
                  onSubmit={handleChangePassword}
                  className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Change Password
                  </h2>
                  <p className="mb-3 text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>

                  <div className="space-y-3">
                    <label className="block text-sm text-gray-700">
                      Current Password
                      <div className="relative mt-1">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              currentPassword: e.target.value,
                            }))
                          }
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus:border-primary/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block text-sm text-gray-700">
                      New Password
                      <div className="relative mt-1">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus:border-primary/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block text-sm text-gray-700">
                      Confirm New Password
                      <div className="relative mt-1">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              confirmNewPassword: e.target.value,
                            }))
                          }
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus:border-primary/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordState.loading}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <KeyRound size={15} />
                    {passwordState.loading ? "Updating..." : "Update password"}
                  </button>

                  {passwordState.message && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={14} />
                      {passwordState.message}
                    </p>
                  )}
                  {passwordState.error && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={14} />
                      {passwordState.error}
                    </p>
                  )}
                </form>

                <form
                  onSubmit={handleDeleteAccount}
                  className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-2 text-lg font-semibold text-red-700">
                    Close Account
                  </h2>
                  <p className="mb-4 text-sm text-gray-600">
                    This action is permanent. Your account and data will be
                    removed.
                  </p>

                  <label className="block text-sm text-gray-700">
                    Confirm with Password
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      autoComplete="current-password"
                      className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus:border-red-400"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={deleteState.loading}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    <Trash2 size={15} />
                    {deleteState.loading ? "Closing..." : "Close account"}
                  </button>

                  {deleteState.message && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={14} />
                      {deleteState.message}
                    </p>
                  )}
                  {deleteState.error && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={14} />
                      {deleteState.error}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      <RequestAgentModal
        isOpen={isRequestAgentOpen}
        onClose={() => setIsRequestAgentOpen(false)}
        agents={agents}
        loadingAgents={loadingAgents}
        agentsLoadError={agentsLoadError}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onRequestAgent={requestAgent}
        requestingAgentId={requestingAgentId}
        requestedAgentIds={requestedAgentIds}
        hasAssignedAgent={Boolean(user?.agentId)}
      />
    </div>
  );
}
