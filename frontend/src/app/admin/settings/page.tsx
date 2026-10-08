'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-hot-toast';
import { settingsApi } from '@/lib/api';
import { useSettingsStore, DEFAULT_SETTINGS, StoreSettings } from '@/lib/settingsStore';
import {
  Save, RefreshCw, Store, Truck, Bell, Share2, Palette, Type,
  Layout, Package, Image, Star, AlignLeft, Globe, Megaphone,
  Plus, Trash2, Eye, Zap, Monitor, Smartphone, Upload, X, Loader,
  Shirt, ArrowUp, ArrowDown, Check, Sparkles,
} from 'lucide-react';
import { COOL_FONTS, DEFAULT_STUDIO_FONT_NAMES, getStudioFontConfig } from '@/lib/studioFonts';


// ─── Sidebar sections ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'brand',        label: 'Brand & Identity',    icon: Store },
  { id: 'theme',        label: 'Theme & Colors',       icon: Palette },
  { id: 'typography',   label: 'Typography',           icon: Type },
  { id: 'announcement', label: 'Announcement Bar',     icon: Bell },
  { id: 'hero',         label: 'Hero Banner',          icon: Image },
  { id: 'products',     label: 'Products Section',     icon: Package },
  { id: 'customizer',   label: 'Live Customizer',      icon: Shirt },

  { id: 'marquee',      label: 'Marquee Strip',        icon: Zap },
  { id: 'sections',     label: 'Sections Visibility',  icon: Eye },
  { id: 'howItWorks',   label: 'How It Works',         icon: Monitor },
  { id: 'testimonials', label: 'Testimonials',         icon: Star },
  { id: 'footer',       label: 'Footer',               icon: AlignLeft },
  { id: 'shipping',     label: 'Shipping & Checkout',  icon: Truck },
  { id: 'dispatchHub',  label: 'Dispatch & Return Hub', icon: Package },
  { id: 'seo',          label: 'SEO & Meta',           icon: Globe },
  { id: 'social',       label: 'Social Links',         icon: Share2 },
  { id: 'promotions',   label: 'Promotions',           icon: Megaphone },
];

// ─── Shared UI building blocks ────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.795rem', color: '#374151', fontWeight: 600, marginBottom: '0.35rem' }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem', display: 'block' }}>{hint}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.6rem 0.85rem', color: '#111827', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.6rem 0.85rem', color: '#111827', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', padding: 2, flexShrink: 0 }}
      />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000"
        style={{ flex: 1, background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.7rem', color: '#111827', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace' }}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)}
        style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#111827' : '#d1d5db', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      {label && <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{label}</span>}
    </label>
  );
}

