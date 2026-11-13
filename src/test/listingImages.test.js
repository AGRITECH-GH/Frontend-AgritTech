import { describe, it, expect } from "vitest";
import { getPrimaryListingImageUrl, getListingImageGalleryUrls } from "@/lib/listingImages";

describe("listingImages", () => {
  const listing = {
    images: [
      { url: "third.jpg", sortOrder: 3 },
      { secure_url: "first.jpg", sortOrder: 1 },
      { imageUrl: "primary.jpg", isPrimary: true, sortOrder: 9 },
      "plain.jpg",
    ],
  };

  it("puts the primary image first, then sorts by sortOrder", () => {
    expect(getPrimaryListingImageUrl(listing)).toBe("primary.jpg");
    expect(getListingImageGalleryUrls(listing)).toEqual([
      "primary.jpg",
      "first.jpg",
      "third.jpg",
      "plain.jpg",
    ]);
  });

  it("falls back to legacy single-image fields", () => {
    expect(getPrimaryListingImageUrl({ imageUrl: "legacy.jpg" })).toBe("legacy.jpg");
    expect(getListingImageGalleryUrls({ image: "legacy.jpg" })).toEqual(["legacy.jpg"]);
  });

  it("returns empty values when there is no image", () => {
    expect(getPrimaryListingImageUrl(null)).toBe("");
    expect(getListingImageGalleryUrls({ images: [] })).toEqual([]);
  });
});
