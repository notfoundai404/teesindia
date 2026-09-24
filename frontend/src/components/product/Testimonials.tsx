'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';

const AUTO_ADVANCE_MS = 6000;

export default function Testimonials() {
  const { settings } = useSettingsStore();
  const testimonials = settings.testimonials?.length ? settings.testimonials : [];

  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = testimonials.length;

  const navigate = useCallback((dir: 1 | -1) => {
    if (isTransitioning || total === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(i => (i + dir + total) % total);
      setIsTransitioning(false);
    }, 250);
  }, [isTransitioning, total]);

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (total <= 1) return;
    intervalRef.current = setInterval(() => navigate(1), AUTO_ADVANCE_MS);
  }, [navigate, total]);

  useEffect(() => {
    startAutoAdvance();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoAdvance]);

  if (total === 0) {
    return null;
  }

  const handleManualNav = (dir: 1 | -1) => {
    navigate(dir);
    startAutoAdvance();
  };

  const safeIndex = current >= total ? 0 : current;
  const testimonial = testimonials[safeIndex];
  const quote = (testimonial as any).text || (testimonial as any).quote || '';
  const image = (testimonial as any).imageUrl || (testimonial as any).image;

  return (
    <section
      aria-labelledby="testimonials-heading"
      style={{
        background: '#ffffff',
        padding: '5rem 0',
        overflow: 'hidden',
        borderTop: '1px solid #f3f4f6',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <div className="container">
        {/* Header - Perfectly Centered */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--accent-dark, #a07f45)',
              marginBottom: '0.75rem',
            }}
          >
            Real Reviews
          </p>
          <h2
            id="testimonials-heading"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#0a0a0a',
            }}
          >
            WHAT THEY SAY
          </h2>
        </div>

        {/* Carousel Container - Centered */}
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            position: 'relative',
          }}
          onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
          onMouseLeave={startAutoAdvance}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Centered Testimonial Card */}
          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(8px) scale(0.99)' : 'translateY(0) scale(1)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative Quote Mark */}
            <div
              style={{
                position: 'absolute',
                top: '1.25rem',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(201, 169, 110, 0.12)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <Quote size={60} />
            </div>

            {/* Optional Image */}
            {image && (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.25rem',
                  border: '2px solid var(--accent-color, #C9A96E)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  position: 'relative',
                  zIndex: 1,
                }}
                aria-hidden="true"
              >
                <img
                  src={image}
                  alt={testimonial.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Stars - Centered */}
            <div
              style={{
                display: 'flex',
                gap: 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '1.5rem',
                position: 'relative',
                zIndex: 1,
              }}
              aria-label={`${testimonial.rating || 5} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < (testimonial.rating || 5) ? 'var(--accent-color, #C9A96E)' : 'transparent'}
                  color={i < (testimonial.rating || 5) ? 'var(--accent-color, #C9A96E)' : '#d1d5db'}
                />
              ))}
            </div>

            {/* Quote - Centered */}
            <blockquote style={{ position: 'relative', zIndex: 1, margin: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: '#111827',
                  maxWidth: '680px',
                  margin: '0 auto 1.75rem',
                  letterSpacing: '-0.01em',
                  textAlign: 'center',
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author Footer - Centered */}
              <footer style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#0a0a0a',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: (testimonial as any).location ? '0.2rem' : '0',
                  }}
                >
                  {testimonial.name}
                </p>

                {(testimonial as any).location && (
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.2rem' }}>
                    {(testimonial as any).location}
                  </p>
                )}
              </footer>
            </blockquote>
          </div>

          {/* Navigation Controls - Centered below card */}
          {total > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                marginTop: '1.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => handleManualNav(-1)}
                aria-label="Previous testimonial"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#111827';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Progress Dots */}
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i !== safeIndex && !isTransitioning) {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrent(i);
                          setIsTransitioning(false);
                        }, 250);
                        startAutoAdvance();
                      }
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === safeIndex}
                    style={{
                      width: i === safeIndex ? 24 : 7,
                      height: 7,
                      borderRadius: 4,
                      background: i === safeIndex ? 'var(--accent-color, #C9A96E)' : '#d1d5db',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleManualNav(1)}
                aria-label="Next testimonial"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#111827';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
