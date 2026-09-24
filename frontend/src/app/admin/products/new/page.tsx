"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { productApi, categoryApi, collectionApi } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Star,
  Tag,
  Package,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Info,
  Percent,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
  Image as ImageIcon,
  Link2,
  HelpCircle,
  RotateCcw,
  Check,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
}

interface Collection {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
}

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock: number;
}

interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  isExternal?: boolean;
  name?: string;
  size?: number;
}

const POPULAR_TAGS = [
  "Streetwear",
  "Oversized",
  "Acid Wash",
  "Heavyweight",
  "Best Seller",
  "Limited Edition",
  "Drop Shoulder",
  "100% Cotton",
  "Graphic Tee",
  "Summer Drop",
];

const FABRIC_PRESETS = [
  "100% Combed Cotton (240 GSM)",
  "French Terry Cotton (280 GSM)",
  "Heavyweight Cotton (220 GSM)",
  "Organic Bio-Washed Cotton (200 GSM)",
  "Cotton-Poly Terry Blend (260 GSM)",
];

const CARE_PRESETS = [
  "Machine wash cold inside out with similar colors",
  "Do not iron directly on graphics or prints",
  "Tumble dry low or line dry in shade",
  "Do not bleach or dry clean",
  "Warm iron on reverse side if needed",
];

