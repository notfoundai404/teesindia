import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Apparel Collections',
  description: 'Discover curated clothing capsules from TEESINDIA. Oversized fits, heavyweights, streetwear drops, and limited editions.',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'Curated Apparel Collections | TEESINDIA™',
    description: 'Discover curated clothing capsules from TEESINDIA. Oversized fits, heavyweights, streetwear drops, and limited editions.',
    url: 'https://teesindia.com/collections',
  },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
