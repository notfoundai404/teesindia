import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs)',
  description: 'Find answers to common questions about shipping, returns, fabric care, sizing guides, and payments at TEESINDIA.',
  alternates: {
    canonical: '/faqs',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQs) | TEESINDIA™',
    description: 'Find answers to common questions about shipping, returns, fabric care, sizing guides, and payments at TEESINDIA.',
    url: 'https://teesindia.com/faqs',
  },
};

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
