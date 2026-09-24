'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';

interface CommunityImage {
  id: string;
  src: string;
  alt: string;
  author: string;
  tag?: string;
}

const COMMUNITY_IMAGES: CommunityImage[] = [
  {
    id: 'sunset_festival',
    src: '/community/sunset_festival.jpg',
    alt: 'Friends in oversized graphic tees at sunset music festival',
    author: '@aarav.vibe',
    tag: 'Festival State of Mind',
  },
  {
    id: 'dj_stage',
    src: '/community/dj_stage.jpg',
    alt: 'DJ performing in oversized Sound Wave streetwear tee',
    author: '@dj_rohan_live',
    tag: 'Sound Wave 2024',
  },
  {
    id: 'friends_selfie',
    src: '/community/friends_selfie.jpg',
    alt: 'Friends in green caps taking a selfie at event',
    author: '@maya_and_sim',
    tag: 'Drop Crew',
  },
  {
    id: 'qr_tees',
    src: '/community/qr_tees.jpg',
    alt: 'Friends at festival in Rave On streetwear tees scanning phone',
    author: '@aditya_rave',
    tag: 'Rave On Fest',
  },
  {
    id: 'black_tee',
    src: '/community/black_tee.jpg',
    alt: 'Urban Beat Fest graphic tee worn at night festival',
    author: '@tanya_rawat',
    tag: 'Urban Beat Fest',
  },
  {
    id: 'skateboard_guy',
    src: '/community/skateboard_guy.jpg',
    alt: 'Skater chilling on asphalt with skateboard in golden hour',
    author: '@kabir.skates',
    tag: 'Minimal Boxy Tee',
  },
  {
    id: 'subway_tee',
    src: '/community/subway_tee.jpg',
    alt: 'Commuter in subway wearing streetwear oversized tee',
    author: '@teesindia',
    tag: 'Streetwear Edition',
  },
];

export default function CommunitySection() {
  const { settings } = useSettingsStore();
  const instagramUrl = settings.instagramUrl || 'https://instagram.com/teesindia';
  const [activePhoto, setActivePhoto] = useState<CommunityImage | null>(null);

  // Use admin-uploaded community images if available, otherwise fallback to local placeholders
  const activeImages: CommunityImage[] = (settings.communityImages?.length >= 7)
    ? settings.communityImages as CommunityImage[]
    : COMMUNITY_IMAGES;

  return (
    <section
      aria-labelledby="community-heading"
      style={{ background: '#fff', overflow: 'hidden', padding: '2rem 1.5rem 2.5rem' }}
    >
      <style>{`
        .comm-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          gap: 10px;
          /* 4 columns: left-tall | center-a | center-b | right-tall */
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-template-rows: auto auto auto;
          grid-template-areas:
            "left  ca    cb    right"
            "left  head  head  right"
            "bot1  bot2  bot2  bot3";
        }

        .comm-left  { grid-area: left;  }
        .comm-ca    { grid-area: ca;    }
        .comm-cb    { grid-area: cb;    }
        .comm-right { grid-area: right; }
        .comm-head  { grid-area: head;  }
        .comm-bot1  { grid-area: bot1;  }
        .comm-bot2  { grid-area: bot2;  }
        .comm-bot3  { grid-area: bot3;  }

        .comm-photo {
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          background: #e5e7eb;
          position: relative;
        }

        .comm-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }

        .comm-photo:hover img {
          transform: scale(1.06);
        }

        /* Tall side cards */
        .comm-left,
        .comm-right {
          aspect-ratio: 2/3;
        }

        /* Top center landscape cards */
        .comm-ca,
        .comm-cb {
          aspect-ratio: 4/3;
        }

        /* Bottom cards */
        .comm-bot1,
        .comm-bot3 {
          aspect-ratio: 4/3;
        }

        .comm-bot2 {
          aspect-ratio: 4/3;
        }

        /* Center heading */
        .comm-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 1rem;
        }

        .comm-head h2 {
          font-size: clamp(1.6rem, 2.4vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #0a0a0a;
          text-transform: uppercase;
          line-height: 1.1;
          margin: 0 0 0.5rem;
        }

        .comm-head p {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b7280;
          margin: 0;
        }



        /* Mobile */
        @media (max-width: 768px) {
          .comm-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "left  right"
              "ca    cb"
              "head  head"
              "bot1  bot3"
              "bot2  bot2";
          }
          .comm-left,
          .comm-right  { aspect-ratio: 3/4; }
          .comm-bot2   { aspect-ratio: 16/7; }
        }
      `}</style>

      <div className="comm-grid">

        {/* Left tall */}
        <div className="comm-photo comm-left" onClick={() => setActivePhoto(activeImages[0])}>
          <img src={activeImages[0].src} alt={activeImages[0].alt} loading="lazy" />
        </div>

        {/* Center top-left */}
        <div className="comm-photo comm-ca" onClick={() => setActivePhoto(activeImages[1])}>
          <img src={activeImages[1].src} alt={activeImages[1].alt} loading="lazy" />
        </div>

        {/* Center top-right */}
        <div className="comm-photo comm-cb" onClick={() => setActivePhoto(activeImages[2])}>
          <img src={activeImages[2].src} alt={activeImages[2].alt} loading="lazy" />
        </div>

        {/* Right tall */}
        <div className="comm-photo comm-right" onClick={() => setActivePhoto(activeImages[3])}>
          <img src={activeImages[3].src} alt={activeImages[3].alt} loading="lazy" />
        </div>

        {/* Center heading */}
        <div className="comm-head">
          <h2 id="community-heading" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.communityHeading || 'OUR COMMUNITY'}
          </h2>
          <p>{settings.communitySubtext || 'TAG US ON YOUR SOCIALS TO BE FEATURED ON OUR PAGE'}</p>
        </div>

        {/* Bottom row */}
        <div className="comm-photo comm-bot1" onClick={() => setActivePhoto(activeImages[4])}>
          <img src={activeImages[4].src} alt={activeImages[4].alt} loading="lazy" />
        </div>

        <div className="comm-photo comm-bot2" onClick={() => setActivePhoto(activeImages[5])}>
          <img src={activeImages[5].src} alt={activeImages[5].alt} loading="lazy" />
        </div>

        <div className="comm-photo comm-bot3" onClick={() => setActivePhoto(activeImages[6])}>
          <img src={activeImages[6].src} alt={activeImages[6].alt} loading="lazy" />
        </div>

      </div>

      {/* LIGHTBOX */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
            }}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                borderRadius: '50%', width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#000' }}>
              <img src={activePhoto.src} alt={activePhoto.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '2px' }}>Tees India Community</span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Tag @teesindia to be featured</span>
              </div>
              <a
                href={instagramUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0a0a0a', background: '#f3f4f6', padding: '0.4rem 0.9rem', borderRadius: '999px', textDecoration: 'none' }}
              >
                View on Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
