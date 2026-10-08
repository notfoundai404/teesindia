'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  user: { name: string; email: string };
  items?: any[];
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  images?: { url: string }[];
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  label: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revRes] = await Promise.all([
          adminApi.stats(),
          adminApi.revenue().catch(() => ({ data: { data: [] } })),
        ]);
        setStats(statsRes.data.stats);
        setRecentOrders(statsRes.data.recentOrders || []);
        setLowStock(statsRes.data.lowStockProducts || []);
        if (revRes.data?.data) {
          setRevenueData(revRes.data.data);
        }
      } catch (err: any) {
        // 401 = not authenticated or session expired → redirect to login
        if (err?.response?.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/login';
          return;
        }
        // Other errors: log but let the dashboard show with empty state
        console.error('Failed to load admin stats:', err?.response?.data?.message || err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : '₹0',
      icon: <IndianRupee size={22} color="#C9A96E" />,
      bg: 'rgba(201, 169, 110, 0.08)',
      border: 'rgba(201, 169, 110, 0.2)',
    },
    {
      label: 'Total Orders',
      value: stats ? stats.totalOrders.toLocaleString('en-IN') : '0',
      icon: <ShoppingBag size={22} color="#60a5fa" />,
      bg: 'rgba(96, 165, 250, 0.08)',
      border: 'rgba(96, 165, 250, 0.2)',
    },
    {
      label: 'Active Products',
      value: stats ? stats.totalProducts.toLocaleString('en-IN') : '0',
      icon: <Package size={22} color="#4ade80" />,
      bg: 'rgba(74, 222, 128, 0.08)',
      border: 'rgba(74, 222, 128, 0.2)',
    },
    {
      label: 'Customers',
      value: stats ? stats.totalCustomers.toLocaleString('en-IN') : '0',
      icon: <Users size={22} color="#a78bfa" />,
      bg: 'rgba(167, 139, 250, 0.08)',
      border: 'rgba(167, 139, 250, 0.2)',
    },
  ];

  const statusColor: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    CONFIRMED: { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa' },
    PROCESSING: { bg: 'rgba(167, 139, 250, 0.15)', text: '#a78bfa' },
    SHIPPED: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
    DELIVERED: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' },
    CANCELLED: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
  };

  const actionButtons = (
    <div className="flex flex-wrap gap-3 items-center">
      <Link
        href="/admin/products/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#C9A96E',
          color: '#000',
          padding: '0.6rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
          boxShadow: '0 2px 10px rgba(201, 169, 110, 0.2)',
          transition: 'all 0.2s ease',
        }}
      >
        <Plus size={16} /> Add Product
      </Link>
      <Link
        href="/admin/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#181818',
          color: '#fff',
          border: '1px solid #333',
          padding: '0.6rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        View Orders
      </Link>
    </div>
  );

  return (
    <AdminLayout title="Dashboard Overview" action={actionButtons}>
      {/* Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--grey-400)', fontWeight: 500 }}>
                {card.label}
              </span>
              <div
                style={{
                  background: card.bg,
                  padding: '0.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#0a0a0a',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {loading ? '—' : card.value}
            </div>
            {/* change text removed */}
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart Section */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#0a0a0a',
                fontFamily: 'var(--font-heading)',
                margin: 0,
              }}
            >
              Revenue Analytics (Last 30 Days)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', margin: '0.25rem 0 0' }}>
              Daily collected revenue from paid orders
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#855d14',
              background: 'rgba(201, 169, 110, 0.12)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid rgba(201, 169, 110, 0.25)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', display: 'inline-block' }} />
            <span>Live analytics</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A96E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--grey-400)',
                fontSize: '0.875rem',
              }}
            >
              No revenue data recorded in the last 30 days yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Low Stock Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Orders Table */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
                  margin: 0,
                }}
              >
                Recent Orders
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--grey-400)', margin: '0.2rem 0 0' }}>
                Latest transactions across store
              </p>
            </div>
            <Link
              href="/admin/orders"
              style={{
                fontSize: '0.8rem',
                color: '#855d14',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
              }}
            >
              All orders <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--grey-400)', fontSize: '0.875rem' }}>
              No orders placed yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#6b7280' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Order ID</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Customer</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Total</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => {
                    const st = statusColor[ord.status] || { bg: '#f3f4f6', text: '#4b5563' };
                    return (
                      <tr
                        key={ord.id}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: '#6b7280' }}>
                          #{ord.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#111827', fontWeight: 500 }}>
                          {ord.user?.name || 'Guest'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0a0a0a' }}>
                          ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span
                            style={{
                              background: st.bg,
                              color: st.text,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            style={{
                              color: 'var(--grey-400)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={18} color="#dc2626" /> Low Stock Inventory
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--grey-400)', margin: '0.2rem 0 0' }}>
                Items with 5 or fewer units remaining
              </p>
            </div>
            <Link
              href="/admin/products"
              style={{
                fontSize: '0.8rem',
                color: '#855d14',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
              }}
            >
              Inventory <ArrowRight size={14} />
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', textAlign: 'center', color: '#16a34a', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} /> All products are well-stocked
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStock.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        background: '#f4f4f5',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Package size={20} color="#9ca3af" style={{ margin: '10px' }} />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: '#111827',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {prod.name}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: prod.stock === 0 ? '#dc2626' : '#d97706',
                          fontWeight: 600,
                        }}
                      >
                        {prod.stock === 0 ? 'Out of Stock' : `Only ${prod.stock} left in stock`}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/products/${prod.id}`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      color: '#111827',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
