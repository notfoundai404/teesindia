/**
 * Studio Typography Catalog — Curated fonts for streetwear and graphic apparel.
 */

export interface StudioFont {
  name: string;
  label: string;
  category: 'Gothic' | 'Streetwear' | 'Cyber' | '8-Bit Pixel' | 'Graffiti' | 'Avant-Garde' | 'Varsity' | 'Luxury' | 'Retro' | 'Horror';
  badge: string;
  sample: string;
  letterSpacing?: string;
  sizeMultiplier?: number;
  weight?: string | number;
  textTransform?: 'uppercase' | 'none' | 'capitalize';
}

export const COOL_FONTS: StudioFont[] = [
  // ── Gothic & Underground ──
  {
    name: 'UnifrakturMaguntia',
    label: 'Gothic Blackletter',
    category: 'Gothic',
    badge: 'Gothic',
    sample: 'Blackletter',
    letterSpacing: '0.04em',
    sizeMultiplier: 1.05,
    textTransform: 'none',
  },
  {
    name: 'Pirata One',
    label: 'Pirata Gothic',
    category: 'Gothic',
    badge: 'Pirata',
    sample: 'Rebellion',
    letterSpacing: '0.05em',
    sizeMultiplier: 1.05,
    textTransform: 'uppercase',
  },

  // ── Cyberpunk & Futuristic ──
  {
    name: 'Righteous',
    label: 'Righteous Cyber',
    category: 'Cyber',
    badge: 'Cyber',
    sample: 'NEO TOKYO',
    letterSpacing: '0.08em',
    sizeMultiplier: 1.0,
    textTransform: 'uppercase',
  },
  {
    name: 'Rubik Glitch',
    label: 'Rubik Glitch',
    category: 'Cyber',
    badge: 'Glitch',
    sample: 'CORRUPT',
    letterSpacing: '0.08em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },

  // ── 8-Bit Pixel & Y2K ──
  {
    name: 'Press Start 2P',
    label: 'Press Start Pixel',
    category: '8-Bit Pixel',
    badge: '8-Bit',
    sample: 'GAME OVER',
    letterSpacing: '0.04em',
    sizeMultiplier: 0.72,
    textTransform: 'uppercase',
  },

  // ── Streetwear & Raw Graffiti ──
  {
    name: 'Permanent Marker',
    label: 'Permanent Marker',
    category: 'Graffiti',
    badge: 'Graffiti',
    sample: 'RAW INK',
    letterSpacing: '0.06em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },
  {
    name: 'Rock Salt',
    label: 'Rock Salt Grunge',
    category: 'Graffiti',
    badge: 'Grunge',
    sample: 'NO RULES',
    letterSpacing: '0.04em',
    sizeMultiplier: 0.8,
    textTransform: 'uppercase',
  },

  // ── Heavy Impact Streetwear ──
  {
    name: 'Space Grotesk',
    label: 'Space Grotesk',
    category: 'Streetwear',
    badge: 'Streetwear',
    sample: 'DISTRICT 09',
    letterSpacing: '0.1em',
    sizeMultiplier: 1.0,
    textTransform: 'uppercase',
  },
  {
    name: 'Bebas Neue',
    label: 'Bebas Neue',
    category: 'Streetwear',
    badge: 'Impact',
    sample: 'STAND TALL',
    letterSpacing: '0.12em',
    sizeMultiplier: 1.15,
    textTransform: 'uppercase',
  },
  {
    name: 'Archivo Black',
    label: 'Archivo Black',
    category: 'Streetwear',
    badge: 'Block',
    sample: 'OVERLOAD',
    letterSpacing: '0.08em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },
  {
    name: 'Bungee',
    label: 'Bungee Outline',
    category: 'Streetwear',
    badge: 'Urban',
    sample: 'HEAVYWEIGHT',
    letterSpacing: '0.06em',
    sizeMultiplier: 0.88,
    textTransform: 'uppercase',
  },
  {
    name: 'Anton',
    label: 'Anton Poster',
    category: 'Streetwear',
    badge: 'Poster',
    sample: 'STATEMENT',
    letterSpacing: '0.09em',
    sizeMultiplier: 1.1,
    textTransform: 'uppercase',
  },
  {
    name: 'Russo One',
    label: 'Russo Stencil',
    category: 'Streetwear',
    badge: 'Industrial',
    sample: 'ARMOR',
    letterSpacing: '0.08em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },

  // ── Avant-Garde & High Fashion ──
  {
    name: 'Syne',
    label: 'Syne Avant-Garde',
    category: 'Avant-Garde',
    badge: 'Hypebeast',
    sample: 'VANGUARD',
    letterSpacing: '0.07em',
    sizeMultiplier: 1.0,
    weight: 800,
    textTransform: 'uppercase',
  },

  // ── Varsity & Athletic ──
  {
    name: 'Alfa Slab One',
    label: 'Alfa Slab Varsity',
    category: 'Varsity',
    badge: 'Varsity',
    sample: 'CHAMPIONS',
    letterSpacing: '0.06em',
    sizeMultiplier: 0.88,
    textTransform: 'uppercase',
  },
  {
    name: 'Oswald',
    label: 'Oswald Athletic',
    category: 'Varsity',
    badge: 'Athletic',
    sample: 'DIVISION I',
    letterSpacing: '0.1em',
    sizeMultiplier: 1.05,
    textTransform: 'uppercase',
  },

  // ── Luxury & Editorial ──
  {
    name: 'Cinzel',
    label: 'Cinzel Roman',
    category: 'Luxury',
    badge: 'Luxury',
    sample: 'MONARCH',
    letterSpacing: '0.14em',
    sizeMultiplier: 1.0,
    textTransform: 'uppercase',
  },
  {
    name: 'Playfair Display',
    label: 'Playfair Editorial',
    category: 'Luxury',
    badge: 'Editorial',
    sample: 'ATELIER',
    letterSpacing: '0.08em',
    sizeMultiplier: 1.0,
    textTransform: 'uppercase',
  },

  // ── Retro & Script ──
  {
    name: 'Kaushan Script',
    label: 'Kaushan Script',
    category: 'Retro',
    badge: 'Signature',
    sample: 'Authentic',
    letterSpacing: '0.02em',
    sizeMultiplier: 1.0,
    textTransform: 'none',
  },
  {
    name: 'Courier Prime',
    label: 'Courier Typewriter',
    category: 'Retro',
    badge: 'Typewriter',
    sample: 'ARCHIVE',
    letterSpacing: '0.06em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },

  // ── Horror & Underground ──
  {
    name: 'Creepster',
    label: 'Creepster Horror',
    category: 'Horror',
    badge: 'Underground',
    sample: 'HAUNTED',
    letterSpacing: '0.08em',
    sizeMultiplier: 0.95,
    textTransform: 'uppercase',
  },

  // ── Clean Minimal ──
  {
    name: 'Montserrat',
    label: 'Montserrat Sans',
    category: 'Streetwear',
    badge: 'Minimal',
    sample: 'MINIMALIST',
    letterSpacing: '0.12em',
    sizeMultiplier: 0.95,
    weight: 800,
    textTransform: 'uppercase',
  },
];

export const DEFAULT_STUDIO_FONT_NAMES: string[] = COOL_FONTS.map(f => f.name);

export function getStudioFontConfig(fontName?: string): StudioFont {
  if (!fontName) return COOL_FONTS[0];
  const found = COOL_FONTS.find(f => f.name.toLowerCase() === fontName.toLowerCase());
  return found || COOL_FONTS[0];
}
