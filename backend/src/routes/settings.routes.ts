import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToDrive, isDriveConfigured } from '../lib/drive';

// ── Multer for settings image uploads (logo, hero, OG image) ──────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/settings');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: isDriveConfigured() ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

async function resolveUploadUrl(file: Express.Multer.File): Promise<string> {
  if (isDriveConfigured()) {
    const result = await uploadToDrive(file.buffer, file.originalname, file.mimetype);
    return result.webContentLink;
  }
  return `/uploads/settings/${file.filename}`;
}

const router = Router();

// ─── Revalidation helper — fires the Next.js on-demand revalidation webhook ───
// Called after any admin mutation so the CDN cache is purged instantly.
async function revalidateFrontend(scope: 'settings' | 'products' | 'collections' | 'blog' | 'all' = 'settings'): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return; // Skip silently if not configured
  try {
    await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ scope }),
    });
  } catch (err) {
    // Non-fatal — log but don't break the save
    console.warn('[Revalidation] Failed to ping frontend:', (err as Error).message);
  }
}

// ─── Default settings (fallback when no settings saved yet) ───────────────────
export const DEFAULT_STORE_SETTINGS = {
  // Brand
  storeName: 'TEESINDIA™',
  tagline: 'Ultra-Premium Heavyweight Graphic & Minimal T-Shirts',
  logoUrl: '/logo.svg',
  faviconUrl: '/logo.svg',

  // Theme & Colors
  primaryColor: '#C9A96E',
  accentColor: '#111827',
  bgColor: '#ffffff',
  textColor: '#111827',
  buttonStyle: 'square' as const,

  // Typography
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',

  // Announcement Bar
  announcementActive: true,
  announcementText: 'COMPLIMENTARY SHIPPING ACROSS INDIA ON ORDERS ABOVE ₹999 | NEW LUXURY DROP IS LIVE',
  announcementBg: '#111827',
  announcementTextColor: '#C9A96E',

  // Navbar
  navBg: '#ffffff',
  navSticky: true,
  navShowSearch: true,

  // Hero Banner
  heroHeadline: 'Wear the\nStatement.',
  heroSubheadline: 'Ultra-premium heavyweight tees crafted for those who command attention.',
  heroCtaText: 'Shop New Arrivals',
  heroCtaLink: '/shop',
  heroImageUrl: '',
  heroOverlayOpacity: 0.4,

  // Products Section
  productsTitle: 'LATEST DROPS',
  productsSubtitle: 'Freshly crafted, limited runs. Every piece tells a story.',
  productsCount: 8,
  productsLayout: 'grid' as const,
  productCardShowBadge: true,
  productCardShowWishlist: true,
  productCardShowQuickAdd: true,
  productCardShowRatings: false,

  // Collections
  collections: [
    { label: 'Men', href: '/shop?category=men', tagline: 'Classic & Contemporary', imageUrl: '', order: 0 },
    { label: 'Women', href: '/shop?category=women', tagline: 'Bold & Effortless', imageUrl: '', order: 1 },
    { label: 'Oversized', href: '/shop?category=oversized', tagline: 'The Drop-Shoulder Fit', imageUrl: '', order: 2 },
    { label: 'Hoodies', href: '/shop?category=hoodies', tagline: '400 GSM Heavyweight', imageUrl: '', order: 3 },
  ],

  // Marquee
  marqueeItems: [
    'Free Shipping Over ₹999',
    'Premium Cotton',
    'Made in India',
    '100% Original',
    '7-Day Easy Returns',
    'New Drops Weekly',
    'COD Available',
    '10,000+ Customers',
    'Complimentary Gift Wrapping',
  ],
  marqueeBg: '#C9A96E',
  marqueeTextColor: '#000000',
  marqueeSpeed: 30,

  // Sections visibility
  showHowItWorks: false,
  showTestimonials: true,

  // Testimonials
  testimonials: [
    { name: 'Arjun M.', text: 'Best tee I\'ve ever bought. The fabric quality is unreal for the price.', rating: 5, imageUrl: '' },
    { name: 'Priya R.', text: 'Ordered 3 oversized fits. Every single one is perfect. Definitely coming back.', rating: 5, imageUrl: '' },
    { name: 'Karan S.', text: 'Love the minimal designs. Finally a brand that gets streetwear in India.', rating: 5, imageUrl: '' },
  ],

  // Footer
  footerText: '© 2024 TEESINDIA™. All rights reserved.',
  footerShowNewsletter: true,

  // Social
  instagramUrl: 'https://instagram.com/teesindia',
  youtubeUrl: 'https://youtube.com/@teesindia',
  twitterUrl: 'https://x.com/teesindia',

  // Shipping & Checkout
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  codExtraFee: 49,

  // SEO
  metaTitle: 'TEESINDIA™ — Premium Heavyweight Graphic Tees',
  metaDescription: 'Shop ultra-premium heavyweight graphic and minimal t-shirts. Made in India, designed for those who stand out.',
  ogImageUrl: '',

  // Support
  supportEmail: 'support@teesindia.in',
  supportPhone: '+91 98765 43210',

  // Promotions
  welcomePopupActive: false,
  welcomePopupDelay: 3,
  welcomePopupCode: 'WELCOME10',
  welcomePopupDiscount: '10% off your first order',

  // Warehouse & Dispatch Hub (Packing Slips & Invoices)
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



  // ── Hero enhancements ──────────────────────────────────────────────────────
  heroEyebrow: 'NEW COLLECTION — 2026',
  trustBadges: [
    { label: '10K+',  sub: 'Happy Customers' },
    { label: '100%',  sub: 'Premium Cotton' },
    { label: '2–5',   sub: 'Day Delivery' },
  ],

  // ── Brand Story section ───────────────────────────────────────────────────
  brandYear: '2020',
  brandStoryHeading: 'Born in India,\nbuilt for the streets.',
  brandStoryBody: 'Teesindia started with a simple idea: premium quality clothing that doesn\'t compromise on style or ethics. Every thread is chosen with intention, every fit designed to last beyond trends. Crafted in India, worn everywhere.',
  brandStoryCtaText: 'Our Story',
  brandStoryCtaLink: '/about',

  // ── Newsletter section ────────────────────────────────────────────────────
  newsletterDescription: 'Get exclusive early access to drops, sales, and style updates.',

  // ── Community / Instagram wall ────────────────────────────────────────────
  // When empty, the storefront falls back to the static placeholder images.
  communityHeading: 'OUR COMMUNITY',
  communitySubtext: 'TAG US ON YOUR SOCIALS TO BE FEATURED ON OUR PAGE',
  communityImages: [] as Array<{ id: string; src: string; alt: string; author: string; tag?: string }>,

  // ── Navigation links ──────────────────────────────────────────────────────
  navLinks: [
    { label: 'Shop',       href: '/shop',        accent: false },
    { label: 'Collections',href: '/collections', accent: false },
    { label: 'Customize',  href: '/#customizer', accent: true  },
    { label: 'Blog',       href: '/blog',        accent: false },
    { label: 'About',      href: '/about',       accent: false },
    { label: 'Contact',    href: '/contact',     accent: false },
  ],

  // ── Footer link groups ────────────────────────────────────────────────────
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

  // ── Products sort default ─────────────────────────────────────────────────
  productSort: 'newest' as const,
};

