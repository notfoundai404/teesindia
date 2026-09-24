'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { productApi } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Heart, Search } from 'lucide-react';

interface Product {
  id: string; name: string; slug: string; price: number;
  comparePrice?: number; images: { url: string }[];
  category: { name: string; slug: string }; isFeatured: boolean;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    productApi.list({ search: q, limit: 24 }).then(res => {
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '2rem 0' }}>
          <div className="container">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                <input
                  type="search" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="form-input"
                  style={{ paddingLeft: '3rem', fontSize: '1rem' }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            {q && !loading && (
              <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                {total > 0 ? `${total} results for "${q}"` : `No results for "${q}"`}
              </p>
            )}
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
          {!q && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Search size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Start typing to search products</p>
            </div>
          )}
          {loading && (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--black-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ aspectRatio: '3/4', background: 'var(--black-surface)' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '1rem', background: 'var(--black-surface)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '0.8rem', background: 'var(--black-surface)', borderRadius: '4px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && q && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>No products found for &ldquo;{q}&rdquo;</p>
              <Link href="/shop" className="btn btn-outline">Browse All Products</Link>
            </div>
          )}
          {!loading && products.length > 0 && (
            <div className="product-grid">
              {products.map(product => {
                const wishlisted = isWishlisted(product.id);
                const hasDiscount = product.comparePrice && product.comparePrice > product.price;
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-card__image-wrap">
                      <Link href={`/product/${product.slug}`}>
                        {product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="product-card__image-main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--black-surface)' }} />
                        )}
                      </Link>
                      {hasDiscount && <span className="product-card__badge sale">SALE</span>}
                      <button className="product-card__wishlist" onClick={() => toggle(product.id)} aria-label="Wishlist">
                        <Heart size={16} fill={wishlisted ? '#e11d48' : 'none'} color={wishlisted ? '#e11d48' : 'currentColor'} />
                      </button>
                      <button className="product-card__quick-add" onClick={() => {
                        addItem({ id: `${product.id}-default`, productId: product.id, quantity: 1, product: { name: product.name, price: product.price, images: product.images, slug: product.slug } });
                        openCart(); toast.success('Added to cart');
                      }}>Quick Add</button>
                    </div>
                    <div className="product-card__info">
                      <Link href={`/product/${product.slug}`}><p className="product-card__name">{product.name}</p></Link>
                      <p>
                        <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
                        {hasDiscount && <span className="product-card__compare-price">₹{product.comparePrice?.toLocaleString('en-IN')}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense fallback={
        <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      }>
        <SearchContent />
      </Suspense>
    </>
  );
}
