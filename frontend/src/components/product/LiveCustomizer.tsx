'use client';

/**
 * LiveCustomizer — Storefront Customer Experience
 * Shows the curated designs, typography, and blank garment colors configured in Admin.
 * Customers simply choose a design, garment color, and size, with real-time SVG recoloring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { getStudioFontConfig } from '@/lib/studioFonts';
import QRCode from 'qrcode';

/* ═══════════════════════════════════════════════
   DEFAULTS
   ═══════════════════════════════════════════════ */


const DEFAULT_GARMENT_COLORS = [
  { id: 'black',    label: 'Black',    hex: '#0d0d0d', textColor: '#ffffff' },
  { id: 'white',    label: 'White',    hex: '#f7f6f2', textColor: '#111111' },
  { id: 'cream',    label: 'Cream',    hex: '#e8d9c0', textColor: '#2a1f0e' },
  { id: 'slate',    label: 'Slate',    hex: '#4a5568', textColor: '#ffffff' },
  { id: 'navy',     label: 'Navy',     hex: '#1e3a5f', textColor: '#ffffff' },
  { id: 'burgundy', label: 'Burgundy', hex: '#6b1c2c', textColor: '#ffffff' },
  { id: 'forest',   label: 'Forest',   hex: '#1e4d2b', textColor: '#ffffff' },
  { id: 'sand',     label: 'Sand',     hex: '#c9a96e', textColor: '#1a1a1a' },
];

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', iconUrl: 'https://cdn.simpleicons.org/instagram/111827', urlPrefix: 'https://instagram.com/', placeholder: 'your_username', hint: 'Instagram username' },
  { id: 'whatsapp',  label: 'WhatsApp',  iconUrl: 'https://cdn.simpleicons.org/whatsapp/111827',  urlPrefix: 'https://wa.me/91',         placeholder: '9876543210',    hint: 'Mobile number (without +91)' },
  { id: 'snapchat',  label: 'Snapchat',  iconUrl: 'https://cdn.simpleicons.org/snapchat/111827',  urlPrefix: 'https://snapchat.com/add/', placeholder: 'your_username', hint: 'Snapchat username' },
  { id: 'custom',    label: 'Custom',    iconUrl: 'https://cdn.simpleicons.org/linktree/111827',   urlPrefix: '',                          placeholder: 'https://...',  hint: 'Any URL — website, playlist, portfolio…' },
];

const DUMMY_QR_PATH  = '/mockups/qr-dummy.png';
const QR_DEBOUNCE_MS = 320;
const ACCENT         = '#C9A96E';
const ACCENT_GLOW    = 'rgba(201,169,110,0.25)';

/* ═══════════════════════════════════
   HELPERS
   ═══════════════════════════════════ */

function buildQRUrl(platformId: string, input: string): string {
  if (!input.trim()) return '';
  const p = PLATFORM_OPTIONS.find(x => x.id === platformId);
  return p?.urlPrefix ? `${p.urlPrefix}${input.trim()}` : input.trim();
}

