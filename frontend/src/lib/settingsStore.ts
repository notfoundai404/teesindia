import { create } from 'zustand';
import api from './api';
import { DEFAULT_STUDIO_FONT_NAMES } from './studioFonts';

// ─── Full Settings Type ────────────────────────────────────────────────────────
export interface StoreSettings {
  // Brand
  storeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;

  // Theme & Colors
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';

  // Typography
  headingFont: string;
  bodyFont: string;

  // Announcement Bar
  announcementActive: boolean;
  announcementText: string;
  announcementBg: string;
  announcementTextColor: string;

  // Navbar
  navBg: string;
  navSticky: boolean;
  navShowSearch: boolean;

  // Hero Banner
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImageUrl: string;
  heroOverlayOpacity: number;

  // Products Section
  productsTitle: string;
  productsSubtitle: string;
  productsCount: number;
  productsLayout: 'grid' | 'list';
  productCardShowBadge: boolean;
  productCardShowWishlist: boolean;
  productCardShowQuickAdd: boolean;
  productCardShowRatings: boolean;

  // Collections
  collections: Array<{
    label: string;
    href: string;
    tagline: string;
    imageUrl: string;
    order: number;
  }>;

  // Marquee
  marqueeItems: string[];
  marqueeBg: string;
  marqueeTextColor: string;
  marqueeSpeed: number;

  // Sections visibility
  showHowItWorks: boolean;
  showTestimonials: boolean;

  // Testimonials
  testimonials: Array<{
    name: string;
    text: string;
    rating: number;
    imageUrl: string;
  }>;

  // Footer
  footerText: string;
  footerShowNewsletter: boolean;

  // Social
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;

  // Shipping & Checkout
  freeShippingThreshold: number;
  standardShippingFee: number;
  codExtraFee: number;

  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;

  // Support
  supportEmail: string;
  supportPhone: string;

  // Promotions
  welcomePopupActive: boolean;
  welcomePopupDelay: number;
  welcomePopupCode: string;
  welcomePopupDiscount: string;

  // Warehouse & Dispatch Hub (Packing Slips & Invoices)
  dispatchHubEnabled: boolean;
  dispatchHubName: string;
  dispatchAddressLine1: string;
  dispatchAddressLine2: string;
  dispatchCity: string;
  dispatchState: string;
  dispatchPincode: string;
  dispatchGst: string;
  dispatchSupportEmail: string;
  dispatchSupportPhone: string;
  dispatchCarrier: string;

  // Customize Your Own Section
  customizerEnabled: boolean;
  customizerHeading: string;
  customizerSubheading: string;
  customizerPrice: number;
  customizerOrigPrice: number;
  customizerSizes: string[];
  customizerPhrases: string[];
  customizerFonts?: string[];
  customizerAllowFontSelection?: boolean;
  customizerAllowCustomText?: boolean;
  customizerAllowImageUpload?: boolean;
  customizerAllowPrintColor?: boolean;
  customizerMaxChars?: number;
  customizerDesigns: Array<{
    id: string;
    text: string;
    font: string;
    printColor?: string;
    imageUrl?: string;
  }>;
  customizerGarmentColors: Array<{
    id: string;
    label: string;
    hex: string;
    textColor: string;
  }>;

  // Hero enhancements
  heroEyebrow: string;
  trustBadges: Array<{ label: string; sub: string }>;

  // Brand Story section
  brandYear: string;
  brandStoryHeading: string;
  brandStoryBody: string;
  brandStoryCtaText: string;
  brandStoryCtaLink: string;

  // Newsletter section
  newsletterDescription: string;

  // Community / Instagram wall
  communityHeading: string;
  communitySubtext: string;
  communityImages: Array<{ id: string; src: string; alt: string; author: string; tag?: string }>;

  // Navigation links
  navLinks: Array<{ label: string; href: string; accent: boolean }>;

  // Footer link groups
  footerShopLinks: Array<{ label: string; href: string }>;
  footerHelpLinks: Array<{ label: string; href: string }>;

