"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { productApi, categoryApi } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Plus,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id?: string;
  _id?: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  position: number;
  altText?: string | null;
}

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    categoryId: "",
    isFeatured: false,
    isActive: true,
    material: "",
    careInstructions: "",
    tags: "",
  });

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageColors, setNewImageColors] = useState<string[]>([]);

  const [variants, setVariants] = useState<Variant[]>([
    { size: "S", color: "Standard", stock: 0 },
    { size: "M", color: "Standard", stock: 0 },
    { size: "L", color: "Standard", stock: 0 },
    { size: "XL", color: "Standard", stock: 0 },
    { size: "XXL", color: "Standard", stock: 0 },
  ]);
  const [colors, setColors] = useState<string[]>(["Standard"]);

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.list(),
          productApi.get(productId),
        ]);

        const cats = catRes.data?.categories || catRes.data || [];
        setCategories(cats.map((c: any) => ({ ...c, id: c.id || c._id })));

        const p = prodRes.data?.product || prodRes.data;
        if (!p) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }

        let parsedTags = "";
        if (p.tags) {
          try {
            const arr = typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags;
            parsedTags = Array.isArray(arr) ? arr.join(", ") : String(p.tags);
          } catch {
            parsedTags = String(p.tags);
          }
        }

        setFormData({
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          price: String(p.price || ""),
          compareAtPrice: p.comparePrice ? String(p.comparePrice) : p.compareAtPrice ? String(p.compareAtPrice) : "",
          stock: String(p.stock || "0"),
          categoryId: p.categoryId || (typeof p.category === "object" ? p.category?.id || p.category?._id : p.category) || "",
          isFeatured: Boolean(p.isFeatured),
          isActive: p.isActive !== false,
          material: p.material || "",
          careInstructions: p.careInstr || p.careInstructions || "",
          tags: parsedTags,
        });

        if (p.images && p.images.length) {
          setExistingImages(p.images);
        }

        if (p.variants && p.variants.length) {
          const loadedVariants: Variant[] = p.variants.map((v: any) => ({
              id: v.id,
              size: v.size || "M",
              color: v.color || "Standard",
              stock: Number(v.stock) || 0,
          }));
          setVariants(loadedVariants);
          setColors([...new Set(loadedVariants.map((variant) => variant.color))]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) init();
  }, [productId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: field === "stock" ? parseInt(value) || 0 : value };
    setVariants(updated);

    const totalStock = updated.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
    setFormData((prev) => ({ ...prev, stock: String(totalStock) }));
  };

  const addVariantRow = () => {
    setVariants((prev) => [...prev, { size: "Custom", color: colors[0] || "Standard", stock: 0 }]);
  };

  const addColor = () => {
    let index = colors.length + 1;
    while (colors.some((color) => color.toLowerCase() === `color ${index}`.toLowerCase())) index += 1;
    const colorName = `Color ${index}`;
    setColors((prev) => [...prev, colorName]);
    setVariants((prev) => {
      const sizes = [...new Set(prev.map((variant) => variant.size))];
      return [...prev, ...sizes.map((size) => ({
        size,
        color: colorName,
        stock: prev.find((variant) => variant.size === size)?.stock || 0,
      }))];
    });
    const addedStock = [...new Set(variants.map((variant) => variant.size))]
      .reduce((total, size) => total + (variants.find((variant) => variant.size === size)?.stock || 0), 0);
    setFormData((prev) => ({ ...prev, stock: String(Number(prev.stock) + addedStock) }));
  };

  const renameColor = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    if (colors.some((color) => color !== oldName && color.trim().toLowerCase() === newName.trim().toLowerCase())) {
      toast.error("Color names must be unique");
      return;
    }
    setColors((prev) => prev.map((color) => color === oldName ? newName : color));
    setVariants((prev) => prev.map((variant) => variant.color === oldName ? { ...variant, color: newName } : variant));
    setExistingImages((prev) => prev.map((image) => image.altText === oldName ? { ...image, altText: newName } : image));
    setNewImageColors((prev) => prev.map((color) => color === oldName ? newName : color));
  };

  const removeColor = (colorName: string) => {
    if (colors.length === 1) {
      toast.error("A product must have at least one color");
      return;
    }
    setColors((prev) => prev.filter((color) => color !== colorName));
    const remainingVariants = variants.filter((variant) => variant.color !== colorName);
    setVariants(remainingVariants);
    setFormData((prev) => ({
      ...prev,
      stock: String(remainingVariants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)),
    }));
    setExistingImages((prev) => prev.map((image) => image.altText === colorName ? { ...image, altText: null } : image));
    setNewImageColors((prev) => prev.map((color) => color === colorName ? "" : color));
  };

  const removeVariantRow = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    const totalStock = updated.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
    setFormData((prev) => ({ ...prev, stock: String(totalStock) }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, colorName = "") => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
      setNewImageColors((prev) => [...prev, ...filesArray.map(() => colorName)]);
    }
    e.target.value = "";
  };

  const removeExistingImage = (id: string) => {
    setDeletedImageIds((prev) => [...prev, id]);
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImageColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Please fill required fields (Name, Price, Category)");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.compareAtPrice) {
      data.append("comparePrice", formData.compareAtPrice);
      data.append("compareAtPrice", formData.compareAtPrice);
    }
    data.append("stock", formData.stock);
    data.append("categoryId", formData.categoryId);
    data.append("isFeatured", String(formData.isFeatured));
    data.append("isActive", String(formData.isActive));
    if (formData.material) data.append("material", formData.material);
    if (formData.careInstructions) data.append("careInstr", formData.careInstructions);

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    data.append("tags", JSON.stringify(tagsArray));

    // Variants
    data.append("sizes", JSON.stringify(variants));

    // Deleted images
    if (deletedImageIds.length) {
      data.append("deleteImageIds", JSON.stringify(deletedImageIds));
    }

    // New uploaded files
    newImages.forEach((img) => {
      data.append("images", img);
    });
    data.append("imageAltTexts", JSON.stringify(newImageColors));
    data.append("imageAltTextUpdates", JSON.stringify(
      existingImages.map((image) => ({ id: image.id, altText: image.altText || "" }))
    ));

    try {
      await productApi.update(productId, data);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product? Products referenced by past orders will be kept and deactivated instead.")) {
      setIsDeleting(true);
      try {
        const { data } = await productApi.delete(productId);
        toast.success(data.message);
        router.push("/admin/products");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete product");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Product">
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--grey-400)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          Loading product details...
        </div>
      </AdminLayout>
    );
  }

  const actionButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Link
        href="/admin/products"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--grey-400)",
          fontSize: "0.85rem",
          textDecoration: "none",
          padding: "0.5rem 0.75rem",
        }}
      >
        <ArrowLeft size={16} /> Back
      </Link>
      {formData.slug && (
        <Link
          href={`/product/${formData.slug}`}
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            color: "#111827",
            fontSize: "0.85rem",
            borderRadius: "6px",
            padding: "0.5rem 0.85rem",
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <ExternalLink size={15} /> View in Store
        </Link>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          fontSize: "0.85rem",
          borderRadius: "6px",
          padding: "0.5rem 0.85rem",
          cursor: "pointer",
        }}
      >
        <Trash2 size={15} /> Delete
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#C9A96E",
          color: "#000",
          fontSize: "0.85rem",
          fontWeight: 600,
          borderRadius: "6px",
          padding: "0.55rem 1.25rem",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(201, 169, 110, 0.2)",
        }}
      >
        <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  return (
    <AdminLayout title={`Edit: ${formData.name || "Product"}`} action={actionButtons}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", paddingBottom: "3rem" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Basic Information Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "1.25rem" }}>
              Basic Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#4b5563",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.875rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Image Gallery Management */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "0.5rem" }}>
              Product Media Gallery
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--grey-400)", marginBottom: "1.25rem" }}>
              Manage active photos and upload additional high-resolution images
            </p>

            {/* Current Images */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#855d14", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                  Current Images ({existingImages.length})
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "148px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                        background: "#f4f4f5",
                      }}
                    >
                      <img
                        src={img.url}
                        alt="Product"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        title="Remove image"
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(0,0,0,0.75)",
                          color: "#f87171",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                      <select
                        aria-label="Image color"
                        value={img.altText || ""}
                        onChange={(event) => setExistingImages((prev) => prev.map((image) => image.id === img.id ? { ...image, altText: event.target.value || null } : image))}
                        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", border: 0, padding: "4px", fontSize: "10px", background: "rgba(255,255,255,0.95)" }}
                      >
                        <option value="">Shared / no color</option>
                        {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f9fafb",
                  transition: "border-color 0.2s",
                }}
              >
                <Upload size={24} color="#C9A96E" style={{ margin: "0 auto 0.5rem" }} />
                <div style={{ fontSize: "0.85rem", color: "#111827", fontWeight: 500 }}>
                  Click to add new photos
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--grey-400)", marginTop: "0.2rem" }}>
                  PNG, JPG, WEBP up to 10MB each
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>

              {newImagePreviews.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                    + New Images to Upload ({newImagePreviews.length})
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {newImagePreviews.map((preview, i) => (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          width: "90px",
                        height: "138px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #16a34a",
                        }}
                      >
                        <img
                          src={preview}
                          alt="New preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.75)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "3px",
                            cursor: "pointer",
                          }}
                        >
                          <X size={12} />
                        </button>
                        <select
                          aria-label="Image color"
                          value={newImageColors[i] || ""}
                          onChange={(event) => setNewImageColors((prev) => prev.map((color, imageIndex) => imageIndex === i ? event.target.value : color))}
                          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", border: 0, padding: "4px", fontSize: "10px", background: "rgba(255,255,255,0.95)" }}
                        >
                          <option value="">Shared / no color</option>
                          {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants and Sizes Table */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", margin: 0 }}>
                  Size & Stock Variants
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--grey-400)", margin: "0.2rem 0 0" }}>
                  Break down stock per size and colorway
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#111827",
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.85rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <strong style={{ fontSize: "0.8rem", color: "#111827" }}>Product colors</strong>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.2rem" }}>Upload images for a color and select it on the images above.</div>
                </div>
                <button type="button" onClick={addColor} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", padding: "0.4rem 0.6rem", fontSize: "0.75rem", cursor: "pointer" }}>
                  <Plus size={13} /> Add color
                </button>
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {colors.map((color, colorIndex) => (
                  <div key={colorIndex} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.4rem" }}>
                    <input aria-label="Color name" value={color} onChange={(event) => renameColor(color, event.target.value)} style={{ minWidth: 0, flex: 1, border: "1px solid #e5e7eb", borderRadius: "4px", padding: "0.4rem", color: "#111827" }} />
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", fontSize: "0.7rem", whiteSpace: "nowrap", color: "#374151" }}>
                      <Upload size={13} /> Upload
                      <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(event) => handleImageSelect(event, color)} />
                    </label>
                    <button type="button" aria-label={`Remove ${color}`} disabled={colors.length === 1} onClick={() => removeColor(color)} style={{ border: 0, background: "none", color: "#ef4444", cursor: "pointer", opacity: colors.length === 1 ? 0.3 : 1 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#6b7280" }}>
                  <th style={{ padding: "0.5rem" }}>Size</th>
                  <th style={{ padding: "0.5rem" }}>Color</th>
                  <th style={{ padding: "0.5rem" }}>Units In Stock</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleVariantChange(i, "size", e.target.value)}
                        style={{
                          width: "80px",
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          padding: "0.4rem 0.6rem",
                          color: "#111827",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <select
                        value={v.color}
                        onChange={(e) => handleVariantChange(i, "color", e.target.value)}
                        style={{
                          width: "140px",
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          padding: "0.4rem 0.6rem",
                          color: "#111827",
                        }}
                      >
                        {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                        style={{
                          width: "90px",
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          padding: "0.4rem 0.6rem",
                          color: "#111827",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#855d14" }}>
              Calculated Total Stock: <strong>{formData.stock} units</strong>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Pricing Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "1rem" }}>
              Pricing
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Compare at Price (₹)
                </label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  placeholder="e.g. 1999"
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#6b7280",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Visibility & Category Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "1rem" }}>
              Status & Category
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => {
                    const cid = c.id || c._id || "";
                    return (
                      <option key={cid} value={cid}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ paddingTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    style={{ accentColor: "#C9A96E", width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "0.875rem", color: "#111827" }}>
                    Active (Visible in store)
                  </span>
                </label>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    style={{ accentColor: "#C9A96E", width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "0.875rem", color: "#111827" }}>
                    Feature on Homepage
                  </span>
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="oversized, luxury, cotton"
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Material & Care */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "1rem" }}>
              Garment Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Fabric / Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="e.g. 100% French Terry 240 GSM"
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                  Care Instructions
                </label>
                <input
                  type="text"
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Machine wash cold, tumble dry low"
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
