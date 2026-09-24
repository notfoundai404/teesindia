'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { productApi } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import toast from 'react-hot-toast';
import { Heart, Minus, Plus, ChevronRight, Star, Package, RotateCcw, Truck, Shield } from 'lucide-react';

interface ProductVariant { id: string; size: string; color?: string; stock: number; }
interface ProductImage { id: string; url: string; altText?: string; }
interface Review { id: string; rating: number; comment?: string; user: { name: string }; createdAt: string; }

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; comparePrice?: number;
  images: ProductImage[]; variants: ProductVariant[];
  category: { name: string; slug: string };
  tags?: string; material?: string; careInstr?: string;
  reviews: Review[];
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { settings } = useSettingsStore();
  const freeShippingThreshold = settings.freeShippingThreshold ?? 999;
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'care'>('details');

  useEffect(() => {
    productApi.get(slug).then(res => {
      const p = res.data.product;
      if (!p || p.isActive === false) {
        toast.error('This product is no longer available');
        setProduct(null);
        return;
      }
      setProduct(p);
      if (p.variants?.length) setSelectedVariant(p.variants[0]);
    }).catch(() => {
      setProduct(null);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <Navbar /><CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            <div style={{ aspectRatio: '3/4', background: 'var(--black-card)', borderRadius: 'var(--radius-md)' }} />
            <div>
              <div style={{ height: '2rem', background: 'var(--black-card)', borderRadius: '4px', marginBottom: '1rem', width: '70%' }} />
              <div style={{ height: '1.5rem', background: 'var(--black-card)', borderRadius: '4px', marginBottom: '2rem', width: '40%' }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );

  if (!product) {
    return (
      <>
        <Navbar /><CartDrawer />
        <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '80vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
            <Package size={48} color="#C9A96E" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Product Unavailable</h1>
            <p style={{ color: 'var(--grey-400)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              This item has been removed, marked as draft, or is currently unavailable in our catalog.
            </p>
            <Link href="/shop" className="btn btn-primary">Browse All Collections</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discountPct = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null;
  const wishlisted = isWishlisted(product.id);
  const avgRating = product.reviews.length ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : null;

  const handleAddToCart = () => {
    if (!product || (product as any).isActive === false) {
      toast.error('This product is no longer available');
      return;
    }
    addItem({
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      product: { name: product.name, price: product.price, images: product.images, slug: product.slug },
      variant: selectedVariant ? { size: selectedVariant.size, color: selectedVariant.color } : undefined,
    });
    openCart();
    toast.success(`${product.name} added to cart`);
  };

  const sizes = [...new Set(product.variants.map(v => v.size))];

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        {/* Breadcrumb */}
        <div className="container" style={{ padding: '1.5rem 1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--grey-400)' }}>
            <Link href="/" style={{ transition: 'color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--grey-400)')}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" style={{ transition: 'color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--grey-400)')}>Shop</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--white)' }}>{product.name}</span>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
            {/* At md+ screens: side-by-side */}
            <style>{`@media(min-width:768px){.pdp-grid{grid-template-columns:55% 1fr !important;}}`}</style>
            <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              {/* Gallery */}
              <div>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f4f4f5', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                  {product.images[activeImage] ? (
                    <img src={product.images[activeImage].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={64} color="#9ca3af" />
                    </div>
                  )}
                  {discountPct && (
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#0a0a0a', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      -{discountPct}%
                    </div>
                  )}
                </div>
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    {product.images.map((img, i) => (
                      <button key={img.id} onClick={() => setActiveImage(i)} style={{ flexShrink: 0, width: '80px', height: '100px', border: `2px solid ${activeImage === i ? '#0a0a0a' : '#e5e7eb'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0, transition: 'border-color 0.3s' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <Link href={`/shop?category=${product.category.slug}`} style={{ fontSize: '0.75rem', color: 'var(--grey-400)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    {product.category.name}
                  </Link>
                </div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem', color: '#0a0a0a' }}>
                  {product.name}
                </h1>

                {/* Rating */}
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(avgRating) ? '#C9A96E' : 'none'} color="#C9A96E" />
                    ))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--grey-400)' }}>({product.reviews.length} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: '#0a0a0a' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  {product.comparePrice && (
                    <span style={{ fontSize: '1.25rem', color: 'var(--grey-400)', textDecoration: 'line-through' }}>₹{product.comparePrice.toLocaleString('en-IN')}</span>
                  )}
                  {discountPct && (
                    <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700 }}>Save {discountPct}%</span>
                  )}
                </div>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0a0a0a' }}>
                        Size: {selectedVariant?.size}
                      </span>
                      <button style={{ fontSize: '0.8rem', textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)' }}>Size Guide</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {sizes.map(size => {
                        const variant = product.variants.find(v => v.size === size);
                        const inStock = (variant?.stock || 0) > 0;
                        const selected = selectedVariant?.size === size;
                        return (
                          <button key={size} onClick={() => variant && inStock && setSelectedVariant(variant)} disabled={!inStock} style={{ minWidth: '52px', height: '52px', border: `1.5px solid ${selected ? '#0a0a0a' : '#e5e7eb'}`, borderRadius: 'var(--radius-sm)', background: selected ? '#0a0a0a' : '#ffffff', color: selected ? '#ffffff' : inStock ? '#0a0a0a' : '#9ca3af', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', cursor: inStock ? 'pointer' : 'not-allowed', transition: 'all 0.3s', position: 'relative', opacity: inStock ? 1 : 0.4 }}>
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', color: '#0a0a0a' }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)', width: 'fit-content', background: '#ffffff' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={16} /></button>
                    <span style={{ width: '44px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#0a0a0a' }}>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={16} /></button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add to Cart</button>
                  <button onClick={() => toggle(product.id)} style={{ width: '52px', height: '52px', border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wishlisted ? '#e11d48' : '#0a0a0a', background: '#ffffff', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0 }} title="Add to Wishlist">
                    <Heart size={20} fill={wishlisted ? '#e11d48' : 'none'} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1.25rem', border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                  {[{ icon: <Truck size={16} />, label: `Free shipping above ₹${freeShippingThreshold}` }, { icon: <RotateCcw size={16} />, label: 'Easy 7-day returns' }, { icon: <Shield size={16} />, label: '100% genuine products' }, { icon: <Package size={16} />, label: 'Secure packaging' }].map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#4b5563' }}>
                      {b.icon} {b.label}
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div>
                  <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    {(['details', 'sizing', 'care'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 1.5rem', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'capitalize', color: activeTab === tab ? '#0a0a0a' : 'var(--grey-400)', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#0a0a0a' : 'transparent'}`, marginBottom: '-1px', cursor: 'pointer', transition: 'all 0.3s' }}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  {activeTab === 'details' && <p style={{ color: '#374151', lineHeight: 1.8, fontSize: '0.95rem' }}>{product.description}</p>}
                  {activeTab === 'sizing' && (
                    <div>
                      <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.9rem' }}>We recommend ordering your regular size. For an oversized fit, go one size up.</p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => <th key={h} style={{ padding: '0.6rem', textAlign: 'left', color: '#4b5563', fontWeight: 600 }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {[['S', '36-38', '27', '16'], ['M', '38-40', '28', '17'], ['L', '40-42', '29', '18'], ['XL', '42-44', '30', '19'], ['XXL', '44-46', '31', '20']].map(row => (
                            <tr key={row[0]} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              {row.map((c, i) => <td key={i} style={{ padding: '0.6rem', color: i === 0 ? '#0a0a0a' : '#4b5563' }}>{c}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {activeTab === 'care' && (
                    <ul style={{ color: '#4b5563', lineHeight: 2, fontSize: '0.9rem' }}>
                      {(product.careInstr || 'Machine wash cold with similar colors.\nDo not bleach.\nTumble dry low.\nIron on low heat if needed.\nDo not dry clean.').split('\n').map((c, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• {c}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews.length > 0 && (
            <section style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e5e7eb' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#0a0a0a' }}>
                Customer Reviews ({product.reviews.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {product.reviews.map(review => (
                  <div key={review.id} style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < review.rating ? '#C9A96E' : 'none'} color="#C9A96E" />)}
                    </div>
                    {review.comment && <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>&ldquo;{review.comment}&rdquo;</p>}
                    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: '#0a0a0a' }}>{review.user.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
