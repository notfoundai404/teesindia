'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { collectionApi, categoryApi } from '@/lib/api';
import { useSettingsStore } from '@/lib/settingsStore';
import { ArrowRight } from 'lucide-react';

interface DisplayCollection {
  id: string;
  label: string;
  tagline?: string;
  desc?: string;
  href: string;
  imageUrl?: string;
  itemsCount?: string;
}

export default function CollectionsPage() {
  const { settings } = useSettingsStore();
  const [collections, setCollections] = useState<DisplayCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      setLoading(true);
      try {
        const res = await collectionApi.list();
        const apiCols = res.data?.collections || [];
        if (apiCols.length > 0) {
          setCollections(
            apiCols.map((c: any) => ({
              id: c.id,
              label: c.name,
              tagline: c.description || 'Collection',
              desc: c.description || '',
              href: `/shop?collection=${c.slug}`,
              imageUrl: c.heroImage || c.products?.[0]?.product?.images?.[0]?.url || '',
              itemsCount: c.products?.length ? `${c.products.length} styles` : 'Collection',
            }))
          );
        } else if (settings.collections?.length > 0) {
          setCollections(
            settings.collections.map((c, i) => ({
              id: `setting-${i}`,
              label: c.label,
              tagline: c.tagline || '',
              desc: c.tagline || '',
              href: c.href || `/shop?category=${encodeURIComponent(c.label.toLowerCase())}`,
              imageUrl: c.imageUrl || '',
              itemsCount: 'Collection',
            }))
          );
        } else {
          // Fallback to active categories from backend
          const catRes = await categoryApi.list();
          const cats = catRes.data?.categories || [];
          setCollections(
            cats.map((c: any) => ({
              id: c.id,
              label: c.name,
              tagline: c.description || '',
              desc: c.description || '',
              href: `/shop?category=${c.slug}`,
              imageUrl: c.image || '',
              itemsCount: c._count?.products ? `${c._count.products} styles` : 'Category',
            }))
          );
        }
      } catch {
        // Fallback to store settings
        if (settings.collections?.length > 0) {
          setCollections(
            settings.collections.map((c, i) => ({
              id: `setting-${i}`,
              label: c.label,
              tagline: c.tagline || '',
              desc: c.tagline || '',
              href: c.href || `/shop?category=${encodeURIComponent(c.label.toLowerCase())}`,
              imageUrl: c.imageUrl || '',
              itemsCount: 'Collection',
            }))
          );
        } else {
          setCollections([]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, [settings.collections]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '4rem 0 3rem' }}>
          <div className="container">
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1rem' }}>
              {settings.storeName || 'TEESINDIA™'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#111827' }}>
              ALL<br /><em>COLLECTIONS</em>
            </h1>
          </div>
        </div>

        {/* Collection Grid */}
        <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', height: '240px', background: '#f3f4f6', animation: 'shimmer 1.5s infinite', border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>No collections found</p>
              <Link href="/shop" className="btn btn-outline">Browse All Products</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {collections.map((col, i) => (
                <Link
                  key={col.id}
                  href={col.href}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: i === 0 || i === 1 ? '3/2' : '4/3',
                    border: '1px solid #e5e7eb',
                    transition: 'border-color 0.3s, transform 0.2s',
                    background: col.imageUrl ? `url(${col.imageUrl}) center/cover` : 'linear-gradient(135deg, #f8f9fa 0%, #ede8df 100%)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Pattern overlay */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 12px)' }} />

                  {/* Large letter watermark */}
                  <div aria-hidden="true" style={{ position: 'absolute', right: '-0.05em', bottom: '-0.1em', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(6rem, 20vw, 12rem)', lineHeight: 1, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: '1px rgba(0,0,0,0.06)', userSelect: 'none', zIndex: 1 }}>
                    {col.label.charAt(0)}
                  </div>

                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)', zIndex: 2 }} />

                  {/* Arrow */}
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 36, height: 36, borderRadius: '50%', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, transition: 'background 0.3s', background: 'rgba(255,255,255,0.9)' }}>
                    <ArrowRight size={14} color="#111827" />
                  </div>

                  {/* Content */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', zIndex: 3 }}>
                    {col.itemsCount && (
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.4rem' }}>
                        {col.itemsCount}
                      </p>
                    )}
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', marginBottom: '0.5rem' }}>
                      {col.label}
                    </h2>
                    {col.desc && (
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, maxWidth: '300px' }}>
                        {col.desc}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
