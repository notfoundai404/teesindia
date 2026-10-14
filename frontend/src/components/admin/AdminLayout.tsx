"use client";

import React, { ReactNode, useEffect, useState } from "react";
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
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { authApi } from "@/lib/api";

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
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      logout();
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="admin-mobile-header md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label={sidebarOpen ? "Close admin navigation" : "Open admin navigation"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/">
            <img src="/logo.svg" alt="TEESINDIA" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 p-2 hover:bg-red-50 rounded-full flex items-center justify-center"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <Link href="/" className="hidden md:block mb-10">
          <img src="/logo.svg" alt="TEESINDIA" className="h-9 w-auto object-contain" />
        </Link>
        <nav className="flex-1 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href + '/'));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)} // Close sidebar on click (mobile)
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-heading font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-[#855d14] bg-[#C9A96E]/10 border-l-2 border-[#C9A96E]' 
                    : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#855d14]' : 'text-gray-500'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pt-6 mt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-gray-900 mb-3 truncate">{user.name}</p>
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2 text-left"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main min-w-0 flex-1 p-4 md:p-10 overflow-x-hidden">
        <div className="admin-page-heading flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {action && <div className="admin-page-action flex-shrink-0">{action}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
