import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SettingsProvider from '@/components/layout/SettingsProvider';

export const metadata: Metadata = {
  title: 'TEESINDIA™ — Premium Apparel Since 2020',
  description: 'Discover premium quality clothing at Teesindia. Shop T-shirts, hoodies, oversized fits and more. Designed in India, worn everywhere.',
  keywords: 'teesindia, t-shirts india, premium clothing, streetwear india, hoodies, oversized tshirts',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'TEESINDIA™ — Premium Apparel',
    description: 'Premium quality clothing. Designed in India, worn everywhere.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