function hexToNorm(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function buildColorMatrix(hex: string): string {
  const { r, g, b } = hexToNorm(hex);
  const rr = (1 - r).toFixed(4); const rc = r.toFixed(4);
  const gr = (1 - g).toFixed(4); const gc = g.toFixed(4);
  const br = (1 - b).toFixed(4); const bc = b.toFixed(4);
  return [
    `${rr} 0 0 0 ${rc}`,
    `${gr} 0 0 0 ${gc}`,
    `${br} 0 0 0 ${bc}`,
    `0 0 0 1 0`,
  ].join(' ');
}

function wrapText(text: string, maxChars = 14): string[] {
  if (!text.trim()) return [];
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return [trimmed];
  const words = trimmed.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length <= maxChars) { cur = cand; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/**
 * Capture an exact PNG snapshot of the customized shirt using Canvas.
 */
async function captureSnapshot(
  colorHex: string,
  effectiveTextColor: string,
  designText: string,
  fontFamily: string,
  imageUrl?: string
): Promise<string> {
  const SIZE = 420;
  const canvas = document.createElement('canvas');
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  // 1. Background
  ctx.fillStyle = '#f0ede8';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 2. Load & pixel-map the shirt PNG
  const loadImg = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });

  const shirtImg = await loadImg('/mockups/tshirt-base.png');
  ctx.drawImage(shirtImg, 0, 0, SIZE, SIZE);

  // Recolor: black pixels → targetColor, white pixels stay white
  const norm = hexToNorm(colorHex);
  const tr = Math.round(norm.r * 255);
  const tg = Math.round(norm.g * 255);
  const tb = Math.round(norm.b * 255);

  const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const darkness = 1 - d[i] / 255;
    d[i]   = Math.round(255 * (1 - darkness) + tr * darkness);
    d[i+1] = Math.round(255 * (1 - darkness) + tg * darkness);
    d[i+2] = Math.round(255 * (1 - darkness) + tb * darkness);
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Draw content: Uploaded Graphic OR Text in font
  if (imageUrl) {
    try {
      const artImg = await loadImg(imageUrl);
      const maxWidth = SIZE * 0.42;
      const maxHeight = SIZE * 0.28;
      const aspect = artImg.width / artImg.height;
      let drawW = maxWidth;
      let drawH = maxWidth / aspect;
      if (drawH > maxHeight) {
        drawH = maxHeight;
        drawW = maxHeight * aspect;
      }
      const drawX = (SIZE - drawW) / 2;
      const drawY = SIZE * 0.33 + (maxHeight - drawH) / 2;
      ctx.drawImage(artImg, drawX, drawY, drawW, drawH);
    } catch (e) {
      console.warn('Canvas image error:', e);
    }
  } else if (designText.trim()) {
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        await document.fonts.load(`800 24px "${fontFamily}"`);
        await document.fonts.ready;
      } catch {}
    }

    const fontConfig = getStudioFontConfig(fontFamily);
    const lines = wrapText(designText, 14);
    if (lines.length > 0) {
      const baseFontSize = designText.length > 18 ? 16 : designText.length > 11 ? 20 : 25;
      const fontSize = Math.round(baseFontSize * (fontConfig.sizeMultiplier || 1.0));
      ctx.font = `${fontConfig.weight || 800} ${fontSize}px "${fontFamily}", sans-serif`;
      ctx.fillStyle = effectiveTextColor;
      ctx.textAlign = 'center';
      ctx.shadowColor = effectiveTextColor === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)';
      ctx.shadowBlur = 4;
      const startY = SIZE * 0.35;
      lines.forEach((line, i) => {
        const textToDraw = fontConfig.textTransform === 'none' ? line : line.toUpperCase();
        ctx.fillText(textToDraw, SIZE / 2, startY + i * (fontSize * 1.35));
      });
      ctx.shadowBlur = 0;
    }
  }

  // 4. Draw QR dummy overlay
  try {
    const qrImg = await loadImg('/mockups/qr-dummy.png');
    const QR_SIZE = SIZE * 0.20;
    const qrX = (SIZE - QR_SIZE) / 2;
    const qrY = (imageUrl || designText.trim()) ? SIZE * 0.58 : SIZE * 0.42;

    const qc = document.createElement('canvas');
    qc.width = qrImg.width;
    qc.height = qrImg.height;
    const qCtx = qc.getContext('2d')!;
    qCtx.drawImage(qrImg, 0, 0);

    const qNorm = hexToNorm(effectiveTextColor);
    const qtr = Math.round(qNorm.r * 255);
    const qtg = Math.round(qNorm.g * 255);
    const qtb = Math.round(qNorm.b * 255);

    const qData = qCtx.getImageData(0, 0, qrImg.width, qrImg.height);
    const qd = qData.data;
    for (let i = 0; i < qd.length; i += 4) {
      const dark = 1 - qd[i] / 255;
      qd[i]   = Math.round(255 * (1 - dark) + qtr * dark);
      qd[i+1] = Math.round(255 * (1 - dark) + qtg * dark);
      qd[i+2] = Math.round(255 * (1 - dark) + qtb * dark);
    }
    qCtx.putImageData(qData, 0, 0);

    ctx.globalAlpha = 0.88;
    ctx.drawImage(qc, qrX, qrY, QR_SIZE, QR_SIZE);
    ctx.globalAlpha = 1;
  } catch (e) {
    console.warn('Canvas QR render error:', e);
  }

  return canvas.toDataURL('image/png');
}

/* ═══════════════════════════════════
   T-SHIRT MOCKUP COMPONENT
   ═══════════════════════════════════ */

interface MockupProps {
  color: { id: string; label: string; hex: string; textColor: string };
  design: { text: string; font?: string; printColor?: string; imageUrl?: string };
  fading: boolean;
}

