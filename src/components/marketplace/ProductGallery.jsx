import { useMemo, useState } from "react";
import { getPrimaryListingImageUrl, getListingImageGalleryUrls } from "@/lib/listingImages";

const getListingImage = (listing) => {
  return getPrimaryListingImageUrl(listing);
};

const getAllImages = (listing) => {
  return getListingImageGalleryUrls(listing);
};

export const ProductGallery = ({ listing }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const allImages = useMemo(() => getAllImages(listing), [listing]);
  const listingImage = useMemo(
    () => allImages[selectedImageIndex] || getListingImage(listing),
    [allImages, selectedImageIndex, listing],
  );

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#f0f2ec] aspect-square flex items-center justify-center">
        {listingImage ? (
          <img
            src={listingImage}
            alt={listing?.title || listing?.name || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-sm text-muted">
            No image available
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                selectedImageIndex === idx
                  ? "border-primary"
                  : "border-border/40 hover:border-border/60"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
