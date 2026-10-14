'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useSettingsStore, getCustomizerPhraseImage } from '@/lib/settingsStore';
import { productApi } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', iconUrl: 'https://cdn.simpleicons.org/instagram/111827', urlPrefix: 'https://instagram.com/', placeholder: 'your_username', hint: 'Instagram username' },
  { id: 'whatsapp', label: 'WhatsApp', iconUrl: 'https://cdn.simpleicons.org/whatsapp/111827', urlPrefix: 'https://wa.me/+91', hint: 'Mobile number (without +91)' },
  { id: 'snapchat', label: 'Snapchat', iconUrl: 'https://cdn.simpleicons.org/snapchat/111827', urlPrefix: 'https://snapchat.com/add/', placeholder: 'your_username', hint: 'Snapchat username' },
  { id: 'custom', label: 'Custom', iconUrl: 'https://cdn.simpleicons.org/linktree/111827', urlPrefix: '', placeholder: 'https://...', hint: 'Any URL — website, playlist, portfolio…' },
];

const ACCENT = '#C9A96E';

function customizerProductSlug(phrase: string): string {
  const phraseSlug = phrase
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `customizer-${phraseSlug || 'design'}`;
}

function buildQRUrl(platformId: string, input: string): string {
  if (!input.trim()) return '';
  const p = PLATFORM_OPTIONS.find(x => x.id === platformId);
  return p?.urlPrefix ? `${p.urlPrefix}${input.trim()}` : input.trim();
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', color: '#111827', fontWeight: 600, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

export function StepModal({ designText, colorLabel, size, onClose, onSubmit }: any) {
  const [step, setStep] = useState(0);
  const [platformId, setPlatformId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [agreed, setAgreed] = useState(false);

  const selPlatform = PLATFORM_OPTIONS.find(p => p.id === platformId);
  const canNext = [platformId !== '', userInput.trim() !== '', agreed];
  const TITLES = ['STEP 01. DESTINATION', 'STEP 02. CUSTOMIZE QR CODE', 'STEP 03. REVIEW'];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 400 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[step]}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[401] w-[95vw] md:w-[92vw] max-w-[460px] bg-white border border-[#e5e7eb] rounded-[20px] p-5 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 50 }}
        >
          <X size={20} />
        </button>

        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.14em', textAlign: 'center', color: '#111827', marginBottom: '1.75rem' }}>{TITLES[step]}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {PLATFORM_OPTIONS.map(p => {
              const active = platformId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatformId(p.id)}
                  aria-pressed={active}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '0.6rem', padding: '1.25rem 0.75rem',
                    borderRadius: 12, border: `2px solid ${active ? ACCENT : '#e5e7eb'}`,
                    background: active ? 'rgba(201,169,110,0.12)' : '#ffffff',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  <img src={active ? p.iconUrl.replace('/111827', '/C9A96E') : p.iconUrl} alt={`${p.label} icon`} width={26} height={26} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: active ? 700 : 600, color: active ? '#a07f45' : '#374151' }}>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && selPlatform && (
          <div>
            <label htmlFor="modal-link-input" style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.04em', fontWeight: 600 }}>{selPlatform.hint}</label>
            <input id="modal-link-input" type={platformId === 'custom' ? 'url' : 'text'} value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={selPlatform.placeholder} autoFocus style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }} />
            {userInput.trim() && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.6rem', fontFamily: 'var(--font-heading)' }}>QR links to: <span style={{ color: '#a07f45', fontWeight: 600 }}>{buildQRUrl(platformId, userInput)}</span></p>}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '1.1rem', border: '1px solid #e5e7eb' }}>
              <Row label="Design" value={designText} />
              <Row label="Garment Color" value={colorLabel} />
              <Row label="Size" value={size} />
              <Row label="Platform" value={selPlatform?.label ?? '—'} />
              <Row label="QR Link" value={buildQRUrl(platformId, userInput) || '—'} />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: '#4b5563', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT }} />
              I confirm my custom details are correct and ready for print.
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.7rem', marginTop: '2rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '0.9rem', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#ffffff', color: '#374151', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button
            onClick={() => { if (step < 2) setStep(s => s + 1); else { onSubmit(platformId, userInput); onClose(); } }}
            disabled={!canNext[step]}
            style={{
              flex: 2, padding: '0.9rem', borderRadius: 10, border: 'none',
              background: canNext[step] ? ACCENT : '#e5e7eb', color: canNext[step] ? '#000000' : '#9ca3af',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem',
              cursor: canNext[step] ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {step < 2 ? <>Continue <ArrowRight size={15} /></> : <><ShoppingBag size={15} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </>
  );
}

function ProductModal({
  selectedDesign,
  onClose,
  onContinue,
  settings,
  productData,
  hideProductLink,
}: {
  selectedDesign: string;
  onClose: () => void;
  onContinue: (colorId: string, size: string) => Promise<boolean>;
  settings: any;
  productData: any;
  hideProductLink?: boolean;
}) {
  const COLORS = settings.customizerGarmentColors || [];
  const SIZES = settings.customizerSizes || [];
  const [colorId, setColorId] = useState(COLORS[0]?.id || 'white');
  const [size, setSize] = useState(SIZES.includes('M') ? 'M' : SIZES[0]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const price = productData ? Number(productData.price) : settings.customizerProductPrice || 7800;
  const productName = productData?.name || settings.customizerProductName || 'Teesindia QR Tshirt';

  // Check if a custom whole image was uploaded for this (design, color)
  const wholeImage = getCustomizerPhraseImage(settings, selectedDesign, colorId);

  const handleAddToCart = async () => {
    setLoadingProduct(true);
    try {
      await onContinue(colorId, size);
    } finally {
      setLoadingProduct(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white z-[1001] w-[95vw] md:w-[90vw] max-w-[900px] flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-10 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 50 }}>
          <X size={24} color="#ccc" />
        </button>

        <div className="bg-[#f5f5f5] rounded-md relative flex items-center justify-center p-4 md:p-8 min-h-[300px]">
          {wholeImage && (
            <img
              src={wholeImage}
              alt={`${selectedDesign} on ${COLORS.find((c: any) => c.id === colorId)?.label || colorId}`}
              style={{ width: '100%', maxWidth: '350px', maxHeight: '350px', objectFit: 'contain' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#000' }}>{productName}</h2>
              <p style={{ fontSize: '1.2rem', color: '#333', margin: 0 }}>₹{price.toLocaleString('en-IN')}</p>
            </div>
            <Heart size={24} color="#000" style={{ cursor: 'pointer', marginTop: '0.5rem' }} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '0 0 1.5rem 0' }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>{settings.customizerColorLabel || 'Select Color:'}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {COLORS.map((c: any) => (
                <button key={c.id} onClick={() => setColorId(c.id)} title={c.label} style={{
                  width: '40px', height: '40px', borderRadius: '4px', background: c.hex,
                  border: colorId === c.id ? '2px solid #000' : '1px solid #ddd',
                  cursor: 'pointer'
                }} />
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '0 0 1.5rem 0' }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>{settings.customizerSizeLabel || 'Select Size:'}</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {SIZES.map((s: string) => (
                <button key={s} onClick={() => setSize(s)} style={{
                  background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer',
                  fontWeight: size === s ? 700 : 400, color: '#000',
                  borderBottom: size === s ? '2px solid #000' : 'none', paddingBottom: '4px'
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAddToCart} style={{
            width: '100%', background: '#b90000', color: '#fff', border: 'none',
            padding: '1.1rem', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 600,
            cursor: loadingProduct ? 'wait' : 'pointer', marginBottom: '1.5rem', transition: 'background 0.2s',
            opacity: loadingProduct ? 0.7 : 1,
          }} disabled={loadingProduct}>
            {loadingProduct ? 'Loading design…' : 'Continue'}
          </button>

          <a href="/size-guide" style={{ color: '#666', textDecoration: 'underline', fontSize: '0.9rem', display: 'block', marginBottom: '1.5rem' }}>Size Guide</a>

          {!hideProductLink && (
            <Link
              href={`/product/${customizerProductSlug(selectedDesign)}?design=${encodeURIComponent(selectedDesign)}&color=${encodeURIComponent(colorId)}&size=${encodeURIComponent(size)}`}
              style={{ color: '#b90000', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Full description &rarr;
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function LiveCustomizer({ productData: propProductData }: { productData?: any } = {}) {
  const { settings } = useSettingsStore();
  const [fetchedProductData, setFetchedProductData] = useState<any>(null);

  // Only fetch internally when no productData is passed in as a prop
  useEffect(() => {
    if (propProductData) return;
    fetch('/api/products/teesindia-qr-tshirt')
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setFetchedProductData(data.product);
        }
      })
      .catch(err => console.warn('Could not fetch QR product', err));
  }, [propProductData]);

  // Use prop data if provided, otherwise fall back to internally fetched data
  const productData = propProductData ?? fetchedProductData;

  const DESIGNS = settings.customizerPhrases || ['WANNA KISS'];
  const COLORS = settings.customizerGarmentColors || [];

  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[0] || 'WANNA KISS');
  const [heroColorId, setHeroColorId] = useState(COLORS[0]?.id || 'white');
  const [modalOpen, setModalOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);

  // Data saved from ProductModal to pass to StepModal
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<any>(null);
  const [selectedCatalogVariant, setSelectedCatalogVariant] = useState<any>(null);

  const { addItem, openCart } = useCartStore();

  // Keep heroColorId valid
  useEffect(() => {
    if (COLORS.length > 0 && !COLORS.some((c: any) => c.id === heroColorId)) {
      setHeroColorId(COLORS[0]?.id || 'white');
    }
  }, [COLORS, heroColorId]);

  const heroWholeImage = getCustomizerPhraseImage(settings, selectedDesign, heroColorId);

  const handlePrevDesign = () => {
    const idx = DESIGNS.indexOf(selectedDesign);
    const nextIdx = (idx - 1 + DESIGNS.length) % DESIGNS.length;
    setSelectedDesign(DESIGNS[nextIdx]);
  };
  const handleNextDesign = () => {
    const idx = DESIGNS.indexOf(selectedDesign);
    const nextIdx = (idx + 1) % DESIGNS.length;
    setSelectedDesign(DESIGNS[nextIdx]);
  };

  const handleProductContinue = async (colorId: string, size: string) => {
    try {
      const response = await productApi.get(customizerProductSlug(selectedDesign));
      const product = response.data?.product;
      if (!product?.id) throw new Error('The selected design is unavailable.');
      const variant = product.variants?.find(
        (item: any) => item.size === size && item.color === colorId && item.stock > 0
      );
      if (!variant) throw new Error('The selected size and color are unavailable for this design.');

      setSelectedCatalogProduct(product);
      setSelectedCatalogVariant(variant);
      setSelectedColorId(colorId);
      setSelectedSize(size);
      setModalOpen(false);
      setStepModalOpen(true);
      return true;
    } catch (error) {
      console.error('Could not load the selected customizer product.', error);
      toast.error(error instanceof Error ? error.message : 'Could not load this design. Please try again.');
      return false;
    }
  };

  const handleStepModalSubmit = (platformId: string, userInput: string) => {
    if (!selectedCatalogProduct || !selectedCatalogVariant) {
      toast.error('Could not load this design. Please select it again.');
      return;
    }

    const currentColor = COLORS.find((c: any) => c.id === selectedColorId) || COLORS[0] || { hex: '#ffffff' };
    const price = Number(selectedCatalogProduct.price);
    const chosenWholeImage = getCustomizerPhraseImage(settings, selectedDesign, selectedColorId);
    const itemImage = chosenWholeImage || '';

    addItem({
      id: `${selectedCatalogProduct.id}-${selectedCatalogVariant.id}-${Date.now()}`,
      productId: selectedCatalogProduct.id,
      variantId: selectedCatalogVariant.id,
      quantity: 1,
      product: {
        name: `${selectedCatalogProduct.name} - ${selectedDesign}`,
        price: price,
        images: [{ url: itemImage ?? '' }],
        slug: selectedCatalogProduct.slug,
      },
      variant: { size: selectedSize, color: selectedColorId },
      customization: {
        printText: selectedDesign,
        colorHex: currentColor.hex,
        textColor: '#000',
        socialLink: { type: platformId, value: userInput },
      },
    });
    setStepModalOpen(false);
    openCart();
    toast.success(`${selectedDesign} added to cart!`);
  };

  // Keep selectedDesign in sync if settings load later
  useEffect(() => {
    if (DESIGNS.length > 0 && !DESIGNS.includes(selectedDesign)) {
      setSelectedDesign(DESIGNS[0]);
    }
  }, [DESIGNS, selectedDesign]);

  return (
    <>
      <section className="bg-white py-10 md:py-20 font-sans">
        <div className="container flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-20 items-center">

          <div className="bg-[#f5f5f5] p-6 md:p-12 relative flex justify-center items-center min-h-[350px] md:min-h-[500px] rounded-lg">
            {heroWholeImage && (
              <img
                src={heroWholeImage}
                alt={`${selectedDesign} preview`}
                style={{ width: '100%', maxWidth: '400px', maxHeight: '420px', objectFit: 'contain' }}
              />
            )}
            <button
              onClick={handlePrevDesign}
              aria-label="Previous Design"
              style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', background: '#b90000', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}
            >
              &larr;
            </button>
            <button
              onClick={handleNextDesign}
              aria-label="Next Design"
              style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: '#b90000', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '4px 0 0 4px' }}
            >
              &rarr;
            </button>
          </div>

          <div className="text-center px-2 md:px-8">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 400, margin: '0 0 0.2rem 0', color: '#000', textTransform: 'uppercase' }}>CUSTOMIZE YOUR OWN</h2>
            <p style={{ fontSize: '0.8rem', color: '#333', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>SWIPE TO CHOOSE</p>

            {/* Garment Color Swatches on Hero removed as per user request */}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {DESIGNS.map((d: string) => (
                <button
                  key={d}
                  onClick={() => setSelectedDesign(d)}
                  style={{
                    background: selectedDesign === d ? '#b90000' : '#111',
                    color: '#fff',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: selectedDesign === d ? '0 0 20px rgba(185,0,0,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              style={{
                width: '100%',
                background: '#b90000',
                color: '#fff',
                border: 'none',
                padding: '1rem',
                borderRadius: '30px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s'
              }}
            >
              🚀 GENERATE MY VIRAL SHIRT
            </button>
          </div>
        </div>
      </section>

      {settings.showHowItWorks && settings.howItWorksSteps && settings.howItWorksSteps.length > 0 && (
        <section className="bg-white py-12 md:py-20 border-t border-gray-100 font-sans">
          <div className="container max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-[#6b7280] text-[1.1rem] md:text-[1.3rem] mb-2">{settings.howItWorksSubtitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {settings.howItWorksSteps.map((step: any, idx: number) => (
                <div key={idx} className="bg-white rounded-[1.5rem] p-4 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col relative">
                  <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/5] bg-gray-100 flex items-center justify-center">
                    {step.imageUrl ? (
                      <img src={step.imageUrl} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="text-gray-400 text-sm">No image</span>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-sm">
                      0{idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col relative pb-6">
                    <h3 className="text-xl font-bold text-black mb-2 tracking-wide uppercase">{step.title}</h3>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed pr-10">{step.description}</p>
                    <div className="absolute bottom-0 right-0 text-[#c00000]">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {modalOpen && (
        <ProductModal
          selectedDesign={selectedDesign}
          onClose={() => setModalOpen(false)}
          onContinue={handleProductContinue}
          settings={settings}
          productData={productData}
          hideProductLink={!!propProductData}
        />
      )}

      {stepModalOpen && (
        <StepModal
          designText={selectedDesign}
          colorLabel={COLORS.find((c: any) => c.id === selectedColorId)?.label || 'Unknown'}
          size={selectedSize}
          onClose={() => setStepModalOpen(false)}
          onSubmit={handleStepModalSubmit}
        />
      )}
    </>
  );
}
