import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SettingsProvider from '@/components/layout/SettingsProvider';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teesindia.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TEESINDIA™ — Premium Streetwear & Custom Apparel India',
    template: '%s | TEESINDIA™',
  },
  description: 'Shop luxury heavyweight cotton t-shirts, oversized fits, graphic hoodies, and live viral QR customizer tees. Handcrafted with obsession in India.',
  keywords: [
    'teesindia',
    't-shirts india',
    'streetwear india',
    'oversized t-shirts',
    'custom qr tshirt',
    'heavyweight cotton tees',
    'premium clothing india',
    'graphic hoodies',
    'drop shoulder tees',
  ],
  authors: [{ name: 'TEESINDIA', url: SITE_URL }],
  creator: 'TEESINDIA',
  publisher: 'TEESINDIA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'TEESINDIA™ — Premium Streetwear & Custom Apparel India',
    description: 'Shop luxury heavyweight cotton t-shirts, oversized fits, graphic hoodies, and live viral QR customizer tees. Handcrafted with obsession in India.',
    url: SITE_URL,
    siteName: 'TEESINDIA™',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'TEESINDIA™ — Premium Apparel India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TEESINDIA™ — Premium Streetwear & Custom Apparel',
    description: 'Discover luxury heavyweight cotton tees, oversized fits, graphic hoodies, and viral QR custom apparel.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TEESINDIA',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: 'Premium quality apparel, streetwear, and custom QR clothing brand designed in India.',
  sameAs: [
    'https://www.instagram.com/teesindia',
    'https://twitter.com/teesindia',
  ],
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TEESINDIA',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body>
        <SettingsProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'toast-custom',
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#0a0a0a',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </SettingsProvider>
      </body>
    </html>
  );
}