function TShirtMockup({ color, design, fading }: MockupProps) {
  const filterId = `recolor-${color.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const qrFilter = `qr-recolor-${color.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const effectiveTextColor = (design.printColor && design.printColor !== 'auto')
    ? design.printColor
    : color.textColor;

  const font = design.font || 'Space Grotesk';
  const fontConfig = getStudioFontConfig(font);
  const matrix = buildColorMatrix(color.hex);
  const qrMatrix = buildColorMatrix(effectiveTextColor);

  const lines = wrapText(design.text, 14);
  const hasText = !design.imageUrl && lines.length > 0;
  const isDark = effectiveTextColor === '#ffffff';

  const PRINT_TOP   = 32;
  const PRINT_LEFT  = 25;
  const PRINT_WIDTH = 50;
  const QR_SIZE     = 21;
  const QR_LEFT     = 39.5;

  const baseFontSize = design.text.length > 16 ? 1.7 : design.text.length > 10 ? 2.1 : 2.6;
  const fontSize = baseFontSize * (fontConfig.sizeMultiplier || 1.0);
  const lineHeightPct = 4.8;
  const textBlockPct  = lines.length * lineHeightPct;
  const QR_TOP = (hasText || design.imageUrl)
    ? PRINT_TOP + (design.imageUrl ? 24 : textBlockPct) + 3
    : PRINT_TOP + 4;


  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.2s ease',
        userSelect: 'none',
      }}
      aria-label={`${color.label} t-shirt preview`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix type="matrix" values={matrix} />
          </filter>
          <filter id={qrFilter} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix type="matrix" values={qrMatrix} />
          </filter>
        </defs>
      </svg>

      {/* Recolor base PNG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mockups/tshirt-base.png"
        alt={`${color.label} t-shirt`}
        draggable={false}
        style={{
          width: '100%',
          display: 'block',
          filter: `url(#${filterId})`,
        }}
      />

      {/* If design has an artwork image */}
      {design.imageUrl && (
        <div
          style={{
            position: 'absolute',
            top: `${PRINT_TOP}%`,
            left: `${PRINT_LEFT}%`,
            width: `${PRINT_WIDTH}%`,
            height: '26%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.imageUrl}
            alt="Design graphic"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            }}
          />
        </div>
      )}

      {/* Design Text in Admin-configured Font */}
      {hasText && (
        <div
          aria-label={`Print text: ${design.text}`}
          style={{
            position: 'absolute',
            top: `${PRINT_TOP}%`,
            left: `${PRINT_LEFT}%`,
            width: `${PRINT_WIDTH}%`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.12em',
            pointerEvents: 'none',
          }}
        >
          {lines.map((line, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                fontFamily: `'${font}', sans-serif`,
                fontWeight: fontConfig.weight || 800,
                fontSize: `${fontSize}cqw`,
                lineHeight: 1.15,
                letterSpacing: fontConfig.letterSpacing || '0.1em',
                textTransform: fontConfig.textTransform || 'uppercase',
                color: effectiveTextColor,
                textShadow: isDark
                  ? '0 1px 6px rgba(0,0,0,0.65)'
                  : '0 1px 4px rgba(255,255,255,0.45)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </span>
          ))}
        </div>
      )}

      {/* QR Code overlay */}
      <img
        src={DUMMY_QR_PATH}
        alt="QR code on shirt"
        draggable={false}
        style={{
          position: 'absolute',
          top: `${QR_TOP}%`,
          left: `${QR_LEFT}%`,
          width: `${QR_SIZE}%`,
          height: `${QR_SIZE}%`,
          objectFit: 'contain',
          opacity: 0.86,
          pointerEvents: 'none',
          filter: `url(#${qrFilter})`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════
   STEP MODAL
   ═══════════════════════════════════ */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', color: '#111827', fontWeight: 600, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

interface ModalProps {
  designText: string;
  colorLabel: string;
  size: string;
  onClose: () => void;
  onSubmit: (platformId: string, userInput: string) => void;
}

function StepModal({ designText, colorLabel, size, onClose, onSubmit }: ModalProps) {
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
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 401, width: '92vw', maxWidth: 460, background: '#ffffff',
          border: '1px solid #e5e7eb', borderRadius: 20, padding: '2rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
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
            <input id="modal-link-input" type={platformId === 'custom' ? 'url' : 'text'} value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={selPlatform.placeholder} autoFocus className="customizer-input" />
            {userInput.trim() && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.6rem', fontFamily: 'var(--font-heading)' }}>QR links to: <span style={{ color: '#a07f45', fontWeight: 600 }}>{buildQRUrl(platformId, userInput)}</span></p>}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '1.1rem', border: '1px solid #e5e7eb' }}>
              <Row label="Design"   value={designText} />
              <Row label="Garment Color" value={colorLabel} />
              <Row label="Size"     value={size} />
              <Row label="Platform" value={selPlatform?.label ?? '—'} />
              <Row label="QR Link"  value={buildQRUrl(platformId, userInput) || '—'} />
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

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */

export default function LiveCustomizer() {
  const { settings } = useSettingsStore();

  // If section disabled in Admin Settings, return null
  if (settings.customizerEnabled === false) {
    return null;
  }

  // Active settings with fallbacks
  const heading = settings.customizerHeading || 'CUSTOMIZE YOUR OWN';
  const subheading = settings.customizerSubheading || 'Select · Personalise · Order';
  const price = settings.customizerPrice || 1299;
  const origPrice = settings.customizerOrigPrice || 1799;
  const sizes = settings.customizerSizes?.length ? settings.customizerSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Normalize designs from admin: dynamically render from backend without hardcoding
  const designs = (settings.customizerDesigns && settings.customizerDesigns.length > 0)
    ? settings.customizerDesigns
    : (settings.customizerPhrases && settings.customizerPhrases.length > 0)
    ? settings.customizerPhrases.map((phrase, i) => ({
        id: `p-${i}`,
        text: phrase,
        font: 'Space Grotesk',
        printColor: 'auto',
        imageUrl: '',
      }))
    : [];

  const garmentColors = settings.customizerGarmentColors?.length ? settings.customizerGarmentColors : DEFAULT_GARMENT_COLORS;

  const [fading, setFading] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(designs[0]?.id || '');
  const [colorId, setColorId] = useState(garmentColors[0]?.id || 'black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [modalOpen, setModalOpen] = useState(false);

  // Sync selectedDesignId when backend designs load or change
  useEffect(() => {
    if (designs.length > 0 && !designs.some(d => d.id === selectedDesignId)) {
      setSelectedDesignId(designs[0].id);
    }
  }, [designs, selectedDesignId]);

  const { addItem, openCart } = useCartStore();

  if (designs.length === 0) {
    return null;
  }

  const currentDesign = designs.find(d => d.id === selectedDesignId) || designs[0];
  const currentColor = garmentColors.find(c => c.id === colorId) || garmentColors[0] || DEFAULT_GARMENT_COLORS[0];

  const changeColor = (id: string) => {
    if (id === colorId) return;
    setFading(true);
    setTimeout(() => { setColorId(id); setFading(false); }, 180);
  };

  const effectiveTextColor = (currentDesign.printColor && currentDesign.printColor !== 'auto')
    ? currentDesign.printColor
    : currentColor.textColor;

  const handleModalSubmit = async (platformId: string, userInput: string) => {
    let snapshotUrl: string | undefined;
    try {
      snapshotUrl = await captureSnapshot(
        currentColor.hex,
        effectiveTextColor,
        currentDesign.text,
        currentDesign.font || 'Space Grotesk',
        currentDesign.imageUrl
      );
    } catch (e) {
      console.warn('Snapshot capture failed:', e);
    }

    addItem({
      id: `custom-${colorId}-${selectedSize}-${Date.now()}`,
      productId: 'custom-tee',
      quantity: 1,
      product: {
        name: `${currentDesign.text || 'Custom Tee'} — ${currentColor.label}`,
        price: price,
        images: [{ url: snapshotUrl || '/mockups/tshirt-base.png' }],
        slug: 'custom-tee',
      },
      variant: { size: selectedSize },
      customization: {
        colorHex: currentColor.hex,
        textColor: effectiveTextColor,
        printText: currentDesign.text,
        snapshotUrl,
      },
    });
    openCart();
  };

  const handleReset = () => {
    setSelectedDesignId(designs[0]?.id || '');
    setColorId(garmentColors[0]?.id || 'black');
    setSelectedSize('M');
  };


  return (
    <>
      <section
        id="customizer"
        aria-labelledby="customizer-heading"
        style={{
          background: 'var(--black)',
          padding: '6rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)', width: '70vw', height: '70vw',
            maxWidth: 800, maxHeight: 800, borderRadius: '50%',
            background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.75rem' }}>
              Live Preview Studio
            </p>
            <h2 id="customizer-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--white)', marginBottom: '0.6rem' }}>
              {heading}
            </h2>
            <p style={{ fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-400)' }}>
              {subheading}
            </p>
          </div>

          <div className="customizer-layout">
            {/* ── LEFT: T-Shirt Mockup ── */}
            <div className="customizer-preview-col">
              <div
                style={{
                  position: 'relative',
                  background: 'linear-gradient(145deg, #f0ede8 0%, #e8e3dc 100%)',
                  borderRadius: 20,
                  padding: '2rem 1.5rem',
                  boxShadow: '0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
                  containerType: 'inline-size',
                }}
                aria-label={`${currentColor.label} t-shirt preview`}
              >
                <TShirtMockup
                  color={currentColor}
                  design={currentDesign}
                  fading={fading}
                />

                <div
                  style={{
                    position: 'absolute', bottom: '0.8rem', left: '50%',
                    transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'var(--font-heading)', fontSize: '0.62rem',
                    fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                    padding: '0.3rem 0.9rem', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.15)', whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {currentColor.label} · {currentDesign.text} · {currentDesign.font || 'Space Grotesk'}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Customer Selection Panel ── */}
            <div className="customizer-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Choose a Design (Curated in Admin) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                  <p className="customizer-section-label" style={{ marginBottom: 0 }}>Choose a Design</p>
                  <span style={{ fontSize: '0.68rem', color: ACCENT, fontFamily: 'var(--font-heading)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {currentDesign.font || 'Space Grotesk'}
                  </span>
                </div>
                <div className="phrase-grid" role="radiogroup" aria-label="Design phrases">
                  {designs.map((d) => {
                    const dFontConfig = getStudioFontConfig(d.font);
                    const isSelected = selectedDesignId === d.id;
                    return (
                      <button
                        key={d.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedDesignId(d.id)}
                        className={`phrase-btn${isSelected ? ' selected' : ''}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          padding: '0.75rem 0.6rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: `'${d.font || 'Space Grotesk'}', sans-serif`,
                            fontWeight: dFontConfig.weight || 800,
                            letterSpacing: dFontConfig.letterSpacing || '0.05em',
                            textTransform: dFontConfig.textTransform || 'uppercase',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {d.text}
                        </span>
                        <span
                          style={{
                            fontSize: '0.58rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 10,
                            background: isSelected ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.08)',
                            color: isSelected ? '#C9A96E' : 'var(--grey-400)',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {dFontConfig.badge ? dFontConfig.badge.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim() : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Garment Color Swatches */}
              <div>
                <p className="customizer-section-label">
                  Garment Color — <span style={{ fontWeight: 500, color: 'var(--grey-200)', textTransform: 'none', letterSpacing: 0 }}>{currentColor.label}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }} role="radiogroup" aria-label="Garment color">
                  {garmentColors.map(col => (
                    <button
                      key={col.id}
                      role="radio"
                      aria-checked={colorId === col.id}
                      aria-label={col.label}
                      onClick={() => changeColor(col.id)}
                      title={col.label}
                      style={{
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: col.hex,
                        border: colorId === col.id ? `3px solid ${ACCENT}` : `2px solid ${col.hex === '#f7f6f2' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        cursor: 'pointer',
                        transform: colorId === col.id ? 'scale(1.22)' : 'scale(1)',
                        boxShadow: colorId === col.id ? `0 0 0 3px ${ACCENT_GLOW}` : 'none',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Chips */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                  <p className="customizer-section-label" style={{ marginBottom: 0 }}>Garment Size</p>
                  <a href="/size-guide" style={{ fontSize: '0.68rem', color: 'var(--grey-400)', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>Size Guide</a>
                </div>
                <div className="size-row" role="radiogroup" aria-label="Size selection">
                  {sizes.map(size => (
                    <button
                      key={size}
                      role="radio"
                      aria-checked={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-chip${selectedSize === size ? ' active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Add to Cart CTA */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.1rem' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.03em' }}>
                    ₹{price.toLocaleString('en-IN')}
                    {origPrice > price && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--grey-400)', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                        ₹{origPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </p>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Size: {selectedSize}
                  </span>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="customizer-cta-btn"
                  aria-label="Generate my custom shirt"
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  Generate My Custom Shirt
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    width: '100%', marginTop: '0.75rem', padding: '0.5rem', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey-400)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--grey-400)')}
                >
                  <RotateCcw size={11} aria-hidden="true" /> Reset Studio
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <StepModal
          designText={currentDesign.text}
          colorLabel={currentColor.label}
          size={selectedSize}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}
