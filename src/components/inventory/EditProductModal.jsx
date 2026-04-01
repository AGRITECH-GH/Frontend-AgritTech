import { useState, useEffect } from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";

const PRODUCT_UNITS = ["KG", "BAG", "CRATE", "PIECE", "LITRE", "BUNDLE"];

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  onUploadImages,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    pricePerUnit: "",
    quantityAvailable: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        title: product.name || "",
        pricePerUnit: product.price || "",
        quantityAvailable: product.stockLevel || "",
        status: product.status === "active" ? "ACTIVE" : "PAUSED",
      });
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen, product]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product name is required";
    }

    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0";
    }

    if (
      !formData.quantityAvailable ||
      parseFloat(formData.quantityAvailable) < 0
    ) {
      newErrors.quantityAvailable = "Quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitError("");

    const result = await onSave({
      title: formData.title,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      quantityAvailable: parseFloat(formData.quantityAvailable),
      status: formData.status,
    });

    if (result?.success) {
      onClose();
    } else {
      setSubmitError(result?.error || "Failed to update product");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setUploadingImages(true);

    const result = await onUploadImages(files);

    if (!result?.success) {
      setSubmitError(result?.error || "Failed to upload images");
    }

    setUploadingImages(false);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
        className="relative z-[101] w-full max-w-md rounded-2xl border border-border/60 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-product-title"
              className="text-lg font-bold text-foreground"
            >
              Edit Product
            </h2>
            <p className="mt-1 text-sm text-muted">
              Update pricing, quantity, and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Product Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Product name"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Price per Unit
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={(e) =>
                  handleInputChange("pricePerUnit", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="0.00"
              />
              {errors.pricePerUnit && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.pricePerUnit}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Available Qty
              </label>
              <input
                type="number"
                value={formData.quantityAvailable}
                onChange={(e) =>
                  handleInputChange("quantityAvailable", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="0"
              />
              {errors.quantityAvailable && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.quantityAvailable}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Status
            </label>
            <div className="flex gap-2">
              {["ACTIVE", "PAUSED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleInputChange("status", st)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    formData.status === st
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-border text-foreground hover:bg-surface"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Upload Images (max 5)
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-3 transition hover:border-primary hover:bg-primary/5">
              <Upload className="h-4 w-4 text-muted" />
              <span className="text-sm text-muted">
                {uploadingImages ? "Uploading..." : "Click to upload"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>
          </div>

          {/* Error */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
