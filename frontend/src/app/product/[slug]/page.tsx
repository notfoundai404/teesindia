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
import { Heart, Minus, Plus, ChevronRight, Star, Package, RotateCcw, Truck, Shield, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveCustomizer from '@/components/product/LiveCustomizer';

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
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar /><CartDrawer />
      <main className="pt-[112px] min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl" />
            <div className="space-y-6 pt-8">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <Navbar /><CartDrawer />
        <main className="flex-grow pt-[112px] flex items-center justify-center bg-gray-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md p-10 bg-white rounded-3xl shadow-xl border border-gray-100"
          >
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold font-heading text-gray-900 mb-4 tracking-tight">Not Found</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">This item has been removed, marked as draft, or is currently unavailable.</p>
            <Link href="/shop" className="btn btn-primary w-full py-4 rounded-xl text-sm tracking-widest shadow-lg shadow-gray-200">
              Browse Collections
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPct = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null;
  const wishlisted = isWishlisted(product.id);
  const avgRating = product.reviews.length ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : null;

  const handleAddToCart = () => {
    if (!product || (product as any).isActive === false) return toast.error('This product is no longer available');
    setIsAdding(true);
    addItem({
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      product: { name: product.name, price: product.price, images: product.images, slug: product.slug },
      variant: selectedVariant ? { size: selectedVariant.size, color: selectedVariant.color } : undefined,
    });
    setTimeout(() => {
      setIsAdding(false);
      openCart();
      toast.success(`${product.name} added to cart`);
    }, 400);
  };

  const sizes = [...new Set(product.variants.map(v => v.size))];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#C9A96E] selection:text-black pb-20">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }}>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 md:px-6 py-5 border-b border-gray-100 mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#C9A96E] truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left: Gallery (Sticky) */}
            <div className="lg:col-span-7 lg:sticky lg:top-[120px]">
              <div className="flex flex-col-reverse md:flex-row gap-4">
                {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
                {product.images.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar py-2 md:py-0 w-full md:w-20 lg:w-24 shrink-0">
                    {product.images.map((img, i) => (
                      <button 
                        key={img.id} 
                        onClick={() => setActiveImage(i)}
                        className={`relative aspect-[3/4] w-20 md:w-full rounded-xl overflow-hidden bg-gray-100 transition-all duration-300 border-2 ${activeImage === i ? 'border-black ring-4 ring-gray-100 shadow-md scale-95' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}
                      >
                        <Image src={img.url} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200/60 group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      {product.images[activeImage] ? (
                        <Image src={product.images[activeImage].url} alt={product.name} fill className="object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-[1.5s] ease-out" priority />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={64} className="text-gray-300" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {discountPct && (
                    <div className="absolute top-4 left-4 bg-black text-[#C9A96E] border border-[#C9A96E]/40 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-md" style={{ fontFamily: 'var(--font-heading)' }}>
                      {discountPct}% OFF
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-gray-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-gray-200">
                    240 GSM
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-4">
              
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#a07f45] rounded-full text-[11px] font-bold uppercase tracking-widest">
                    {product.category?.name || 'Exclusive Drop'}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    In Stock
                  </span>
                </div>
                
                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-gray-900 tracking-tight leading-[1.1] mb-4"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {product.name}
                </h1>

                {/* Price & Rating Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-black" style={{ fontFamily: 'var(--font-heading)' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.comparePrice && (
                      <span className="text-lg text-gray-400 line-through font-medium">
                        ₹{product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  
                  {avgRating && (
                    <div className="flex items-center gap-1.5 bg-[#0a0a0a] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                      <Star size={13} className="fill-[#C9A96E] text-[#C9A96E]" />
                      <span>{avgRating.toFixed(1)}</span>
                      <span className="text-gray-400 font-normal">({product.reviews.length})</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Sizes */}
              {sizes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Select Size</h3>
                    <button 
                      onClick={() => setShowSizeModal(true)} 
                      className="text-xs font-semibold text-gray-500 underline underline-offset-4 hover:text-black transition-colors uppercase tracking-wider"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map(size => {
                      const variant = product.variants.find(v => v.size === size);
                      const inStock = (variant?.stock || 0) > 0;
                      const selected = selectedVariant?.size === size;
                      return (
                        <button 
                          key={size} 
                          onClick={() => variant && inStock && setSelectedVariant(variant)} 
                          disabled={!inStock} 
                          className={`
                            relative h-14 min-w-[3.5rem] px-5 rounded-2xl font-heading font-bold text-sm transition-all duration-300
                            ${selected ? 'bg-black text-white shadow-xl shadow-black/20 scale-105 ring-2 ring-black ring-offset-2' : 
                              inStock ? 'bg-white border-2 border-gray-200 text-gray-900 hover:border-black' : 
                              'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'}
                          `}
                        >
                          {size}
                          {!inStock && (
                            <svg className="absolute inset-0 w-full h-full text-gray-300/50" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4 mb-12">
                <div className="flex gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between w-32 h-13 px-2 bg-gray-50 rounded-xl border border-gray-300">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="font-bold text-sm text-gray-900 font-mono">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart} 
                    disabled={isAdding}
                    className={`flex-1 h-13 rounded-xl font-bold text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                      isAdding 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-black text-white hover:bg-[#C9A96E] hover:text-black hover:shadow-lg'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {isAdding ? <><Check size={16} /> Added To Bag</> : 'Add to Cart'}
                  </button>

                  {/* Wishlist Button */}
                  <button 
                    onClick={() => toggle(product.id)} 
                    className={`w-13 h-13 flex items-center justify-center rounded-xl transition-all duration-200 border-2 ${
                      wishlisted 
                        ? 'bg-red-50 text-red-600 border-red-200' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-black hover:text-black'
                    }`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} className={wishlisted ? 'fill-red-600' : ''} />
                  </button>
                </div>

                {/* Free Shipping Alert */}
                <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                  <Truck size={14} className="text-[#C9A96E]" />
                  <span>
                    {product.price * quantity >= freeShippingThreshold ? (
                      <strong className="text-emerald-700">Qualified for FREE Pan-India Shipping!</strong>
                    ) : (
                      <>Add ₹{(freeShippingThreshold - (product.price * quantity)).toLocaleString('en-IN')} more to unlock <strong>FREE Shipping</strong>.</>
                    )}
                  </span>
                </div>
              </motion.div>

              {/* Luxury Guarantee Badges (Monochrome + Champagne Gold) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-3.5 p-5 bg-[#fbfbfb] rounded-2xl border border-gray-200 mb-8">
                {[
                  { icon: <Truck size={18} className="text-[#C9A96E]" />, title: 'Free Pan-India Delivery', desc: `On all orders over ₹${freeShippingThreshold}` }, 
                  { icon: <RotateCcw size={18} className="text-[#C9A96E]" />, title: '7-Day Easy Returns', desc: 'No-questions-asked exchanges' }, 
                  { icon: <Shield size={18} className="text-[#C9A96E]" />, title: '240+ GSM Cotton', desc: 'Heavyweight bio-washed comfort' }, 
                  { icon: <Package size={18} className="text-[#C9A96E]" />, title: '100% Genuine', desc: 'Custom spun and sewn in India' }
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Accordion / Tabs Modernized */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100">
                  {(['details', 'sizing', 'care'] as const).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-50 text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-8 min-h-[200px] text-gray-600 text-sm leading-relaxed">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      {activeTab === 'details' && <p className="whitespace-pre-line">{product.description}</p>}
                      {activeTab === 'sizing' && (
                        <div className="space-y-4">
                          <p className="font-medium text-black">We recommend ordering your regular size. For an oversized fit, go one size up.</p>
                          <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <tr>
                                  {['Size', 'Chest', 'Length', 'Shoulder'].map(h => <th key={h} className="p-4">{h}</th>)}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {[['S', '36-38"', '27"', '16"'], ['M', '38-40"', '28"', '17"'], ['L', '40-42"', '29"', '18"'], ['XL', '42-44"', '30"', '19"'], ['XXL', '44-46"', '31"', '20"']].map(row => (
                                  <tr key={row[0]} className="hover:bg-gray-50 transition-colors">
                                    {row.map((c, i) => <td key={i} className={`p-4 ${i === 0 ? 'font-bold text-black' : ''}`}>{c}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {activeTab === 'care' && (
                        <ul className="space-y-3 font-medium">
                          {(product.careInstr || 'Machine wash cold with similar colors.\nDo not bleach.\nTumble dry low.\nIron on low heat if needed.\nDo not dry clean.').split('\n').map((c, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 bg-black rounded-full" /> {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Store Customizer — WANNA KISS / WANNA DATE / WANNA F*CK / WANNA DANCE */}
        <LiveCustomizer productData={product} />

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <section className="mt-24 pt-20 border-t border-gray-200 bg-[#fbfbfb]">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span className="text-black font-bold text-xl">{avgRating?.toFixed(1)}</span>
                    <div className="flex text-[#C9A96E]">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill={i < Math.round(avgRating!) ? 'currentColor' : 'none'} />)}
                    </div>
                    <span>Based on {product.reviews.length} verified reviews</span>
                  </div>
                </div>
                <button 
                  className="mt-6 md:mt-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider border border-black hover:bg-black hover:text-white transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Write a Review
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.reviews.map(review => (
                  <div key={review.id} className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-[#C9A96E]/50 hover:shadow-md transition-all duration-300">
                    <div className="flex gap-1 mb-4 text-[#C9A96E]">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />)}
                    </div>
                    {review.comment && <p className="text-gray-700 italic leading-relaxed mb-6">&ldquo;{review.comment}&rdquo;</p>}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-black text-[#C9A96E] flex items-center justify-center font-bold text-xs uppercase font-mono">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{review.user.name}</p>
                        <p className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Size Chart Modal */}
        {showSizeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  Heavyweight Tee Size Chart
                </h3>
                <button 
                  onClick={() => setShowSizeModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Measurements are in inches. Designed with an intentional boxy oversized streetwear silhouette.
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 font-bold uppercase text-gray-700" style={{ fontFamily: 'var(--font-heading)' }}>
                    <tr>
                      <th className="p-3">Size</th>
                      <th className="p-3">Chest</th>
                      <th className="p-3">Length</th>
                      <th className="p-3">Shoulder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {[['S', '38"', '27"', '18"'], ['M', '40"', '28"', '19"'], ['L', '42"', '29"', '20"'], ['XL', '44"', '30"', '21"'], ['XXL', '46"', '31"', '22"']].map((r) => (
                      <tr key={r[0]} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-black">{r[0]}</td>
                        <td className="p-3">{r[1]}</td>
                        <td className="p-3">{r[2]}</td>
                        <td className="p-3">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button 
                onClick={() => setShowSizeModal(false)}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C9A96E] hover:text-black transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Close Size Chart
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
