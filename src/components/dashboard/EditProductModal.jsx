import { useState, useEffect } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { validateImageFiles } from "@/lib/utils";

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  onUploadImages,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    pricePerUnit: 0,
    quantityAvailable: 0,
    unit: "",
    status: "active",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        pricePerUnit: product.pricePerUnit || 0,
        quantityAvailable: product.quantityAvailable || 0,
        unit: product.unit || "KG",
        status: product.status || "active",
      });
      setUploadedFiles([]);
      setError("");
      setUploadError("");
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
    setError("");
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { isValid, error } = validateImageFiles(files, {
      maxFiles: 5,
      maxFilesError: "Maximum 5 images allowed.",
    });
    if (!isValid) {
      setUploadError(error);
      return;
    }

    setUploadedFiles(files);
    setUploadError("");
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Product name is required.");
      return;
    }

    if (formData.pricePerUnit <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (formData.quantityAvailable < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    try {
      // First, update product details
      await onSave(formData);

      // Then, upload images if any
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        try {
          await onUploadImages(uploadedFiles);
        } catch (err) {
          console.error("Image upload failed, but product was updated:", err);
          // Don't block the save if images fail
        } finally {
          setIsUploading(false);
        }
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save product. Please try again.");
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-96 w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Product Name ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter product name"
            />
          </div>

          {/* ── Description ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter product description"
            />
          </div>

          {/* ── Price & Quantity Row ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Per Unit
              </label>
              <div className="mt-1 flex items-center">
                <span className="text-gray-500">₵</span>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="ml-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity Available
              </label>
              <input
                type="number"
                name="quantityAvailable"
                value={formData.quantityAvailable}
                onChange={handleInputChange}
                step="1"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>

          {/* ── Unit Selection ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="KG">KG</option>
              <option value="BAG">BAG</option>
              <option value="CRATE">CRATE</option>
              <option value="PIECE">PIECE</option>
              <option value="LITRE">LITRE</option>
              <option value="BUNDLE">BUNDLE</option>
            </select>
          </div>

          {/* ── Status Toggle ── */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">Product Status</p>
              <p className="text-sm text-gray-600">
                {formData.status === "active"
                  ? "Product is active and visible"
                  : "Product is hidden from listings"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.status === "active" ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.status === "active"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* ── Image Upload ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Images
            </label>
            <div className="mt-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 transition hover:border-primary hover:bg-gray-50">
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
            </div>

            {/* ── File List ── */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-100 px-3 py-2"
                  >
                    <span className="truncate text-sm text-gray-700">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                      className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving || isUploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
