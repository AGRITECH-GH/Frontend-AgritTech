export function cn(...values) {
  return values
    .flatMap((v) => {
      if (!v) return [];
      if (typeof v === "string") return v.split(" ");
      if (Array.isArray(v)) return v;
      if (typeof v === "object") {
        return Object.entries(v)
          .filter(([, condition]) => Boolean(condition))
          .map(([className]) => className);
      }
      return [];
    })
    .join(" ")
    .trim();
}

/**
 * Default MIME types accepted by image upload validators across the app.
 *
 * Use this constant when you want the standard image policy for uploads
 * (JPEG/JPG, PNG, WEBP) and override it only for endpoint-specific rules.
 */
export const DEFAULT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const validateImageFiles = (
  files,
  {
    existingCount = 0,
    maxFiles = 5,
    maxSizeBytes = 5 * 1024 * 1024,
    allowedTypes = DEFAULT_IMAGE_MIME_TYPES,
    allowedTypesError = "Only JPG, JPEG, PNG, and WEBP images are allowed.",
    maxFilesError,
    maxSizeError = "Each image must be 5MB or smaller.",
  } = {},
) => {
  const selected = Array.from(files || []);
  const resolvedMaxFilesError =
    maxFilesError ?? `Maximum ${maxFiles} images allowed.`;

  if (existingCount + selected.length > maxFiles) {
    return { isValid: false, error: resolvedMaxFilesError };
  }

  for (const file of selected) {
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: allowedTypesError };
    }

    if (file.size > maxSizeBytes) {
      return { isValid: false, error: maxSizeError };
    }
  }

  return { isValid: true, error: "" };
};