  // Products sort default
  productSort: 'newest' | 'price_asc' | 'price_desc';
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'TEESINDIA™',
  tagline: 'Ultra-Premium Heavyweight Graphic & Minimal T-Shirts',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#C9A96E',
  accentColor: '#111827',
  bgColor: '#ffffff',
  textColor: '#111827',
  buttonStyle: 'square',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  announcementActive: true,
  announcementText: 'COMPLIMENTARY SHIPPING ACROSS INDIA ON ORDERS ABOVE ₹999 | NEW LUXURY DROP IS LIVE',
  announcementBg: '#111827',
  announcementTextColor: '#C9A96E',
  navBg: '#ffffff',
  navSticky: true,
  navShowSearch: true,
  heroHeadline: 'Wear the\nStatement.',
  heroSubheadline: 'Ultra-premium heavyweight tees crafted for those who command attention.',
  heroCtaText: 'Shop New Arrivals',
  heroCtaLink: '/shop',
  heroImageUrl: '',
  heroOverlayOpacity: 0.4,
  productsTitle: 'LATEST DROPS',
  productsSubtitle: 'Freshly crafted, limited runs. Every piece tells a story.',
  productsCount: 8,
  productsLayout: 'grid',
  productCardShowBadge: true,
  productCardShowWishlist: true,
  productCardShowQuickAdd: true,
  productCardShowRatings: false,
  collections: [
    { label: 'Men', href: '/shop?category=men', tagline: 'Classic & Contemporary', imageUrl: '', order: 0 },
    { label: 'Women', href: '/shop?category=women', tagline: 'Bold & Effortless', imageUrl: '', order: 1 },
    { label: 'Oversized', href: '/shop?category=oversized', tagline: 'The Drop-Shoulder Fit', imageUrl: '', order: 2 },
    { label: 'Hoodies', href: '/shop?category=hoodies', tagline: '400 GSM Heavyweight', imageUrl: '', order: 3 },
  ],
  marqueeItems: [
    'Free Shipping Over ₹999', 'Premium Cotton', 'Made in India', '100% Original',
    '7-Day Easy Returns', 'New Drops Weekly', 'COD Available', '10,000+ Customers',
    'Complimentary Gift Wrapping',
  ],
  marqueeBg: '#C9A96E',
  marqueeTextColor: '#000000',
  marqueeSpeed: 30,
  showHowItWorks: true,
  showTestimonials: true,
  testimonials: [
    { name: 'Arjun M.', text: "Best tee I've ever bought. The fabric quality is unreal for the price.", rating: 5, imageUrl: '' },
    { name: 'Priya R.', text: 'Ordered 3 oversized fits. Every single one is perfect. Definitely coming back.', rating: 5, imageUrl: '' },
    { name: 'Karan S.', text: 'Love the minimal designs. Finally a brand that gets streetwear in India.', rating: 5, imageUrl: '' },
  ],
  footerText: '© 2024 TEESINDIA™. All rights reserved.',
  footerShowNewsletter: true,
  instagramUrl: 'https://instagram.com/teesindia',
  youtubeUrl: 'https://youtube.com/@teesindia',
  twitterUrl: 'https://x.com/teesindia',
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  codExtraFee: 49,
  metaTitle: 'TEESINDIA™ — Premium Heavyweight Graphic Tees',
  metaDescription: 'Shop ultra-premium heavyweight graphic and minimal t-shirts. Made in India, designed for those who stand out.',
  ogImageUrl: '',
  supportEmail: 'support@teesindia.in',
  supportPhone: '+91 98765 43210',
  welcomePopupActive: false,
  welcomePopupDelay: 3,
  welcomePopupCode: 'WELCOME10',
  welcomePopupDiscount: '10% off your first order',

  // Warehouse & Dispatch Hub
  dispatchHubEnabled: false,
  dispatchHubName: '',
  dispatchAddressLine1: '',
  dispatchAddressLine2: '',
  dispatchCity: '',
  dispatchState: '',
  dispatchPincode: '',
  dispatchGst: '',
  dispatchSupportEmail: '',
  dispatchSupportPhone: '',
  dispatchCarrier: '',

