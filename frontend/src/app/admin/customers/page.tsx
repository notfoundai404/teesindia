"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/api";
import { Search, User, ArrowUpRight, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await adminApi.customers();
      setCustomers(res.data.customers || []);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <AdminLayout title="Registered Customers">
      {/* Search Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
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
            placeholder="Search by name, email, or phone..."
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
          Showing {filtered.length} of {customers.length} customers
        </div>
      </div>

      {/* Customers Table Card */}
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
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600 }}>Customer</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Phone</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Total Orders</th>
                <th style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>Joined</th>
                <th style={{ padding: "0.9rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td colSpan={6} style={{ padding: "1.25rem", textAlign: "center", color: "#9ca3af" }}>
                      Loading customer directory...
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    {search ? "No customers found matching search." : "No registered customers yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Customer */}
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                          }}
                        >
                          {c.name ? c.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            style={{
                              color: "#111827",
                              fontWeight: 600,
                              textDecoration: "none",
                              fontSize: "0.9rem",
                            }}
                          >
                            {c.name}
                          </Link>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            ID: {c.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "0.9rem 1rem", color: "#374151" }}>{c.email}</td>

                    {/* Phone */}
                    <td style={{ padding: "0.9rem 1rem", color: "#6b7280" }}>{c.phone || "—"}</td>

                    {/* Orders count */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: "#111827",
                        }}
                      >
                        {c._count?.orders ?? 0} orders
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td style={{ padding: "0.9rem 1rem", color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          color: "#111827",
                          padding: "0.4rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        Profile <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
