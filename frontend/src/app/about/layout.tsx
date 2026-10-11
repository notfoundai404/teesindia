import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story & Brand Philosophy',
  description: 'Learn about TEESINDIA. Born in 2020 out of pure passion for heavyweight cotton, precise fits, and uncompromising Indian craftsmanship.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Our Story & Brand Philosophy | TEESINDIA™',
    description: 'Learn about TEESINDIA. Born in 2020 out of pure passion for heavyweight cotton, precise fits, and uncompromising Indian craftsmanship.',
    url: 'https://teesindia.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
