'use client';
import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { productApi, categoryApi } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string }[];
  category: { name: string; slug: string };
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openCart, addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.list({ category, sort, search, page, limit: 12 });
      const prods = res.data.products || res.data || [];
      setProducts(prods);
      setTotal(res.data.total || prods.length);
      setPages(res.data.pages || 1);
    } catch {
      setProducts([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoryApi.list()
      .then(res => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const handleQuickAdd = (product: Product) => {
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      quantity: 1,
      product: { name: product.name, price: product.price, images: product.images, slug: product.slug },
    });
    openCart();
    toast.success('Added to cart');
  };

  return (
    <>
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        {/* Page Header */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '2rem 0' }}>
          <div className="container">
            <h1 className="text-4xl font-heading" style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000' }}>
              {category ? categories.find(c => c.slug === category)?.name || 'Collection' : 'ALL PRODUCTS'}
            </h1>
            <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>{total} products</p>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setParam('category', '')} style={{ padding: '0.6rem 1.25rem', border: `1.5px solid ${!category ? '#000000' : '#e5e7eb'}`, borderRadius: 'var(--radius-pill)', background: !category ? '#000000' : '#ffffff', color: !category ? '#ffffff' : '#374151', fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s', cursor: 'pointer' }}>All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setParam('category', cat.slug)} style={{ padding: '0.6rem 1.25rem', border: `1.5px solid ${category === cat.slug ? '#000000' : '#e5e7eb'}`, borderRadius: 'var(--radius-pill)', background: category === cat.slug ? '#000000' : '#ffffff', color: category === cat.slug ? '#ffffff' : '#374151', fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s', cursor: 'pointer' }}>
                  {cat.name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--grey-400)', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sort</span>
              <select value={sort} onChange={e => setParam('sort', e.target.value)} className="form-input form-select" style={{ width: 'auto', padding: '0.5rem 2.5rem 0.5rem 1rem', fontSize: '0.85rem' }}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '3/4', background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '1rem', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '0.8rem', background: '#f3f4f6', borderRadius: '4px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontSize: '1.25rem', color: 'var(--grey-400)', marginBottom: '1rem' }}>No products found</p>
              <button onClick={() => router.push('/shop')} className="btn btn-outline">Clear Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => {
                const wishlisted = isWishlisted(product.id);
                const hasDiscount = product.comparePrice && product.comparePrice > product.price;
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-card__image-wrap">
                      {product.images[0] ? (
                        <Link href={`/product/${product.slug}`}>
                          <img src={product.images[0].url} alt={product.name} className="product-card__image-main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {product.images[1] && (
                            <img src={product.images[1].url} alt={product.name} className="product-card__image-hover" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                          )}
                        </Link>
                      ) : (
                        <Link href={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%', background: 'var(--black-surface)' }} />
                      )}
                      {hasDiscount && <span className="product-card__badge sale">SALE</span>}
                      {product.isFeatured && !hasDiscount && <span className="product-card__badge">NEW</span>}
                      <button className="product-card__wishlist" onClick={() => toggle(product.id)} aria-label="Add to wishlist">
                        <Heart size={16} fill={wishlisted ? '#e11d48' : 'none'} stroke={wishlisted ? '#e11d48' : 'currentColor'} />
                      </button>
                      <button className="product-card__quick-add" onClick={() => handleQuickAdd(product)}>Quick Add</button>
                    </div>
                    <div className="product-card__info">
                      <Link href={`/product/${product.slug}`}>
                        <p className="product-card__name">{product.name}</p>
                      </Link>
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

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setParam('page', String(p))} style={{ width: '40px', height: '40px', border: `1.5px solid ${p === page ? '#000000' : '#e5e7eb'}`, borderRadius: '50%', background: p === page ? '#000000' : '#ffffff', color: p === page ? '#ffffff' : '#374151', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
    </>
  );
}

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense fallback={
        <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      }>
        <ShopContent />
      </Suspense>
    </>
  );
}
