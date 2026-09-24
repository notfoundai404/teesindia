'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';

// ─── Nav Links ──────────────────────────────────────────────
// Static fallback — used if settings haven't loaded yet.
const DEFAULT_NAV_LINKS: { label: string; href: string; accent?: boolean }[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Customize', href: '/#customizer', accent: true },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// ─── AnnouncementBar — driven by StoreSettings ──────────────
function AnnouncementBar() {
  const { settings } = useSettingsStore();
  if (!settings.announcementActive) return null;

  // Split on | so admins can write multi-message bars
  const items = settings.announcementText.split('|').map((s) => s.trim()).filter(Boolean);
  const doubled = [...items, ...items];

  return (
    <div
      className="announcement-bar"
      style={{ background: settings.announcementBg, color: settings.announcementTextColor }}
    >
      <div className="announcement-bar__track">
        {doubled.map((text, i) => (
          <span key={i} className="announcement-bar__item" style={{ color: settings.announcementTextColor }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── SearchBar ──────────────────────────────────────────────
interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        padding: '1.5rem 2rem',
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Search size={20} color="var(--grey-400)" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, collections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#000000',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.02em',
          }}
        />
        <button
          type="button"
          onClick={onClose}
          className="navbar__icon-btn"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </form>
      {query.length > 0 && (
        <p
          style={{
            textAlign: 'center',
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--grey-400)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
          }}
        >
          Press Enter to search
        </p>
      )}
    </div>
  );
}

// ─── MobileMenu ─────────────────────────────────────────────
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 150,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '340px',
          background: '#ffffff',
          zIndex: 160,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '4px 0 20px rgba(0,0,0,0.06)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Link href="/" onClick={onClose}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.2rem',
                letterSpacing: '-0.02em',
                color: '#000000',
              }}
            >
              {settings.storeName || 'TEESINDIA'}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="navbar__icon-btn"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {(settings.navLinks?.length ? settings.navLinks : DEFAULT_NAV_LINKS).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  style={{
                    display: 'block',
                    padding: '0.9rem 0.5rem',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.05rem',
                    fontWeight: pathname === link.href ? 700 : 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: pathname === link.href ? '#000000' : '#4b5563',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'color var(--transition)',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Secondary links */}
          <div style={{ marginTop: '2rem' }}>
            <p
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--grey-600)',
                marginBottom: '1rem',
              }}
            >
              Account
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {user ? (
                <>
                  {user.role === 'ADMIN' ? (
                    <li>
                      <Link
                        href="/admin"
                        onClick={onClose}
                        style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/account"
                          onClick={onClose}
                          style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                        >
                          My Account
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/account/orders"
                          onClick={onClose}
                          style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                        >
                          My Orders
                        </Link>
                      </li>
                    </>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      onClick={onClose}
                      style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      onClick={onClose}
                      style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                    >
                      Create Account
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  style={{ fontSize: '0.9rem', color: 'var(--grey-400)' }}
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* CTA */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <Link
            href="/shop"
            onClick={onClose}
            className="btn btn-primary w-full"
            style={{ textAlign: 'center' }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Main Navbar ─────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settings } = useSettingsStore();
  const { openCart, totalItems } = useCartStore();
  const { user } = useAuthStore();

  const cartCount = totalItems();

  // ── Scroll listener ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close mobile menu on route change ───────────────────
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // ── Keyboard shortcut for search (Cmd/Ctrl + K) ─────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCartOpen = useCallback(() => {
    openCart();
  }, [openCart]);

  return (
    <>
      {/* ── Announcement Bar ── */}
      <AnnouncementBar />

      {/* ── Search Overlay ── */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Header Wrapper ── */}
      <header
        className={`header-wrapper${scrolled ? ' scrolled' : ''}`}
      >
        <nav className="navbar">
          {/* ── Mobile Hamburger ── */}
          <button
            className="navbar__icon-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: 'flex' }}
          >
            <Menu size={22} />
          </button>

          {/* ── Logo ── */}
          <Link href="/" className="navbar__logo" aria-label={`${settings.storeName || 'TEESINDIA'} Home`}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName || 'TEESINDIA'}
                style={{ height: '40px', width: 'auto' }}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  const fallback = el.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
            ) : null}
            <span
              style={{
                display: settings.logoUrl ? 'none' : 'block',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              {settings.storeName || 'TEESINDIA'}
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="navbar__menu" role="navigation" aria-label="Main navigation">
            {(settings.navLinks?.length ? settings.navLinks : DEFAULT_NAV_LINKS).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`navbar__menu-item${link.accent ? ' accent' : ''}${pathname === link.href || (link.href !== '/#customizer' && pathname.startsWith(link.href + '/')) ? ' active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Right Actions ── */}
          <div className="navbar__actions">
            {/* Search */}
            <button
              className="navbar__icon-btn hide-mobile"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="navbar__icon-btn hide-mobile"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* User / Account */}
            <Link
              href={user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/login'}
              className="navbar__icon-btn hide-mobile"
              aria-label={user ? (user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Account') : 'Sign In'}
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <button
              className="navbar__icon-btn"
              onClick={handleCartOpen}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="navbar__cart-count">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ── */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
