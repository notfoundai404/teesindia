"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/api";
import { Download, Search, Eye, ChevronDown, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  _id?: string;
  totalAmount: number;
  status: string;
  orderStatus?: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  user?: { name: string; email: string };
  address?: { name: string; phone: string; city: string; state: string };
  items?: any[];
}

const STATUS_TABS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.orders();
      const raw = res.data.orders || res.data || [];
      const normalized: Order[] = raw.map((o: any) => ({
        ...o,
        id: o.id || o._id,
        status: o.status || o.orderStatus || "PENDING",
      }));
      setOrders(normalized);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminApi.updateOrderStatus(id, { status: newStatus });
      toast.success(`Order #${id.slice(0, 8)} status set to ${newStatus}`);
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Customer", "Email", "Phone", "Amount (INR)", "Payment Method", "Payment Status", "Order Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...orders.map((o) => [
        o.id,
        `"${o.address?.name || o.user?.name || 'Guest'}"`,
        `"${o.user?.email || ''}"`,
        `"${o.address?.phone || ''}"`,
        o.totalAmount,
        o.paymentMethod || 'RAZORPAY',
        o.paymentStatus,
        o.status,
        new Date(o.createdAt).toISOString().slice(0, 10),
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `teesindia_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === "All" || o.status.toUpperCase() === activeTab.toUpperCase();
    const q = search.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(q) ||
      (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
      (o.address?.name && o.address.name.toLowerCase().includes(q)) ||
      (o.user?.email && o.user.email.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return { bg: "#fef3c7", text: "#92400e" };
      case "CONFIRMED":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "PROCESSING":
        return { bg: "#ede9fe", text: "#5b21b6" };
      case "SHIPPED":
        return { bg: "#d1fae5", text: "#065f46" };
      case "DELIVERED":
        return { bg: "#dcfce7", text: "#166534" };
      case "CANCELLED":
        return { bg: "#fee2e2", text: "#991b1b" };
      default:
        return { bg: "#f3f4f6", text: "#4b5563" };
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { bg: "#dcfce7", text: "#166534", label: "PAID" };
      case "FAILED":
        return { bg: "#fee2e2", text: "#991b1b", label: "FAILED" };
      case "REFUNDED":
        return { bg: "#ede9fe", text: "#5b21b6", label: "REFUNDED" };
      default:
        return { bg: "#fef3c7", text: "#92400e", label: "PENDING" };
    }
  };

  const actionButton = (
    <button
      onClick={exportCSV}
      disabled={orders.length === 0}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        color: "#111827",
        padding: "0.6rem 1.1rem",
        borderRadius: "var(--radius-md)",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Download size={16} /> Export CSV
    </button>
  );

  return (
    <AdminLayout title="Orders Management" action={actionButton}>
      {/* Filter Tabs & Search Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? "#000000" : "#ffffff",
                  color: isActive ? "#ffffff" : "#4b5563",
                  border: isActive ? "none" : "1px solid #e5e7eb",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              border: "1px solid #e5e7eb",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Search size={16} color="#9ca3af" style={{ marginRight: "0.75rem", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Email..."
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
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Customer</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Total</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Payment</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td colSpan={7} style={{ padding: "1.25rem", textAlign: "center", color: "#9ca3af" }}>
                      Loading orders...
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    {search ? "No orders match your search." : "No orders found in this category."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const sBadge = getStatusBadge(order.status);
                  const pBadge = getPaymentBadge(order.paymentStatus);
                  const customerName = order.address?.name || order.user?.name || "Customer";
                  const customerEmail = order.user?.email || "";

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Order ID */}
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={{
                            fontFamily: "monospace",
                            color: "#111827",
                            fontWeight: 600,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                          }}
                        >
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{customerName}</div>
                        {customerEmail && (
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {customerEmail}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "#111827" }}>
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span
                            style={{
                              background: pBadge.bg,
                              color: pBadge.text,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              display: "inline-block",
                              width: "fit-content",
                            }}
                          >
                            {pBadge.label}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                            {order.paymentMethod || "RAZORPAY"}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <select
                          value={order.status.toUpperCase()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          style={{
                            background: sBadge.bg,
                            color: sBadge.text,
                            border: `1px solid ${sBadge.text}30`,
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "0.9rem 1rem", color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: "#f3f4f6",
                            color: "#111827",
                            border: "1px solid #e5e7eb",
                            padding: "0.4rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            textDecoration: "none",
                            transition: "background 0.2s",
                          }}
                        >
                          <Eye size={14} /> View
                        </Link>
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
