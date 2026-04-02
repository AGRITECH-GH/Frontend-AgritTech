import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/lib";
import AdminLayout from "@/components/admin/AdminLayout";

const extractCategories = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.categories,
    response.items,
    response.data?.categories,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getCategoryId = (category) =>
  String(category?.id || category?._id || "").trim();

const AdminSettings = () => {
  const { user: authUser } = useAuth();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
    parentId: "",
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    id: "",
    name: "",
    description: "",
    iconUrl: "",
    parentId: "",
    isActive: true,
  });
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl: authUser?.avatarUrl || authUser?.profileImage || null,
  };

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const response = await adminService.getCategories();
        if (cancelled) return;
        setCategories(extractCategories(response));
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(err.message || "Failed to fetch categories.");
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshCategories = async () => {
    const refreshed = await adminService.getCategories();
    setCategories(extractCategories(refreshed));
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!createForm.name.trim()) {
      setCreateError("Category name is required.");
      return;
    }

    setCreatingCategory(true);
    try {
      await adminService.createCategory({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        iconUrl: createForm.iconUrl.trim() || undefined,
        parentId: createForm.parentId.trim() || null,
      });

      setCreateSuccess("Category created successfully.");
      setCreateForm({ name: "", description: "", iconUrl: "", parentId: "" });
      setIsCreateOpen(false);
      await refreshCategories();
    } catch (err) {
      setCreateError(err.message || "Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleUpdateCategory = async (event) => {
    event.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    if (!updateForm.id.trim()) {
      setUpdateError("Category ID is required for update.");
      return;
    }
    if (!updateForm.name.trim()) {
      setUpdateError("Category name is required.");
      return;
    }

    setUpdatingCategory(true);
    try {
      await adminService.updateCategory(updateForm.id.trim(), {
        name: updateForm.name.trim(),
        description: updateForm.description.trim() || null,
        iconUrl: updateForm.iconUrl.trim() || null,
        parentId: updateForm.parentId.trim() || null,
        isActive: Boolean(updateForm.isActive),
      });

      setUpdateSuccess("Category updated successfully.");
      setEditingCategoryId("");
      setUpdateForm({
        id: "",
        name: "",
        description: "",
        iconUrl: "",
        parentId: "",
        isActive: true,
      });
      await refreshCategories();
    } catch (err) {
      setUpdateError(err.message || "Failed to update category.");
    } finally {
      setUpdatingCategory(false);
    }
  };

  const startEditCategory = (category) => {
    const categoryId = getCategoryId(category);
    if (!categoryId) return;

    setUpdateError("");
    setUpdateSuccess("");
    setEditingCategoryId(categoryId);
    setUpdateForm({
      id: categoryId,
      name: category?.name || "",
      description: category?.description || "",
      iconUrl: category?.iconUrl || category?.icon_url || "",
      parentId:
        String(
          category?.parentId ||
            category?.parent_id ||
            category?.parent?.id ||
            category?.parent?._id ||
            "",
        ) || "",
      isActive: Boolean(category?.isActive ?? category?.active ?? true),
    });
  };

  const cancelEditCategory = () => {
    setEditingCategoryId("");
    setUpdateError("");
    setUpdateSuccess("");
    setUpdateForm({
      id: "",
      name: "",
      description: "",
      iconUrl: "",
      parentId: "",
      isActive: true,
    });
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-50 to-white p-5 pl-12 shadow-sm lg:pl-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage platform taxonomy and administrative configuration.
          </p>
        </div>

        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Categories</h2>
              <p className="mt-1 text-sm text-muted">
                Create and maintain product categories used across the marketplace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateError("");
                setCreateSuccess("");
                setIsCreateOpen(true);
              }}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create Category
            </button>
          </div>

          {(createSuccess || updateSuccess) && (
            <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {createSuccess || updateSuccess}
            </div>
          )}

          {categoriesError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {categoriesError}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground">#</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Children</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  [...categories]
                    .sort((a, b) => getCategoryId(a).localeCompare(getCategoryId(b)))
                    .map((category, index) => (
                      <tr
                        key={getCategoryId(category) || index}
                        className="border-b border-border/40"
                      >
                        <td className="px-4 py-3 text-foreground/80">{index + 1}</td>
                        <td className="px-4 py-3 text-foreground">{category.name || "-"}</td>
                        <td className="px-4 py-3 text-foreground/80">{category.description || "-"}</td>
                        <td className="px-4 py-3 text-foreground/80">
                          {Array.isArray(category.children) ? category.children.length : 0}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => startEditCategory(category)}
                            disabled={!getCategoryId(category)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface/70 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Create Category</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-border px-3 py-1 text-sm text-foreground"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleCreateCategory} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Description"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="url"
                  value={createForm.iconUrl}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, iconUrl: e.target.value }))
                  }
                  placeholder="Icon URL"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  value={createForm.parentId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, parentId: e.target.value }))
                  }
                  placeholder="Parent ID (optional)"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />

                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 lg:col-span-2">
                    {createError}
                  </div>
                )}

                <div className="flex gap-2 lg:col-span-2">
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {creatingCategory ? "Creating..." : "Create Category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingCategoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Edit Category</h3>
                <button
                  type="button"
                  onClick={cancelEditCategory}
                  className="rounded-lg border border-border px-3 py-1 text-sm text-foreground"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-3">
                <div className="text-xs text-muted">Category ID: {updateForm.id}</div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <input
                    type="text"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                  <input
                    type="text"
                    value={updateForm.description}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                  <input
                    type="url"
                    value={updateForm.iconUrl}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, iconUrl: e.target.value }))
                    }
                    placeholder="Icon URL"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                  <input
                    type="text"
                    value={updateForm.parentId}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, parentId: e.target.value }))
                    }
                    placeholder="Parent ID"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={updateForm.isActive}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                  isActive
                </label>

                {updateError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {updateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updatingCategory}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {updatingCategory ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditCategory}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminSettings;
