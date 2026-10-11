import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products — Oversized Tees, Hoodies & Streetwear',
  description: 'Explore the full TEESINDIA collection. Premium 100% combed cotton t-shirts, drop shoulder fits, graphic hoodies, and streetwear essentials. Fast pan-India delivery.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop All Products | TEESINDIA™',
    description: 'Explore the full TEESINDIA collection. Premium 100% combed cotton t-shirts, drop shoulder fits, graphic hoodies, and streetwear essentials.',
    url: 'https://teesindia.com/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
