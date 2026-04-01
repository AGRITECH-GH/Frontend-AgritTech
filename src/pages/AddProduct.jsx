import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory, PRODUCT_UNITS } from "@/hooks/useInventory";
import { listingsService, categoriesService } from "@/lib";
import StatCard from "@/components/dashboard/StatCard";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useEffect } from "react";

const AddProduct = () => {
  const navigate = useNavigate();
  const { stats } = useInventory();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    productName: "",
    expectedHarvestDate: "",
    category: "",
    pricePerUnit: "",
    quantity: "",
    unit: "KG",
    storageLocation: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageErrors, setImageErrors] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [createdListingId, setCreatedListingId] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesService.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0";
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }
    if (!formData.storageLocation.trim()) {
      newErrors.storageLocation = "Storage location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateFiles = (files) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFiles = 5;

    if (uploadedImages.length + files.length > maxFiles) {
      setImageErrors(`Maximum ${maxFiles} images allowed`);
      return [];
    }

    const validFiles = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageErrors("Only JPG, PNG, or WEBP images are allowed");
        return [];
      }
      if (file.size > maxSize) {
        setImageErrors("Images must be smaller than 10MB each");
        return [];
      }
      validFiles.push(file);
    }

    setImageErrors("");
    return validFiles;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setUploadedImages((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-surface");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-primary", "bg-surface");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-surface");
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setUploadedImages((prev) => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const safeUnit = PRODUCT_UNITS.includes(formData.unit)
        ? formData.unit
        : "KG";

      const res = await listingsService.createListing({
        title: formData.productName.trim(),
        description: (formData.description || formData.productName).trim(),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        quantity: parseFloat(formData.quantity),
        quantityAvailable: parseFloat(formData.quantity),
        unit: safeUnit,
        location: formData.storageLocation.trim(),
        listingType: "SELL",
        categoryId: formData.category,
      });

      const listingId = res.listing?.id;
      setCreatedListingId(listingId);

      // Upload images if any
      if (uploadedImages.length > 0 && listingId) {
        setIsUploadingImages(true);
        try {
          await listingsService.uploadListingImages(listingId, uploadedImages);
          console.log("Images uploaded successfully");
        } catch (err) {
          console.error("Image upload failed:", err);
        } finally {
          setIsUploadingImages(false);
        }
      }

      // Success - navigate after brief delay
      setTimeout(() => {
        navigate("/farmer/inventory");
      }, 500);
    } catch (err) {
      setErrors({
        form:
          err.status === 403
            ? "You do not have permission to create listings. Please log in with a FARMER account."
            : err.message || "Failed to create listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <main className="container py-6 lg:py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate("/farmer/inventory")}
          className="mb-6 flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Inventory
        </button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Add New Farm Product
          </h1>
          <p className="mt-1 text-sm text-muted">
            Register a new harvest or product batch to your digital inventory.
          </p>
        </div>

        {/* Form Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm lg:p-8">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Product Name & Harvest Date */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g. Organic Red Tomatoes"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.productName
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {errors.productName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.productName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  name="expectedHarvestDate"
                  value={formData.expectedHarvestDate}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.expectedHarvestDate
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {errors.expectedHarvestDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.expectedHarvestDate}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Category & Price */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loadingCategories}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.category
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                >
                  <option value="">
                    {loadingCategories ? "Loading..." : "Select a category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Price per Unit (GHC)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    GHC
                  </span>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full rounded-lg border px-3 py-2 pl-12 text-sm transition focus:outline-none ${
                      errors.pricePerUnit
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.pricePerUnit && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.pricePerUnit}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Quantity, Unit & Storage */}
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.1"
                  min="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.quantity
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.unit
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                >
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-xs text-red-500">{errors.unit}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. North Warehouse, Bin 4"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${
                    errors.storageLocation
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {errors.storageLocation && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.storageLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Upload Photos
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-surface/50 px-6 py-12 transition hover:border-primary hover:bg-surface"
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop images here
                  </p>
                  <p className="text-xs text-muted">
                    or click to browse from your files
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    JPG, PNG or WEBP up to 10 MB each (max{" "}
                    {5 - uploadedImages.length} remaining)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={isSubmitting || isUploadingImages}
                  className="hidden"
                />
              </div>

              {imageErrors && (
                <p className="mt-2 text-xs text-red-500">{imageErrors}</p>
              )}

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-3 text-sm font-medium text-foreground">
                    {uploadedImages.length} image
                    {uploadedImages.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {uploadedImages.map((file, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-lg bg-gray-100"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting || isUploadingImages}
                          className="absolute right-1 top-1 rounded bg-red-500 p-1 text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="px-2 py-1 text-xs text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/farmer/inventory")}
                className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImages}
                className="flex items-center gap-2 rounded-full bg-green-600 px-8 py-2 text-sm font-medium text-white transition disabled:opacity-60 hover:bg-green-700"
              >
                {isSubmitting
                  ? "Adding..."
                  : isUploadingImages
                    ? "Uploading..."
                    : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <StatCard
            label="Total Items"
            value={stats.totalItems.toString()}
            icon="tag"
          />
          <StatCard
            label="Organic %"
            value={`${stats.organicPercentage}%`}
            icon="repeat"
          />
          <StatCard
            label="Est. Value"
            value={`₵${(parseFloat(stats.totalValue) / 1000).toFixed(1)}k`}
            icon="dollar"
          />
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
