import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";
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

  const isAgent = String(user?.role || "").toUpperCase() === "AGENT";

  const displayRole = useMemo(() => {
    const role = String(user?.role || "").toUpperCase();
    if (!role) return "User";
    return role.charAt(0) + role.slice(1).toLowerCase();
  }, [user?.role]);

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f0f2ec" }}
    >
      <nav className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="container flex h-12 items-center justify-between md:h-14">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-base font-semibold text-foreground"
          >
            <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
            <span>AgriTech</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-300"
          >
            <X size={18} />
          </button>
        </div>
      </nav>

      <main className="container flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your personal details, password, email and account
              security.
            </p>
            <p className="text-xs font-medium text-gray-600">
              Role: {displayRole}
            </p>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.form
            onSubmit={handleProfileSave}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Edit Profile
            </h2>
            <div className="space-y-3">
              <label className="block text-sm text-gray-700">
                Full Name
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block text-sm text-gray-700">
                Phone Number
                <div className="relative mt-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={profileForm.phoneNumber}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block text-sm text-gray-700">
                Region
                <div className="relative mt-1">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={profileForm.region}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, region: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-400"
                  >
                    <option value="">Select region</option>
                    {GHANA_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {isAgent && (
                <label className="block text-sm text-gray-700">
                  Bio
                  <div className="relative mt-1">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, bio: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-400"
                    />
                  </div>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={profileState.loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {profileState.loading ? "Saving..." : "Save profile"}
            </button>

            {profileState.message && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={14} />
                {profileState.message}
              </p>
            )}
            {profileState.error && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} />
                {profileState.error}
              </p>
            )}
          </motion.form>

          <motion.form
            onSubmit={handleChangePassword}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Change Password
            </h2>
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm outline-none focus:border-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm outline-none focus:border-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm outline-none focus:border-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
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
          </motion.form>

          <motion.form
            onSubmit={handleRequestEmailChange}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
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
                      setEmailForm((p) => ({ ...p, newEmail: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block text-sm text-gray-700">
                Current Password
                <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) =>
                    setEmailForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={emailState.loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
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
          </motion.form>

          <motion.form
            onSubmit={handleDeleteAccount}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="mb-2 text-lg font-semibold text-red-700">
              Delete Account
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              This action is permanent. Your account and data will be removed.
            </p>

            <label className="block text-sm text-gray-700">
              Confirm with Password
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm outline-none focus:border-red-400"
              />
            </label>

            <button
              type="submit"
              disabled={deleteState.loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              <Trash2 size={15} />
              {deleteState.loading ? "Deleting..." : "Delete my account"}
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
          </motion.form>
        </div>
      </main>
    </div>
  );
}
