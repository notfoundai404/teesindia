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

  // Marquee

  // Marquee
  marqueeItems: string[];
  marqueeBg: string;
  marqueeTextColor: string;
  marqueeSpeed: number;

  // Sections visibility
  showHowItWorks: boolean;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorksSteps: Array<{
    title: string;
    description: string;
    imageUrl: string;
  }>;

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

  // QR T-Shirt Customizer Section
  customizerSizes: string[];
  customizerPhrases: string[];
  customizerGarmentColors: Array<{
    id: string;
    label: string;
    hex: string;
    imageUrl?: string;
  }>;
  customizerProductName: string;
  customizerProductPrice: number;
  customizerColorLabel: string;
  customizerSizeLabel: string;
  customizerProductSlug: string;
  // Whole images matrix: phrase -> colorId -> imageUrl
  customizerImages: Record<string, Record<string, string>>;

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
  logoUrl: '/logo.svg',
  faviconUrl: '/logo.svg',
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
  marqueeItems: [
    'Free Shipping Over ₹999', 'Premium Cotton', 'Made in India', '100% Original',
    '7-Day Easy Returns', 'New Drops Weekly', 'COD Available', '10,000+ Customers',
    'Complimentary Gift Wrapping',
  ],
  marqueeBg: '#C9A96E',
  marqueeTextColor: '#000000',
  marqueeSpeed: 30,
  showHowItWorks: true,
  howItWorksTitle: 'HOW IT WORKS',
  howItWorksSubtitle: 'Three simple steps to make it happen.',
  howItWorksSteps: [
    { title: 'SCAN', description: 'Discover people and possibilities around you.', imageUrl: '' },
    { title: 'CONNECT', description: 'Start a conversation and make a genuine connection.', imageUrl: '' },
    { title: 'DATE', description: 'Turn the connection into a real-world moment.', imageUrl: '' }
  ],
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

  // QR T-Shirt Customizer Section
  customizerSizes: ['S', 'M', 'L', 'XL', '2XL'],
  customizerPhrases: ['WANNA KISS', 'WANNA DATE', 'WANNA F*CK', 'WANNA DANCE'],
  customizerGarmentColors: [
    { id: 'white', label: 'White', hex: '#ffffff' },
    { id: 'grey', label: 'Grey', hex: '#d1d5db' },
    { id: 'pink', label: 'Pink', hex: '#fbcfe8' },
    { id: 'blue', label: 'Blue', hex: '#bfdbfe' },
    { id: 'black', label: 'Black', hex: '#111827' },
  ],
  customizerProductName: 'Teesindia QR Tshirt',
  customizerProductPrice: 7800,
  customizerColorLabel: 'Select Color:',
  customizerSizeLabel: 'Select Size:',
  customizerProductSlug: 'teesindia-qr-tshirt',
  customizerImages: {},

  // Hero enhancements
  heroEyebrow: 'NEW COLLECTION — 2026',
  trustBadges: [
    { label: '10K+', sub: 'Happy Customers' },
    { label: '100%', sub: 'Premium Cotton' },
    { label: '2–5',  sub: 'Day Delivery' },
  ],

  // Brand Story section
  brandYear: '2020',
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
  isSuspended: boolean;
  suspensionMessage: string;
  fetchSettings: () => Promise<void>;
  setSettings: (s: StoreSettings) => void;
  setSuspended: (suspended: boolean, message?: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  isSuspended: false,
  suspensionMessage: 'This application has been suspended. Please contact NotfoundAi team',

  fetchSettings: async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.suspended) {
        set({
          isSuspended: true,
          suspensionMessage: res.data?.message || 'This application has been suspended. Please contact NotfoundAi team',
          loaded: true,
        });
        return;
      }
      const fetched: Partial<StoreSettings> = res.data?.settings || {};
      // Deep-merge: for array fields, keep the default if the fetched value is missing/empty
      const merged = { ...DEFAULT_SETTINGS, ...fetched } as StoreSettings;
      for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof StoreSettings>) {
        if (Array.isArray(DEFAULT_SETTINGS[key])) {
          const fetchedVal = fetched[key];
          if (!Array.isArray(fetchedVal) || (fetchedVal as unknown[]).length === 0) {
            (merged as any)[key] = DEFAULT_SETTINGS[key];
          }
        }
      }
      // Merge customizerImages object cleanly
      if (fetched.customizerImages && typeof fetched.customizerImages === 'object') {
        merged.customizerImages = { ...(DEFAULT_SETTINGS.customizerImages || {}), ...fetched.customizerImages };
      } else {
        merged.customizerImages = { ...(DEFAULT_SETTINGS.customizerImages || {}) };
      }
      set({ settings: merged, loaded: true, isSuspended: false });
    } catch (err: any) {
      if (err.response?.status === 503 || err.response?.data?.suspended) {
        const msg = err.response?.data?.message || 'This application has been suspended. Please contact NotfoundAi team';
        set({ isSuspended: true, suspensionMessage: msg, loaded: true });
      } else {
        // fail silently for network issues — use defaults
        set({ loaded: true });
      }
    }
  },

  setSettings: (s: StoreSettings) => set({ settings: s }),
  setSuspended: (suspended: boolean, message?: string) =>
    set({
      isSuspended: suspended,
      ...(message ? { suspensionMessage: message } : {}),
    }),
}));

/**
 * Returns the whole image URL for a given phrase and color ID.
 * Falls back to color default image if present.
 */
export function getCustomizerImage(
  settings: Partial<StoreSettings> | null | undefined,
  phrase?: string,
  colorId?: string
): string | undefined {
  if (!settings) return undefined;
  if (phrase && colorId && settings.customizerImages?.[phrase]?.[colorId]) {
    return settings.customizerImages[phrase][colorId];
  }
  // Try case-insensitive or flattened key
  if (phrase && colorId && (settings.customizerImages as any)?.[`${phrase}_${colorId}`]) {
    return (settings.customizerImages as any)[`${phrase}_${colorId}`];
  }
  // Fallback to color default image if present
  if (colorId && settings.customizerGarmentColors) {
    const color = settings.customizerGarmentColors.find(c => c.id === colorId);
    if (color?.imageUrl) return color.imageUrl;
  }
  return undefined;
}