  // Customize Your Own Section
  customizerEnabled: true,
  customizerHeading: 'CUSTOMIZE YOUR OWN',
  customizerSubheading: 'Select · Personalise · Order',
  customizerPrice: 1299,
  customizerOrigPrice: 1799,
  customizerSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  customizerPhrases: [
    'WEAR YOUR STORY',
    'BORN IN INDIA',
    'STREETS SPEAK',
    'MADE IN CHAOS',
    'NO FILTER',
    'TIMELESS ICON',
  ],
  customizerFonts: DEFAULT_STUDIO_FONT_NAMES,
  customizerAllowFontSelection: false,
  customizerAllowCustomText: false,
  customizerAllowImageUpload: false,
  customizerAllowPrintColor: true,
  customizerMaxChars: 28,
  customizerDesigns: [
    { id: 'd1', text: 'WEAR YOUR STORY', font: 'Space Grotesk',     printColor: 'auto', imageUrl: '' },
    { id: 'd2', text: 'BORN IN INDIA',   font: 'Bebas Neue',         printColor: 'auto', imageUrl: '' },
    { id: 'd3', text: 'STREETS SPEAK',   font: 'Rubik Glitch',       printColor: 'auto', imageUrl: '' },
    { id: 'd4', text: 'MADE IN CHAOS',   font: 'UnifrakturMaguntia', printColor: 'auto', imageUrl: '' },
    { id: 'd5', text: 'NO FILTER',       font: 'Permanent Marker',   printColor: 'auto', imageUrl: '' },
    { id: 'd6', text: 'TIMELESS ICON',   font: 'Cinzel',             printColor: 'auto', imageUrl: '' },
  ],
  customizerGarmentColors: [
    { id: 'black',    label: 'Black',    hex: '#0d0d0d', textColor: '#ffffff' },
    { id: 'white',    label: 'White',    hex: '#f7f6f2', textColor: '#111111' },
    { id: 'cream',    label: 'Cream',    hex: '#e8d9c0', textColor: '#2a1f0e' },
    { id: 'slate',    label: 'Slate',    hex: '#4a5568', textColor: '#ffffff' },
    { id: 'navy',     label: 'Navy',     hex: '#1e3a5f', textColor: '#ffffff' },
    { id: 'burgundy', label: 'Burgundy', hex: '#6b1c2c', textColor: '#ffffff' },
    { id: 'forest',   label: 'Forest',   hex: '#1e4d2b', textColor: '#ffffff' },
    { id: 'sand',     label: 'Sand',     hex: '#c9a96e', textColor: '#1a1a1a' },
  ],

  // Hero enhancements
  heroEyebrow: 'NEW COLLECTION — 2026',
  trustBadges: [
    { label: '10K+', sub: 'Happy Customers' },
    { label: '100%', sub: 'Premium Cotton' },
    { label: '2–5',  sub: 'Day Delivery' },
  ],

  // Brand Story section
  brandYear: '2026',
  brandStoryHeading: 'Born in India,\nbuilt for the streets.',
  brandStoryBody: "Teesindia started with a simple idea: premium quality clothing that doesn't compromise on style or ethics. Every thread is chosen with intention, every fit designed to last beyond trends. Crafted in India, worn everywhere.",
  brandStoryCtaText: 'Our Story',
  brandStoryCtaLink: '/about',

  // Newsletter section
  newsletterDescription: 'Get exclusive early access to drops, sales, and style updates.',

  // Community / Instagram wall
  communityHeading: 'OUR COMMUNITY',
  communitySubtext: 'TAG US ON YOUR SOCIALS TO BE FEATURED ON OUR PAGE',
  communityImages: [],

  // Navigation links
  navLinks: [
    { label: 'Shop',        href: '/shop',        accent: false },
    { label: 'Collections', href: '/collections', accent: false },
    { label: 'Customize',   href: '/#customizer', accent: true  },
    { label: 'Blog',        href: '/blog',        accent: false },
    { label: 'About',       href: '/about',       accent: false },
    { label: 'Contact',     href: '/contact',     accent: false },
  ],

  // Footer link groups
  footerShopLinks: [
    { label: 'New Arrivals',  href: '/shop?sort=newest' },
    { label: 'T-Shirts',      href: '/shop?category=men' },
    { label: 'Hoodies',       href: '/shop?category=hoodies' },
    { label: 'Oversized',     href: '/shop?category=oversized' },
    { label: 'Accessories',   href: '/shop?category=accessories' },
    { label: 'Women',         href: '/shop?category=women' },
  ],
  footerHelpLinks: [
    { label: 'About Us',        href: '/about' },
    { label: 'Contact',         href: '/contact' },
    { label: 'Size Guide',      href: '/size-guide' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Return Policy',   href: '/return-policy' },
    { label: 'FAQs',            href: '/faqs' },
  ],

  // Products sort default
  productSort: 'newest' as const,
};

// ─── Zustand Store ─────────────────────────────────────────────────────────────
interface SettingsState {
  settings: StoreSettings;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
  setSettings: (s: StoreSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  fetchSettings: async () => {
    try {
      const res = await api.get('/settings');
      const fetched = res.data?.settings || {};
      set({ settings: { ...DEFAULT_SETTINGS, ...fetched }, loaded: true });
    } catch {
      // fail silently — use defaults
      set({ loaded: true });
    }
  },

  setSettings: (s: StoreSettings) => set({ settings: s }),
}));
