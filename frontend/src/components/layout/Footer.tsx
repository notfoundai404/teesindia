'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';

// Custom Instagram icon
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Custom X (Twitter) icon
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ─── Link Groups ──────────────────────────────────────────────
const DEFAULT_SHOP_LINKS = [
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'T-Shirts', href: '/shop?category=men' },
  { label: 'Hoodies', href: '/shop?category=hoodies' },
  { label: 'Oversized', href: '/shop?category=oversized' },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'Women', href: '/shop?category=women' },
];

const DEFAULT_HELP_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Return Policy', href: '/return-policy' },
  { label: 'FAQs', href: '/faqs' },
];


// ─── Footer Component ─────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettingsStore();

  // Build social links dynamically from settings
  const socialLinks = [
    settings.instagramUrl && { label: 'Instagram', href: settings.instagramUrl, Icon: InstagramIcon },
    settings.twitterUrl && { label: 'Twitter / X', href: settings.twitterUrl, Icon: XIcon },
  ].filter(Boolean) as { label: string; href: string; Icon: React.FC<{ size?: number }> }[];

  return (
    <footer className="footer" style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
      <div className="container">

        {/* ── Main Grid ── */}
        <div className="footer__grid">

          {/* ── Brand Column ── */}
          <div>
            {/* Logo / Brand Name */}
            <div className="footer__brand-name">
              <Link href="/" aria-label={`${settings.storeName || 'TEESINDIA'} Home`} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                <img
                  src={settings.logoUrl || '/logo.svg'}
                  alt={settings.storeName || 'TEESINDIA'}
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'inline-block';
                  }}
                />
                <span style={{ display: 'none', letterSpacing: '-0.02em', color: '#000000', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  {settings.storeName || 'TEESINDIA'}
                </span>
              </Link>
            </div>

            {/* Tagline */}
            <p className="footer__brand-desc">
              {settings.tagline || 'Designed in India. Worn Everywhere.'}
              <br />
              <span
                style={{
                  color: 'var(--grey-600)',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.08em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                ESTD {settings.brandYear || '2020'}
              </span>
            </p>

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid #e5e7eb',
                    color: '#4b5563',
                    background: '#ffffff',
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = '#000000';
                    el.style.borderColor = '#000000';
                    el.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = '#4b5563';
                    el.style.borderColor = '#e5e7eb';
                    el.style.background = '#ffffff';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            )}

            {/* Trust Badge */}
            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--grey-500)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldCheck size={14} color="#C9A96E" /> 100% Secure Payments
            </p>
          </div>

          {/* ── Shop Links ── */}
          <div>
            <h3 className="footer__heading">Shop</h3>
            <ul className="footer__links">
              {(settings.footerShopLinks?.length ? settings.footerShopLinks : DEFAULT_SHOP_LINKS).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Help Links ── */}
          <div>
            <h3 className="footer__heading">Help</h3>
            <ul className="footer__links">
              {(settings.footerHelpLinks?.length ? settings.footerHelpLinks : DEFAULT_HELP_LINKS).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect Column ── */}
          <div>
            <h3 className="footer__heading">Connect</h3>

            {/* Social text links */}
            {socialLinks.length > 0 && (
              <ul className="footer__links" style={{ marginBottom: '1.5rem' }}>
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer__link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Icon size={14} />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* Newsletter mini-form */}
            <div>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--grey-200)',
                  marginBottom: '0.75rem',
                }}
              >
                Newsletter
              </p>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--grey-400)',
                  marginBottom: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                Get early access to drops &amp; exclusive offers.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 0.9rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer__bottom">
          <p>
            {settings.footerText || `© ${currentYear} TEESINDIA™. All rights reserved.`}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href="https://notfoundai.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'color 0.15s ease',
              }}
            >
              Created and crafted by{' '}
              <span
                style={{
                  fontWeight: 600,
                  color: '#111827',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                notfound ai
              </span>
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Made with{' '}
              <Heart size={13} fill="#C9A96E" color="#C9A96E" />{' '}
              in India
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
