"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { collectionApi, productApi } from "@/lib/api";
import {
  Plus,
  Trash2,
  Save,
  Pencil,
  X,
  Layers,
  Check,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  isActive: boolean;
  _count?: { products: number };
}

interface ProductItem {
  id: string;
  _id?: string;
  name: string;
  images?: { url: string }[];
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage products modal state
  const [activeCollectionForProducts, setActiveCollectionForProducts] = useState<Collection | null>(null);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [collectionProductIds, setCollectionProductIds] = useState<Set<string>>(new Set());
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    heroImage: "",
    isActive: true,
  });

  const fetchCollections = async () => {
    try {
      const res = await collectionApi.adminList();
      setCollections(res.data.collections || []);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
      if (name === "name" && !editingCollection) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const handleStartEdit = (col: Collection) => {
    setEditingCollection(col);
    setFormData({
      name: col.name,
      slug: col.slug,
      description: col.description || "",
      heroImage: col.heroImage || "",
      isActive: col.isActive,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCollection(null);
    setFormData({ name: "", slug: "", description: "", heroImage: "", isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCollection) {
        await collectionApi.update(editingCollection.id, formData);
        toast.success("Collection updated successfully");
      } else {
        await collectionApi.create(formData);
        toast.success("Collection created successfully");
      }
      handleCancel();
      fetchCollections();
    } catch (error) {
      toast.error("Failed to save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete collection "${name}"?`)) {
      try {
        await collectionApi.delete(id);
        toast.success("Collection deleted");
        setCollections((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        toast.error("Failed to delete collection");
      }
    }
  };

  // Open product selector modal for a collection
  const handleOpenProductSelector = async (col: Collection) => {
    setActiveCollectionForProducts(col);
    setLoadingProducts(true);
    try {
      const [allRes, colRes] = await Promise.all([
        productApi.list({ limit: 100 }),
        collectionApi.get(col.slug),
      ]);

      const prods = (allRes.data.products || allRes.data || []).map((p: any) => ({
        ...p,
        id: p.id || p._id,
      }));
      setAllProducts(prods);

      const assigned = new Set<string>();
      if (colRes.data?.collection?.products) {
        colRes.data.collection.products.forEach((cp: any) => {
          if (cp.productId) assigned.add(cp.productId);
          else if (cp.product?.id) assigned.add(cp.product.id);
        });
      }
      setCollectionProductIds(assigned);
    } catch (err) {
      toast.error("Failed to load products for collection");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleToggleProductInCollection = async (productId: string) => {
    if (!activeCollectionForProducts) return;
    const colId = activeCollectionForProducts.id;
    const isAssigned = collectionProductIds.has(productId);

    try {
      if (isAssigned) {
        await collectionApi.removeProduct(colId, productId);
        setCollectionProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success("Product removed from collection");
      } else {
        await collectionApi.addProduct(colId, productId);
        setCollectionProductIds((prev) => new Set(prev).add(productId));
        toast.success("Product added to collection");
      }
      fetchCollections();
    } catch (err) {
      toast.error("Failed to update product association");
    }
  };

  const actionButton = (
    <button
      onClick={() => {
        if (showAddForm) handleCancel();
        else {
          setEditingCollection(null);
          setFormData({ name: "", slug: "", description: "", heroImage: "", isActive: true });
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
      {showAddForm ? "Cancel" : "New Collection"}
    </button>
  );

  return (
    <AdminLayout title="Themed Collections" action={actionButton}>
      {/* Create / Edit Form Panel */}
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
              {editingCollection ? `Edit Collection: ${editingCollection.name}` : "Create New Themed Collection"}
            </h2>
            <button onClick={handleCancel} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                Collection Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Summer Drop 2026, Cyberpunk Anime"
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
                placeholder="e.g. summer-drop-2026"
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
                Hero Banner Image URL
              </label>
              <input
                type="url"
                name="heroImage"
                value={formData.heroImage}
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
                placeholder="Story behind the collection, aesthetics, limited edition notes..."
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

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  style={{ accentColor: "#000000", width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#111827" }}>
                  Active (Published and visible in store)
                </span>
              </label>
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
                {isSubmitting ? "Saving..." : editingCollection ? "Update Collection" : "Save Collection"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
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

      {/* Collections Grid */}
      {isLoading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#6b7280" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          Loading collections...
        </div>
      ) : collections.length === 0 ? (
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
          <Layers size={40} color="#9ca3af" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: "#111827", fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Collections Yet</h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Curate products into themed drops, seasonal lookbooks, or style edits.
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
            + Create First Collection
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {collections.map((col) => {
            const productCount = col._count?.products ?? 0;
            return (
              <div
                key={col.id}
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
                {col.heroImage ? (
                  <div style={{ height: "140px", background: "#f3f4f6", overflow: "hidden" }}>
                    <img
                      src={col.heroImage}
                      alt={col.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: "100px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Layers size={32} color="#855d14" />
                  </div>
                )}

                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: "0 0 0.2rem" }}>
                        {col.name}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "#855d14", fontFamily: "monospace" }}>
                        /{col.slug}
                      </span>
                    </div>
                    <span
                      style={{
                        background: col.isActive ? "#dcfce7" : "#f3f4f6",
                        color: col.isActive ? "#166534" : "#6b7280",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {col.isActive ? "Active" : "Draft"}
                    </span>
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
                    {col.description || "No description provided."}
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
                    <button
                      onClick={() => handleOpenProductSelector(col)}
                      style={{
                        background: "#f3f4f6",
                        border: "1px solid #e5e7eb",
                        color: "#111827",
                        borderRadius: "6px",
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Package size={13} style={{ display: "inline-block", marginRight: "0.4rem", verticalAlign: "-2px" }} />
                      Manage Products ({productCount})
                    </button>

                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        onClick={() => handleStartEdit(col)}
                        title="Edit collection"
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
                        onClick={() => handleDelete(col.id, col.name)}
                        title="Delete collection"
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Selector Modal */}
      {activeCollectionForProducts && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  Assign Products to Collection
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#855d14", fontWeight: 600 }}>
                  {activeCollectionForProducts.name}
                </span>
              </div>
              <button
                onClick={() => setActiveCollectionForProducts(null)}
                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1rem 1.5rem", overflowY: "auto", flex: 1, background: "#ffffff" }}>
              {loadingProducts ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                  <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                  Loading store catalog...
                </div>
              ) : allProducts.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center" }}>No products found in store catalog.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {allProducts.map((p) => {
                    const isSelected = collectionProductIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProductInCollection(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          background: isSelected ? "#fef3c7" : "#f9fafb",
                          border: isSelected ? "1px solid #f59e0b" : "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "44px",
                              borderRadius: "4px",
                              background: "#f3f4f6",
                              overflow: "hidden",
                            }}
                          >
                            {p.images?.[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Package size={16} color="#9ca3af" style={{ margin: "14px 10px" }} />
                            )}
                          </div>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {p.name}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            border: isSelected ? "none" : "1px solid #d1d5db",
                            background: isSelected ? "#000000" : "transparent",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid #e5e7eb",
                background: "#f9fafb",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setActiveCollectionForProducts(null)}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
