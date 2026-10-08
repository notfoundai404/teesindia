'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface SuspendedScreenProps {
  message?: string;
}

export default function SuspendedScreen({
  message = 'This application has been suspended. Please contact NotfoundAi team',
}: SuspendedScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#09090b',
        color: '#f4f4f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        userSelect: 'none',
      }}
    >
      {/* Background ambient red glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          background: '#121217',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(239, 68, 68, 0.08)',
        }}
      >
        {/* Brand Logo */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.svg"
            alt="TEESINDIA"
            style={{
              height: '38px',
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              opacity: 0.9,
            }}
          />
        </div>

        {/* Warning Icon Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldAlert size={32} strokeWidth={2} />
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f87171',
            }}
          >
            <AlertTriangle size={12} />
            HTTP 503 • Service Suspended
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            margin: '0 0 1rem 0',
          }}
        >
          Application Suspended
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#a1a1aa',
            margin: '0 0 2rem 0',
          }}
        >
          {message}
        </p>

        {/* Divider & Footer note */}
        <div
          style={{
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            color: '#71717a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Security Lockdown</span>
          <span style={{ color: '#d4d4d8', fontWeight: 600 }}>NotfoundAi Security</span>
        </div>
      </div>
    </div>
  );
}
