"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  addresses?: {
    id: string;
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  orders?: {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items?: {
      product?: {
        id: string;
        name: string;
        images?: { url: string }[];
      };
    }[];
  }[];
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await adminApi.customer(customerId);
        setCustomer(res.data.customer || res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customer profile");
        router.push("/admin/customers");
      } finally {
        setIsLoading(false);
      }
    };
    if (customerId) fetchCustomer();
  }, [customerId, router]);

  if (isLoading) {
    return (
      <AdminLayout title="Customer Profile">
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--grey-400)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          Loading customer profile...
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Customer Not Found">
        <div style={{ padding: "2rem", color: "var(--grey-400)" }}>
          Could not locate customer records.
        </div>
      </AdminLayout>
    );
  }

  const totalSpent = customer.orders?.reduce((acc, curr) => acc + Number(curr.totalAmount), 0) || 0;

  const actionButtons = (
    <Link
      href="/admin/customers"
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
      <ArrowLeft size={16} /> Back to Directory
    </Link>
  );

  return (
    <AdminLayout title={customer.name || "Customer Profile"} action={actionButtons}>
      {/* Top Profile Summary Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.75rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#111827",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.5rem",
              fontFamily: "var(--font-heading)",
            }}
          >
            {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: "0 0 0.35rem" }}>
              {customer.name}
            </h2>
            <div style={{ display: "flex", gap: "1.25rem", color: "#6b7280", fontSize: "0.85rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Mail size={14} /> {customer.email}
              </span>
              {customer.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Phone size={14} /> {customer.phone}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Calendar size={14} /> Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick customer metric pills */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem 1.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Lifetime Orders</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
              {customer.orders?.length || 0}
            </span>
          </div>
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem 1.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Total Spend</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
              ₹{totalSpent.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.75rem" }}>
        {/* Left Column: Order History */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                Order History ({customer.orders?.length || 0})
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                All past transactions placed by this customer
              </span>
            </div>
          </div>

          {!customer.orders || customer.orders.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", fontSize: "0.85rem" }}>
              No orders placed yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#4b5563" }}>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Order ID</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Items</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Total</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Status</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Date</th>
                    <th style={{ padding: "0.6rem 0.5rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", color: "#111827", fontWeight: 600 }}>
                        #{ord.id.slice(0, 8)}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "#4b5563" }}>
                        {ord.items?.length || 0} product(s)
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "#111827" }}>
                        ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span
                          style={{
                            background: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "#6b7280", fontSize: "0.8rem" }}>
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          style={{
                            color: "#855d14",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          View <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Saved Addresses */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            height: "fit-content",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <MapPin size={18} color="#2563eb" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              Saved Addresses ({customer.addresses?.length || 0})
            </h3>
          </div>

          {!customer.addresses || customer.addresses.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>No shipping addresses on file.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{addr.name}</span>
                    {addr.isDefault && (
                      <span
                        style={{
                          background: "#dbeafe",
                          color: "#1e40af",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                        }}
                      >
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#374151" }}>{addr.line1}</div>
                  {addr.line2 && <div style={{ color: "#374151" }}>{addr.line2}</div>}
                  <div style={{ color: "#6b7280" }}>
                    {addr.city}, {addr.state} — {addr.pincode}
                  </div>
                  <div style={{ color: "#6b7280", marginTop: "0.25rem" }}>
                    Phone: {addr.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
