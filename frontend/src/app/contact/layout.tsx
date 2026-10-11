import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Customer Support',
  description: 'Have a question about your order, sizing, or custom inquiries? Get in touch with the TEESINDIA support team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us & Customer Support | TEESINDIA™',
    description: 'Have a question about your order, sizing, or custom inquiries? Get in touch with the TEESINDIA support team.',
    url: 'https://teesindia.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
