"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Lock,
  Edit2,
  Plus,
  Trash2,
  Check,
  Loader2,
  ArrowRight,
  LogOut,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { useAuthStore } from "@/lib/store";
import { userApi, orderApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);

  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: "",
      });
    }

    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const [ordersRes, userRes] = await Promise.all([
          orderApi.list().catch(() => ({ data: [] })),
          userApi.getProfile().catch(() => ({ data: user })),
        ]);

        const fetchedOrders =
          ordersRes.data?.orders || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setOrders(fetchedOrders);
        const userData = userRes.data?.user || userRes.data;
        if (userData?.addresses) {
          setAddresses(userData.addresses);
        }
        if (userData?.phone) {
          setProfileForm((prev) => ({ ...prev, phone: userData.phone || "" }));
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.updateProfile(profileForm);
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await userApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.addAddress(addressForm);
      const createdAddr = res.data?.address || { ...addressForm, id: Date.now().toString() };
      setAddresses((prev) => [...prev, createdAddr]);
      setShowAddAddress(false);
      setAddressForm({
        name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });
      toast.success("Delivery address added successfully");
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id && a._id !== id));
      toast.success("Address removed");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "addresses", label: "Shipping Addresses", icon: MapPin },
    { id: "password", label: "Security & Login", icon: Lock },
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return { bg: "rgba(74, 222, 128, 0.12)", color: "#4ade80", border: "rgba(74, 222, 128, 0.3)" };
      case "SHIPPED":
        return { bg: "rgba(52, 211, 153, 0.12)", color: "#34d399", border: "rgba(52, 211, 153, 0.3)" };
      case "CONFIRMED":
      case "PROCESSING":
        return { bg: "rgba(96, 165, 250, 0.12)", color: "#60a5fa", border: "rgba(96, 165, 250, 0.3)" };
      case "CANCELLED":
        return { bg: "rgba(248, 113, 113, 0.12)", color: "#f87171", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ paddingTop: "calc(40px + 72px)", flex: 1, paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "2rem",
              marginBottom: "2.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A96E, #8C7343)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-heading)",
                  boxShadow: "0 4px 20px rgba(201, 169, 110, 0.25)",
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#C9A96E",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Verified Member'}
                </span>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a0a0a", margin: 0, fontFamily: "var(--font-heading)" }}>
                  {user.name}
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--grey-400)", margin: "0.25rem 0 0" }}>
                  {user.email}
                </p>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    style={{
                      display: "inline-block",
                      marginTop: "0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#C9A96E",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    Go to Admin Dashboard &rarr;
                  </Link>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.75rem 1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", display: "block" }}>Total Orders</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0a0a0a" }}>{orders.length}</span>
              </div>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.75rem 1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", display: "block" }}>Addresses</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#C9A96E" }}>{addresses.length}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Navigation Tabs Sidebar */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
                position: "sticky",
                top: "120px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        padding: "1rem 1.25rem",
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 600 : 500,
                        fontFamily: "var(--font-heading)",
                        color: isActive ? "#C9A96E" : "var(--grey-400)",
                        background: isActive ? "rgba(201, 169, 110, 0.08)" : "transparent",
                        borderLeft: isActive ? "3px solid #C9A96E" : "3px solid transparent",
                        borderTop: "none",
                        borderRight: "none",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon size={16} color={isActive ? "#C9A96E" : "var(--grey-400)"} />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "1rem 1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-heading)",
                    color: "#f87171",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "2rem",
                minHeight: "480px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {initialLoading ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "var(--grey-400)" }}>
                  <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                  Loading your account...
                </div>
              ) : (
                <>
                  {/* PROFILE TAB */}
                  {activeTab === "profile" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                        <div>
                          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
                            Profile Details
                          </h2>
                          <p style={{ fontSize: "0.8rem", color: "var(--grey-400)", margin: "0.25rem 0 0" }}>
                            Manage your personal contact credentials
                          </p>
                        </div>
                        <button
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: isEditingProfile ? "#f3f4f6" : "rgba(201, 169, 110, 0.1)",
                            border: isEditingProfile ? "1px solid #e5e7eb" : "1px solid rgba(201, 169, 110, 0.3)",
                            color: isEditingProfile ? "#111827" : "#855d14",
                            padding: "0.45rem 0.9rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={13} />
                          {isEditingProfile ? "Cancel" : "Edit Profile"}
                        </button>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleProfileUpdate} style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              required
                              style={{
                                width: "100%",
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                padding: "0.65rem 0.85rem",
                                color: "#0a0a0a",
                                fontSize: "0.9rem",
                                outline: "none",
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                              Email Address (Read-only)
                            </label>
                            <input
                              type="email"
                              value={profileForm.email}
                              disabled
                              style={{
                                width: "100%",
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                padding: "0.65rem 0.85rem",
                                color: "#6b7280",
                                fontSize: "0.9rem",
                                outline: "none",
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              style={{
                                width: "100%",
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                padding: "0.65rem 0.85rem",
                                color: "#0a0a0a",
                                fontSize: "0.9rem",
                                outline: "none",
                              }}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              background: "#C9A96E",
                              color: "#000",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              padding: "0.65rem 1.25rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              width: "fit-content",
                            }}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </form>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "600px" }}>
                          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                              Full Name
                            </span>
                            <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a" }}>
                              {profileForm.name}
                            </span>
                          </div>

                          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                              Email Address
                            </span>
                            <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a" }}>
                              {profileForm.email}
                            </span>
                          </div>

                          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                              Phone Number
                            </span>
                            <span style={{ fontSize: "1rem", fontWeight: 600, color: profileForm.phone ? "#0a0a0a" : "var(--grey-500)" }}>
                              {profileForm.phone || "Not provided"}
                            </span>
                          </div>

                          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                              Account Role
                            </span>
                            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#C9A96E" }}>
                              {user.role || "CUSTOMER"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ORDERS TAB */}
                  {activeTab === "orders" && (
                    <div>
                      <div style={{ marginBottom: "1.75rem" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
                          Order History
                        </h2>
                        <p style={{ fontSize: "0.8rem", color: "var(--grey-400)", margin: "0.25rem 0 0" }}>
                          Track current shipments and view historical receipts
                        </p>
                      </div>

                      {orders.length === 0 ? (
                        <div
                          style={{
                            border: "1px dashed #d1d5db",
                            borderRadius: "12px",
                            padding: "4rem 2rem",
                            textAlign: "center",
                          }}
                        >
                          <Package size={44} color="#9ca3af" style={{ margin: "0 auto 1rem" }} />
                          <h3 style={{ color: "#0a0a0a", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                            No Orders Yet
                          </h3>
                          <p style={{ color: "var(--grey-400)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                            Your closet awaits. Discover our newest heavyweight drops and streetwear silhouettes.
                          </p>
                          <Link
                            href="/shop"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              background: "#C9A96E",
                              color: "#000",
                              fontWeight: 600,
                              padding: "0.6rem 1.5rem",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              textDecoration: "none",
                            }}
                          >
                            Explore Catalog <ArrowRight size={15} />
                          </Link>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {orders.map((order) => {
                            const orderId = order.id || order._id;
                            const badge = getStatusBadge(order.status);
                            const itemCount = order.items?.length || 0;

                            return (
                              <div
                                key={orderId}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "10px",
                                  padding: "1.25rem 1.5rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "1rem",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                  transition: "border-color 0.2s",
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", color: "#0a0a0a" }}>
                                      #{String(orderId).slice(0, 8).toUpperCase()}
                                    </span>
                                    <span
                                      style={{
                                        background: badge.bg,
                                        color: badge.color,
                                        border: `1px solid ${badge.border}`,
                                        padding: "0.15rem 0.5rem",
                                        borderRadius: "12px",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      {order.status || "PENDING"}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "0.8rem", color: "var(--grey-400)", display: "flex", gap: "1rem" }}>
                                    <span>
                                      Date: {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                    <span>·</span>
                                    <span>{itemCount} product(s)</span>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                  <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: "0.7rem", color: "var(--grey-400)", display: "block" }}>Order Total</span>
                                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#C9A96E" }}>
                                      ₹{Number(order.totalAmount || order.total || 0).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/account/orders/${orderId}`}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "0.4rem",
                                      background: "#f9fafb",
                                      border: "1px solid #e5e7eb",
                                      color: "#0a0a0a",
                                      padding: "0.45rem 0.9rem",
                                      borderRadius: "6px",
                                      fontSize: "0.8rem",
                                      fontWeight: 500,
                                      textDecoration: "none",
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    View Details <ArrowRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADDRESSES TAB */}
                  {activeTab === "addresses" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                        <div>
                          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
                            Saved Shipping Addresses
                          </h2>
                          <p style={{ fontSize: "0.8rem", color: "var(--grey-400)", margin: "0.25rem 0 0" }}>
                            Addresses used for rapid order dispatch
                          </p>
                        </div>
                        {!showAddAddress && (
                          <button
                            onClick={() => setShowAddAddress(true)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              background: "#C9A96E",
                              color: "#000",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              padding: "0.45rem 0.9rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={14} /> Add Address
                          </button>
                        )}
                      </div>

                      {showAddAddress && (
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            padding: "1.5rem",
                            marginBottom: "1.75rem",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                          }}
                        >
                          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0a0a0a", marginBottom: "1rem" }}>
                            Add New Shipping Destination
                          </h3>
                          <form onSubmit={handleAddAddress} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                Recipient Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.name}
                                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                Contact Phone *
                              </label>
                              <input
                                type="tel"
                                required
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                Street Address (Line 1) *
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.line1}
                                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                City *
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                State *
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                                Pincode *
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.pincode}
                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                style={{
                                  width: "100%",
                                  background: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  padding: "0.6rem 0.85rem",
                                  color: "#0a0a0a",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={addressForm.isDefault}
                                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                  style={{ accentColor: "#C9A96E" }}
                                />
                                <span style={{ fontSize: "0.85rem", color: "#0a0a0a" }}>Set as default address</span>
                              </label>
                            </div>

                            <div style={{ gridColumn: "span 2", display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                              <button
                                type="submit"
                                disabled={loading}
                                style={{
                                  background: "#C9A96E",
                                  color: "#000",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                  padding: "0.6rem 1.25rem",
                                  borderRadius: "6px",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {loading ? "Saving..." : "Save Address"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddAddress(false)}
                                style={{
                                  background: "#f3f4f6",
                                  color: "#4b5563",
                                  fontSize: "0.85rem",
                                  padding: "0.6rem 1rem",
                                  borderRadius: "6px",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {addresses.length === 0 ? (
                        <p style={{ color: "var(--grey-400)", fontSize: "0.85rem" }}>No shipping addresses saved on file.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                          {addresses.map((addr) => (
                            <div
                              key={addr.id || addr._id}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "10px",
                                padding: "1.25rem",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                                lineHeight: "1.5",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                  <span style={{ fontWeight: 600, color: "#0a0a0a" }}>{addr.name}</span>
                                  {addr.isDefault && (
                                    <span
                                      style={{
                                        background: "rgba(201, 169, 110, 0.15)",
                                        color: "#855d14",
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
                                <div style={{ color: "var(--grey-300)" }}>{addr.line1}</div>
                                {addr.line2 && <div style={{ color: "var(--grey-300)" }}>{addr.line2}</div>}
                                <div style={{ color: "var(--grey-400)" }}>
                                  {addr.city}, {addr.state} — {addr.pincode}
                                </div>
                                <div style={{ color: "var(--grey-400)", marginTop: "0.4rem" }}>
                                  Phone: {addr.phone}
                                </div>
                              </div>
                              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id || addr._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                  }}
                                >
                                  <Trash2 size={13} /> Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECURITY / PASSWORD TAB */}
                  {activeTab === "password" && (
                    <div style={{ maxWidth: "480px" }}>
                      <div style={{ marginBottom: "1.75rem" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
                          Password & Security
                        </h2>
                        <p style={{ fontSize: "0.8rem", color: "var(--grey-400)", margin: "0.25rem 0 0" }}>
                          Ensure your account uses a strong, unique password
                        </p>
                      </div>

                      <form onSubmit={handlePasswordUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                            Current Password *
                          </label>
                          <input
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            style={{
                              width: "100%",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              padding: "0.65rem 0.85rem",
                              color: "#0a0a0a",
                              fontSize: "0.9rem",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                            New Password (min 6 characters) *
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            style={{
                              width: "100%",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              padding: "0.65rem 0.85rem",
                              color: "#0a0a0a",
                              fontSize: "0.9rem",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--grey-400)", marginBottom: "0.35rem" }}>
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            style={{
                              width: "100%",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              padding: "0.65rem 0.85rem",
                              color: "#0a0a0a",
                              fontSize: "0.9rem",
                              outline: "none",
                            }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            background: "#C9A96E",
                            color: "#000",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            padding: "0.65rem 1.25rem",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            width: "fit-content",
                          }}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
