"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { categoryApi } from "@/lib/api";
import { Plus, Trash2, Save, Pencil, X, Folder, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      const raw = res.data.categories || res.data || [];
      const normalized = raw.map((c: any) => ({
        ...c,
        id: c.id || c._id,
      }));
      setCategories(normalized);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name" && !editingCategory) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      image: category.image || "",
      description: category.description || "",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", image: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryApi.create(formData);
        toast.success("Category created successfully");
      }
      handleCancelForm();
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await categoryApi.delete(id);
        toast.success("Category deleted successfully");
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const actionButton = (
    <button
      onClick={() => {
        if (showAddForm) handleCancelForm();
        else {
          setEditingCategory(null);
          setFormData({ name: "", slug: "", image: "", description: "" });
          setShowAddForm(true);
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: showAddForm ? "#ffffff" : "#000000",
        color: showAddForm ? "#111827" : "#ffffff",
        border: showAddForm ? "1px solid #e5e7eb" : "none",
        padding: "0.6rem 1.25rem",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {showAddForm ? <X size={16} /> : <Plus size={16} />}
      {showAddForm ? "Cancel" : "Add Category"}
    </button>
  );

  return (
    <AdminLayout title="Product Categories" action={actionButton}>
      {/* Category Create/Edit Form Panel */}
      {showAddForm && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.75rem",
            marginBottom: "2rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h2>
            <button
              onClick={handleCancelForm}
              style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Oversized T-Shirts"
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "0.6rem 0.85rem",
                  color: "#111827",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                placeholder="e.g. oversized-t-shirts"
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "0.6rem 0.85rem",
                  color: "#374151",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                Banner / Cover Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or /uploads/..."
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "0.6rem 0.85rem",
                  color: "#111827",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Category summary shown on shop category headers..."
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "0.6rem 0.85rem",
                  color: "#111827",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#000000",
                  color: "#ffffff",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  color: "#4b5563",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Cards Grid */}
      {isLoading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#6b7280" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Folder size={40} color="#9ca3af" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: "#111827", fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Categories Found</h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Add categories to organize your t-shirts and apparel lines.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: "#000000",
              color: "#ffffff",
              fontWeight: 600,
              padding: "0.6rem 1.25rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            + Create First Category
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {categories.map((cat) => {
            const count = cat._count?.products ?? 0;
            return (
              <div
                key={cat.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                {cat.image ? (
                  <div style={{ height: "120px", background: "#f3f4f6", overflow: "hidden" }}>
                    <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ height: "6px", background: "#000000" }} />
                )}

                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: "0 0 0.25rem" }}>
                        {cat.name}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "#855d14", fontFamily: "monospace" }}>
                        /{cat.slug}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        title="Edit category"
                        style={{
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          color: "#4b5563",
                          borderRadius: "4px",
                          padding: "0.35rem",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        title="Delete category"
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          color: "#dc2626",
                          borderRadius: "4px",
                          padding: "0.35rem",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#4b5563",
                      margin: "0.5rem 0 1rem",
                      flex: 1,
                      lineHeight: "1.4",
                    }}
                  >
                    {cat.description || "No description provided."}
                  </p>

                  <div
                    style={{
                      paddingTop: "0.75rem",
                      borderTop: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>Products Cataloged</span>
                    <span
                      style={{
                        background: "#f3f4f6",
                        border: "1px solid #e5e7eb",
                        color: "#111827",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "12px",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {count} items
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
