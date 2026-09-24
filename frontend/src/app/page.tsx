'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import LiveCustomizer from '@/components/product/LiveCustomizer';
import Testimonials from '@/components/product/Testimonials';
import CommunitySection from '@/components/product/CommunitySection';
import HowItWorks from '@/components/product/HowItWorks';
import { useCartStore } from '@/lib/store';
import { productApi } from '@/lib/api';
import { useSettingsStore } from '@/lib/settingsStore';
import { ArrowRight, ChevronRight, ShoppingBag, Heart, MessageCircle } from 'lucide-react';

// ─── Dynamic Storefront ───────────────────────────────────────


// ─── Product Card ─────────────────────────────────────────
function ProductCard({ product, showBadge = true, showWishlist = true, showQuickAdd = true }: {
  product: any;
  showBadge?: boolean;
  showWishlist?: boolean;
  showQuickAdd?: boolean;
}) {
  const { addItem, openCart } = useCartStore();
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const imageUrl = product.image || product.images?.[0]?.url || '/placeholder-product.jpg';
  const sizes: string[] = product.sizes || (product.variants?.length ? product.variants.map((v: any) => v.size) : ['S', 'M', 'L', 'XL']);
  const color = product.color || (product.variants?.[0]?.color ? product.variants[0].color : product.category?.name || 'Exclusive');
  const prodId = product.id || product._id;
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: `${prodId}-${sizes[0] || 'M'}`,
      productId: prodId,
      quantity: 1,
      product: { name: product.name, price, images: [{ url: imageUrl }], slug: product.slug },
      variant: { size: sizes[0] || 'M' },
    });
    openCart();
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-card__image-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
        <Link href={`/product/${product.slug}`}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          />
        </Link>

        {/* Badge */}
        {showBadge && product.badge && (
          <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.2rem 0.6rem', background: product.isSale ? '#dc2626' : '#111827', color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', borderRadius: '2px', zIndex: 2 }}>
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        {showWishlist && (
          <button
            onClick={() => setWishlisted(!wishlisted)}
            style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 32, height: 32, borderRadius: '50%', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={wishlisted ? '#e11d48' : 'none'} color={wishlisted ? '#e11d48' : '#374151'} />
          </button>
        )}

        {/* Quick add */}
        {showQuickAdd && (
          <button
            onClick={handleAddToCart}
            className="product-card__quick-add"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
        )}
      </div>

      <div className="product-card__info">
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
          <p className="product-card__name">{product.name}</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--grey-500)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>{color}</p>
        </Link>
        <p>
          <span className="product-card__price">₹{price.toLocaleString('en-IN')}</span>
          {comparePrice && comparePrice > price && (
            <span className="product-card__compare-price">₹{comparePrice.toLocaleString('en-IN')}</span>
          )}
        </p>
        {/* Size pills */}
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {sizes.slice(0, 5).map(s => (
            <span key={s} style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', padding: '0.15rem 0.4rem', border: '1px solid #e5e7eb', borderRadius: '2px', color: 'var(--grey-400)' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────
export default function HomePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { settings } = useSettingsStore();

  useEffect(() => {
    setProductsLoading(true);
    productApi.list({ sort: settings.productSort || 'newest', limit: settings.productsCount || 8 })
      .then(res => {
        const prods = res.data.products || res.data || [];
        setLiveProducts(prods);
      })
      .catch(() => { setLiveProducts([]); })
      .finally(() => { setProductsLoading(false); });
  }, [settings.productsCount, settings.productSort]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setSubscribed(true);
    setEmail('');
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes heroOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.97)} }
        @keyframes heroOrb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-35px,30px) scale(1.08)} 70%{transform:translate(25px,-15px) scale(0.95)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes whatsapp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)} 50%{box-shadow:0 0 0 8px rgba(37,211,102,0)} }
        .h-eyebrow  { animation: fadeInUp 0.7s ease 0.2s both }
        .h-title    { animation: fadeInUp 0.7s ease 0.4s both }
        .h-subtitle { animation: fadeInUp 0.7s ease 0.6s both }
        .h-cta      { animation: fadeInUp 0.7s ease 0.8s both }
        .h-trust    { animation: fadeIn   1s   ease 1.1s both }
        .col-card:hover .col-inner { transform: scale(1.05) }
        .col-inner { position:absolute;inset:0;transition:transform 0.7s ease }
        @media(min-width:768px){ .story-grid{ grid-template-columns:1fr 1fr !important } }
      `}</style>

      <Navbar />
      <CartDrawer />

      <main>
        {/* ══════════════════ HERO ══════════════════ */}
        <section className="hero" aria-label="Hero" style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: settings.heroImageUrl
            ? `url(${settings.heroImageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #ffffff 0%, #f7f7f9 50%, #f0f0f3 100%)',
        }}>
          {/* Orbs — only shown when no hero image */}
          {!settings.heroImageUrl && (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 800, maxHeight: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)', top: '-20%', right: '-15%', animation: 'heroOrb1 12s ease-in-out infinite' }} />
              <div aria-hidden="true" style={{ position: 'absolute', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', bottom: '10%', left: '-10%', animation: 'heroOrb2 15s ease-in-out infinite' }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.012) 2px, rgba(0,0,0,0.012) 4px)' }} />
            </>
          )}

          {/* Hero image overlay — darkens the bg image for readability */}
          {settings.heroImageUrl && (
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${settings.heroOverlayOpacity ?? 0.4})`, zIndex: 1 }} />
          )}

          {/* Large background text — only shown when no hero image */}
          {!settings.heroImageUrl && (
            <div aria-hidden="true" style={{ position: 'absolute', right: '-0.05em', bottom: '-0.1em', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(8rem, 22vw, 22rem)', lineHeight: 1, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: '1px rgba(0,0,0,0.06)', userSelect: 'none', zIndex: 1, whiteSpace: 'nowrap' }}>TEES</div>
          )}

          <div className="hero__overlay" />

          {/* Content */}
          <div className="hero__content" style={{ paddingBottom: '4rem', zIndex: 2, position: 'relative' }}>
            <p className="hero__eyebrow h-eyebrow">{settings.heroEyebrow || 'NEW COLLECTION — 2026'}</p>
            <h1 className="hero__title h-title">
              {settings.heroHeadline
                ? settings.heroHeadline.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))
                : <><span>WEAR YOUR</span><br /><em>STORY</em></>}
            </h1>
            <p className="hero__subtitle h-subtitle">
              {settings.heroSubheadline || 'Premium streetwear crafted for those who dare to stand out. Every stitch, intentional.'}
            </p>
            <div className="hero__cta h-cta">
              <Link href={settings.heroCtaLink || '#customizer'} className="btn btn-accent btn-lg">
                {settings.heroCtaText || 'Customize Now'}
              </Link>
              <Link href="/shop" className="btn btn-outline btn-lg">Browse Collection</Link>
            </div>

            {/* Trust badges — from settings */}
            <div className="h-trust" style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {(settings.trustBadges?.length ? settings.trustBadges : [
                { label: '10K+', sub: 'Happy Customers' },
                { label: '100%', sub: 'Premium Cotton' },
                { label: '2–5',  sub: 'Day Delivery' },
              ]).map(({ label, sub }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#000000', lineHeight: 1.1 }}>{label}</p>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>


        </section>

        {/* ══════════════════ MARQUEE ══════════════════ */}
        {settings.marqueeItems?.length > 0 && (
          <div
            className="marquee-band"
            aria-label="Site features"
            style={{ background: settings.marqueeBg, color: settings.marqueeTextColor }}
          >
            <div style={{ display: 'flex', animation: `marquee ${settings.marqueeSpeed || 30}s linear infinite`, width: 'max-content' }}>
              {[...settings.marqueeItems, ...settings.marqueeItems].map((text, i) => (
                <span key={i} className="marquee-band__item" style={{ color: settings.marqueeTextColor }}>
                  {text}
                  <span className="marquee-band__sep" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true"><polygon points="4,0.5 5,2.5 7.5,3 5.5,5 6,7.5 4,6.3 2,7.5 2.5,5 0.5,3 3,2.5" /></svg>
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════ LIVE CUSTOMIZER ══════════════════ */}
        <LiveCustomizer />

        {/* ══════════════════ COLLECTIONS ══════════════════ */}
        {settings.collections?.length > 0 && (
          <section className="section" aria-labelledby="collections-heading">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title" id="collections-heading">SHOP BY COLLECTION</h2>
                <Link href="/collections" className="section-link">
                  View All <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </Link>
              </div>

              <div className="collections-grid">
                {settings.collections.map((col: any) => (
                  <Link key={col.label} href={col.href} className="collection-card col-card" aria-label={`Shop ${col.label}`} style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="col-inner" style={{ background: col.imageUrl ? `url(${col.imageUrl}) center/cover` : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                      {/* Pattern */}
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 12px)' }} />
                      {/* Letter */}
                      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(5rem, 14vw, 11rem)', color: 'transparent', WebkitTextStroke: '1px rgba(0,0,0,0.08)', lineHeight: 1, letterSpacing: '-0.05em', userSelect: 'none' }}>{(col.label || 'C')[0]}</div>
                    </div>

                    <div className="collection-card__overlay" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 60%, transparent 100%)' }} />
                    <div className="collection-card__content">
                      <p className="collection-card__label" style={{ color: '#111827' }}>{col.label}</p>
                      <p className="collection-card__count" style={{ color: '#4b5563' }}>{col.tagline}</p>
                    </div>
                    <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 36, height: 36, borderRadius: '50%', border: '1px solid #d1d5db', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <ArrowRight size={14} color="#111827" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════ NEW ARRIVALS ══════════════════ */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="arrivals-heading">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title" id="arrivals-heading">{settings.productsTitle || 'NEW ARRIVALS'}</h2>
              <Link href="/shop?sort=newest" className="section-link">
                View All <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </div>
            {settings.productsSubtitle && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginTop: '-0.75rem', marginBottom: '2rem' }}>{settings.productsSubtitle}</p>
            )}

            {productsLoading ? (
              <div className="product-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '3/4', background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: '1rem' }}>
                      <div style={{ height: '1rem', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.5rem' }} />
                      <div style={{ height: '0.8rem', background: '#f3f4f6', borderRadius: '4px', width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : liveProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '1rem' }}>No products found in this drop.</p>
                <Link href="/shop" className="btn btn-primary btn-sm">Explore Shop</Link>
              </div>
            ) : (
              <div className="product-grid">
                {liveProducts.slice(0, settings.productsCount || 8).map(product => (
                  <ProductCard
                    key={product.id || product._id || product.slug}
                    product={product}
                    showBadge={settings.productCardShowBadge !== false}
                    showWishlist={settings.productCardShowWishlist !== false}
                    showQuickAdd={settings.productCardShowQuickAdd !== false}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        {settings.showTestimonials !== false && <Testimonials />}

        {/* ══════════════════ HOW IT WORKS ══════════════════ */}
        {settings.showHowItWorks !== false && <HowItWorks />}

        {/* ══════════════════ OUR COMMUNITY ══════════════════ */}
        <CommunitySection />

        {/* ══════════════════ BRAND STORY ══════════════════ */}
        <section className="section" style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
          <div className="container">
            <div className="story-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
              {/* Left */}
              <div>
                <span aria-label={`Since ${settings.brandYear || '2026'}`} style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(5rem, 15vw, 13rem)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.06em', color: 'transparent', WebkitTextStroke: '1.5px rgba(0,0,0,0.12)', display: 'block', userSelect: 'none' }}>SINCE</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(5rem, 15vw, 13rem)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.06em', color: '#000000', display: 'block', userSelect: 'none' }}>{settings.brandYear || '2026'}</span>
              </div>

              {/* Right */}
              <div id="story-heading">
                <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-dark)', marginBottom: '1.25rem' }}>Our Story</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#000000', marginBottom: '1.5rem' }}>
                  {(settings.brandStoryHeading || 'Born in India,\nbuilt for the streets.').split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </h2>
                <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.8, maxWidth: 520, marginBottom: '2rem' }}>
                  {settings.brandStoryBody || `${settings.storeName || 'Teesindia'} started with a simple idea: premium quality clothing that doesn't compromise on style or ethics. Every thread is chosen with intention, every fit designed to last beyond trends. Crafted in India, worn everywhere.`}
                </p>
                <Link href={settings.brandStoryCtaLink || '/about'} className="btn btn-outline">
                  {settings.brandStoryCtaText || 'Our Story'} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ NEWSLETTER / WHATSAPP ══════════════════ */}
        <section style={{ background: '#ffffff', padding: '5rem 0' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Join the Family</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 700, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem', textTransform: 'uppercase' }}>
              {settings.welcomePopupDiscount || '10% OFF YOUR FIRST ORDER'}
            </h2>
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {settings.newsletterDescription || 'Get exclusive early access to drops, sales, and style updates.'}
            </p>

            {subscribed ? (
              <div style={{ padding: '1rem 2rem', background: '#000', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em', display: 'inline-block', borderRadius: '4px' }}>
                You&apos;re in — check your inbox
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto', border: '1.5px solid #000' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ flex: 1, padding: '0.9rem 1rem', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '0.9rem', background: 'transparent', color: '#000' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="newsletter-cta-btn"
                  style={{ padding: '0.9rem 1.5rem', background: '#000', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.75rem' }}>No spam, ever. Unsubscribe anytime.</p>

            {/* WhatsApp CTA */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Prefer to order via WhatsApp? We&apos;re here.
              </p>
              <a
                href={`https://wa.me/${(settings.supportPhone || '+91 98765 43210').replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I want to customize a tee')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem 1.75rem',
                  background: '#25D366',
                  color: '#fff',
                  borderRadius: '40px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  animation: 'whatsapp-pulse 2.5s ease-in-out infinite',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1da854'; (e.currentTarget as HTMLAnchorElement).style.animation = 'none'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#25D366'; (e.currentTarget as HTMLAnchorElement).style.animation = 'whatsapp-pulse 2.5s ease-in-out infinite'; }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
