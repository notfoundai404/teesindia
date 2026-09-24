'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { ChevronDown } from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{q}</span>
        <ChevronDown size={18} color="#6b7280" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      {open && (
        <div style={{ paddingBottom: '1.25rem', color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.8 }}>{a}</div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const { settings } = useSettingsStore();
  const threshold = settings.freeShippingThreshold ?? 999;
  const fee = settings.standardShippingFee ?? 99;
  const supportEmail = settings.supportEmail || 'support@teesindia.com';
  const brandName = settings.storeName || 'Teesindia';

  const faqs = [
    {
      category: 'Orders & Shipping',
      items: [
        { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days. Express delivery (3–4 days) is available at checkout for ₹149.' },
        { q: 'Do you offer free shipping?', a: `Yes! All orders above ₹${threshold} ship for free. Orders below ₹${threshold} have a flat ₹${fee} shipping fee.` },
        { q: 'Can I track my order?', a: 'Absolutely. Once shipped, you\'ll receive a tracking link via email. You can also track in My Account → My Orders.' },
        { q: 'Do you ship internationally?', a: 'Currently, we ship only within India. International shipping is coming soon!' },
        { q: 'Can I change my delivery address after ordering?', a: `Contact us within 2 hours of placing the order at ${supportEmail}. After dispatch, address changes are not possible.` },
      ],
    },
    {
      category: 'Returns & Refunds',
      items: [
        { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging with tags intact.' },
        { q: 'How do I initiate a return?', a: 'Go to My Account → My Orders → select the order → click "Return". Our team will arrange a free pickup.' },
        { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.' },
        { q: 'Can I exchange for a different size?', a: 'Yes! Free size exchanges are available. Mention your preferred size when initiating the return.' },
      ],
    },
    {
      category: 'Products & Sizing',
      items: [
        { q: 'What fabric do you use?', a: 'We use 100% combed cotton (180 GSM for tees, 320 GSM for hoodies) for superior softness and durability.' },
        { q: 'How do I find my size?', a: 'Check our Size Guide page for detailed measurements. If between sizes, we recommend going one size up.' },
        { q: 'Will colors fade after washing?', a: 'Our garments use reactive dyes that are colorfast. Follow the care instructions (cold wash, inside out) for best results.' },
        { q: 'Are your products true to size?', a: 'Our regular fit tees are true to size. Oversized styles are intentionally larger — check the size chart for exact measurements.' },
      ],
    },
    {
      category: 'Payments',
      items: [
        { q: 'What payment methods do you accept?', a: 'We accept UPI, debit/credit cards, net banking, and all major wallets via Razorpay. Cash on Delivery is also available.' },
        { q: 'Is my payment information secure?', a: 'Yes. All payments are processed by Razorpay with PCI DSS compliance. We never store your card details.' },
        { q: 'Can I pay on delivery?', a: 'Yes, Cash on Delivery is available for orders up to ₹5,000.' },
        { q: 'Will I get an invoice?', a: 'Yes, a GST invoice is automatically sent to your email after order confirmation.' },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827' }}>FAQs</h1>
            <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>Everything you need to know about {brandName}</p>
          </div>
        </div>
        <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '780px' }}>
          {faqs.map(section => (
            <section key={section.category} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#855d14', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>{section.category}</h2>
              {section.items.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
            </section>
          ))}
          <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', marginTop: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.25rem', color: '#111827' }}>Still have questions?</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Our support team is available Mon–Sat, 10am–7pm IST</p>
            <Link href="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