const SIZE_PRESETS = {
  standard: ["S", "M", "L", "XL", "XXL"],
  oversized: ["M", "L", "XL"],
  full: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
};

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data sources
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic Details
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    category: "",
    material: "",
    careInstructions: "",
    isFeatured: false,
    isActive: true,
  });

  const [slugLocked, setSlugLocked] = useState(true);

  // Collections multi-select
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([
    { size: "S", color: "Standard", stock: 15 },
    { size: "M", color: "Standard", stock: 25 },
    { size: "L", color: "Standard", stock: 25 },
    { size: "XL", color: "Standard", stock: 20 },
    { size: "XXL", color: "Standard", stock: 10 },
  ]);
  const [bulkStockVal, setBulkStockVal] = useState("");

  // Media
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);

  // Load Categories & Collections
  useEffect(() => {
    Promise.all([
      categoryApi.list().catch(() => ({ data: [] })),
      collectionApi.adminList ? collectionApi.adminList().catch(() => ({ data: [] })) : collectionApi.list().catch(() => ({ data: [] })),
    ]).then(([catRes, colRes]) => {
      const catList = catRes.data?.categories || catRes.data || [];
      setCategories(catList.map((c: any) => ({ ...c, id: c.id || c._id })));

      const colList = colRes.data?.collections || colRes.data || [];
      setCollections(colList.map((c: any) => ({ ...c, id: c.id || c._id })));
    });
  }, []);

  // Auto-generate slug when title changes (if locked)
  useEffect(() => {
    if (slugLocked && formData.name) {
      const generated = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.name, slugLocked]);

  // Keyboard shortcut Ctrl+S / Cmd+S to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formData, variants, mediaList, tags, selectedCollections]);

  // Derived financial metrics
  const priceNum = parseFloat(formData.price) || 0;
  const compareNum = parseFloat(formData.compareAtPrice) || 0;
  const costNum = parseFloat(formData.costPerItem) || 0;

  const savingsAmount = compareNum > priceNum ? compareNum - priceNum : 0;
  const savingsPercent = compareNum > priceNum ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;

  const grossProfit = priceNum > costNum && costNum > 0 ? priceNum - costNum : 0;
  const grossMargin = priceNum > 0 && costNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : 0;

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  // Readiness checklist calculations
  const checklist = [
    { label: "Product Name", completed: Boolean(formData.name.trim()) },
    { label: "Primary Category", completed: Boolean(formData.category) },
    { label: "Selling Price", completed: priceNum > 0 },
    { label: "Product Media (At least 1 image)", completed: mediaList.length > 0 },
    { label: "Inventory Stock (> 0 units)", completed: totalStock > 0 },
  ];
  const completedChecklistCount = checklist.filter((item) => item.completed).length;
  const readinessPercent = Math.round((completedChecklistCount / checklist.length) * 100);

  // Form field change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Preset discount applier
  const applyQuickDiscount = (pct: number) => {
    if (!priceNum) {
      toast.error("Please enter a selling price first");
      return;
    }
    const calculatedCompare = Math.round(priceNum / (1 - pct / 100));
    setFormData((prev) => ({ ...prev, compareAtPrice: String(calculatedCompare) }));
    toast.success(`Set compare price to ₹${calculatedCompare} (${pct}% OFF)`);
  };

  // Media Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newItems: MediaItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      isExternal: false,
      name: file.name,
      size: file.size,
    }));
    setMediaList((prev) => [...prev, ...newItems]);
    toast.success(`Added ${files.length} image${files.length > 1 ? "s" : ""}`);
  };

  const addExternalUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      toast.error("Please enter a valid HTTP/HTTPS image URL");
      return;
    }

    const newItem: MediaItem = {
      id: Math.random().toString(36).substring(2, 9),
      previewUrl: url,
      isExternal: true,
      name: url.split("/").pop() || "External Image",
    };

    setMediaList((prev) => [...prev, newItem]);
    setUrlInput("");
    setShowUrlModal(false);
    toast.success("External image added");
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setMediaList((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    toast.success("Primary cover image updated");
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= mediaList.length) return;
    setMediaList((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  // Tags Handlers
  const handleAddTag = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Variants Handlers
  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: field === "stock" ? parseInt(value) || 0 : value,
    };
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { size: "Custom", color: "Standard", stock: 10 },
    ]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length === 1) {
      toast.error("Product must have at least one variant size");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const applySizePreset = (presetKey: "standard" | "oversized" | "full") => {
    const sizes = SIZE_PRESETS[presetKey];
    setVariants(sizes.map((s) => ({ size: s, color: "Standard", stock: 20 })));
    toast.success(`Applied ${presetKey} sizes preset`);
  };

  const handleBulkStockApply = () => {
    const stockVal = parseInt(bulkStockVal);
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    setVariants((prev) => prev.map((v) => ({ ...v, stock: stockVal })));
    setBulkStockVal("");
    toast.success(`Set ${stockVal} units for all ${variants.length} sizes`);
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all product fields?")) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        compareAtPrice: "",
        costPerItem: "",
        category: "",
        material: "",
        careInstructions: "",
        isFeatured: false,
        isActive: true,
      });
      setMediaList([]);
      setTags([]);
      setSelectedCollections([]);
      setVariants([
        { size: "S", color: "Standard", stock: 15 },
        { size: "M", color: "Standard", stock: 25 },
        { size: "L", color: "Standard", stock: 25 },
        { size: "XL", color: "Standard", stock: 20 },
        { size: "XXL", color: "Standard", stock: 10 },
      ]);
      toast.success("Form reset to empty template");
    }
  };

  // Submit Handler
  const handleSubmit = async (overrideActive?: boolean) => {
    if (!formData.name.trim()) {
      toast.error("Product Name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid selling price is required");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a primary category");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("slug", formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    data.append("description", formData.description.trim());
    data.append("price", formData.price);
    if (formData.compareAtPrice) {
      data.append("comparePrice", formData.compareAtPrice);
      data.append("compareAtPrice", formData.compareAtPrice);
    }
    data.append("stock", String(totalStock));
    data.append("categoryId", formData.category);
    data.append("category", formData.category);
    data.append("isFeatured", String(formData.isFeatured));
    
    // Status
    const publishStatus = overrideActive !== undefined ? overrideActive : formData.isActive;
    data.append("isActive", String(publishStatus));

    if (formData.material) data.append("material", formData.material.trim());
    if (formData.careInstructions) {
      data.append("careInstr", formData.careInstructions.trim());
      data.append("careInstructions", formData.careInstructions.trim());
    }

    // Tags
    if (tags.length) {
      data.append("tags", JSON.stringify(tags));
    }

    // Collections
    if (selectedCollections.length) {
      data.append("collectionIds", JSON.stringify(selectedCollections));
    }

    // Variants
    data.append(
      "sizes",
      JSON.stringify(
        variants.map((v) => ({
          size: v.size,
          color: v.color || "Standard",
          stock: Number(v.stock) || 0,
        }))
      )
    );

    // Media Files & External URLs
    const externalUrls: string[] = [];
    mediaList.forEach((m) => {
      if (m.file) {
        data.append("images", m.file);
      } else if (m.isExternal && m.previewUrl) {
        externalUrls.push(m.previewUrl);
      }
    });

    if (externalUrls.length) {
      data.append("imageUrls", JSON.stringify(externalUrls));
    }

    try {
      const res = await productApi.create(data);
      const createdProduct = res.data?.product;

      // Also ensure collections are linked if API endpoint supported
      if (createdProduct?.id && selectedCollections.length) {
        await Promise.allSettled(
          selectedCollections.map((colId) =>
            collectionApi.addProduct(colId, createdProduct.id)
          )
        );
      }

      toast.success(
        publishStatus
          ? "🎉 Product published successfully to Tees India!"
          : "Product saved as Draft!"
      );
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "Failed to create product. Check backend logs.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action header
  const actionButton = (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <button
        type="button"
        onClick={handleReset}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        title="Clear all fields"
      >
        <RotateCcw size={13} /> Reset
      </button>

      <button
        type="button"
        onClick={() => handleSubmit(false)}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        Save as Draft
      </button>

      <button
        type="button"
        onClick={() => handleSubmit(true)}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 text-xs font-semibold text-black bg-[#C9A96E] hover:bg-[#b89557] px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
      >
        <Save size={14} />
        {isSubmitting ? "Publishing..." : "Publish Product"}
        <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono ml-1 px-1.5 py-0.5 bg-black/10 rounded">
          Ctrl+S
        </span>
      </button>
    </div>
  );

  return (
    <AdminLayout title="Add New Product" action={actionButton}>
      {/* Top Readiness Bar */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-900">Catalog Readiness</h2>
            <span className="text-xs font-medium text-gray-500">
              ({completedChecklistCount}/{checklist.length} required steps complete)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 sm:w-48 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C9A96E] to-emerald-500 transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700">{readinessPercent}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                item.completed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                  : "bg-gray-50 text-gray-400 border border-gray-100"
              }`}
            >
              {item.completed ? (
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
              )}
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
        {/* Left Column (8 cols): Main Product Data */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Product Identity</h3>
                <p className="text-xs text-gray-500">
                  Name, web URL identifier, and customer-facing description
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-medium border border-amber-200">
                Required Info
              </span>
            </div>

            {/* Product Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">{formData.name.length}/100</span>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acid Washed Heavyweight Vintage Tee"
                maxLength={100}
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-900 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  Storefront URL Slug <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    title={slugLocked ? "Unlock to manually customize slug" : "Lock to auto-generate slug"}
                  >
                    {slugLocked ? <Lock size={12} /> : <Unlock size={12} className="text-amber-600" />}
                  </button>
                </label>
                <span className="text-[11px] text-gray-400">
                  {slugLocked ? "Auto-synced with title" : "Manual override"}
                </span>
              </div>
              <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <span className="px-3 text-xs text-gray-500 font-mono select-none bg-gray-100 border-r border-gray-200 py-2.5">
                  teesindia.com/product/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  readOnly={slugLocked}
                  placeholder="vintage-tee-slug"
                  className={`w-full px-3 py-2 text-xs font-mono outline-none ${
                    slugLocked ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "bg-white text-gray-900"
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Detailed Description
                </label>
                <span className="text-[11px] text-gray-400">{formData.description.length} characters</span>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the fit, story, feel, and styling inspirations of this piece..."
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 resize-y"
              />
            </div>

            {/* Google SERP Preview Accordion */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#C9A96E]" /> Search Engine (Google) Snippet Preview
              </span>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-2xs font-sans text-left">
                <div className="text-[11px] text-gray-600 font-mono truncate">
                  https://teesindia.com &gt; product &gt; {formData.slug || "vintage-tee"}
                </div>
                <div className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {formData.name || "Product Name"} | Premium Streetwear — Tees India
                </div>
                <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                  {formData.description ||
                    "Shop the latest premium streetwear t-shirt crafted with luxury heavy combed cotton. Fast India delivery and easy returns on Tees India."}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Media & Image Gallery */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Product Media & Gallery</h3>
                <p className="text-xs text-gray-500">
                  High-res mockups, on-model lookbook photos, and detail shots ({mediaList.length} attached)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Link2 size={13} /> Add by URL
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs text-black bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 border border-[#C9A96E]/40 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <Upload size={13} /> Upload Local
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#C9A96E] bg-[#C9A96E]/5 scale-[0.99]"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/70"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-3 group-hover:scale-105 transition-transform">
                <Upload size={22} className={isDragging ? "text-[#C9A96E]" : "text-gray-500"} />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Drag and drop your product images here, or{" "}
                <span className="text-[#C9A96E] underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PNG, JPG, WEBP, AVIF up to 10MB each. The first image will be set as primary storefront cover.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {/* Modal for External URL */}
            {showUrlModal && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Link2 size={14} className="text-[#C9A96E]" /> Attach Image via External Web Link
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or hosted CDN image URL"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={addExternalUrl}
                    className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors shrink-0"
                  >
                    Add Image
                  </button>
                </div>
              </div>
            )}

            {/* Media Gallery Thumbnails */}
            {mediaList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Re-order or set primary cover image:</span>
                  <span>{mediaList.length} image{mediaList.length > 1 ? "s" : ""}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {mediaList.map((media, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={media.id}
                        className={`group relative rounded-xl overflow-hidden border transition-all ${
                          isCover
                            ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/30 bg-amber-50/10 shadow-sm"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {/* Aspect Ratio 1:1 preview */}
                        <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                          <img
                            src={media.previewUrl}
                            alt={media.name || "Preview"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Cover badge */}
                          {isCover && (
                            <span className="absolute top-2 left-2 z-10 bg-[#C9A96E] text-black font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> Cover
                            </span>
                          )}

                          {/* External indicator badge */}
                          {media.isExternal && (
                            <span className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                              External URL
                            </span>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveMedia(index, index - 1);
                                }}
                                title="Move left"
                                className="p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-md transition-colors"
                              >
                                <ChevronLeft size={14} />
                              </button>
                            )}

                            {!isCover && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAsCover(index);
                                }}
                                title="Set as primary cover"
                                className="px-2 py-1 bg-[#C9A96E] text-black font-semibold text-[11px] rounded-md shadow-sm transition-colors hover:bg-white"
                              >
                                Set Cover
                              </button>
                            )}

                            {index < mediaList.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveMedia(index, index + 1);
                                }}
                                title="Move right"
                                className="p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-md transition-colors"
                              >
                                <ChevronRight size={14} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMedia(index);
                              }}
                              title="Delete photo"
                              className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Caption / file name */}
                        <div className="p-2 text-[11px] text-gray-600 truncate bg-white border-t border-gray-100 flex items-center justify-between">
                          <span className="truncate">{media.name || `Image #${index + 1}`}</span>
                          {media.size ? (
                            <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-1">
                              {(media.size / 1024).toFixed(0)}KB
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Pricing & Profit Margins */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Pricing & Margins</h3>
                <p className="text-xs text-gray-500">
                  Configure selling rates, strike-through original prices, and track margin profitability
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200 flex items-center gap-1">
                <DollarSign size={13} /> Currency: INR (₹)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Selling Price */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="999"
                    min="0"
                    step="1"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-semibold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Compare Price */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Compare At Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    placeholder="1499"
                    min="0"
                    step="1"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Cost Per Item */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5 flex items-center justify-between">
                  <span>Cost Per Item (₹)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Internal only</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    name="costPerItem"
                    value={formData.costPerItem}
                    onChange={handleChange}
                    placeholder="350"
                    min="0"
                    step="1"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Quick Discount Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Percent size={13} className="text-[#C9A96E]" /> Quick Discount Preset:
              </span>
              {[15, 25, 35, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyQuickDiscount(pct)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {pct}% OFF
                </button>
              ))}
            </div>

            {/* Financial Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm shrink-0">
                  %
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">Customer Savings</span>
                  {savingsAmount > 0 ? (
                    <span className="text-xs font-bold text-red-600">
                      Save ₹{savingsAmount} ({savingsPercent}% OFF discount displayed)
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Regular full price (No discount active)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">Estimated Gross Margin</span>
                  {grossProfit > 0 ? (
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{grossProfit} / unit ({grossMargin}% margin)
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Add cost per item to calculate margin</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Variants & Inventory Matrix */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Inventory & Variant Sizes</h3>
                <p className="text-xs text-gray-500">
                  Individual stock tracking per size. Total calculated inventory:{" "}
                  <strong className="text-black font-semibold">{totalStock} units</strong>
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applySizePreset("standard")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Standard (S-XXL)
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset("oversized")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Oversized (M-XL)
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset("full")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Full (XS-3XL)
                </button>
              </div>
            </div>

            {/* Bulk Stock Quick Apply */}
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-700 font-medium">Quick-Fill Stock for all sizes:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={bulkStockVal}
                  onChange={(e) => setBulkStockVal(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-20 px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md outline-none focus:border-black font-medium"
                />
                <button
                  type="button"
                  onClick={handleBulkStockApply}
                  className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition-colors"
                >
                  Apply All
                </button>
              </div>
            </div>

            {/* Variants Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Color / Style</th>
                    <th className="py-2.5 px-3">SKU Preview</th>
                    <th className="py-2.5 px-3 w-32">Inventory Stock</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map((variant, index) => {
                    const skuPreview = `${(formData.slug || "tee").toUpperCase()}-${variant.size}-${(
                      variant.color || "STD"
                    )
                      .substring(0, 3)
                      .toUpperCase()}`;

                    return (
                      <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                            className="w-20 px-2.5 py-1.5 font-semibold bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                            placeholder="Standard"
                            className="w-32 px-2.5 py-1.5 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                          {skuPreview}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={variant.stock || ""}
                            onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                            placeholder="0"
                            className="w-24 px-2.5 py-1.5 font-medium bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(index)}
                            disabled={variants.length === 1}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors p-1"
                            title="Remove size"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addVariantRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A96E] hover:text-[#b89557] px-3 py-1.5 border border-dashed border-[#C9A96E]/40 hover:border-[#C9A96E] rounded-lg bg-[#C9A96E]/5 transition-all"
            >
              <Plus size={14} /> Add Another Variant / Size
            </button>
          </div>

          {/* Card 5: Fabric & Care Specifications */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Garment Specifications</h3>
              <p className="text-xs text-gray-500">
                Premium material details and care guidance displayed in customer product accordion
              </p>
            </div>

            {/* Material */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Fabric & Material Composition
                </label>
              </div>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. 100% Combed Cotton, 240 GSM Heavyweight Terry"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-900 text-sm focus:border-black outline-none transition-all placeholder:text-gray-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400 self-center">Presets:</span>
                {FABRIC_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, material: preset }))}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Care Instructions
                </label>
              </div>
              <textarea
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Machine wash cold inside out with similar colors. Do not iron directly on graphics."
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 text-sm focus:border-black outline-none transition-all placeholder:text-gray-400 resize-y"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400 self-center">Presets:</span>
                {CARE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        careInstructions: prev.careInstructions
                          ? `${prev.careInstructions}. ${preset}`
                          : preset,
                      }))
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Organization, Status & Live Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Publishing Status & Highlights */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2.5">
              Publishing Visibility
            </h3>

            {/* Active / Draft Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block">
                Catalog Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    formData.isActive
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published Live
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    !formData.isActive
                      ? "bg-gray-200 text-gray-800 border-gray-300 shadow-2xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400" /> Save as Draft
                </button>
              </div>
            </div>

            {/* Featured Switch */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    <Star size={13} className={formData.isFeatured ? "text-[#C9A96E] fill-[#C9A96E]" : "text-gray-400"} />
                    Feature on Homepage
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Highlight this item in the primary curated drops carousel on the store home
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card: Category & Collections */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2.5">
              Taxonomy & Categorization
            </h3>

            {/* Category Select */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                Primary Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 focus:border-black outline-none"
              >
                <option value="">Select a Category</option>
                {categories.map((cat) => {
                  const val = cat.id || cat._id || "";
                  return (
                    <option key={val} value={val}>
                      {cat.name}
                    </option>
                  );
                })}
              </select>
              {categories.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Loading categories from database...
                </p>
              )}
            </div>

            {/* Collections Multi-Select */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5 flex items-center justify-between">
                <span>Collections</span>
                <span className="text-[10px] text-gray-400">Multiple selection</span>
              </label>

              {collections.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
                  {collections.map((col) => {
                    const colId = col.id || col._id || "";
                    const isSelected = selectedCollections.includes(colId);
                    return (
                      <button
                        key={colId}
                        type="button"
                        onClick={() => toggleCollection(colId)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#C9A96E] text-black font-semibold shadow-2xs"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No collections currently created</p>
              )}
            </div>

            {/* Interactive Tags */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
                Product Tags
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Type tag & press Enter"
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-black outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Tag Chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Suggestions */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Popular Suggestions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_TAGS.map((pop) => (
                    <button
                      key={pop}
                      type="button"
                      onClick={() => handleAddTag(pop)}
                      disabled={tags.includes(pop)}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        tags.includes(pop)
                          ? "bg-gray-100 text-gray-300 cursor-default"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      + {pop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Live Storefront Card Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3 sticky top-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Eye size={13} className="text-[#C9A96E]" /> Live Storefront Card Preview
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>

            {/* Mockup Card */}
            <div className="max-w-[260px] mx-auto rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm font-sans transition-all">
              {/* Product Image */}
              <div className="relative aspect-3/4 w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {mediaList.length > 0 ? (
                  <img
                    src={mediaList[0].previewUrl}
                    alt="Storefront preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 p-4 text-center">
                    <ImageIcon size={36} strokeWidth={1.5} className="mb-2" />
                    <span className="text-[11px] font-medium text-gray-400">Add an image to preview card</span>
                  </div>
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {formData.isFeatured && (
                    <span className="bg-[#C9A96E] text-black font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      Featured
                    </span>
                  )}
                  {savingsPercent > 0 && (
                    <span className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      {savingsPercent}% OFF
                    </span>
                  )}
                  {!formData.isActive && (
                    <span className="bg-gray-800 text-gray-200 font-medium text-[9px] uppercase px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 text-left space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block truncate">
                  {categories.find((c) => (c.id || c._id) === formData.category)?.name || "Category"}
                </span>

                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {formData.name || "Untitled Streetwear Tee"}
                </h4>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{formData.price || "0"}
                  </span>
                  {compareNum > priceNum && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{formData.compareAtPrice}
                    </span>
                  )}
                </div>

                {/* Size Pills */}
                <div className="flex gap-1 pt-1 overflow-x-hidden">
                  {variants.slice(0, 5).map((v) => (
                    <span
                      key={v.size}
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        v.stock > 0
                          ? "bg-gray-50 border-gray-200 text-gray-800 font-medium"
                          : "bg-gray-100 border-gray-100 text-gray-300 line-through"
                      }`}
                    >
                      {v.size}
                    </span>
                  ))}
                  {variants.length > 5 && (
                    <span className="text-[9px] text-gray-400 self-center">
                      +{variants.length - 5}
                    </span>
                  )}
                </div>

                {/* Stock Status Pill */}
                <div className="pt-2 text-[10px]">
                  {totalStock === 0 ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Out of stock
                    </span>
                  ) : totalStock <= 10 ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Only {totalStock} left
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In stock ({totalStock})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
