const toImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.imageUrl ||
    image.url ||
    image.secure_url ||
    image.src ||
    image.path ||
    ""
  );
};

const sortImagesForDisplay = (images) => {
  if (!Array.isArray(images)) return [];

  return [...images].sort((a, b) => {
    const aPrimary = a?.isPrimary ? 1 : 0;
    const bPrimary = b?.isPrimary ? 1 : 0;

    if (aPrimary !== bPrimary) {
      return bPrimary - aPrimary;
    }

    const aOrder = Number.isFinite(Number(a?.sortOrder))
      ? Number(a.sortOrder)
      : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(Number(b?.sortOrder))
      ? Number(b.sortOrder)
      : Number.MAX_SAFE_INTEGER;

    return aOrder - bOrder;
  });
};

export const getPrimaryListingImageUrl = (listing) => {
  const images = Array.isArray(listing?.images) ? listing.images : [];

  if (images.length > 0) {
    const sorted = sortImagesForDisplay(images);
    const primaryUrl = toImageUrl(sorted[0]);
    if (primaryUrl) return primaryUrl;
  }

  return listing?.imageUrl || listing?.image || "";
};

export const getListingImageGalleryUrls = (listing) => {
  const images = Array.isArray(listing?.images) ? listing.images : [];
  if (images.length === 0) {
    return getPrimaryListingImageUrl(listing)
      ? [getPrimaryListingImageUrl(listing)]
      : [];
  }

  return sortImagesForDisplay(images).map(toImageUrl).filter(Boolean);
};