// ─── File Upload Component ─────────────────────────────────────────────────────
function ImageUpload({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (url: string) => void; hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await settingsApi.uploadImage(file);
      onChange(res.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed — check backend');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* URL input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text" value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or upload below"
            style={{ flex: 1, background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.6rem 0.85rem', color: '#111827', fontSize: '0.875rem', outline: 'none' }}
          />
          {value && (
            <button onClick={() => onChange('')}
              style={{ padding: '0 0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#ffffff', cursor: 'pointer', color: '#6b7280' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Upload button */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem', border: '1px solid #d1d5db',
              borderRadius: '6px', background: '#f9fafb', cursor: uploading ? 'wait' : 'pointer',
              fontSize: '0.8rem', color: '#374151', fontWeight: 500,
            }}
          >
            {uploading ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={13} /> Upload Image</>}
          </button>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Max 5 MB · PNG/JPG/WebP</span>
        </div>

        {/* Preview */}
        {value && (
          <div style={{ position: 'relative', width: '100%', maxWidth: 200, height: 80, borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f3f4f6' }}>
            <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </Field>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.FC<any>; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #f3f4f6' }}>
        <Icon size={17} color="#C9A96E" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
      {children}
    </div>
  );
}

function hexToNorm(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function buildColorMatrix(hex: string): string {
  const { r, g, b } = hexToNorm(hex || '#0d0d0d');
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

function AdminTShirtPreview({
  text,
  font,
  colorHex,
  textColor,
  printColor,
}: {
  text: string;
  font: string;
  colorHex: string;
  textColor: string;
  printColor?: string;
}) {
  const fontConfig = getStudioFontConfig(font);
  const effectiveTextColor = (printColor && printColor !== 'auto') ? printColor : textColor;
  const isDark = effectiveTextColor === '#ffffff';
  const filterId = `admin-recolor-${(colorHex || 'black').replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const words = (text || 'WEAR YOUR STORY').trim().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length <= 14) cur = cand;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  const displayLines = lines.slice(0, 3);

  const baseSize = text.length > 16 ? 12 : text.length > 10 ? 15 : 18;
  const fontSize = Math.round(baseSize * (fontConfig.sizeMultiplier || 1));

  return (
    <div style={{
      position: 'relative',
      width: 200,
      height: 200,
      background: 'linear-gradient(145deg, #f0ede8 0%, #e8e3dc 100%)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId}>
            <feColorMatrix type="matrix" values={buildColorMatrix(colorHex)} />
          </filter>
        </defs>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mockups/tshirt-base.png"
        alt="T-shirt preview"
        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `url(#${filterId})` }}
      />
      <div style={{
        position: 'absolute',
        top: '31%',
        left: '24%',
        width: '52%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.12em',
        pointerEvents: 'none',
      }}>
        {displayLines.map((line, i) => (
          <span
            key={i}
            style={{
              fontFamily: `'${font}', sans-serif`,
              fontWeight: fontConfig.weight || 800,
              fontSize: `${fontSize}px`,
              lineHeight: 1.15,
              letterSpacing: fontConfig.letterSpacing || '0.08em',
              textTransform: fontConfig.textTransform || 'uppercase',
              color: effectiveTextColor,
              textShadow: isDark ? '0 1px 4px rgba(0,0,0,0.7)' : '0 1px 3px rgba(255,255,255,0.4)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {line}
          </span>
        ))}
      </div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '40%',
        width: '20%',
        height: '20%',
        opacity: 0.85,
        pointerEvents: 'none',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mockups/qr-dummy.png" alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('brand');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewVisible, setPreviewVisible] = useState(true);
  const [adminPreviewDesignIdx, setAdminPreviewDesignIdx] = useState(0);
  const [adminPreviewColorId, setAdminPreviewColorId] = useState('black');
  const [activePhraseTab, setActivePhraseTab] = useState<string>('WANNA KISS');
  const [newPhraseInput, setNewPhraseInput] = useState<string>('');
  const [newColorLabel, setNewColorLabel] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState<string>('#ffffff');
  const [matrixView, setMatrixView] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const { fetchSettings } = useSettingsStore();

  // Load settings on mount
  useEffect(() => {
    settingsApi.adminGet()
      .then((res) => {
        if (res.data?.settings) setSettings({ ...DEFAULT_SETTINGS, ...res.data.settings });
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('teesindia_admin_settings');
          if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
        } catch {}
      });
  }, []);

  // ── Send live preview to iframe via postMessage (debounced 400ms) ─────────────
  const sendPreview = useCallback((newSettings: StoreSettings) => {
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'TEESINDIA_PREVIEW_SETTINGS', settings: newSettings },
        window.location.origin,
      );
    }, 400);
  }, []);

  const update = useCallback(<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      sendPreview(next);
      return next;
    });
  }, [sendPreview]);

  // ── Customizer Whole Image & Color Handlers ──
  const handleCustomizerImageChange = useCallback((phrase: string, colorId: string, url: string) => {
    setSettings((prev) => {
      const current = { ...(prev.customizerImages || {}) };
      const phraseMap = { ...(current[phrase] || {}) };
      if (url) {
        phraseMap[colorId] = url;
      } else {
        delete phraseMap[colorId];
      }
      current[phrase] = phraseMap;
      const next = { ...prev, customizerImages: current };
      sendPreview(next);
      return next;
    });
  }, [sendPreview]);

  const handleAddPhrase = () => {
    const trimmed = newPhraseInput.trim().toUpperCase();
    if (!trimmed) return;
    if (settings.customizerPhrases.includes(trimmed)) {
      toast.error('Phrase already exists');
      return;
    }
    update('customizerPhrases', [...settings.customizerPhrases, trimmed]);
    setNewPhraseInput('');
    setActivePhraseTab(trimmed);
    toast.success(`Added "${trimmed}"`);
  };

  const handleRemovePhrase = (phraseToRemove: string) => {
    if (settings.customizerPhrases.length <= 1) {
      toast.error('At least one phrase is required');
      return;
    }
    const next = settings.customizerPhrases.filter(p => p !== phraseToRemove);
    update('customizerPhrases', next);
    if (activePhraseTab === phraseToRemove) {
      setActivePhraseTab(next[0] || '');
    }
    toast.success(`Removed "${phraseToRemove}"`);
  };

  const handleAddColor = () => {
    const label = newColorLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-') || `color-${Date.now()}`;
    if (settings.customizerGarmentColors.some(c => c.id === id)) {
      toast.error('Color ID already exists');
      return;
    }
    update('customizerGarmentColors', [...settings.customizerGarmentColors, { id, label, hex: newColorHex }]);
    setNewColorLabel('');
    setNewColorHex('#ffffff');
    toast.success(`Added color "${label}"`);
  };

  const handleRemoveColor = (idToRemove: string) => {
    if (settings.customizerGarmentColors.length <= 1) {
      toast.error('At least one color is required');
      return;
    }
    update('customizerGarmentColors', settings.customizerGarmentColors.filter(c => c.id !== idToRemove));
    toast.success('Color removed');
  };

  const handleUpdateColor = (index: number, field: 'label' | 'hex', val: string) => {
    const next = [...settings.customizerGarmentColors];
    next[index] = { ...next[index], [field]: val };
    update('customizerGarmentColors', next);
  };

  // Initial preview when iframe loads
  const handleIframeLoad = () => {
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'TEESINDIA_PREVIEW_SETTINGS', settings },
        window.location.origin,
      );
    }, 300);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.save(settings);
      await fetchSettings();
      // Reload the iframe to reflect saved state
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
      toast.success('✓ Storefront settings saved & applied!');
    } catch {
      try {
        localStorage.setItem('teesindia_admin_settings', JSON.stringify(settings));
        toast.success('Saved locally (API unavailable)');
      } catch { toast.error('Failed to save settings'); }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset ALL settings to factory defaults?')) return;
    setSettings(DEFAULT_SETTINGS);
    sendPreview(DEFAULT_SETTINGS);
    toast.success('Settings reset to defaults');
  };

  const actionButton = (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <button onClick={handleReset}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #e5e7eb', color: '#4b5563', padding: '0.55rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
      >
        <RefreshCw size={14} /> Reset
      </button>
      <button onClick={handleSave} disabled={isSaving}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#111827', color: '#ffffff', fontWeight: 600, padding: '0.55rem 1.25rem', borderRadius: '6px', fontSize: '0.85rem', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
      >
        <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Apply'}
      </button>
    </div>
  );

  return (
    <AdminLayout title="Storefront Customizer" action={actionButton}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .settings-iframe-wrap { transition: width 0.3s ease; }
      `}</style>

      {/* ── 3-column layout: Sidebar | Form | Preview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: previewVisible ? '200px 1fr 1fr' : '200px 1fr', gap: '1rem', alignItems: 'start', minHeight: 'calc(100vh - 120px)' }}>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: 0 }}>STOREFRONT</p>
          </div>
          <nav style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.65rem 1rem', background: activeSection === id ? '#f9fafb' : 'transparent',
                  border: 'none', borderLeft: `3px solid ${activeSection === id ? '#C9A96E' : 'transparent'}`,
                  cursor: 'pointer', fontSize: '0.785rem', fontWeight: activeSection === id ? 600 : 400,
                  color: activeSection === id ? '#111827' : '#6b7280', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <Icon size={13} color={activeSection === id ? '#C9A96E' : '#9ca3af'} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* ═══════════ FORM PANEL ═══════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>

          {/* ── BRAND ── */}
          {activeSection === 'brand' && (
            <SectionCard icon={Store} title="Brand & Store Identity">
              <Grid>
                <Field label="Store Name">
                  <TextInput value={settings.storeName} onChange={(v) => update('storeName', v)} />
                </Field>
                <Field label="Brand Tagline">
                  <TextInput value={settings.tagline} onChange={(v) => update('tagline', v)} />
                </Field>
                <Field label="Support Email">
                  <TextInput value={settings.supportEmail} onChange={(v) => update('supportEmail', v)} type="email" />
                </Field>
                <Field label="Support Phone / WhatsApp">
                  <TextInput value={settings.supportPhone} onChange={(v) => update('supportPhone', v)} />
                </Field>
              </Grid>
              <ImageUpload label="Store Logo" value={settings.logoUrl} onChange={(v) => update('logoUrl', v)} hint="PNG or SVG, transparent background recommended" />
              <ImageUpload label="Favicon" value={settings.faviconUrl} onChange={(v) => update('faviconUrl', v)} hint="Square PNG, 32×32 or 64×64px" />
            </SectionCard>
          )}

          {/* ── THEME ── */}
          {activeSection === 'theme' && (
            <SectionCard icon={Palette} title="Theme & Colors">
              <Grid>
                <Field label="Primary Color (Brand Gold)">
                  <ColorInput value={settings.primaryColor} onChange={(v) => update('primaryColor', v)} />
                </Field>
                <Field label="Accent Color">
                  <ColorInput value={settings.accentColor} onChange={(v) => update('accentColor', v)} />
                </Field>
                <Field label="Background Color">
                  <ColorInput value={settings.bgColor} onChange={(v) => update('bgColor', v)} />
                </Field>
                <Field label="Text Color">
                  <ColorInput value={settings.textColor} onChange={(v) => update('textColor', v)} />
                </Field>
              </Grid>
              <Field label="Button Style">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {(['square', 'rounded', 'pill'] as const).map((s) => (
                    <button key={s} onClick={() => update('buttonStyle', s)}
                      style={{ padding: '0.45rem 1rem', border: `2px solid ${settings.buttonStyle === s ? '#111827' : '#e5e7eb'}`, borderRadius: s === 'square' ? '2px' : s === 'rounded' ? '8px' : '9999px', background: settings.buttonStyle === s ? '#111827' : '#ffffff', color: settings.buttonStyle === s ? '#ffffff' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
              {/* Live color preview */}
              <div style={{ padding: '1rem', background: settings.bgColor, border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Preview:</span>
                {[{ label: 'Primary', bg: settings.primaryColor, color: '#000' }, { label: 'Accent', bg: settings.accentColor, color: '#fff' }].map(({ label, bg, color }) => (
                  <button key={label} style={{ background: bg, color, padding: '0.4rem 1rem', border: 'none', cursor: 'default', borderRadius: settings.buttonStyle === 'square' ? '2px' : settings.buttonStyle === 'rounded' ? '8px' : '9999px', fontWeight: 600, fontSize: '0.8rem' }}>{label}</button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── TYPOGRAPHY ── */}
          {activeSection === 'typography' && (
            <SectionCard icon={Type} title="Typography">
              <Grid>
                <Field label="Heading Font" hint="Google Font name (e.g. 'Playfair Display')">
                  <TextInput value={settings.headingFont} onChange={(v) => update('headingFont', v)} />
                </Field>
                <Field label="Body Font" hint="Google Font name (e.g. 'Inter', 'Poppins')">
                  <TextInput value={settings.bodyFont} onChange={(v) => update('bodyFont', v)} />
                </Field>
              </Grid>
              <div style={{ padding: '1.25rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <p style={{ fontFamily: settings.headingFont + ', serif', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Heading Font Preview</p>
                <p style={{ fontFamily: settings.bodyFont + ', sans-serif', fontSize: '0.875rem', color: '#4b5563', margin: 0, lineHeight: 1.6 }}>
                  Body font preview — this is how paragraph text looks across your storefront.
                </p>
              </div>
            </SectionCard>
          )}

          {/* ── ANNOUNCEMENT ── */}
          {activeSection === 'announcement' && (
            <SectionCard icon={Bell} title="Top Announcement Bar">
              <Toggle checked={settings.announcementActive} onChange={(v) => update('announcementActive', v)} label="Enable Announcement Bar" />
              <Field label="Announcement Text" hint="Use | to separate multiple messages (they'll scroll one by one)">
                <TextInput value={settings.announcementText} onChange={(v) => update('announcementText', v)} placeholder="FREE SHIPPING ON ₹999+ | NEW DROPS LIVE" />
              </Field>
              <Grid>
                <Field label="Background Color"><ColorInput value={settings.announcementBg} onChange={(v) => update('announcementBg', v)} /></Field>
                <Field label="Text Color"><ColorInput value={settings.announcementTextColor} onChange={(v) => update('announcementTextColor', v)} /></Field>
              </Grid>
              <div style={{ padding: '0.6rem 1rem', background: settings.announcementBg, borderRadius: '6px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', color: settings.announcementTextColor }}>
                {settings.announcementText.split('|')[0]?.trim() || 'Announcement preview'}
              </div>
            </SectionCard>
          )}

          {/* ── HERO ── */}
          {activeSection === 'hero' && (
            <SectionCard icon={Image} title="Hero Banner">
              <Field label="Main Headline" hint="Use \n for a line break">
                <TextInput value={settings.heroHeadline} onChange={(v) => update('heroHeadline', v)} placeholder="Wear the\nStatement." />
              </Field>
              <Field label="Sub-headline">
                <TextArea value={settings.heroSubheadline} onChange={(v) => update('heroSubheadline', v)} rows={2} />
              </Field>
              <Grid>
                <Field label="CTA Button Text"><TextInput value={settings.heroCtaText} onChange={(v) => update('heroCtaText', v)} /></Field>
                <Field label="CTA Button Link"><TextInput value={settings.heroCtaLink} onChange={(v) => update('heroCtaLink', v)} /></Field>
              </Grid>
              <ImageUpload label="Hero Background Image" value={settings.heroImageUrl} onChange={(v) => update('heroImageUrl', v)} hint="High-res landscape image (1920×1080 recommended)" />
              <Field label={`Overlay Opacity: ${Math.round(settings.heroOverlayOpacity * 100)}%`} hint="Darkens the hero image — only applies when an image is set">
                <input type="range" min={0} max={1} step={0.05} value={settings.heroOverlayOpacity}
                  onChange={(e) => update('heroOverlayOpacity', parseFloat(e.target.value))} style={{ width: '100%' }}
                />
              </Field>
            </SectionCard>
          )}

          {/* ── PRODUCTS ── */}
          {activeSection === 'products' && (
            <SectionCard icon={Package} title="Products Section">
              <Grid>
                <Field label="Section Title"><TextInput value={settings.productsTitle} onChange={(v) => update('productsTitle', v)} /></Field>
                <Field label="Section Subtitle"><TextInput value={settings.productsSubtitle} onChange={(v) => update('productsSubtitle', v)} /></Field>
              </Grid>
              <Field label={`Products to Show: ${settings.productsCount}`}>
                <input type="range" min={4} max={20} step={2} value={settings.productsCount}
                  onChange={(e) => update('productsCount', parseInt(e.target.value))} style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  {[4, 8, 12, 16, 20].map(n => <span key={n}>{n}</span>)}
                </div>
              </Field>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', margin: 0 }}>Product Card Elements</p>
                <Toggle checked={settings.productCardShowBadge} onChange={(v) => update('productCardShowBadge', v)} label="Show Sale / New badges" />
                <Toggle checked={settings.productCardShowWishlist} onChange={(v) => update('productCardShowWishlist', v)} label="Show Wishlist (heart) button" />
                <Toggle checked={settings.productCardShowQuickAdd} onChange={(v) => update('productCardShowQuickAdd', v)} label="Show Quick Add to Cart button" />
                <Toggle checked={settings.productCardShowRatings} onChange={(v) => update('productCardShowRatings', v)} label="Show star ratings on cards" />
              </div>
            </SectionCard>
          )}

          {/* ── LIVE CUSTOMIZER & GARMENT IMAGES ── */}
          {activeSection === 'customizer' && (
            <SectionCard icon={Shirt} title="Live Customizer & Garment Images">
              {/* Product Info & Slug */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product Information & Destination Link
                </h4>
                <Grid cols={2}>
                  <Field label="Customizer Product Name">
                    <TextInput value={settings.customizerProductName} onChange={(v) => update('customizerProductName', v)} placeholder="Teesindia QR Tshirt" />
                  </Field>
                  <Field label="Customizer Product Price (₹)">
                    <TextInput type="number" value={String(settings.customizerProductPrice)} onChange={(v) => update('customizerProductPrice', parseInt(v) || 0)} placeholder="7800" />
                  </Field>
                  <Field label="Linked Product Slug" hint="Destination when customer clicks 'Full description' (e.g. teesindia-qr-tshirt)">
                    <TextInput value={settings.customizerProductSlug || 'teesindia-qr-tshirt'} onChange={(v) => update('customizerProductSlug', v)} placeholder="teesindia-qr-tshirt" />
                  </Field>
                  <Field label="Color Swatch Label">
                    <TextInput value={settings.customizerColorLabel} onChange={(v) => update('customizerColorLabel', v)} placeholder="Select Color:" />
                  </Field>
                </Grid>
                <div style={{ marginTop: '0.75rem' }}>
                  <Field label="Sizes Available" hint="Comma-separated list (e.g. S, M, L, XL, 2XL)">
                    <TextInput
                      value={settings.customizerSizes.join(', ')}
                      onChange={(v) => update('customizerSizes', v.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="S, M, L, XL, 2XL"
                    />
                  </Field>
                </div>
              </div>

              {/* Manage Phrases (The 4 Texts) */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Text / Phrase Designs ({settings.customizerPhrases.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Default 4: WANNA KISS, WANNA DATE, WANNA F*CK, WANNA DANCE</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {settings.customizerPhrases.map((phrase) => (
                    <div key={phrase} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.45rem 0.85rem', background: '#ffffff', border: '1.5px solid #d1d5db',
                      borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#111827'
                    }}>
                      <span>{phrase}</span>
                      {settings.customizerPhrases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(phrase)}
                          title="Remove phrase"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <TextInput
                    value={newPhraseInput}
                    onChange={setNewPhraseInput}
                    placeholder="Add custom text (e.g. WANNA VIBE)"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhrase}
                    style={{ padding: '0.55rem 1rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={14} /> Add Text
                  </button>
                </div>
              </div>

              {/* Manage Garment Colors */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Garment Colour Options ({settings.customizerGarmentColors.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Color swatches displayed on storefront</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {settings.customizerGarmentColors.map((color, idx) => (
                    <div key={color.id} style={{
                      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '0.65rem'
                    }}>
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => handleUpdateColor(idx, 'hex', e.target.value)}
                        style={{ width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: 1, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input
                          type="text"
                          value={color.label}
                          onChange={(e) => handleUpdateColor(idx, 'label', e.target.value)}
                          style={{ width: '100%', fontSize: '0.82rem', fontWeight: 600, border: 'none', outline: 'none', color: '#111827', padding: 0 }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{color.hex}</span>
                      </div>
                      {settings.customizerGarmentColors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color.id)}
                          title="Remove color"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    style={{ width: 36, height: 36, border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                  />
                  <TextInput
                    value={newColorLabel}
                    onChange={setNewColorLabel}
                    placeholder="New Color Name (e.g. Crimson Red, Olive)"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    style={{ padding: '0.55rem 1rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={14} /> Add Color
                  </button>
                </div>
              </div>

              {/* WHOLE IMAGE UPLOADS FOR ALL 4 TEXTS & ALL COLOUR OPTIONS */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '2px solid #C9A96E', boxShadow: '0 4px 20px rgba(201,169,110,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#C9A96E', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Feature</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                        Upload Whole Images (All 4 Texts × All Colour Options)
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.35rem 0 0 0' }}>
                      Upload complete photos or mockups showing each text design on each color t-shirt. When uploaded, the customizer displays your whole image instead of template overlays.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMatrixView(!matrixView)}
                    style={{
                      padding: '0.45rem 0.85rem', background: matrixView ? '#111827' : '#f3f4f6',
                      color: matrixView ? '#ffffff' : '#374151', border: '1px solid #d1d5db',
                      borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {matrixView ? 'Switch to Tabs View' : 'Switch to Full Matrix View'}
                  </button>
                </div>

                {/* Tabs View (Default) */}
                {!matrixView && (
                  <div>
                    {/* Phrase Selector Tabs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {settings.customizerPhrases.map((phrase) => {
                        const active = (activePhraseTab || settings.customizerPhrases[0]) === phrase;
                        const uploadedCount = settings.customizerGarmentColors.filter(c => !!settings.customizerImages?.[phrase]?.[c.id]).length;
                        const totalColors = settings.customizerGarmentColors.length;
                        return (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => setActivePhraseTab(phrase)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                              padding: '0.6rem 1.1rem', borderRadius: '8px',
                              border: `2px solid ${active ? '#111827' : '#e5e7eb'}`,
                              background: active ? '#111827' : '#ffffff',
                              color: active ? '#ffffff' : '#374151',
                              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{phrase}</span>
                            <span style={{
                              fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px',
                              background: active ? (uploadedCount === totalColors ? '#10b981' : 'rgba(255,255,255,0.25)') : (uploadedCount > 0 ? '#dcfce7' : '#f3f4f6'),
                              color: active ? '#ffffff' : (uploadedCount > 0 ? '#15803d' : '#6b7280'),
                              fontWeight: 600
                            }}>
                              {uploadedCount}/{totalColors}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Uploaders for Active Phrase */}
                    {(() => {
                      const currentPhrase = activePhraseTab || settings.customizerPhrases[0] || 'WANNA KISS';
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                          {settings.customizerGarmentColors.map((col) => {
                            const currentImg = settings.customizerImages?.[currentPhrase]?.[col.id] || '';
                            return (
                              <div key={col.id} style={{
                                background: '#f9fafb', border: `1.5px solid ${currentImg ? '#C9A96E' : '#e5e7eb'}`,
                                borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                boxShadow: currentImg ? '0 2px 8px rgba(201,169,110,0.15)' : 'none'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: 22, height: 22, borderRadius: '4px', background: col.hex, border: '1px solid #d1d5db', display: 'inline-block' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{col.label}</span>
                                  </div>
                                  <span style={{
                                    fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '4px',
                                    background: currentImg ? '#dcfce7' : '#fef3c7',
                                    color: currentImg ? '#15803d' : '#b45309'
                                  }}>
                                    {currentImg ? '✓ Whole Image' : 'Fallback Mockup'}
                                  </span>
                                </div>

                                <ImageUpload
                                  label={`"${currentPhrase}" on ${col.label}`}
                                  value={currentImg}
                                  onChange={(url) => handleCustomizerImageChange(currentPhrase, col.id, url)}
                                  hint={`Full whole image for ${currentPhrase} on ${col.label} t-shirt`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Matrix View (All Phrases x All Colors Grid) */}
                {matrixView && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#111827' }}>Text / Design</th>
                          {settings.customizerGarmentColors.map(c => (
                            <th key={c.id} style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#111827' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: 14, height: 14, borderRadius: '3px', background: c.hex, border: '1px solid #9ca3af', display: 'inline-block' }} />
                                <span>{c.label}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {settings.customizerPhrases.map((phrase) => (
                          <tr key={phrase} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                              {phrase}
                            </td>
                            {settings.customizerGarmentColors.map((col) => {
                              const imgUrl = settings.customizerImages?.[phrase]?.[col.id] || '';
                              return (
                                <td key={col.id} style={{ padding: '0.5rem 0.75rem', textAlign: 'center', minWidth: '160px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                                    {imgUrl ? (
                                      <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: '1.5px solid #C9A96E' }}>
                                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                          type="button"
                                          onClick={() => handleCustomizerImageChange(phrase, col.id, '')}
                                          style={{ position: 'absolute', top: 1, right: 1, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 14, height: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>No image</span>
                                    )}
                                    <input
                                      type="text"
                                      value={imgUrl}
                                      onChange={(e) => handleCustomizerImageChange(phrase, col.id, e.target.value)}
                                      placeholder="URL or paste"
                                      style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem 0.45rem', border: '1px solid #d1d5db', borderRadius: '4px', textAlign: 'center' }}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Live Storefront Modal Preview Box */}
                <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Storefront Modal Live Preview
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Click swatches and designs to test your uploaded images</span>
                  </div>
                  {(() => {
                    const previewPhrase = activePhraseTab || settings.customizerPhrases[0] || 'WANNA KISS';
                    const previewCol = settings.customizerGarmentColors.find(c => c.id === adminPreviewColorId) || settings.customizerGarmentColors[0] || { id: 'black', label: 'Black', hex: '#111827' };
                    const previewImg = settings.customizerImages?.[previewPhrase]?.[previewCol.id] || (previewCol as any)?.imageUrl;

                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb', alignItems: 'center' }}>
                        {/* Image Preview Box */}
                        <div style={{
                          width: 220, height: 220, background: '#f5f5f5', borderRadius: 8, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 8
                        }}>
                          {previewImg ? (
                            <img src={previewImg} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <>
                              <img src="/mockups/tshirt-base.png" alt="Mockup" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                              <div style={{ position: 'absolute', top: '26%', textAlign: 'center', color: '#c00000', fontFamily: 'Impact, sans-serif', fontSize: '1.5rem', lineHeight: 1 }}>
                                {previewPhrase.split(' ').map((w, i) => <div key={i}>{w}</div>)}
                              </div>
                            </>
                          )}
                          <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px',
                              background: previewImg ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.65)', color: '#fff'
                            }}>
                              {previewImg ? '✓ Custom Whole Image' : 'Template Overlay'}
                            </span>
                          </div>
                        </div>

                        {/* Product Info Preview */}
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#000' }}>
                            {settings.customizerProductName || 'Teesindia QR Tshirt'}
                          </h3>
                          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: '0 0 1rem 0' }}>
                            ₹{(settings.customizerProductPrice || 7800).toLocaleString('en-IN')}
                          </p>

                          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.4rem 0', textTransform: 'uppercase' }}>
                            Text: <span style={{ color: '#000', fontWeight: 700 }}>{previewPhrase}</span>
                          </p>

                          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.4rem 0', textTransform: 'uppercase' }}>
                            {settings.customizerColorLabel || 'Select Color:'} <span style={{ color: '#000', fontWeight: 700 }}>{previewCol.label}</span>
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            {settings.customizerGarmentColors.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setAdminPreviewColorId(c.id)}
                                title={c.label}
                                style={{
                                  width: 32, height: 32, borderRadius: 4, background: c.hex,
                                  border: adminPreviewColorId === c.id ? '2.5px solid #000' : '1px solid #d1d5db',
                                  cursor: 'pointer'
                                }}
                              />
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#b90000', fontWeight: 600, textDecoration: 'underline' }}>
                              Full description &rarr;
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                              (Links dynamically to /product/{settings.customizerProductSlug || 'teesindia-qr-tshirt'})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── MARQUEE ── */}
          {activeSection === 'marquee' && (
            <SectionCard icon={Zap} title="Marquee Strip">
              <Grid>
                <Field label="Background Color"><ColorInput value={settings.marqueeBg} onChange={(v) => update('marqueeBg', v)} /></Field>
                <Field label="Text Color"><ColorInput value={settings.marqueeTextColor} onChange={(v) => update('marqueeTextColor', v)} /></Field>
              </Grid>
              <Field label={`Scroll Speed: ${settings.marqueeSpeed}s`} hint="Lower = faster">
                <input type="range" min={10} max={60} step={5} value={settings.marqueeSpeed}
                  onChange={(e) => update('marqueeSpeed', parseInt(e.target.value))} style={{ width: '100%' }}
                />
              </Field>
              <Field label="Items" hint="One item per line">
                <TextArea value={settings.marqueeItems.join('\n')} rows={8}
                  onChange={(v) => update('marqueeItems', v.split('\n').map(s => s.trim()).filter(Boolean))}
                  placeholder={'Free Shipping Over ₹999\nPremium Cotton\nMade in India'}
                />
              </Field>
              <div style={{ overflow: 'hidden', background: settings.marqueeBg, padding: '0.6rem', borderRadius: '6px', display: 'flex', gap: '1.5rem', color: settings.marqueeTextColor, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                {settings.marqueeItems.slice(0, 4).map((item, i) => <span key={i}>{item} ★</span>)}
              </div>
            </SectionCard>
          )}

          {/* ── SECTIONS VISIBILITY ── */}
          {activeSection === 'sections' && (
            <SectionCard icon={Eye} title="Sections Visibility">
              {[
                { key: 'showHowItWorks' as const, label: 'How It Works', desc: 'Step-by-step process section' },
                { key: 'showTestimonials' as const, label: 'Testimonials', desc: 'Customer reviews carousel' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.15rem' }}>{label}</p>
                    <p style={{ fontSize: '0.73rem', color: '#6b7280', margin: 0 }}>{desc}</p>
                  </div>
                  <Toggle checked={!!settings[key]} onChange={(v) => update(key, v)} label="" />
                </div>
              ))}
            </SectionCard>
          )}

          {/* ── HOW IT WORKS ── */}
          {activeSection === 'howItWorks' && (
            <SectionCard icon={Monitor} title="How It Works Section">
              <Grid>
                <Field label="Section Title">
                  <TextInput value={settings.howItWorksTitle} onChange={(v) => update('howItWorksTitle', v)} />
                </Field>
                <Field label="Section Subtitle">
                  <TextInput value={settings.howItWorksSubtitle} onChange={(v) => update('howItWorksSubtitle', v)} />
                </Field>
              </Grid>
              
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: '0 0 0.5rem 0' }}>Steps Configuration</h4>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Define the step-by-step process shown on the storefront.</p>
              </div>

              {settings.howItWorksSteps?.map((step, i) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>Step 0{i + 1}</span>
                    <button onClick={() => { const n = [...settings.howItWorksSteps]; n.splice(i, 1); update('howItWorksSteps', n); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                  <Grid>
                    <Field label="Title">
                      <TextInput value={step.title} onChange={(v) => { const n = [...settings.howItWorksSteps]; n[i] = { ...n[i], title: v }; update('howItWorksSteps', n); }} />
                    </Field>
                    <Field label="Description">
                      <TextArea value={step.description} rows={2} onChange={(v) => { const n = [...settings.howItWorksSteps]; n[i] = { ...n[i], description: v }; update('howItWorksSteps', n); }} />
                    </Field>
                  </Grid>
                  <div style={{ marginTop: '1rem' }}>
                    <ImageUpload label="Step Image" value={step.imageUrl} onChange={(v) => { const n = [...settings.howItWorksSteps]; n[i] = { ...n[i], imageUrl: v }; update('howItWorksSteps', n); }} />
                  </div>
                </div>
              ))}
              <button onClick={() => update('howItWorksSteps', [...(settings.howItWorksSteps || []), { title: 'NEW STEP', description: 'Description here', imageUrl: '' }])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '2px dashed #d1d5db', borderRadius: '8px', background: '#ffffff', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 500, width: '100%', justifyContent: 'center' }}
              >
                <Plus size={15} /> Add Step
              </button>
            </SectionCard>
          )}

          {/* ── LIVE CUSTOMIZER ── */}
          {activeSection === 'customizer' && (
            <SectionCard icon={Shirt} title="Live Customizer Settings">
              <Grid>
                <Field label="Product Name Fallback">
                  <TextInput value={settings.customizerProductName} onChange={(v) => update('customizerProductName', v)} />
                </Field>
                <Field label="Product Price Fallback">
                  <input 
                    type="number" 
                    value={settings.customizerProductPrice} 
                    onChange={(e) => update('customizerProductPrice', Number(e.target.value))} 
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }} 
                  />
                </Field>
                <Field label="Color Selection Label">
                  <TextInput value={settings.customizerColorLabel} onChange={(v) => update('customizerColorLabel', v)} />
                </Field>
                <Field label="Size Selection Label">
                  <TextInput value={settings.customizerSizeLabel} onChange={(v) => update('customizerSizeLabel', v)} />
                </Field>
              </Grid>
            </SectionCard>
          )}

          {/* ── TESTIMONIALS ── */}
          {activeSection === 'testimonials' && (
            <SectionCard icon={Star} title="Testimonials">
              {settings.testimonials.map((t, i) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Review {i + 1}</span>
                    <button onClick={() => { const n = [...settings.testimonials]; n.splice(i, 1); update('testimonials', n); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                  <Grid>
                    <Field label="Name">
                      <TextInput value={t.name} onChange={(v) => { const n = [...settings.testimonials]; n[i] = { ...n[i], name: v }; update('testimonials', n); }} />
                    </Field>
                    <Field label={`Rating: ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}`}>
                      <input type="range" min={1} max={5} value={t.rating}
                        onChange={(e) => { const n = [...settings.testimonials]; n[i] = { ...n[i], rating: parseInt(e.target.value) }; update('testimonials', n); }}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      />
                    </Field>
                  </Grid>
                  <Field label="Review Text">
                    <TextArea value={t.text} rows={2}
                      onChange={(v) => { const n = [...settings.testimonials]; n[i] = { ...n[i], text: v }; update('testimonials', n); }}
                    />
                  </Field>
                </div>
              ))}
              <button onClick={() => update('testimonials', [...settings.testimonials, { name: 'Customer', text: 'Great product!', rating: 5, imageUrl: '' }])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '2px dashed #d1d5db', borderRadius: '8px', background: '#ffffff', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 500, width: '100%', justifyContent: 'center' }}
              >
                <Plus size={15} /> Add Review
              </button>
            </SectionCard>
          )}

          {/* ── FOOTER ── */}
          {activeSection === 'footer' && (
            <SectionCard icon={AlignLeft} title="Footer Settings">
              <Field label="Footer Copyright Text">
                <TextInput value={settings.footerText} onChange={(v) => update('footerText', v)} />
              </Field>
              <Toggle checked={settings.footerShowNewsletter} onChange={(v) => update('footerShowNewsletter', v)} label="Show Newsletter Signup in Footer" />
            </SectionCard>
          )}

          {/* ── SHIPPING ── */}
          {activeSection === 'shipping' && (
            <SectionCard icon={Truck} title="Shipping & Checkout">
              <Grid cols={3}>
                <Field label="Free Shipping Threshold (₹)">
                  <TextInput value={String(settings.freeShippingThreshold)} onChange={(v) => update('freeShippingThreshold', Number(v))} type="number" />
                </Field>
                <Field label="Standard Shipping Fee (₹)">
                  <TextInput value={String(settings.standardShippingFee)} onChange={(v) => update('standardShippingFee', Number(v))} type="number" />
                </Field>
                <Field label="COD Surcharge (₹)">
                  <TextInput value={String(settings.codExtraFee)} onChange={(v) => update('codExtraFee', Number(v))} type="number" />
                </Field>
              </Grid>
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#16a34a' }}>
                Free shipping ≥ ₹{settings.freeShippingThreshold} · Standard ₹{settings.standardShippingFee} · COD +₹{settings.codExtraFee}
              </div>
            </SectionCard>
          )}

          {/* ── DISPATCH & RETURN HUB ── */}
          {activeSection === 'dispatchHub' && (
            <SectionCard icon={Package} title="Dispatch & Return Hub (Packing Slip / Invoices)">
              <Toggle
                checked={settings.dispatchHubEnabled}
                onChange={(v) => update('dispatchHubEnabled', v)}
                label="Include Dispatch Hub & Return Address on packing slips"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '-0.4rem 0 0.5rem' }}>
                When enabled, your warehouse address and carrier details appear automatically on generated packing slips and print views.
              </p>

              <Field label="Dispatch / Hub Name" hint="e.g. TEESINDIA Logistics Hub or Main Fulfillment Center">
                <TextInput
                  value={settings.dispatchHubName}
                  onChange={(v) => update('dispatchHubName', v)}
                  placeholder="e.g. TEESINDIA Logistics Hub"
                />
              </Field>

              <Grid>
                <Field label="Address Line 1" hint="Building, street, or industrial area">
                  <TextInput
                    value={settings.dispatchAddressLine1}
                    onChange={(v) => update('dispatchAddressLine1', v)}
                    placeholder="e.g. 102 Weavers Industrial Complex, 2nd Cross"
                  />
                </Field>
                <Field label="Address Line 2 (Optional)" hint="Suite, cross, or landmark">
                  <TextInput
                    value={settings.dispatchAddressLine2}
                    onChange={(v) => update('dispatchAddressLine2', v)}
                    placeholder="e.g. Electronic City Ph-1"
                  />
                </Field>
              </Grid>

              <Grid cols={3}>
                <Field label="City">
                  <TextInput
                    value={settings.dispatchCity}
                    onChange={(v) => update('dispatchCity', v)}
                    placeholder="e.g. Bangalore"
                  />
                </Field>
                <Field label="State">
                  <TextInput
                    value={settings.dispatchState}
                    onChange={(v) => update('dispatchState', v)}
                    placeholder="e.g. KA"
                  />
                </Field>
                <Field label="Pincode / Postal Code">
                  <TextInput
                    value={settings.dispatchPincode}
                    onChange={(v) => update('dispatchPincode', v)}
                    placeholder="e.g. 560100"
                  />
                </Field>
              </Grid>

              <Grid cols={3}>
                <Field label="GSTIN / Tax ID" hint="Printed on packing slips & invoices">
                  <TextInput
                    value={settings.dispatchGst}
                    onChange={(v) => update('dispatchGst', v)}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                  />
                </Field>
                <Field label="Dispatch Helpline / Phone">
                  <TextInput
                    value={settings.dispatchSupportPhone}
                    onChange={(v) => update('dispatchSupportPhone', v)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </Field>
                <Field label="Support Email">
                  <TextInput
                    value={settings.dispatchSupportEmail}
                    onChange={(v) => update('dispatchSupportEmail', v)}
                    placeholder="e.g. support@teesindia.com"
                  />
                </Field>
              </Grid>

              <Field label="Default Shipping Carrier" hint="e.g. Express Surface, Blue Dart, Delhivery">
                <TextInput
                  value={settings.dispatchCarrier}
                  onChange={(v) => update('dispatchCarrier', v)}
                  placeholder="e.g. Express Surface"
                />
              </Field>

              {/* Live Preview Card */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                  Packing Slip Return Address Preview:
                </p>
                {settings.dispatchHubEnabled ? (
                  <div style={{ fontSize: '0.85rem', color: '#111827', lineHeight: 1.5 }}>
                    <strong>{settings.dispatchHubName || 'Logistics Hub'}</strong>
                    {settings.dispatchAddressLine1 && <div>{settings.dispatchAddressLine1}</div>}
                    {settings.dispatchAddressLine2 && <div>{settings.dispatchAddressLine2}</div>}
                    {(settings.dispatchCity || settings.dispatchState || settings.dispatchPincode) && (
                      <div>
                        {[settings.dispatchCity, settings.dispatchState].filter(Boolean).join(', ')}
                        {settings.dispatchPincode ? ` — ${settings.dispatchPincode}` : ''}
                      </div>
                    )}
                    {(settings.dispatchSupportEmail || settings.dispatchSupportPhone || settings.dispatchCarrier) && (
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        {[
                          settings.dispatchSupportEmail && `Email: ${settings.dispatchSupportEmail}`,
                          settings.dispatchSupportPhone && `Phone: ${settings.dispatchSupportPhone}`,
                          settings.dispatchCarrier && `Carrier: ${settings.dispatchCarrier}`,
                        ].filter(Boolean).join(' | ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                    Disabled — Only customer deliver-to address will be shown on packing slips.
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {/* ── SEO ── */}
          {activeSection === 'seo' && (
            <SectionCard icon={Globe} title="SEO & Meta Tags">
              <Field label="Page Title">
                <TextInput value={settings.metaTitle} onChange={(v) => update('metaTitle', v)} />
                <span style={{ fontSize: '0.7rem', color: settings.metaTitle.length > 60 ? '#dc2626' : '#9ca3af', marginTop: '0.2rem', display: 'block' }}>{settings.metaTitle.length}/60 chars</span>
              </Field>
              <Field label="Meta Description">
                <TextArea value={settings.metaDescription} onChange={(v) => update('metaDescription', v)} rows={3} />
                <span style={{ fontSize: '0.7rem', color: settings.metaDescription.length > 160 ? '#dc2626' : '#9ca3af', marginTop: '0.2rem', display: 'block' }}>{settings.metaDescription.length}/160 chars</span>
              </Field>
              <ImageUpload label="OG / Social Share Image" value={settings.ogImageUrl} onChange={(v) => update('ogImageUrl', v)} hint="1200×630px recommended for social sharing" />
              {/* Google snippet preview */}
              <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>Search Snippet Preview:</p>
                <p style={{ color: '#1558d6', fontSize: '1rem', margin: '0 0 0.1rem', textDecoration: 'underline' }}>{settings.metaTitle || 'Page Title'}</p>
                <p style={{ color: '#006621', fontSize: '0.8rem', margin: '0 0 0.1rem' }}>teesindia.in</p>
                <p style={{ color: '#545454', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{settings.metaDescription || 'Meta description...'}</p>
              </div>
            </SectionCard>
          )}

          {/* ── SOCIAL ── */}
          {activeSection === 'social' && (
            <SectionCard icon={Share2} title="Social Links">
              <Field label="Instagram URL"><TextInput value={settings.instagramUrl} onChange={(v) => update('instagramUrl', v)} type="url" /></Field>
              <Field label="YouTube URL"><TextInput value={settings.youtubeUrl} onChange={(v) => update('youtubeUrl', v)} type="url" /></Field>
              <Field label="Twitter / X URL"><TextInput value={settings.twitterUrl} onChange={(v) => update('twitterUrl', v)} type="url" /></Field>
            </SectionCard>
          )}

          {/* ── PROMOTIONS ── */}
          {activeSection === 'promotions' && (
            <SectionCard icon={Megaphone} title="Welcome Popup">
              <Toggle checked={settings.welcomePopupActive} onChange={(v) => update('welcomePopupActive', v)} label="Enable Welcome Popup for new visitors" />
              <Grid>
                <Field label="Popup Delay (seconds)">
                  <TextInput value={String(settings.welcomePopupDelay)} onChange={(v) => update('welcomePopupDelay', Number(v))} type="number" />
                </Field>
                <Field label="Discount Code">
                  <TextInput value={settings.welcomePopupCode} onChange={(v) => update('welcomePopupCode', v)} />
                </Field>
              </Grid>
              <Field label="Offer Description">
                <TextInput value={settings.welcomePopupDiscount} onChange={(v) => update('welcomePopupDiscount', v)} />
              </Field>
              {settings.welcomePopupActive && (
                <div style={{ padding: '1.5rem', background: '#111827', borderRadius: '12px', textAlign: 'center', color: '#ffffff' }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A96E', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Welcome Offer</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{settings.welcomePopupDiscount}</p>
                  <div style={{ background: '#C9A96E', color: '#000', padding: '0.35rem 1rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.9rem' }}>{settings.welcomePopupCode}</div>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>Shows after {settings.welcomePopupDelay}s</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Save reminder */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0 }}>💡 Changes are not applied until you <strong>Save & Apply</strong></p>
            <button onClick={handleSave} disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#111827', color: '#ffffff', border: 'none', padding: '0.45rem 0.875rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <Save size={13} /> {isSaving ? 'Saving...' : 'Save & Apply'}
            </button>
          </div>

        </div>

        {/* ═══════════ LIVE PREVIEW PANEL ═══════════ */}
        {previewVisible && (
          <div style={{ position: 'sticky', top: '1rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
            {/* Preview toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', background: '#111', borderBottom: '1px solid #333', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Traffic lights */}
                {['#ff5f57', '#ffbd2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, margin: '0 0.75rem' }}>
                <div style={{ background: '#2a2a2a', borderRadius: '4px', padding: '0.25rem 0.75rem', fontSize: '0.7rem', color: '#888', textAlign: 'center', letterSpacing: '0.02em' }}>
                  localhost:3000 — Live Preview
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => setPreviewDevice('desktop')}
                  style={{ background: previewDevice === 'desktop' ? '#333' : 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px', color: previewDevice === 'desktop' ? '#fff' : '#666' }}
                  title="Desktop preview"
                >
                  <Monitor size={14} />
                </button>
                <button onClick={() => setPreviewDevice('mobile')}
                  style={{ background: previewDevice === 'mobile' ? '#333' : 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px', color: previewDevice === 'mobile' ? '#fff' : '#666' }}
                  title="Mobile preview"
                >
                  <Smartphone size={14} />
                </button>
                <button onClick={() => setPreviewVisible(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '0.3rem', borderRadius: '4px' }}
                  title="Hide preview"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* iframe wrapper */}
            <div style={{ flex: 1, display: 'flex', alignItems: previewDevice === 'mobile' ? 'flex-start' : 'stretch', justifyContent: 'center', overflow: 'hidden', background: previewDevice === 'mobile' ? '#2a2a2a' : 'transparent', padding: previewDevice === 'mobile' ? '1rem 0.5rem' : '0' }}>
              <div style={{
                width: previewDevice === 'mobile' ? '390px' : '100%',
                height: previewDevice === 'mobile' ? '80%' : '100%',
                borderRadius: previewDevice === 'mobile' ? '16px' : '0',
                overflow: 'hidden',
                border: previewDevice === 'mobile' ? '3px solid #444' : 'none',
                flexShrink: 0,
              }}>
                <iframe
                  ref={iframeRef}
                  src="/"
                  onLoad={handleIframeLoad}
                  style={{
                    width: previewDevice === 'mobile' ? '100%' : '150%',
                    height: previewDevice === 'mobile' ? '100%' : '150%',
                    border: 'none',
                    transform: previewDevice === 'desktop' ? 'scale(0.667)' : 'none',
                    transformOrigin: '0 0',
                    pointerEvents: 'auto',
                  }}
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Show preview button when hidden */}
      {!previewVisible && (
        <button
          onClick={() => setPreviewVisible(true)}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#111827', color: '#ffffff', border: 'none',
            padding: '0.75rem 1.25rem', borderRadius: '9999px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            zIndex: 100,
          }}
        >
          <Monitor size={16} /> Show Preview
        </button>
      )}
    </AdminLayout>
  );
}
