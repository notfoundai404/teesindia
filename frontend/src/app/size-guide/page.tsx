'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';



const TSHIRT_SIZES = [
  { size: 'XS', chest: '34-36', length: '26', shoulder: '15' },
  { size: 'S', chest: '36-38', length: '27', shoulder: '16' },
  { size: 'M', chest: '38-40', length: '28', shoulder: '17' },
  { size: 'L', chest: '40-42', length: '29', shoulder: '18' },
  { size: 'XL', chest: '42-44', length: '30', shoulder: '19' },
  { size: 'XXL', chest: '44-46', length: '31', shoulder: '20' },
  { size: '3XL', chest: '46-48', length: '32', shoulder: '21' },
];

const HOODIE_SIZES = [
  { size: 'S', chest: '38-40', length: '25', shoulder: '17', sleeve: '24' },
  { size: 'M', chest: '40-42', length: '26', shoulder: '18', sleeve: '24.5' },
  { size: 'L', chest: '42-44', length: '27', shoulder: '19', sleeve: '25' },
  { size: 'XL', chest: '44-46', length: '28', shoulder: '20', sleeve: '25.5' },
  { size: 'XXL', chest: '46-48', length: '29', shoulder: '21', sleeve: '26' },
];

export default function SizeGuidePage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        {/* Hero */}
        <div style={{ borderBottom: '1px solid var(--border-color)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#855d14', marginBottom: '0.75rem', fontWeight: 600 }}>Find Your Fit</p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827' }}>SIZE GUIDE</h1>
            <p style={{ color: '#6b7280', marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0', lineHeight: 1.7 }}>
              All measurements are in inches. We recommend measuring yourself and comparing with the chart below.
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '4rem 1.5rem 6rem' }}>
          {/* How to Measure */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '-0.02em', color: '#111827' }}>How to Measure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
                { title: 'Length', desc: 'Measure from the highest point of the shoulder to the bottom hem.' },
                { title: 'Shoulder', desc: 'Measure from one shoulder seam to the other across the back.' },
                { title: 'Sleeve', desc: 'Measure from the shoulder seam to the end of the cuff.' },
              ].map(m => (
                <div key={m.title} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem', color: '#111827' }}>{m.title}</h3>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* T-Shirt Size Chart */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: '#111827' }}>T-Shirts & Tops</h2>
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TSHIRT_SIZES.map((row, i) => (
                    <tr key={row.size} style={{ borderBottom: i === TSHIRT_SIZES.length - 1 ? 'none' : '1px solid var(--border-color)', background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{row.size}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.chest}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.length}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hoodie Size Chart */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: '#111827' }}>Hoodies & Sweatshirts</h2>
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)', 'Sleeve (in)'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOODIE_SIZES.map((row, i) => (
                    <tr key={row.size} style={{ borderBottom: i === HOODIE_SIZES.length - 1 ? 'none' : '1px solid var(--border-color)', background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{row.size}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.chest}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.length}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.shoulder}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4b5563' }}>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Fit Guide */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: '#111827' }}>Fit Guide</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[
                { fit: 'Regular Fit', desc: 'Classic cut with room to move. Not too tight, not too loose. True to size.' },
                { fit: 'Oversized Fit', desc: 'Intentionally large and relaxed. Go one size down for a slouchy look, or stay in your size for extra roomy.' },
                { fit: 'Slim Fit', desc: 'Closer to the body without being tight. Great for layering. May run slightly small.' },
              ].map(f => (
                <div key={f.fit} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem', color: '#111827' }}>{f.fit}</h3>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Still not sure about your size?</p>
            <Link href="/contact" className="btn btn-outline">Contact Us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
