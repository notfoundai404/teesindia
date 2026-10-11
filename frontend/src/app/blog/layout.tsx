import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Streetwear Culture & Style Journal',
  description: 'Articles, styling tips, fabric guides, and behind-the-scenes stories on Indian streetwear fashion from the TEESINDIA editorial team.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Streetwear Culture & Style Journal | TEESINDIA™',
    description: 'Articles, styling tips, fabric guides, and behind-the-scenes stories on Indian streetwear fashion from the TEESINDIA editorial team.',
    url: 'https://teesindia.com/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
