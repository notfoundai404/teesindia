"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sparkles,
  ShoppingBag,
  Users,
  FileText,
  Settings,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", icon: Sparkles },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children, title, action }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', color: '#111827', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <Link href="/" style={{ marginBottom: '2.5rem', display: 'block' }}>
          <img src="/logo.svg" alt="TEESINDIA" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        <nav style={{ flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href + '/'));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#855d14' : '#4b5563',
                  background: isActive ? 'rgba(201, 169, 110, 0.12)' : 'transparent',
                  borderLeft: isActive ? '2px solid #C9A96E' : '2px solid transparent',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: '0.25rem',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
              >
                <Icon size={17} color={isActive ? '#855d14' : '#6b7280'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem' }}>Logged in as</p>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>View Store</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0a0a0a' }}>{title}</h1>
          {action && <div>{action}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
