'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, X, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useWishlistStore, useAuthStore, useCartStore } from '@/lib/store';
import { wishlistApi, productApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string }[];
}

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { productIds, toggle } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        if (user) {
          // Backend wishlist returns full product data
          const response = await wishlistApi.get();
          const items = response.data.items || response.data || [];
          setProducts(items.map((item: any) => item.product || item).filter(Boolean));
        } else if (productIds.length > 0) {
          // Fetch products by slug one-by-one for guest users
          const results = await Promise.allSettled(productIds.map(id => productApi.get(id)));
          const prods = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value?.data?.product)
            .filter(Boolean);
          setProducts(prods);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user, productIds.length]);

  const handleRemove = async (productId: string) => {
    if (user) {
      try { await wishlistApi.remove(productId); } catch {}
    }
    toggle(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (product: WishlistProduct) => {
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
    <><Navbar /><CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '2rem 0' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827' }}>
              MY WISHLIST{products.length > 0 && <span style={{ fontWeight: 400, fontSize: '1rem', color: '#6b7280', marginLeft: '0.75rem' }}>({products.length} items)</span>}
            </h1>
          </div>
        </div>

        <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--black-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ aspectRatio: '3/4', background: 'var(--black-surface)' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '1rem', background: 'var(--black-surface)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '0.8rem', background: 'var(--black-surface)', borderRadius: '4px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <Heart size={40} color="#9ca3af" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Your wishlist is empty</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                Save your favourite pieces here. They&apos;ll be waiting when you&apos;re ready.
              </p>
              <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-card__image-wrap">
                    <Link href={`/product/${product.slug}`}>
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="product-card__image-main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--black-surface)' }} />
                      )}
                    </Link>
                    <button onClick={() => handleRemove(product.id)} className="product-card__wishlist" aria-label="Remove from wishlist" title="Remove from wishlist">
                      <Heart size={16} fill="#e11d48" color="#e11d48" />
                    </button>
                    <button className="product-card__quick-add" onClick={() => handleAddToCart(product)}>
                      <ShoppingBag size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      Add to Cart
                    </button>
                  </div>
                  <div className="product-card__info">
                    <Link href={`/product/${product.slug}`}><p className="product-card__name">{product.name}</p></Link>
                    <p>
                      <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="product-card__compare-price">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
