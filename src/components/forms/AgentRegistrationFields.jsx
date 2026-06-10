import { motion } from "framer-motion";
import { transition } from "@/motionConfig";

export const AgentRegistrationFields = ({ form, setForm, errors, setErrors, regions }) => {
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <motion.div
      key="agentFields"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transition}
    >
      <motion.div className="mb-4 mt-4">
        <label className="block text-sm text-gray-700 mb-1.5">
          Assigned Region
        </label>
        <select
          value={form.assignedRegion}
          onChange={handleChange("assignedRegion")}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.assignedRegion
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        >
          <option value="">Select region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.assignedRegion && (
          <p className="text-xs text-red-500 mt-1">
            {errors.assignedRegion}
          </p>
        )}
      </motion.div>

      <motion.div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1.5">
          Commission Rate (%)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.commissionRate}
            onChange={handleChange("commissionRate")}
            placeholder="5.0"
            className={[
              "w-full rounded-xl border bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition-colors",
              errors.commissionRate
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-green-400",
            ].join(" ")}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            %
          </span>
        </div>
        {errors.commissionRate && (
          <p className="text-xs text-red-500 mt-1">
            {errors.commissionRate}
          </p>
        )}
      </motion.div>

      <motion.div className="mb-2">
        <label className="block text-sm text-gray-700 mb-1.5">
          Agent Bio
        </label>
        <textarea
          value={form.bio}
          onChange={handleChange("bio")}
          placeholder="Experienced field agent"
          rows={3}
          className={[
            "w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors",
            errors.bio
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-green-400",
          ].join(" ")}
        />
        {errors.bio && (
          <p className="text-xs text-red-500 mt-1">
            {errors.bio}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
