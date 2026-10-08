'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore, StoreSettings } from '@/lib/settingsStore';
import SuspendedScreen from './SuspendedScreen';

/** How often to silently re-fetch settings from the server in the background (ms) */
const BACKGROUND_REFRESH_MS = 60_000;

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { fetchSettings, settings, setSettings, isSuspended, suspensionMessage } = useSettingsStore();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFontRef = useRef<string>('');

  // ── 1 & 3: Initial fetch + periodic background refresh ───────────────────────
  useEffect(() => {
    // Fetch immediately on mount (background — Zustand defaults already render)
    fetchSettings();

    // Periodic refresh: silently re-pull settings every 60s
    // This keeps long-lived tabs (open browser tabs) consistent with admin changes
    refreshTimerRef.current = setInterval(() => {
      fetchSettings();
    }, BACKGROUND_REFRESH_MS);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchSettings]);

  // ── 4: Live Preview — admin settings iframe postMessage ──────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'TEESINDIA_PREVIEW_SETTINGS') {
        const previewSettings = event.data.settings as StoreSettings;
        setSettings(previewSettings);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSettings]);

  // ── 5: CSS custom properties injection ───────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', settings.primaryColor);
    root.style.setProperty('--brand-accent', settings.accentColor);
    root.style.setProperty('--brand-bg', settings.bgColor);
    root.style.setProperty('--brand-text', settings.textColor);
    const br = settings.buttonStyle === 'rounded' ? '8px'
             : settings.buttonStyle === 'pill'    ? '9999px'
             : '2px';
    root.style.setProperty('--brand-btn-radius', br);
  }, [settings.primaryColor, settings.accentColor, settings.bgColor, settings.textColor, settings.buttonStyle]);

  // ── 6: Dynamic Google Fonts loading ──────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const heading = settings.headingFont || 'Playfair Display';
    const body    = settings.bodyFont    || 'Inter';
    const fontKey = `${heading}|${body}`;

    // Only inject a new <link> if fonts actually changed
    if (fontKey === lastFontRef.current) return;
    lastFontRef.current = fontKey;

    // Remove any previously injected font link
    const existing = document.getElementById('dynamic-google-fonts');
    if (existing) existing.remove();

    const families = [heading, body]
      .filter((f, i, arr) => arr.indexOf(f) === i) // dedupe
      .map(f => encodeURIComponent(f) + ':wght@400;500;600;700;800')
      .join('&family=');

    const link = document.createElement('link');
    link.id = 'dynamic-google-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    document.head.appendChild(link);
  }, [settings.headingFont, settings.bodyFont]);

  // ── 7: Dynamic favicon ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined' || !settings.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }, [settings.faviconUrl]);

  // ── 8: SEO document title ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (settings.metaTitle) {
      document.title = settings.metaTitle;
    }
  }, [settings.metaTitle]);

  // ── Direct frontend killswitch check (if configured in frontend env) ───────
  useEffect(() => {
    const publicUrl = process.env.NEXT_PUBLIC_KILL_SWITCH_URL?.trim();
    if (publicUrl) {
      fetch(publicUrl, { cache: 'no-store' })
        .then((r) => r.text())
        .then((text) => {
          if (text.trim() !== 'ACTIVE') {
            useSettingsStore.getState().setSuspended(true, 'This application has been suspended. Please contact NotfoundAi team');
          }
        })
        .catch(() => {
          useSettingsStore.getState().setSuspended(true, 'This application has been suspended. Please contact NotfoundAi team');
        });
    }
  }, []);

  if (isSuspended) {
    return <SuspendedScreen message={suspensionMessage} />;
  }

  return <>{children}</>;
}
