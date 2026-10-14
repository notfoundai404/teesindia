'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore, StoreSettings } from '@/lib/settingsStore';
import SuspendedScreen from './SuspendedScreen';

/** How often to silently re-fetch settings from the server in the background (ms) */
const BACKGROUND_REFRESH_MS = 60_000;
const KILL_SWITCH_REFRESH_MS = 60_000;
const KILL_SWITCH_TIMEOUT_MS = 2_500;
const SUSPENDED_MESSAGE = 'This application has been suspended. Please contact NotfoundAi team';

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const {
    fetchSettings,
    settings,
    setSettings,
    loaded,
    loadError,
    isSuspended,
    suspensionMessage,
  } = useSettingsStore();
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

  // ── Direct frontend kill-switch check (if configured in frontend env) ───────
  useEffect(() => {
    const publicUrl = process.env.NEXT_PUBLIC_KILL_SWITCH_URL?.trim();
    if (!publicUrl) return;

    let active = true;
    let controller: AbortController | null = null;
    const checkKillSwitch = async () => {
      controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller?.abort(), KILL_SWITCH_TIMEOUT_MS);
      try {
        const response = await fetch(publicUrl, { cache: 'no-store', signal: controller.signal });
        const status = (await response.text()).trim();
        if (active) {
          if (response.ok && status === 'ACTIVE') {
            useSettingsStore.getState().setSuspended(false);
          } else {
            useSettingsStore.getState().setSuspended(true, SUSPENDED_MESSAGE);
          }
        }
      } catch {
        if (active) {
          useSettingsStore.getState().setSuspended(true, SUSPENDED_MESSAGE);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void checkKillSwitch();
    const intervalId = window.setInterval(() => {
      void checkKillSwitch();
    }, KILL_SWITCH_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      controller?.abort();
    };
  }, []);

  if (isSuspended) {
    return <SuspendedScreen message={suspensionMessage} />;
  }

  if (!loaded && loadError) {
    return (
      <main
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          color: '#111827',
          background: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Website temporarily unavailable</h1>
        <p style={{ maxWidth: '32rem', margin: 0, color: '#4b5563' }}>
          We’re having trouble connecting to the TEESINDIA store right now. The website may be temporarily down.
          Please try again in a few moments.
        </p>
        <button
          type="button"
          onClick={() => void fetchSettings()}
          style={{
            border: 0,
            borderRadius: '6px',
            padding: '0.7rem 1.1rem',
            color: '#ffffff',
            background: '#111827',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <>
      {loaded && loadError && (
        <div
          role="alert"
          style={{
            position: 'relative',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            color: '#7f1d1d',
            background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          <span>Could not refresh storefront settings. Showing the last successfully loaded settings. {loadError}</span>
          <button
            type="button"
            onClick={() => void fetchSettings()}
            style={{
              border: 0,
              padding: '0.25rem 0.5rem',
              color: '#7f1d1d',
              background: 'transparent',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
      {children}
    </>
  );
}