// ─── Merge helper: preserve default arrays when saved data has empty/missing arrays ─
function mergeSettings(saved: Record<string, any>): typeof DEFAULT_STORE_SETTINGS {
  const merged: any = { ...DEFAULT_STORE_SETTINGS, ...saved };
  // For every key that is an array in the defaults, fall back to the default
  // if the saved value is missing, null, or an empty array.
  for (const key of Object.keys(DEFAULT_STORE_SETTINGS) as Array<keyof typeof DEFAULT_STORE_SETTINGS>) {
    if (Array.isArray(DEFAULT_STORE_SETTINGS[key])) {
      const savedVal = saved[key];
      if (!Array.isArray(savedVal) || savedVal.length === 0) {
        merged[key] = DEFAULT_STORE_SETTINGS[key];
      }
    }
  }
  return merged;
}

// ─── PUBLIC: GET /api/settings — storefront reads this (no auth required) ─────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } });
    const settings = row ? mergeSettings(row.data as Record<string, any>) : DEFAULT_STORE_SETTINGS;
    // ── CDN Edge Cache: serve from nearest PoP for 60s, stale for 5 min ───────
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ settings });
  } catch (err) {
    // Always return defaults on error so storefront never breaks
    res.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
    res.json({ settings: DEFAULT_STORE_SETTINGS });
  }
});

// ─── ADMIN: GET /api/admin/settings ──────────────────────────────────────────
router.get('/admin', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } });
    const settings = row ? mergeSettings(row.data as Record<string, any>) : DEFAULT_STORE_SETTINGS;
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err });
  }
});

// ─── ADMIN: PUT /api/admin/settings ──────────────────────────────────────────
router.put('/admin', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const newData = req.body;
    const row = await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', data: newData },
      update: { data: newData },
    });
    // ── Fire on-demand revalidation so CDN cache is purged instantly ──────────
    // Non-blocking: we don't await so the admin gets a fast response.
    revalidateFrontend('settings').catch(() => {});
    res.json({ message: 'Settings saved successfully', settings: row.data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save settings', error: err });
  }
});

// ─── ADMIN: POST /api/settings/upload — upload logo/hero/og images ───────────
router.post('/upload', authenticate, requireAdmin, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }
    const url = await resolveUploadUrl(req.file);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image', error: err });
  }
});

// ─── ADMIN: POST /api/settings/verify-smtp — check SMTP connection ───────────
router.post('/verify-smtp', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { verifySMTP } = await import('../lib/mailer');
    const result = await verifySMTP();
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'SMTP check failed' });
  }
});

// ─── ADMIN: POST /api/settings/test-email — send test email to target address ──
router.post('/test-email', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { to } = req.body;
    if (!to) {
      res.status(400).json({ message: 'Target email is required' });
      return;
    }
    const { sendMail } = await import('../lib/mailer');
    await sendMail({
      to,
      subject: 'TEESINDIA™ — SMTP Test Email',
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#0d0d0d;color:#ffffff;border-radius:8px;">
          <h2 style="color:#C9A96E;margin-top:0;">SMTP Configuration Successful</h2>
          <p>Your Gmail SMTP connection for TEESINDIA™ is active and operational.</p>
          <p style="color:#888;font-size:12px;">Sent at: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      `,
    });
    res.json({ success: true, message: `Test email dispatched to ${to}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to send test email' });
  }
});

export default router;
