'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSettingsStore, type StoreSettings } from '@/lib/settingsStore';
import { ChevronRight, Package, Truck, Check, X, MapPin, ArrowLeft, Download } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  product: { name: string; images: { url: string }[]; slug: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  address: {
    name: string; phone: string; line1: string; line2?: string;
    city: string; state: string; pincode: string;
  };
}

async function downloadInvoicePDF(order: Order, settings?: StoreSettings) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const storeName = settings?.storeName || 'TEESINDIA';
  const tagline = (settings?.tagline || 'PREMIUM CUSTOM APPAREL').toUpperCase();
  const threshold = settings?.freeShippingThreshold ?? 999;
  const fee = settings?.standardShippingFee ?? 99;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ACCENT_RGB: [number, number, number] = [201, 169, 110];
  const BLACK: [number, number, number] = [10, 10, 10];
  const GREY: [number, number, number] = [100, 100, 100];

  // Header band
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(...ACCENT_RGB);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(tagline, 14, 12);

  doc.setFontSize(22);
  doc.text(`${storeName.toUpperCase()}™`, 14, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX INVOICE', 196, 24, { align: 'right' });

  // Invoice meta
  const shortId = order.id.toUpperCase().slice(0, 8);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const metaY = 48;
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Order ID', 14, metaY);
  doc.text('Date', 100, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text(`#${shortId}`, 14, metaY + 5);
  doc.text(date, 100, metaY + 5);

  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment', 14, metaY + 13);
  doc.text('Bill To', 100, metaY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text(order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online', 14, metaY + 18);

  const addressLines = [
    order.address.name,
    order.address.line1,
    order.address.line2 || '',
    `${order.address.city}, ${order.address.state} — ${order.address.pincode}`,
  ].filter(Boolean);
  doc.text(addressLines, 100, metaY + 18);

  doc.setDrawColor(...ACCENT_RGB);
  doc.setLineWidth(0.5);
  doc.line(14, metaY + 28, 196, metaY + 28);

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= threshold ? 0 : fee;

  autoTable(doc, {
    startY: metaY + 33,
    head: [['Product', 'Size', 'Qty', 'Unit Price', 'Total']],
    body: order.items.map(item => [
      item.product.name,
      item.size || 'Standard',
      item.quantity.toString(),
      `₹${Number(item.price).toLocaleString('en-IN')}`,
      `₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}`,
    ]),
    foot: [
      ['', '', '', 'Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
      ['', '', '', 'Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
      ['', '', '', 'GRAND TOTAL', `₹${Number(order.totalAmount).toLocaleString('en-IN')}`],
    ],
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [245, 245, 245], textColor: [...BLACK], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  doc.save(`${storeName.toUpperCase()}-Invoice-${shortId}.pdf`);
}

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#60a5fa', PROCESSING: '#a78bfa',
  SHIPPED: '#34d399', DELIVERED: '#4ade80', CANCELLED: '#f87171',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    orderApi.get(id).then(res => setOrder(res.data.order)).catch(() => router.push('/account')).finally(() => setLoading(false));
  }, [user, id, router]);

  if (loading) return (
    <><Navbar /><CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </main><Footer /></>
  );

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <><Navbar /><CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--grey-400)', marginBottom: '2rem' }}>
            <Link href="/account" style={{ color: 'var(--grey-400)' }}>Account</Link>
            <ChevronRight size={14} />
            <Link href="/account" style={{ color: 'var(--grey-400)' }}>My Orders</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--white)' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', background: `${STATUS_COLOR[order.status] || '#888'}20`, color: STATUS_COLOR[order.status] || '#888', border: `1px solid ${STATUS_COLOR[order.status] || '#888'}40` }}>
              {order.status}
            </span>
          </div>

          {/* Order Progress Tracker */}
          {!isCancelled && (
            <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2rem' }}>Order Progress</h2>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {i > 0 && (
                        <div style={{ position: 'absolute', top: '18px', right: '50%', width: '100%', height: '2px', background: i <= stepIndex ? '#0a0a0a' : '#e5e7eb', zIndex: 0 }} />
                      )}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? '#0a0a0a' : '#ffffff', border: `2px solid ${done ? '#0a0a0a' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, transition: 'all 0.3s' }}>
                        {done ? <Check size={16} color="white" strokeWidth={3} /> : <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d1d5db', display: 'block' }} />}
                      </div>
                      <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.04em', color: done ? 'var(--white)' : 'var(--grey-400)', marginTop: '0.5rem', textAlign: 'center', textTransform: 'capitalize' }}>
                        {step.toLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <style>{`@media(min-width:1024px){.order-detail-grid{grid-template-columns:1fr 380px !important;}}`}</style>
            <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Order Items */}
              <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>Items ({order.items.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <Link href={`/product/${item.product.slug}`} style={{ flexShrink: 0, width: '72px', height: '90px', background: '#f4f4f5', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'block', border: '1px solid #e5e7eb' }}>
                        {item.product.images[0] && <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </Link>
                      <div style={{ flex: 1 }}>
                        <Link href={`/product/${item.product.slug}`} style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>{item.product.name}</Link>
                        <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)' }}>
                          {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                    <span>Total</span>
                    <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Delivery Address */}
                <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} /> Delivery Address
                  </h2>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: '0.25rem' }}>{order.address.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--grey-400)', lineHeight: 1.7 }}>
                    {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                    {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                    {order.address.phone}
                  </p>
                </div>

                {/* Payment Info */}
                <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Payment</h2>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--grey-400)' }}>Method</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--grey-400)' }}>Status</span>
                    <span style={{ fontWeight: 600, color: order.paymentStatus === 'PAID' ? '#16a34a' : '#d97706' }}>{order.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/account" className="btn btn-outline" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={15} /> Back to Orders
            </Link>
            <button
              onClick={() => downloadInvoicePDF(order, settings)}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <Download size={15} /> Download Tax Invoice (PDF)
            </button>
            <Link href="/shop" className="btn btn-outline" style={{ gap: '0.5rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
