import { motion } from "framer-motion";
import { transition } from "@/motionConfig";

export const FarmerRegistrationFields = ({ form, setForm, errors, setErrors, regions }) => {
  return (
    <motion.div
      key="farmerFields"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transition}
    >
      <motion.div className="mb-4 mt-4">
        <label className="block text-sm text-gray-700 mb-1.5">Region</label>
        <select
          value={form.assignedRegion}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, assignedRegion: e.target.value }));
            if (errors.assignedRegion) {
              setErrors((prev) => ({ ...prev, assignedRegion: undefined }));
            }
          }}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.assignedRegion
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        >
          <option value="">Select your region</option>
          {regions?.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.assignedRegion && (
          <p className="text-xs text-red-500 mt-1">{errors.assignedRegion}</p>
        )}
      </motion.div>

      <motion.div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1.5">
          National ID Image
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              nationalIdImage: e.target.files?.[0] || null,
            }));
            if (errors.nationalIdImage) {
              setErrors((prev) => ({
                ...prev,
                nationalIdImage: undefined,
              }));
            }
          }}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.nationalIdImage
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        />
        {form.nationalIdImage && (
          <p className="text-xs text-green-600 mt-1">
            ✓ {form.nationalIdImage.name}
          </p>
        )}
        {errors.nationalIdImage && (
          <p className="text-xs text-red-500 mt-1">
            {errors.nationalIdImage}
          </p>
        )}
      </motion.div>

      <motion.div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1.5">
          Farm Registration Image
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              farmRegistrationImage: e.target.files?.[0] || null,
            }));
            if (errors.farmRegistrationImage) {
              setErrors((prev) => ({
                ...prev,
                farmRegistrationImage: undefined,
              }));
            }
          }}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.farmRegistrationImage
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        />
        {form.farmRegistrationImage && (
          <p className="text-xs text-green-600 mt-1">
            ✓ {form.farmRegistrationImage.name}
          </p>
        )}
        {errors.farmRegistrationImage && (
          <p className="text-xs text-red-500 mt-1">
            {errors.farmRegistrationImage}
          </p>
        )}
      </motion.div>

      <motion.div className="mb-2">
        <label className="block text-sm text-gray-700 mb-1.5">
          Business Certificate Image
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              businessCertificateImage: e.target.files?.[0] || null,
            }));
            if (errors.businessCertificateImage) {
              setErrors((prev) => ({
                ...prev,
                businessCertificateImage: undefined,
              }));
            }
          }}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.businessCertificateImage
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        />
        {form.businessCertificateImage && (
          <p className="text-xs text-green-600 mt-1">
            ✓ {form.businessCertificateImage.name}
          </p>
        )}
        {errors.businessCertificateImage && (
          <p className="text-xs text-red-500 mt-1">
            {errors.businessCertificateImage}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
