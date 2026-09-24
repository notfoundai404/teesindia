"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { orderApi, adminApi, settingsApi } from "@/lib/api";
import { useSettingsStore } from "@/lib/settingsStore";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  User,
  MapPin,
  Save,
  Printer,
  Download,
  Eye,
  X,
  CheckSquare,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";

export interface DispatchHubConfig {
  enabled: boolean;
  hubName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  gst?: string;
  phone?: string;
  email?: string;
  carrier?: string;
}

interface OrderDetail {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPayId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; phone?: string };
  address?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images?: { url: string }[];
    };
    variant?: {
      size: string;
      color: string;
    };
  }[];
}

async function downloadPackingSlipPDF(order: OrderDetail, dispatchConfig?: DispatchHubConfig) {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const shortId = order.id.slice(0, 8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const dispatchDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const isCOD = order.paymentMethod === "COD";
    const totalAmount = Number(order.totalAmount);

    const storeSettings = useSettingsStore.getState().settings;
    const brandName = storeSettings.storeName || "TEESINDIA";
    const supportEmail = storeSettings.supportEmail || "support@teesindia.com";

    // ── Header Band ──
    doc.setFillColor(15, 15, 15);
    doc.rect(14, 12, 182, 24, "F");

    doc.setTextColor(201, 169, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${brandName.toUpperCase()}™`, 20, 22);

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL WAREHOUSE DISPATCH & PACKING SLIP", 20, 28);
    if (dispatchConfig?.enabled && dispatchConfig.city) {
      const hubOrigin = `ORIGIN: ${dispatchConfig.hubName ? dispatchConfig.hubName.toUpperCase() + ' — ' : ''}${dispatchConfig.city.toUpperCase()}`;
      doc.text(hubOrigin, 20, 32);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`PACKING SLIP #PS-${shortId}`, 190, 22, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`ORDER ID: #${order.id.toUpperCase()}`, 190, 27, { align: "right" });
    doc.text(`DISPATCH DATE: ${dispatchDate}`, 190, 32, { align: "right" });

    // ── Prominent Payment Banner ──
    const y = 42;
    if (isCOD) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.8);
      doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`CASH ON DELIVERY (COD) — COLLECT CASH: ₹${totalAmount.toLocaleString("en-IN")}`, 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 20, 20);
      doc.text("CRITICAL: Verify full cash payment before handing package to customer. Hand over delivery acknowledgement.", 20, y + 12);
    } else {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.8);
      doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

      doc.setTextColor(21, 128, 61);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PREPAID ORDER — DO NOT COLLECT CASH", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(20, 100, 40);
      doc.text(`Payment verified via online gateway. Payment status: ${order.paymentStatus || "PAID"}`, 20, y + 12);
    }

    if (dispatchConfig?.enabled && dispatchConfig.carrier) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Carrier: ${dispatchConfig.carrier}`, 190, y + 12, { align: "right" });
    }

    // ── Address Section (Deliver To + Optional Dispatch Hub) ──
    const hasHub = Boolean(dispatchConfig?.enabled && (dispatchConfig.hubName || dispatchConfig.line1));
    const addrY = y + 21;
    const boxHeight = 36;

    if (hasHub && dispatchConfig) {
      const boxWidth = 88;

      // Deliver To (Left)
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, addrY, boxWidth, boxHeight, 1, 1, "FD");

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("DELIVER TO (CUSTOMER):", 18, addrY + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(order.address?.name || order.user?.name || "Customer", 18, addrY + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const line1 = order.address?.line1 || "Customer Address";
      const line2 = order.address?.line2 ? `${order.address.line2}, ` : "";
      const cityPin = order.address ? `${order.address.city}, ${order.address.state} — ${order.address.pincode}` : "";
      doc.text(line1, 18, addrY + 17);
      doc.text(line2 + cityPin, 18, addrY + 22);
      doc.text(`Phone: ${order.address?.phone || order.user?.phone || "—"} | Placed: ${orderDate}`, 18, addrY + 28);

      // Return Hub (Right)
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(108, addrY, boxWidth, boxHeight, 1, 1, "FD");

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("DISPATCH HUB & RETURN ADDRESS:", 112, addrY + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(dispatchConfig.hubName || "Logistics & Return Hub", 112, addrY + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      if (dispatchConfig.line1) {
        doc.text(dispatchConfig.line1, 112, addrY + 17);
      }
      const hubLine2 = [
        dispatchConfig.line2,
        [dispatchConfig.city, dispatchConfig.state].filter(Boolean).join(", "),
        dispatchConfig.pincode ? `— ${dispatchConfig.pincode}` : "",
      ].filter(Boolean).join(" ");
      doc.text(hubLine2 || "Bangalore, India", 112, addrY + 22);

      const contactParts = [
        dispatchConfig.email ? `Email: ${dispatchConfig.email}` : "",
        dispatchConfig.phone ? `Phone: ${dispatchConfig.phone}` : "",
        dispatchConfig.carrier ? `Carrier: ${dispatchConfig.carrier}` : "",
      ].filter(Boolean).join(" | ");
      if (contactParts) {
        doc.text(contactParts, 112, addrY + 28);
      }
    } else {
      const boxWidth = 182;

      // Deliver To (Full width)
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, addrY, boxWidth, boxHeight, 1, 1, "FD");

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("DELIVER TO (CUSTOMER):", 18, addrY + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(order.address?.name || order.user?.name || "Customer", 18, addrY + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const line1 = order.address?.line1 || "Customer Address";
      const line2 = order.address?.line2 ? `${order.address.line2}, ` : "";
      const cityPin = order.address ? `${order.address.city}, ${order.address.state} — ${order.address.pincode}` : "";
      doc.text(line1, 18, addrY + 17);
      doc.text(line2 + cityPin, 18, addrY + 22);
      doc.text(`Phone: ${order.address?.phone || order.user?.phone || "—"} | Placed: ${orderDate}`, 18, addrY + 28);
    }

    // ── Warehouse Picker Table ──
    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

    autoTable(doc, {
      startY: addrY + boxHeight + 5,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [20, 20, 20],
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      head: [["PICK", "SKU / CODE", "ITEM DESCRIPTION", "SIZE", "COLOR", "QTY", "PACKED", "UNIT PRICE", "TOTAL"]],
      body: order.items.map((item, idx) => {
        const sku = `${item.product?.name?.slice(0, 4).toUpperCase() || "TEE"}-${item.variant?.size || "STD"}-${idx + 1}`;
        const lineTotal = Number(item.price) * item.quantity;
        return [
          "[   ]",
          sku,
          item.product?.name || "Product",
          item.variant?.size || "Standard",
          item.variant?.color || "Standard",
          item.quantity.toString(),
          "[   ]",
          `₹${Number(item.price).toLocaleString("en-IN")}`,
          `₹${lineTotal.toLocaleString("en-IN")}`,
        ];
      }),
      foot: [
        ["", "", "TOTAL PICK UNITS", "", "", totalUnits.toString(), "", "INVOICE TOTAL", `₹${totalAmount.toLocaleString("en-IN")}`],
      ],
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 165;

    // ── QA Signoff Box ──
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, finalY + 5, 182, 32, 1, 1);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("WAREHOUSE FULFILLMENT VERIFICATION & QA SIGN-OFF", 18, finalY + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    doc.text("Picked By (Staff Sign): __________________________", 18, finalY + 20);
    doc.text("Packed By (Staff Sign): __________________________", 18, finalY + 29);

    doc.text("Security Seal #: __________________________", 105, finalY + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text("QA INSPECTION: [  PASSED  ]", 105, finalY + 29);

    // ── Customer Notice ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "CUSTOMER NOTICE: Please record a continuous unboxing video to assist in rapid returns or exchanges within 7 days.",
      105,
      finalY + 44,
      { align: "center" }
    );
    doc.text(`Customer Support: ${supportEmail}`, 105, finalY + 48, { align: "center" });

    doc.save(`${brandName.toUpperCase()}-PackingSlip-ORD-${shortId}.pdf`);
    toast.success("Packing slip PDF downloaded");
  } catch (error) {
    console.error(error);
    toast.error("Failed to generate packing slip PDF");
  }
}

const TIMELINE_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDispatchCustomizer, setShowDispatchCustomizer] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.get(orderId);
      const o = res.data.order || res.data;
      if (!o) {
        toast.error("Order not found");
        router.push("/admin/orders");
        return;
      }
      setOrder(o);
      setStatus(o.status || "PENDING");
      setPaymentStatus(o.paymentStatus || "PENDING");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateOrderStatus(orderId, { status, paymentStatus });
      toast.success("Order status updated successfully");
      fetchOrder();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch Hub & Return Address configuration
  const [dispatchConfig, setDispatchConfig] = useState<DispatchHubConfig>({
    enabled: false,
    hubName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    phone: "",
    email: "",
    carrier: "",
  });

  // Load default store settings for dispatch hub
  useEffect(() => {
    settingsApi
      .adminGet()
      .then((res) => {
        const s = res.data?.settings;
        if (s) {
          setDispatchConfig({
            enabled: s.dispatchHubEnabled ?? false,
            hubName: s.dispatchHubName || "",
            line1: s.dispatchAddressLine1 || "",
            line2: s.dispatchAddressLine2 || "",
            city: s.dispatchCity || "",
            state: s.dispatchState || "",
            pincode: s.dispatchPincode || "",
            gst: s.dispatchGst || "",
            phone: s.dispatchSupportPhone || "",
            email: s.dispatchSupportEmail || "",
            carrier: s.dispatchCarrier || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveDispatchAsDefault = async () => {
    setIsSavingDefaults(true);
    try {
      const res = await settingsApi.adminGet();
      const current = res.data?.settings || {};
      const updated = {
        ...current,
        dispatchHubEnabled: dispatchConfig.enabled,
        dispatchHubName: dispatchConfig.hubName,
        dispatchAddressLine1: dispatchConfig.line1,
        dispatchAddressLine2: dispatchConfig.line2 || "",
        dispatchCity: dispatchConfig.city,
        dispatchState: dispatchConfig.state,
        dispatchPincode: dispatchConfig.pincode,
        dispatchGst: dispatchConfig.gst || "",
        dispatchSupportPhone: dispatchConfig.phone || "",
        dispatchSupportEmail: dispatchConfig.email || "",
        dispatchCarrier: dispatchConfig.carrier || "",
      };
      await settingsApi.save(updated);
      toast.success("Dispatch hub settings saved as store default!");
    } catch {
      toast.error("Failed to save defaults");
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    setIsGeneratingPDF(true);
    try {
      await downloadPackingSlipPDF(order, dispatchConfig);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Order Details">
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--grey-400)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          Loading order details...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found">
        <div style={{ padding: "2rem", color: "var(--grey-400)" }}>Order could not be located.</div>
      </AdminLayout>
    );
  }

  const stepIndex = TIMELINE_STEPS.indexOf(order.status.toUpperCase());
  const isCancelled = order.status.toUpperCase() === "CANCELLED";

  const actionButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
      <Link
        href="/admin/orders"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "#4b5563",
          fontSize: "0.85rem",
          textDecoration: "none",
          padding: "0.5rem 0.75rem",
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>
      <button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
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
          cursor: isGeneratingPDF ? "not-allowed" : "pointer",
          fontWeight: 500,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <Download size={14} color="#855d14" />
        {isGeneratingPDF ? "Generating..." : "Download Backslip (PDF)"}
      </button>
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#000000",
          border: "none",
          color: "#ffffff",
          fontSize: "0.85rem",
          borderRadius: "6px",
          padding: "0.5rem 0.85rem",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Printer size={15} /> Print / Preview Backslip
      </button>
    </div>
  );

  return (
    <AdminLayout title={`Order #${order.id.slice(0, 8)}`} action={actionButtons}>
      {/* Top Fulfillment Timeline */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              Fulfillment Journey
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
          </div>
          {isCancelled ? (
            <span
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "0.3rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              ORDER CANCELLED
            </span>
          ) : (
            <span
              style={{
                background: "rgba(201, 169, 110, 0.15)",
                color: "#855d14",
                padding: "0.3rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Current Status: {order.status}
            </span>
          )}
        </div>

        {!isCancelled && (
          <div style={{ display: "flex", alignItems: "center", position: "relative", marginTop: "1rem" }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPastOrCurrent = idx <= (stepIndex === -1 ? 0 : stepIndex);
              return (
                <React.Fragment key={step}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flexShrink: 0 }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: isPastOrCurrent ? "#000000" : "#f3f4f6",
                        color: isPastOrCurrent ? "#ffffff" : "#9ca3af",
                        border: isPastOrCurrent ? "none" : "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: isPastOrCurrent ? "#111827" : "#9ca3af",
                        marginTop: "0.4rem",
                        fontWeight: isPastOrCurrent ? 600 : 400,
                        textAlign: "center",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: "2px",
                        background: idx < stepIndex ? "#000000" : "#e5e7eb",
                        marginBottom: "1rem",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.75rem" }}>
        {/* Left Column: Items & Customer Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Items Table Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
              Order Items ({order.items?.length || 0})
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#6b7280" }}>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Item</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Size / Color</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Price</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Qty</th>
                    <th style={{ padding: "0.6rem 0.5rem", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => {
                    const lineTotal = Number(item.price) * item.quantity;
                    const thumb = item.product?.images?.[0]?.url;
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                              style={{
                                width: "40px",
                                height: "50px",
                                borderRadius: "4px",
                                background: "#f3f4f6",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={item.product?.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <Package size={18} color="#9ca3af" style={{ margin: "14px 11px" }} />
                              )}
                            </div>
                            <span style={{ color: "#111827", fontWeight: 500 }}>
                              {item.product?.name || "Product"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "#4b5563" }}>
                          {item.variant ? `${item.variant.size} / ${item.variant.color}` : "Standard"}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "#6b7280" }}>
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "#111827", fontWeight: 600 }}>
                          × {item.quantity}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#111827", fontWeight: 700 }}>
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                maxWidth: "280px",
                marginLeft: "auto",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                <span>Subtotal</span>
                <span style={{ color: "#111827" }}>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                <span>Shipping</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>FREE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#111827",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: "#111827" }}>
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Controls & Customer / Address Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status Controls Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
              Update Order Status
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                  Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "0.35rem" }}>
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    color: "#111827",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  background: "#000000",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "0.65rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Save size={16} /> {isSaving ? "Updating..." : "Save Status Changes"}
              </button>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <User size={18} color="#855d14" />
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                Customer Profile
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>
                {order.address?.name || order.user?.name || "Guest Customer"}
              </div>
              <div style={{ color: "#6b7280" }}>{order.user?.email || "No email"}</div>
              {order.address?.phone && (
                <div style={{ color: "#6b7280" }}>Phone: {order.address.phone}</div>
              )}
              {order.user?.id && (
                <Link
                  href={`/admin/customers/${order.user.id}`}
                  style={{
                    color: "#855d14",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  View full customer profile & history →
                </Link>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <MapPin size={18} color="#2563eb" />
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                Delivery Address
              </h3>
            </div>

            {order.address ? (
              <div style={{ fontSize: "0.85rem", color: "#374151", lineHeight: "1.5" }}>
                <div style={{ fontWeight: 600, color: "#111827" }}>{order.address.name}</div>
                <div>{order.address.line1}</div>
                {order.address.line2 && <div>{order.address.line2}</div>}
                <div>
                  {order.address.city}, {order.address.state} — {order.address.pincode}
                </div>
                <div style={{ marginTop: "0.5rem", color: "#6b7280" }}>
                  Phone: {order.address.phone}
                </div>
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                No shipping address linked.
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <CreditCard size={18} color="#16a34a" />
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                Payment Gateway
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Method:</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Payment Status:</span>
                <span style={{ fontWeight: 600, color: order.paymentStatus === "PAID" ? "#16a34a" : "#d97706" }}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayOrderId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", paddingTop: "0.25rem" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Razorpay Order ID:</span>
                  <span style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {order.razorpayOrderId}
                  </span>
                </div>
              )}
              {order.razorpayPayId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Razorpay Payment ID:</span>
                  <span style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {order.razorpayPayId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Print Stylesheet ── */}
      <style>{`
        @media print {
          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #packing-slip-printable, #packing-slip-printable * {
            visibility: visible !important;
          }
          #packing-slip-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: #fff !important;
            color: #000 !important;
            padding: 8mm 10mm !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 9999999 !important;
          }
        }
      `}</style>

      {/* ── Hidden Print Element (Activated when window.print is called) ── */}
      <div id="packing-slip-printable" style={{ display: "none" }}>
        {renderBackslip()}
      </div>

      {/* ── Interactive Slip Preview Modal ── */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={18} color="#855d14" />
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#111827", fontWeight: 600 }}>
                  Warehouse Backslip & Packing Slip — #PS-{order.id.slice(0, 8).toUpperCase()}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchCustomizer(!showDispatchCustomizer)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: showDispatchCustomizer ? "#e5e7eb" : "#ffffff",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    borderRadius: "6px",
                    padding: "0.45rem 0.8rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Customize Dispatch & Return Address on Slip"
                >
                  <Sliders size={13} color="#855d14" />
                  {showDispatchCustomizer ? "Hide Customizer" : "Customize Dispatch Hub"}
                  <span
                    style={{
                      fontSize: "0.68rem",
                      background: dispatchConfig.enabled ? "#dcfce7" : "#f3f4f6",
                      color: dispatchConfig.enabled ? "#15803d" : "#6b7280",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {dispatchConfig.enabled ? "Active" : "Off"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    borderRadius: "6px",
                    padding: "0.45rem 0.8rem",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <Download size={13} color="#855d14" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "#000000",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "6px",
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Printer size={14} /> Print Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Collapsible Dispatch Hub Customizer Panel */}
            {showDispatchCustomizer && (
              <div
                style={{
                  background: "#ffffff",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "1.25rem 1.5rem",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, color: "#111827" }}>
                    <input
                      type="checkbox"
                      checked={dispatchConfig.enabled}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    Include Dispatch Hub & Return Address on Slip
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveDispatchAsDefault}
                    disabled={isSavingDefaults}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "#111827",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Save size={13} /> {isSavingDefaults ? "Saving..." : "Save as Store Default"}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                    opacity: dispatchConfig.enabled ? 1 : 0.6,
                  }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Hub / Business Name
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.hubName}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, hubName: e.target.value }))}
                      placeholder="e.g. TEESINDIA Logistics Hub"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.line1}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, line1: e.target.value }))}
                      placeholder="e.g. 102 Industrial Complex"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.line2 || ""}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, line2: e.target.value }))}
                      placeholder="e.g. 2nd Cross, Phase 1"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.city}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Bangalore"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      State & Pincode
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <input
                        type="text"
                        value={dispatchConfig.state}
                        onChange={(e) => setDispatchConfig((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        style={{ flex: 1, padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                      />
                      <input
                        type="text"
                        value={dispatchConfig.pincode}
                        onChange={(e) => setDispatchConfig((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Pin"
                        style={{ width: "80px", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.gst || ""}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, gst: e.target.value }))}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={dispatchConfig.email || ""}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="support@teesindia.com"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Helpline / Phone
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.phone || ""}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#4b5563", marginBottom: "0.2rem" }}>
                      Shipping Carrier
                    </label>
                    <input
                      type="text"
                      value={dispatchConfig.carrier || ""}
                      onChange={(e) => setDispatchConfig((prev) => ({ ...prev, carrier: e.target.value }))}
                      placeholder="e.g. Express Surface"
                      style={{ width: "100%", padding: "0.45rem 0.65rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Scrollable White Slip Preview */}
            <div
              style={{
                padding: "2rem",
                overflowY: "auto",
                background: "#f3f4f6",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "750px",
                  background: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderRadius: "2px",
                }}
              >
                {renderBackslip()}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );

  function renderBackslip() {
    if (!order) return null;
    const shortId = order.id.slice(0, 8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const dispatchDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const isCOD = order.paymentMethod === "COD";
    const totalAmount = Number(order.totalAmount);
    const totalUnits = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <div
        style={{
          background: "#fff",
          color: "#000",
          padding: "24px 28px",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          lineHeight: 1.35,
          fontSize: "12px",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #000",
            paddingBottom: "12px",
            marginBottom: "14px",
          }}
        >
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em", color: "#000" }}>
              TEESINDIA™
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#555", marginTop: "2px" }}>
              OFFICIAL WAREHOUSE DISPATCH & PACKING SLIP
            </div>
            {dispatchConfig.gst && (
              <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                GSTIN: {dispatchConfig.gst}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {/* Barcode Graphic */}
            <div style={{ display: "inline-block", textAlign: "center" }}>
              <svg width="140" height="30" viewBox="0 0 140 30" style={{ display: "block" }}>
                <rect x="0" y="0" width="3" height="30" fill="#000" />
                <rect x="5" y="0" width="1" height="30" fill="#000" />
                <rect x="8" y="0" width="4" height="30" fill="#000" />
                <rect x="14" y="0" width="2" height="30" fill="#000" />
                <rect x="18" y="0" width="1" height="30" fill="#000" />
                <rect x="21" y="0" width="3" height="30" fill="#000" />
                <rect x="26" y="0" width="2" height="30" fill="#000" />
                <rect x="30" y="0" width="5" height="30" fill="#000" />
                <rect x="37" y="0" width="1" height="30" fill="#000" />
                <rect x="40" y="0" width="3" height="30" fill="#000" />
                <rect x="45" y="0" width="2" height="30" fill="#000" />
                <rect x="49" y="0" width="4" height="30" fill="#000" />
                <rect x="55" y="0" width="1" height="30" fill="#000" />
                <rect x="58" y="0" width="3" height="30" fill="#000" />
                <rect x="63" y="0" width="2" height="30" fill="#000" />
                <rect x="67" y="0" width="4" height="30" fill="#000" />
                <rect x="73" y="0" width="1" height="30" fill="#000" />
                <rect x="76" y="0" width="3" height="30" fill="#000" />
                <rect x="81" y="0" width="5" height="30" fill="#000" />
                <rect x="88" y="0" width="2" height="30" fill="#000" />
                <rect x="92" y="0" width="1" height="30" fill="#000" />
                <rect x="95" y="0" width="4" height="30" fill="#000" />
                <rect x="101" y="0" width="2" height="30" fill="#000" />
                <rect x="105" y="0" width="3" height="30" fill="#000" />
                <rect x="110" y="0" width="1" height="30" fill="#000" />
                <rect x="113" y="0" width="4" height="30" fill="#000" />
                <rect x="119" y="0" width="2" height="30" fill="#000" />
                <rect x="123" y="0" width="5" height="30" fill="#000" />
                <rect x="130" y="0" width="2" height="30" fill="#000" />
                <rect x="134" y="0" width="3" height="30" fill="#000" />
              </svg>
              <div style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "2px", marginTop: "2px" }}>
                *ORD-{shortId}*
              </div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, marginTop: "3px" }}>
              SLIP: PS-{shortId}
            </div>
            <div style={{ fontSize: "10px", color: "#555" }}>
              Dispatch: {dispatchDate}
            </div>
          </div>
        </div>

        {/* Prominent Payment Banner */}
        <div
          style={{
            border: isCOD ? "2px solid #dc2626" : "2px solid #16a34a",
            background: isCOD ? "#fef2f2" : "#f0fdf4",
            padding: "10px 14px",
            borderRadius: "4px",
            marginBottom: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: isCOD ? "#b91c1c" : "#15803d",
                letterSpacing: "0.02em",
              }}
            >
              {isCOD
                ? `CASH ON DELIVERY (COD) — COLLECT CASH: ₹${totalAmount.toLocaleString("en-IN")}`
                : "PREPAID ORDER — DO NOT COLLECT CASH"}
            </div>
            <div style={{ fontSize: "10px", color: isCOD ? "#7f1d1d" : "#166534", marginTop: "2px" }}>
              {isCOD
                ? "Delivery Notice: Collect full cash before handing parcel to customer. Provide physical acknowledgement."
                : `Payment verified via online gateway (${order.paymentMethod}). Gateway status: ${order.paymentStatus}`}
            </div>
          </div>
          {dispatchConfig.enabled && dispatchConfig.carrier && (
            <div style={{ textAlign: "right", fontSize: "11px", fontWeight: 700 }}>
              Carrier: {dispatchConfig.carrier}
            </div>
          )}
        </div>

        {/* Address Boxes (Dynamic 2-column if Dispatch Hub enabled, otherwise full width) */}
        {dispatchConfig.enabled && (dispatchConfig.hubName || dispatchConfig.line1) ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            {/* Deliver To */}
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px 12px", background: "#fafafa" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>
                DELIVER TO (CONSIGNEE):
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#000" }}>
                {order.address?.name || order.user?.name || "Customer"}
              </div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "3px", lineHeight: "1.4" }}>
                {order.address?.line1}
                {order.address?.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address?.city}, {order.address?.state} — <strong>{order.address?.pincode}</strong>
                <br />
                <strong>Contact:</strong> {order.address?.phone || order.user?.phone || "—"} | Placed: {orderDate}
              </div>
            </div>

            {/* Return Hub */}
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px 12px", background: "#fafafa" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>
                DISPATCHED FROM (RETURN HUB):
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#000" }}>
                {dispatchConfig.hubName || "Logistics & Return Hub"}
              </div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "3px", lineHeight: "1.4" }}>
                {dispatchConfig.line1}
                {dispatchConfig.line2 && <><br />{dispatchConfig.line2}</>}
                <br />
                {[dispatchConfig.city, dispatchConfig.state].filter(Boolean).join(", ")}
                {dispatchConfig.pincode ? ` — ${dispatchConfig.pincode}` : ""}
                <br />
                <strong>Helpline:</strong>{" "}
                {[dispatchConfig.email, dispatchConfig.phone].filter(Boolean).join(" | ") || "support@teesindia.com"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px 14px", background: "#fafafa" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>
                DELIVER TO (CONSIGNEE):
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#000" }}>
                {order.address?.name || order.user?.name || "Customer"}
              </div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "3px", lineHeight: "1.4" }}>
                {order.address?.line1}
                {order.address?.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address?.city}, {order.address?.state} — <strong>{order.address?.pincode}</strong>
                <br />
                <strong>Contact:</strong> {order.address?.phone || order.user?.phone || "—"} | Placed: {orderDate}
              </div>
            </div>
          </div>
        )}

        {/* Warehouse Picker Table */}
        <div style={{ marginBottom: "14px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#111", color: "#fff", textAlign: "left" }}>
                <th style={{ padding: "6px 8px", width: "40px", textAlign: "center" }}>PICK</th>
                <th style={{ padding: "6px 8px" }}>SKU / CODE</th>
                <th style={{ padding: "6px 8px" }}>PRODUCT DESCRIPTION</th>
                <th style={{ padding: "6px 8px" }}>SIZE</th>
                <th style={{ padding: "6px 8px" }}>COLOR</th>
                <th style={{ padding: "6px 8px", textAlign: "center" }}>QTY</th>
                <th style={{ padding: "6px 8px", width: "50px", textAlign: "center" }}>PACKED</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>PRICE</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => {
                const sku = `${item.product?.name?.slice(0, 4).toUpperCase() || "TEE"}-${item.variant?.size || "STD"}-${idx + 1}`;
                const lineTotal = Number(item.price) * item.quantity;
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>[  ]</td>
                    <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10px", color: "#444" }}>{sku}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>{item.product?.name || "Product"}</td>
                    <td style={{ padding: "6px 8px" }}>{item.variant?.size || "Standard"}</td>
                    <td style={{ padding: "6px 8px" }}>{item.variant?.color || "Standard"}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>[  ]</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹{lineTotal.toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f5f5f5", fontWeight: 700 }}>
                <td colSpan={5} style={{ padding: "8px", textAlign: "right" }}>TOTAL ITEMS PICKED:</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{totalUnits}</td>
                <td colSpan={2} style={{ padding: "8px", textAlign: "right" }}>GRAND INVOICE TOTAL:</td>
                <td style={{ padding: "8px", textAlign: "right" }}>₹{totalAmount.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* QA & Signoff Box */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px 14px",
            marginBottom: "12px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            fontSize: "10px",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>FULFILLMENT VERIFICATION:</div>
            <div style={{ marginTop: "4px" }}>Picked By (Staff Sign): __________________________</div>
            <div style={{ marginTop: "8px" }}>Packed By (Staff Sign): __________________________</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>DISPATCH QUALITY AUDIT:</div>
            <div style={{ marginTop: "4px" }}>Security Seal #: __________________________</div>
            <div style={{ marginTop: "8px", fontWeight: 800, color: "#16a34a" }}>
              QA AUDIT: [  PASSED — 100% INSPECTED  ]
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div style={{ textAlign: "center", fontSize: "9px", color: "#666", borderTop: "1px dashed #ccc", paddingTop: "8px" }}>
          CUSTOMER NOTICE: Please record a continuous unboxing video to assist in rapid replacement or return requests within 7 days.
          <br />
          For customer support or order tracking, email {useSettingsStore.getState().settings.supportEmail || "support@teesindia.com"}.
        </div>
      </div>
    );
  }
}
