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
  { id: 'collections',  label: 'Collections',          icon: Layout },
  { id: 'customizer',   label: 'Customize Your Own',   icon: Shirt },
  { id: 'marquee',      label: 'Marquee Strip',        icon: Zap },
  { id: 'sections',     label: 'Sections Visibility',  icon: Eye },
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

          {/* ── COLLECTIONS ── */}
          {activeSection === 'collections' && (
            <SectionCard icon={Layout} title="Collections Grid">
              {settings.collections.map((col, i) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Collection {i + 1}</span>
                    <button onClick={() => { const n = [...settings.collections]; n.splice(i, 1); update('collections', n); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Field label="Label">
                      <TextInput value={col.label} onChange={(v) => { const n = [...settings.collections]; n[i] = { ...n[i], label: v }; update('collections', n); }} />
                    </Field>
                    <Field label="Link">
                      <TextInput value={col.href} onChange={(v) => { const n = [...settings.collections]; n[i] = { ...n[i], href: v }; update('collections', n); }} />
                    </Field>
                    <Field label="Tagline">
                      <TextInput value={col.tagline} onChange={(v) => { const n = [...settings.collections]; n[i] = { ...n[i], tagline: v }; update('collections', n); }} />
                    </Field>
                    <Field label="Image URL">
                      <TextInput value={col.imageUrl} onChange={(v) => { const n = [...settings.collections]; n[i] = { ...n[i], imageUrl: v }; update('collections', n); }} placeholder="https://..." />
                    </Field>
                  </div>
                </div>
              ))}
              <button onClick={() => update('collections', [...settings.collections, { label: 'New Collection', href: '/shop', tagline: 'Shop now', imageUrl: '', order: settings.collections.length }])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '2px dashed #d1d5db', borderRadius: '8px', background: '#ffffff', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 500, width: '100%', justifyContent: 'center' }}
              >
                <Plus size={15} /> Add Collection
              </button>
            </SectionCard>
          )}

          {/* ── CUSTOMIZE YOUR OWN ── */}
          {activeSection === 'customizer' && (
            <SectionCard icon={Shirt} title="Customize Your Own Studio Settings">
              {/* Enable toggle */}
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.2rem' }}>Enable Live Customizer Studio</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Show or hide the interactive t-shirt customizer on the storefront homepage</p>
                </div>
                <Toggle checked={settings.customizerEnabled !== false} onChange={(v) => update('customizerEnabled', v)} label="" />
              </div>

              {/* Headings & Pricing */}
              <Grid cols={2}>
                <Field label="Section Heading">
                  <TextInput value={settings.customizerHeading || ''} onChange={(v) => update('customizerHeading', v)} placeholder="CUSTOMIZE YOUR OWN" />
                </Field>
                <Field label="Section Subheading">
                  <TextInput value={settings.customizerSubheading || ''} onChange={(v) => update('customizerSubheading', v)} placeholder="Select · Personalise · Order" />
                </Field>
              </Grid>

              <Grid cols={3}>
                <Field label="Price (₹)">
                  <TextInput value={String(settings.customizerPrice || 1299)} onChange={(v) => update('customizerPrice', Number(v))} type="number" />
                </Field>
                <Field label="Original Strikethrough Price (₹)">
                  <TextInput value={String(settings.customizerOrigPrice || 1799)} onChange={(v) => update('customizerOrigPrice', Number(v))} type="number" />
                </Field>
                <Field label="Max Custom Characters">
                  <TextInput value={String(settings.customizerMaxChars || 28)} onChange={(v) => update('customizerMaxChars', Number(v))} type="number" />
                </Field>
              </Grid>

              <Field label="Available Garment Sizes" hint="Comma-separated (e.g. XS, S, M, L, XL, XXL)">
                <TextInput
                  value={(settings.customizerSizes || []).join(', ')}
                  onChange={(v) => update('customizerSizes', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="XS, S, M, L, XL, XXL"
                />
              </Field>

              {/* Studio Feature Toggles */}
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Interactive Customizer Features
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', display: 'block' }}>Custom Text Input</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Let customers type their own phrase</span>
                    </div>
                    <Toggle checked={settings.customizerAllowCustomText !== false} onChange={(v) => update('customizerAllowCustomText', v)} label="" />
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', display: 'block' }}>Font Selection</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Allow choosing custom typography</span>
                    </div>
                    <Toggle checked={settings.customizerAllowFontSelection !== false} onChange={(v) => update('customizerAllowFontSelection', v)} label="" />
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', display: 'block' }}>Artwork / Image Upload</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Customer can upload custom graphics</span>
                    </div>
                    <Toggle checked={settings.customizerAllowImageUpload !== false} onChange={(v) => update('customizerAllowImageUpload', v)} label="" />
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', display: 'block' }}>Print Color Palette</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Allow custom text/print color</span>
                    </div>
                    <Toggle checked={settings.customizerAllowPrintColor !== false} onChange={(v) => update('customizerAllowPrintColor', v)} label="" />
                  </div>
                </div>
              </div>

              {/* Live Admin Studio Mockup Preview Card */}
              {(() => {
                const currentDesigns = (settings.customizerDesigns && settings.customizerDesigns.length > 0)
                  ? settings.customizerDesigns
                  : (settings.customizerPhrases && settings.customizerPhrases.length > 0)
                  ? settings.customizerPhrases.map((phrase, i) => ({
                      id: `d-${i + 1}`,
                      text: phrase,
                      font: i === 0 ? 'Space Grotesk' : i === 1 ? 'Bebas Neue' : i === 2 ? 'Rubik Glitch' : i === 3 ? 'UnifrakturMaguntia' : 'Permanent Marker',
                      printColor: 'auto',
                      imageUrl: '',
                    }))
                  : DEFAULT_SETTINGS.customizerDesigns;

                const safeIdx = Math.min(adminPreviewDesignIdx, currentDesigns.length - 1);
                const activeDesign = currentDesigns[safeIdx] || currentDesigns[0] || { text: 'WEAR YOUR STORY', font: 'Space Grotesk', printColor: 'auto' };
                const currentColorObj = (settings.customizerGarmentColors || []).find(c => c.id === adminPreviewColorId) || (settings.customizerGarmentColors || [])[0] || { hex: '#0d0d0d', textColor: '#ffffff', label: 'Black' };

                return (
                  <div style={{
                    marginTop: '1rem',
                    background: '#0f172a',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    color: '#ffffff',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <AdminTShirtPreview
                        text={activeDesign.text}
                        font={activeDesign.font || 'Space Grotesk'}
                        colorHex={currentColorObj.hex}
                        textColor={currentColorObj.textColor}
                        printColor={activeDesign.printColor}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(201,169,110,0.2)', color: '#C9A96E', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Live Admin Mockup Preview
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Design #{safeIdx + 1}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                          {activeDesign.text}
                        </h4>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                          Typography: <span style={{ color: '#C9A96E', fontWeight: 700 }}>{activeDesign.font || 'Space Grotesk'}</span> <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>({getStudioFontConfig(activeDesign.font).badge})</span>
                        </p>

                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                            Test Garment Color: {currentColorObj.label}
                          </span>
                          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                            {(settings.customizerGarmentColors || []).map((col) => (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => setAdminPreviewColorId(col.id)}
                                title={col.label}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: col.hex,
                                  border: adminPreviewColorId === col.id ? '2px solid #C9A96E' : '1px solid rgba(255,255,255,0.2)',
                                  transform: adminPreviewColorId === col.id ? 'scale(1.2)' : 'scale(1)',
                                  boxShadow: adminPreviewColorId === col.id ? '0 0 0 2px rgba(201,169,110,0.3)' : 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: 240, lineHeight: 1.5, background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={13} color="#C9A96E" /> Storefront Curated Mode
                      </p>
                      Customers on the storefront simply choose from these curated designs and cool fonts you configure below.
                    </div>
                  </div>
                );
              })()}

              {/* Design Phrases & Typography Manager */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Storefront Designs & Typography ({((settings.customizerDesigns && settings.customizerDesigns.length > 0) ? settings.customizerDesigns : DEFAULT_SETTINGS.customizerDesigns).length})
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0.2rem 0 0' }}>
                      Curate the exact slogan phrases and cool typography displayed on t-shirts on the storefront.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [
                        ...((settings.customizerDesigns && settings.customizerDesigns.length > 0)
                          ? settings.customizerDesigns
                          : DEFAULT_SETTINGS.customizerDesigns),
                      ];
                      list.push({
                        id: `d-${Date.now()}`,
                        text: 'NEW SLOGAN',
                        font: 'UnifrakturMaguntia',
                        printColor: 'auto',
                        imageUrl: '',
                      });
                      setSettings((prev) => {
                        const next = {
                          ...prev,
                          customizerDesigns: list,
                          customizerPhrases: list.map((d) => d.text),
                        };
                        sendPreview(next);
                        return next;
                      });
                      setAdminPreviewDesignIdx(list.length - 1);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.45rem 0.85rem', borderRadius: '6px', background: '#111827',
                      color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} /> Add Slogan Design
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(() => {
                    const list = (settings.customizerDesigns && settings.customizerDesigns.length > 0)
                      ? settings.customizerDesigns
                      : DEFAULT_SETTINGS.customizerDesigns;

                    const updateDesignItem = (idx: number, patch: Partial<{ text: string; font: string; printColor: string }>) => {
                      const updated = [...list];
                      updated[idx] = { ...updated[idx], ...patch };
                      setSettings((prev) => {
                        const next = {
                          ...prev,
                          customizerDesigns: updated,
                          customizerPhrases: updated.map((d) => d.text),
                        };
                        sendPreview(next);
                        return next;
                      });
                    };

                    return list.map((design, idx) => {
                      const fontCfg = getStudioFontConfig(design.font);
                      const isPreviewActive = adminPreviewDesignIdx === idx;

                      return (
                        <div
                          key={design.id || idx}
                          style={{
                            padding: '0.85rem',
                            background: isPreviewActive ? '#f8fafc' : '#ffffff',
                            border: `1.5px solid ${isPreviewActive ? '#111827' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                            boxShadow: isPreviewActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', width: 24 }}>#{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setAdminPreviewDesignIdx(idx)}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 4,
                                  background: isPreviewActive ? '#111827' : '#f3f4f6',
                                  color: isPreviewActive ? '#ffffff' : '#4b5563',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                {isPreviewActive ? '★ Previewing on Shirt' : 'Preview on Shirt'}
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const updated = [...list];
                                  const temp = updated[idx - 1];
                                  updated[idx - 1] = updated[idx];
                                  updated[idx] = temp;
                                  setSettings((prev) => {
                                    const next = { ...prev, customizerDesigns: updated, customizerPhrases: updated.map(d => d.text) };
                                    sendPreview(next);
                                    return next;
                                  });
                                  if (adminPreviewDesignIdx === idx) setAdminPreviewDesignIdx(idx - 1);
                                }}
                                style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#d1d5db' : '#6b7280', padding: 3 }}
                                title="Move Up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === list.length - 1}
                                onClick={() => {
                                  if (idx >= list.length - 1) return;
                                  const updated = [...list];
                                  const temp = updated[idx + 1];
                                  updated[idx + 1] = updated[idx];
                                  updated[idx] = temp;
                                  setSettings((prev) => {
                                    const next = { ...prev, customizerDesigns: updated, customizerPhrases: updated.map(d => d.text) };
                                    sendPreview(next);
                                    return next;
                                  });
                                  if (adminPreviewDesignIdx === idx) setAdminPreviewDesignIdx(idx + 1);
                                }}
                                style={{ background: 'none', border: 'none', cursor: idx === list.length - 1 ? 'default' : 'pointer', color: idx === list.length - 1 ? '#d1d5db' : '#6b7280', padding: 3 }}
                                title="Move Down"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_, i) => i !== idx);
                                  setSettings((prev) => {
                                    const next = { ...prev, customizerDesigns: updated, customizerPhrases: updated.map(d => d.text) };
                                    sendPreview(next);
                                    return next;
                                  });
                                  if (adminPreviewDesignIdx >= updated.length) setAdminPreviewDesignIdx(Math.max(0, updated.length - 1));
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 3 }}
                                title="Delete Design"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                            {/* Text Input */}
                            <div>
                              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Slogan Text
                              </label>
                              <input
                                type="text"
                                value={design.text}
                                onChange={(e) => updateDesignItem(idx, { text: e.target.value.toUpperCase() })}
                                style={{
                                  width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #d1d5db',
                                  borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700,
                                  color: '#111827', letterSpacing: '0.05em', textTransform: 'uppercase',
                                }}
                              />
                            </div>

                            {/* Font Selector */}
                            <div>
                              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Font / Typography Family
                              </label>
                              <select
                                value={design.font || 'Space Grotesk'}
                                onChange={(e) => updateDesignItem(idx, { font: e.target.value })}
                                style={{
                                  width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #d1d5db',
                                  borderRadius: '6px', fontSize: '0.82rem', color: '#111827', background: '#ffffff',
                                  fontWeight: 600,
                                }}
                              >
                                {COOL_FONTS.map((f) => (
                                  <option key={f.name} value={f.name}>
                                    {f.badge} — {f.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Print Color */}
                            <div style={{ maxWidth: 160 }}>
                              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Print Color
                              </label>
                              <select
                                value={design.printColor || 'auto'}
                                onChange={(e) => updateDesignItem(idx, { printColor: e.target.value })}
                                style={{
                                  width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #d1d5db',
                                  borderRadius: '6px', fontSize: '0.82rem', color: '#111827', background: '#ffffff',
                                }}
                              >
                                <option value="auto">Auto Contrast</option>
                                <option value="#ffffff">White</option>
                                <option value="#111111">Black</option>
                                <option value="#C9A96E">Gold / Accent</option>
                              </select>
                            </div>
                          </div>

                          {/* Live Font Render Strip inside card */}
                          <div style={{
                            padding: '0.55rem 0.85rem',
                            background: '#0a0a0a',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            overflow: 'hidden',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                              <span style={{
                                fontSize: '0.62rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(201,169,110,0.2)',
                                color: '#C9A96E',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}>
                                {fontCfg.badge}
                              </span>
                              <span style={{
                                fontFamily: `'${design.font || 'Space Grotesk'}', sans-serif`,
                                fontSize: '1rem',
                                fontWeight: fontCfg.weight || 800,
                                color: design.printColor && design.printColor !== 'auto' ? design.printColor : '#ffffff',
                                letterSpacing: fontCfg.letterSpacing || '0.08em',
                                textTransform: fontCfg.textTransform || 'uppercase',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}>
                                {design.text || 'PREVIEW TEXT'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                              {design.font || 'Space Grotesk'}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>


              {/* Garment Colors Manager */}
              <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Garment Color Palette ({(settings.customizerGarmentColors || []).length})
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0.2rem 0 0' }}>
                      Available blank t-shirt colors with hex values and contrast text color
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const colors = [...(settings.customizerGarmentColors || [])];
                      colors.push({
                        id: `color-${Date.now()}`,
                        label: 'New Color',
                        hex: '#8b5cf6',
                        textColor: '#ffffff',
                      });
                      update('customizerGarmentColors', colors);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#111827',
                      color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} /> Add Color
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {(settings.customizerGarmentColors || []).map((col, idx) => (
                    <div
                      key={col.id || idx}
                      style={{
                        padding: '0.85rem', background: '#f9fafb',
                        border: '1px solid #e5e7eb', borderRadius: '8px',
                        display: 'flex', flexDirection: 'column', gap: '0.6rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: col.hex, border: '1px solid rgba(0,0,0,0.15)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{col.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const colors = [...(settings.customizerGarmentColors || [])];
                            colors.splice(idx, 1);
                            update('customizerGarmentColors', colors);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}
                          title="Delete Color"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: 2 }}>Color Name</label>
                          <input
                            type="text"
                            value={col.label}
                            onChange={(e) => {
                              const colors = [...(settings.customizerGarmentColors || [])];
                              colors[idx] = { ...colors[idx], label: e.target.value };
                              update('customizerGarmentColors', colors);
                            }}
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.78rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: 2 }}>Garment Hex</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="color"
                              value={col.hex}
                              onChange={(e) => {
                                const colors = [...(settings.customizerGarmentColors || [])];
                                colors[idx] = { ...colors[idx], hex: e.target.value };
                                update('customizerGarmentColors', colors);
                              }}
                              style={{ width: 28, height: 28, border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', padding: 1 }}
                            />
                            <input
                              type="text"
                              value={col.hex}
                              onChange={(e) => {
                                const colors = [...(settings.customizerGarmentColors || [])];
                                colors[idx] = { ...colors[idx], hex: e.target.value };
                                update('customizerGarmentColors', colors);
                              }}
                              style={{ width: 62, padding: '0.35rem 0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'monospace' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: 3 }}>Text Contrast Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const colors = [...(settings.customizerGarmentColors || [])];
                              colors[idx] = { ...colors[idx], textColor: '#ffffff' };
                              update('customizerGarmentColors', colors);
                            }}
                            style={{
                              flex: 1, padding: '0.35rem', borderRadius: 4,
                              background: col.textColor === '#ffffff' ? '#111827' : '#ffffff',
                              color: col.textColor === '#ffffff' ? '#ffffff' : '#374151',
                              border: `1px solid ${col.textColor === '#ffffff' ? '#111827' : '#d1d5db'}`,
                              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            White Text
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const colors = [...(settings.customizerGarmentColors || [])];
                              colors[idx] = { ...colors[idx], textColor: '#111111' };
                              update('customizerGarmentColors', colors);
                            }}
                            style={{
                              flex: 1, padding: '0.35rem', borderRadius: 4,
                              background: col.textColor !== '#ffffff' ? '#111827' : '#ffffff',
                              color: col.textColor !== '#ffffff' ? '#ffffff' : '#374151',
                              border: `1px solid ${col.textColor !== '#ffffff' ? '#111827' : '#d1d5db'}`,
                              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Dark Text
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Fonts Selection */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Curated Studio Typography Gallery ({COOL_FONTS.length} Cool Fonts)
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0.2rem 0 0' }}>
                      Streetwear, Gothic Blackletter, Cyberpunk, 8-Bit Pixel, Graffiti, and Luxury typography available in your studio
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => update('customizerFonts', DEFAULT_STUDIO_FONT_NAMES)}
                      style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: 4, background: '#111827', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => update('customizerFonts', [
                        'UnifrakturMaguntia', 'Pirata One', 'Rubik Glitch', 'Press Start 2P',
                        'Permanent Marker', 'Rock Salt', 'Space Grotesk', 'Bebas Neue', 'Bungee', 'Syne', 'Anton',
                      ])}
                      style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: 4, background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Streetwear & Gothic
                    </button>
                    <button
                      type="button"
                      onClick={() => update('customizerFonts', DEFAULT_STUDIO_FONT_NAMES)}
                      style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem' }}>
                  {COOL_FONTS.map((font) => {
                    const active = (settings.customizerFonts || []).includes(font.name);
                    return (
                      <div
                        key={font.name}
                        onClick={() => {
                          const current = [...(settings.customizerFonts || [])];
                          const next = active ? current.filter(f => f !== font.name) : [...current, font.name];
                          update('customizerFonts', next);
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: '0.4rem',
                          padding: '0.75rem', borderRadius: 8,
                          border: `1.5px solid ${active ? '#111827' : '#e5e7eb'}`,
                          background: active ? '#ffffff' : '#f9fafb',
                          boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: 4,
                            background: active ? 'rgba(201,169,110,0.2)' : '#e5e7eb',
                            color: active ? '#a07f45' : '#6b7280',
                          }}>
                            {font.badge}
                          </span>
                          <input type="checkbox" checked={active} readOnly style={{ accentColor: '#111827', pointerEvents: 'none' }} />
                        </div>

                        <div>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                            {font.label}
                          </p>
                          <p style={{
                            fontFamily: `'${font.name}', sans-serif`,
                            fontSize: '1.05rem',
                            fontWeight: font.weight || 800,
                            letterSpacing: font.letterSpacing || '0.08em',
                            textTransform: font.textTransform || 'uppercase',
                            color: active ? '#111827' : '#9ca3af',
                            margin: '0.35rem 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {font.sample}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
