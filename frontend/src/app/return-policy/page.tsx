'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { RotateCcw, Truck, CreditCard } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827' }}>RETURN POLICY</h1>
            <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.875rem' }}>Easy 7-day returns, no questions asked</p>
          </div>
        </div>
        <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '800px' }}>
          {/* Quick Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {[
              { icon: <RotateCcw size={28} color="#C9A96E" />, title: '7-Day Window', desc: 'Returns accepted within 7 days of delivery' },
              { icon: <Truck size={28} color="#C9A96E" />, title: 'Free Returns', desc: 'We arrange free pickup from your doorstep' },
              { icon: <CreditCard size={28} color="#C9A96E" />, title: 'Quick Refunds', desc: 'Refunds processed within 5-7 business days' },
            ].map(card => (
              <div key={card.title} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem', color: '#111827' }}>{card.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.8rem', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {[
            { title: 'Eligibility', content: 'Items must be returned within 7 days of delivery. Products must be unused, unwashed, and in their original packaging with all tags intact. Sale items, innerwear, and accessories are not eligible for returns.' },
            { title: 'How to Initiate a Return', content: '1. Log in to your account and go to My Orders.\n2. Select the order and click "Return/Exchange".\n3. Choose the item(s) and reason for return.\n4. Our team will arrange a pickup within 1–2 business days.\n5. Once we receive and inspect the item, we\'ll process your refund or exchange.' },
            { title: 'Refund Process', content: 'Approved refunds are processed to your original payment method within 5–7 business days. For Cash on Delivery orders, refunds are processed via bank transfer or UPI. You will receive an email confirmation once the refund is initiated.' },
            { title: 'Exchanges', content: 'We offer free size exchanges. If you\'d like to exchange for a different size or colour, follow the same return process and mention your preferred exchange item. Exchanges are subject to availability.' },
            { title: 'Damaged or Defective Items', content: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We will arrange an immediate replacement or issue a full refund, including shipping charges.' },
            { title: 'Non-Returnable Items', content: 'The following items cannot be returned: innerwear, accessories, customized products, items damaged due to misuse, and products without original tags or packaging.' },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em', color: '#111827' }}>{section.title}</h2>
              <div style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '0.95rem' }}>
                {section.content.split('\n').map((line, i) => <p key={i} style={{ marginBottom: line.startsWith('1.') || line.match(/^\d\./) ? '0.5rem' : 0 }}>{line}</p>)}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Link href="/contact" className="btn btn-outline">Contact Support</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
