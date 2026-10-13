"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { productApi } from "@/lib/api";
import { Pencil, Trash2, Search, Plus, Package, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
  category?: { name: string } | string;
  images?: { url: string }[];
  variants?: { color?: string | null }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await productApi.list({ limit: 100, includeInactive: true });
      const raw = res.data.products || res.data || [];
      // Normalize id vs _id
      const normalized: Product[] = raw.map((p: any) => ({
        ...p,
        id: p.id || p._id,
      }));
      setProducts(normalized);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? Products referenced by past orders will be kept and deactivated instead.`)) {
      try {
        const { data } = await productApi.delete(id);
        toast.success(data.message);
        setProducts((prev) => data.deleted
          ? prev.filter((p) => p.id !== id)
          : prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
        );
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const form = new FormData();
      form.append("isActive", String(!product.isActive));
      await productApi.update(product.id, form);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(product.isActive ? "Product marked as draft" : "Product published live");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "ACTIVE") return p.isActive;
    if (statusFilter === "DRAFT") return !p.isActive;
    return true;
  });

  const actionButton = (
    <Link
      href="/admin/products/new"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "#C9A96E",
        color: "#000",
        padding: "0.6rem 1.25rem",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        fontSize: "0.875rem",
        textDecoration: "none",
        boxShadow: "0 2px 10px rgba(201, 169, 110, 0.2)",
      }}
    >
      <Plus size={16} /> Add Product
    </Link>
  );

  return (
    <AdminLayout title="Products Catalog" action={actionButton}>
      {/* Search & Filter Header */}
      <div style={{ marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              border: "1px solid #e5e7eb",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <Search size={16} color="#9ca3af" style={{ marginRight: "0.75rem", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#111827",
                width: "100%",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: "inline-flex", gap: "0.4rem", background: "#f3f4f6", padding: "4px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            {(["ALL", "ACTIVE", "DRAFT"] as const).map((tab) => {
              const active = statusFilter === tab;
              const count =
                tab === "ALL"
                  ? products.length
                  : tab === "ACTIVE"
                  ? products.filter((p) => p.isActive).length
                  : products.filter((p) => !p.isActive).length;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    background: active ? "#ffffff" : "transparent",
                    color: active ? (tab === "ACTIVE" ? "#16a34a" : tab === "DRAFT" ? "#d97706" : "#855d14") : "var(--grey-400)",
                    border: active ? "1px solid #e5e7eb" : "1px solid transparent",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : "Draft"} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ color: "var(--grey-400)", fontSize: "0.85rem" }}>
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600 }}>Product</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Price</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Stock</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td colSpan={6} style={{ padding: "1.25rem", textAlign: "center", color: "#9ca3af" }}>
                      Loading catalog...
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--grey-400)" }}>
                    {search ? "No products match your search query." : "No products added yet. Click 'Add Product' to start!"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const prodId = product.id;
                  const thumb = product.images?.[0]?.url;
                  const categoryName =
                    typeof product.category === "object" ? product.category?.name : product.category || "General";
                  const comparePrice = product.comparePrice || product.compareAtPrice;

                  return (
                    <tr
                      key={prodId}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Product Name & Thumbnail */}
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "54px",
                              borderRadius: "6px",
                              background: "#f4f4f5",
                              border: "1px solid #e5e7eb",
                              overflow: "hidden",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={product.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Package size={20} color="#9ca3af" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${prodId}`}
                              style={{
                                color: "#111827",
                                fontWeight: 600,
                                textDecoration: "none",
                                fontSize: "0.9rem",
                                display: "block",
                                marginBottom: "0.2rem",
                              }}
                            >
                              {product.name}
                            </Link>
                            <span style={{ fontSize: "0.75rem", color: "var(--grey-400)" }}>
                              slug: {product.slug}
                            </span>
                            {(() => {
                              const colors = [...new Set((product.variants || []).map((variant) => variant.color?.trim()).filter((color): color is string => Boolean(color)))];
                              return colors.length ? (
                                <span style={{ display: "block", fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                  Colors: {colors.join(", ")}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "0.9rem 1rem", color: "#4b5563" }}>
                        <span
                          style={{
                            background: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            color: "#374151",
                          }}
                        >
                          {categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "0.9rem 1rem", color: "#111827", fontWeight: 600 }}>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                        {comparePrice && Number(comparePrice) > Number(product.price) && (
                          <span
                            style={{
                              marginLeft: "0.5rem",
                              fontSize: "0.75rem",
                              color: "var(--grey-400)",
                              textDecoration: "line-through",
                              fontWeight: 400,
                            }}
                          >
                            ₹{Number(comparePrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Stock Badge */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        {product.stock === 0 ? (
                          <span
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#dc2626",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Out of stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span
                            style={{
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "#d97706",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Low ({product.stock})
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "rgba(74, 222, 128, 0.15)",
                              color: "#16a34a",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            {product.stock} units
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <button
                          onClick={() => handleToggleActive(product)}
                          disabled={togglingId === prodId}
                          style={{
                            background: product.isActive ? "rgba(74, 222, 128, 0.15)" : "#f3f4f6",
                            color: product.isActive ? "#16a34a" : "#6b7280",
                            border: `1px solid ${product.isActive ? "rgba(74, 222, 128, 0.3)" : "#e5e7eb"}`,
                            padding: "0.25rem 0.6rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: product.isActive ? "#4ade80" : "#777" }} />
                            {product.isActive ? "Active" : "Draft"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            title="View product in store"
                            style={{
                              color: "var(--grey-400)",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <Link
                            href={`/admin/products/${prodId}`}
                            title="Edit product"
                            style={{
                              color: "#C9A96E",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              textDecoration: "none",
                              background: "rgba(201, 169, 110, 0.08)",
                            }}
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(prodId, product.name)}
                            title="Delete / deactivate product"
                            style={{
                              color: "#f87171",
                              background: "rgba(248, 113, 113, 0.08)",
                              border: "none",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
