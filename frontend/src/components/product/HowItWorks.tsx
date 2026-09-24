'use client';

import { useEffect, useRef, useState } from 'react';
import { Palette, Type, Eye, Truck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Palette,
    title: 'Choose a Design',
    description: 'Browse our curated presets or start with a blank canvas. Each design is crafted for maximum visual impact on fabric.',
  },
  {
    number: '02',
    icon: Type,
    title: 'Add Your Text',
    description: 'Type your phrase or link a URL for a scannable QR code. Your words, your font, your colour — all rendered live.',
  },
  {
    number: '03',
    icon: Eye,
    title: 'Preview It Live',
    description: 'Watch every change reflect on the garment in real time. Switch angles, try colour ways, and confirm before you commit.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'We Print and Ship',
    description: 'Your design goes to our print studio within hours. Premium DTG printing, dispatched within 2–5 business days across India.',
  },
];

export default function HowItWorks() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(Array(STEPS.length).fill(false));

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Staggered: each step delayed by 150ms
            setTimeout(() => {
              setVisible(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 150);
            obs.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section
      aria-labelledby="how-it-works-heading"
      style={{
        background: 'var(--black-soft)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '6rem 0',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--accent-color)',
              marginBottom: '1rem',
            }}
          >
            The Process
          </p>
          <h2
            id="how-it-works-heading"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'var(--white)',
              marginBottom: '0.75rem',
            }}
          >
            HOW IT WORKS
          </h2>
          <p style={{ color: 'var(--grey-400)', fontSize: '1rem', maxWidth: 460, margin: '0 auto' }}>
            From concept to doorstep in four seamless steps.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-grid">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                ref={el => { stepRefs.current[i] = el; }}
                className="hiw-step"
                style={{
                  opacity: visible[i] ? 1 : 0,
                  transform: visible[i] ? 'translateY(0)' : 'translateY(32px)',
                  transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
                }}
              >
                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <div className="hiw-connector" aria-hidden="true" />
                )}

                {/* Number */}
                <div className="hiw-number" aria-hidden="true">{step.number}</div>

                {/* Icon */}
                <div className="hiw-icon-wrap" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="hiw-title">{step.title}</h3>
                <p className="hiw-desc">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
