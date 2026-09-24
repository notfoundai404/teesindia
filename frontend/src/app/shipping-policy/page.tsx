'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useSettingsStore } from '@/lib/settingsStore';

export default function ShippingPolicyPage() {
  const { settings } = useSettingsStore();
  const threshold = settings.freeShippingThreshold ?? 999;
  const fee = settings.standardShippingFee ?? 99;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827' }}>SHIPPING POLICY</h1>
            <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.875rem' }}>Last updated: September 2025</p>
          </div>
        </div>
        <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '800px' }}>
          {[
            { title: 'Shipping Rates', content: `We offer FREE shipping on all orders above ₹${threshold}. For orders below ₹${threshold}, a flat shipping fee of ₹${fee} is charged. We currently ship only within India.` },
            { title: 'Delivery Timeline', content: 'Standard delivery takes 5–7 business days from the date of dispatch. Express delivery (3–4 business days) is available at an additional charge of ₹149. Remote areas may take 7–10 business days.' },
            { title: 'Order Processing', content: 'Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day.' },
            { title: 'Order Tracking', content: 'Once your order is dispatched, you will receive an email with your tracking number and carrier information. You can track your order in the My Orders section of your account.' },
            { title: 'Shipping Partners', content: 'We ship via trusted courier partners including Delhivery, BlueDart, and India Post depending on your location. We choose the best carrier to ensure timely and safe delivery.' },
            { title: 'Failed Delivery', content: 'In case of a failed delivery attempt, the carrier will try again on the next business day. After 3 failed attempts, the package will be returned to us. We will contact you to reschedule or issue a refund.' },
            { title: 'Damaged in Transit', content: 'If your order arrives damaged, please contact us within 48 hours of delivery with photos of the damaged items. We will arrange a replacement or full refund.' },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em', color: '#111827' }}>{section.title}</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '0.95rem' }}>{section.content}</p>
            </div>
          ))}
          <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Questions about your order?</p>
            <Link href="/contact" className="btn btn-outline">Contact Support</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
