import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const ProfileDetailsForm = ({
  user,
  profileForm,
  setProfileForm,
  profileState,
  handleProfileSave,
  isAgent,
  photoInputRef,
  photoState,
  profilePhotoSrc,
  initials,
  handleUploadProfilePhoto,
  handleDeleteProfilePhoto,
  regions,
}) => {
  return (
    <form
      onSubmit={handleProfileSave}
      className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Profile Details
      </h2>

      <div className="mb-5 rounded-xl border border-border/60 bg-surface/50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white text-sm font-semibold text-foreground">
            {profilePhotoSrc ? (
              <img
                src={profilePhotoSrc}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </span>

          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={photoState.loading}
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera size={14} />
                {photoState.loading ? "Working..." : "Upload Photo"}
              </button>

              <button
                type="button"
                disabled={photoState.loading || !profilePhotoSrc}
                onClick={handleDeleteProfilePhoto}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Allowed formats: JPG, PNG, WEBP. Maximum size: 3MB.
            </p>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleUploadProfilePhoto}
            />

            {photoState.message && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={14} />
                {photoState.message}
              </p>
            )}
            {photoState.error && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} />
                {photoState.error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </label>

        <label className="block text-sm text-gray-700">
          Email
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={user?.email || ""}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-3 text-sm text-gray-500"
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
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
                setProfileForm((p) => ({
                  ...p,
                  region: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
            >
              <option value="">Select region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      {isAgent && (
        <label className="mt-3 block text-sm text-gray-700">
          Bio
          <div className="relative mt-1">
            <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              rows={3}
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((p) => ({
                  ...p,
                  bio: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </label>
      )}

      <button
        type="submit"
        disabled={profileState.loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
    </form>
  );
};
