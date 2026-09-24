'use client';

/**
 * Order Success Page
 * - Animated SVG checkmark
 * - Fetches order details from /orders/:id/public (no auth required)
 * - Shows order meta, itemised table, delivery address
 * - "Download Invoice" button — generates PDF with jsPDF + jspdf-autotable
 * - "Continue Shopping" + "Track Order" CTAs
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderApi } from '@/lib/api';
import { useSettingsStore, type StoreSettings } from '@/lib/settingsStore';
import { Package, ArrowRight, Download, MapPin, CreditCard, Calendar } from 'lucide-react';

const ACCENT = '#C9A96E';
const ACCENT_GLOW = 'rgba(201,169,110,0.15)';

interface OrderItem {
  id: string;
  product: { name: string; images: { url: string }[] };
  variant?: { size: string; color?: string } | null;
  quantity: number;
  price: number;
  size?: string | null;
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  address: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  user: { name: string; email: string };
}

function AnimatedCheckmark() {
  return (
    <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 2rem' }}>
      <style>{`
        @keyframes circleDraw {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes successPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.3); }
          50%      { box-shadow: 0 0 0 16px rgba(201,169,110,0); }
        }
        .success-ring { animation: successPulse 2s ease-in-out infinite; }
      `}</style>
      <div className="success-ring" style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'rgba(201,169,110,0.1)',
        border: `2px solid ${ACCENT}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 52 52" width={52} height={52}>
          <circle
            cx="26" cy="26" r="22"
            fill="none" stroke={ACCENT} strokeWidth="2"
            strokeDasharray="138" strokeDashoffset="138"
            style={{ animation: 'circleDraw 0.6s ease-out 0.1s forwards' }}
          />
          <polyline
            points="14,26 22,34 38,18"
            fill="none" stroke={ACCENT} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="40" strokeDashoffset="40"
            style={{ animation: 'checkDraw 0.4s ease-out 0.7s forwards' }}
          />
        </svg>
      </div>
    </div>
  );
}

async function downloadInvoicePDF(order: Order, settings?: StoreSettings) {
  // Dynamically import jsPDF to avoid SSR issues
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

  // ── Header band ──────────────────────────────────────────────────────────
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

  // ── Invoice meta ─────────────────────────────────────────────────────────
  const shortId = order.id.toUpperCase().slice(0, 8);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  doc.setTextColor(...BLACK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const metaY = 48;
  doc.setFont('helvetica', 'bold');
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
  doc.text(order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online (Razorpay)', 14, metaY + 18);

  const addressLines = [
    order.address.name,
    order.address.line1,
    order.address.line2 || '',
    `${order.address.city}, ${order.address.state} — ${order.address.pincode}`,
  ].filter(Boolean);
  doc.text(addressLines, 100, metaY + 18);

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...ACCENT_RGB);
  doc.setLineWidth(0.5);
  doc.line(14, metaY + 28, 196, metaY + 28);

  // ── Items table ───────────────────────────────────────────────────────────
  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= threshold ? 0 : fee;

  autoTable(doc, {
    startY: metaY + 33,
    head: [['Product', 'Size', 'Qty', 'Unit Price', 'Total']],
    body: order.items.map(item => [
      item.product.name,
      item.size || item.variant?.size || '—',
      item.quantity.toString(),
      `₹${Number(item.price).toLocaleString('en-IN')}`,
      `₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}`,
    ]),
    foot: [
      ['', '', '', 'Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
      ['', '', '', 'Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
      ['', '', '', 'GRAND TOTAL', `₹${Number(order.totalAmount).toLocaleString('en-IN')}`],
    ],
    headStyles: {
      fillColor: BLACK,
      textColor: ACCENT_RGB,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    footStyles: { fontSize: 8, fontStyle: 'bold', fillColor: [245, 245, 245] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...BLACK);
  doc.rect(0, pageH - 18, 210, 18, 'F');
  doc.setTextColor(...GREY);
  doc.setFontSize(7);
  doc.text(`Thank you for shopping with ${storeName}™`, 105, pageH - 8, { align: 'center' });

  doc.save(`${storeName.toUpperCase()}_Invoice_${shortId}.pdf`);
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { settings } = useSettingsStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    orderApi.getPublic(orderId)
      .then(res => setOrder(res.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setPdfLoading(true);
    try {
      await downloadInvoicePDF(order, settings);
    } finally {
      setPdfLoading(false);
    }
  };

  const threshold = settings.freeShippingThreshold ?? 999;
  const fee = settings.standardShippingFee ?? 99;
  const subtotal = order ? order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0) : 0;
  const shipping = subtotal >= threshold ? 0 : fee;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--black)', padding: '4rem 1.5rem 6rem' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .fade-up-delay-1 { animation: fadeUp 0.5s ease-out 0.15s both; }
        .fade-up-delay-2 { animation: fadeUp 0.5s ease-out 0.3s both; }
        .fade-up-delay-3 { animation: fadeUp 0.5s ease-out 0.45s both; }
        .fade-up-delay-4 { animation: fadeUp 0.5s ease-out 0.6s both; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ── Hero ── */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <AnimatedCheckmark />
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#111827',
            marginBottom: '0.5rem',
          }}>Order Confirmed!</h1>
          <p style={{ color: '#4b5563', fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem' }}>
            Thank you for shopping with TEESINDIA™
          </p>
          {order && (
            <p style={{ color: '#6b7280', fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem', marginTop: '0.5rem' }}>
              A confirmation email has been sent to <strong style={{ color: ACCENT }}>{order.user.email}</strong>
            </p>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && order && (
          <>
            {/* ── Order Meta ── */}
            <div className="fade-up-delay-1" style={{
              background: '#ffffff', border: '1px solid #e5e7eb',
              borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                {[
                  { icon: <Package size={14} color={ACCENT} />, label: 'Order ID', value: `#${order.id.slice(0, 8).toUpperCase()}` },
                  { icon: <Calendar size={14} color={ACCENT} />, label: 'Date', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: <CreditCard size={14} color={ACCENT} />, label: 'Payment', value: order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online' },
                  { icon: <MapPin size={14} color={ACCENT} />, label: 'Deliver To', value: `${order.address.city}, ${order.address.state}` },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      {row.icon}
                      <span style={{ fontSize: '0.68rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280' }}>{row.label}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Items Table ── */}
            <div className="fade-up-delay-2" style={{
              background: '#ffffff', border: '1px solid #e5e7eb',
              borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1.25rem' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    {/* Thumbnail */}
                    <div style={{ width: 52, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f4f4f5', border: '1px solid #e5e7eb' }}>
                      {item.product.images[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: '#111827', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.size || item.variant?.size ? `Size: ${item.size || item.variant?.size} · ` : ''}Qty: {item.quantity}
                      </p>
                    </div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#111827', flexShrink: 0 }}>
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                {[
                  { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}` },
                  { label: 'Shipping', value: shipping === 0 ? 'FREE' : `₹${shipping}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem', fontSize: '0.83rem', color: '#4b5563', fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span>{r.label}</span>
                    <span style={{ color: r.value === 'FREE' ? '#16a34a' : '#111827', fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.05rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', color: '#111827' }}>
                  <span>Total</span>
                  <span style={{ color: ACCENT }}>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* ── Delivery Address ── */}
            <div className="fade-up-delay-3" style={{
              background: '#ffffff', border: '1px solid #e5e7eb',
              borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem' }}>Delivery Address</h2>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: '#111827', marginBottom: '0.2rem' }}>{order.address.name}</p>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.35rem' }}>Phone: {order.address.phone}</p>
            </div>

            {/* ── CTAs ── */}
            <div className="fade-up-delay-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleDownloadInvoice}
                disabled={pdfLoading}
                style={{
                  width: '100%', padding: '1rem', borderRadius: 12, border: `1.5px solid ${ACCENT}`,
                  background: 'rgba(201,169,110,0.1)', color: '#855d14',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                  letterSpacing: '0.05em', cursor: pdfLoading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(201,169,110,0.22)`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; }}
              >
                <Download size={16} />
                {pdfLoading ? 'Generating PDF…' : 'Download Invoice'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Link
                  href="/account/orders"
                  style={{
                    padding: '1rem', borderRadius: 12, border: '1px solid #e5e7eb',
                    background: '#ffffff', color: '#111827',
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.85rem',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <Package size={15} /> Track Order
                </Link>
                <Link
                  href="/shop"
                  style={{
                    padding: '1rem', borderRadius: 12, border: 'none',
                    background: ACCENT, color: '#000',
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    boxShadow: `0 4px 20px rgba(201,169,110,0.3)`,
                  }}
                >
                  Continue Shopping <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Fallback: no order data */}
        {!loading && !order && orderId && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b7280', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '1.5rem' }}>
              Could not load order details — but your order was placed successfully!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/account/orders" style={{ padding: '0.85rem 1.5rem', borderRadius: 10, background: ACCENT, color: '#000', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>
                View My Orders
              </Link>
              <Link href="/shop" style={{ padding: '0.85rem 1.5rem', borderRadius: 10, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
