'use client';

/**
 * CheckoutPage — 3-step funnel
 *
 * Step 1: Account Info  (name, email, phone)
 * Step 2: Delivery      (address)
 * Step 3: Payment       (Razorpay online | COD)
 *
 * Works for both logged-in users (pre-fills fields) and guests.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { paymentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Check, ChevronRight, Lock, ShoppingBag, CreditCard, Truck, User } from 'lucide-react';

/* ─── constants ─── */
const ACCENT      = '#C9A96E';
const ACCENT_GLOW = 'rgba(201,169,110,0.2)';
const STEPS       = ['Account', 'Delivery', 'Payment'] as const;
type Step = 0 | 1 | 2;

/* ─── shared field styles ─── */
const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  color: '#0a0a0a',
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
};

/* ─── helpers ─── */
function loadRazorpay(): Promise<void> {
  return new Promise(resolve => {
    if ((window as unknown as Record<string, unknown>).Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

/* ─── sub-components ─── */

function StepDots({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {STEPS.map((label, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? ACCENT : active ? 'rgba(201,169,110,0.15)' : '#f3f4f6',
                border: `2px solid ${done || active ? ACCENT : '#e5e7eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done ? '#000' : active ? ACCENT : '#9ca3af',
                fontSize: '0.75rem', fontWeight: 700,
                boxShadow: active ? `0 0 0 4px ${ACCENT_GLOW}` : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? <Check size={15} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.65rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? ACCENT : done ? '#374151' : '#9ca3af', transition: 'color 0.3s' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 80, height: 2, background: i < step ? ACCENT : '#e5e7eb', borderRadius: 1, margin: '0 0.5rem', marginBottom: '1.4rem', transition: 'background 0.4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <div style={{ color: ACCENT }}>{icon}</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0a0a0a' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.73rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.07em', color: '#374151', textTransform: 'uppercase' }}>{label}</label>
      <input
        id={id}
        style={fieldStyle}
        onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
        onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
        {...props}
      />
    </div>
  );
}

/* ─── main page ─── */
export default function CheckoutPage() {
  const router                        = useRouter();
  const { settings }                  = useSettingsStore();
  const { items, totalPrice, clearCart} = useCartStore();
  const { user }                       = useAuthStore();

  const [step, setStep]       = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const submitting             = useRef(false); // guard against double-click / double-submit

  /* Step 1 — account info */
  const [account, setAccount] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '',
  });

  /* Step 2 — delivery address */
  const [address, setAddress] = useState({
    line1:   '',
    line2:   '',
    city:    '',
    state:   '',
    pincode: '',
  });

  /* Step 3 — payment method */
  const [payMethod, setPayMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  const threshold = settings.freeShippingThreshold ?? 999;
  const fee       = settings.standardShippingFee ?? 99;
  const subtotal  = totalPrice();
  const shipping  = subtotal >= threshold ? 0 : fee;
  const total     = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0) router.replace('/shop');
  }, [items, router]);

  /* Pre-fill from logged-in user */
  useEffect(() => {
    if (user) setAccount(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

  /* ─── Step validations ─── */
  const step1Valid = account.name.trim() && account.email.includes('@') && account.phone.trim().length >= 10;
  const step2Valid = address.line1.trim() && address.city.trim() && address.state.trim() && address.pincode.trim().length === 6;

  /* ─── Place order & pay ─── */
  const handlePlaceOrder = async () => {
    if (submitting.current) return; // prevent double-submission
    submitting.current = true;
    setLoading(true);
    try {
      // ── Single backend call: user + address + order + Razorpay order ──
      const res = await paymentApi.checkout({
        name:          account.name,
        email:         account.email,
        phone:         account.phone,
        address,
        paymentMethod: payMethod,
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity:  i.quantity,
          size:      i.variant?.size,
          price:     i.product.price,   // needed for custom-tee fallback pricing
        })),
      });

      const data = res.data;

      // ── COD path ──
      if (payMethod === 'COD') {
        clearCart();
        toast.success('Order placed! We will deliver soon.');
        router.push(`/order-success?id=${data.orderId}`);
        submitting.current = false;
        return;
      }

      // ── Razorpay Online path ──
      await loadRazorpay();

      type RzpCtor = new (opts: unknown) => { open: () => void };
      const RazorpayClass = (window as unknown as { Razorpay: RzpCtor }).Razorpay;

      const options = {
        key:          data.keyId,
        amount:       data.amount,          // in paise, from backend
        currency:     data.currency,
        name:         settings.storeName || 'TEESINDIA',
        description:  settings.tagline || 'Premium Custom Apparel',
        order_id:     data.razorpayOrderId, // Razorpay order ID from backend
        prefill:      data.prefill,         // { name, email, contact }
        notes:        {
          address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} — ${address.pincode}`,
        },
        theme:   { color: '#0a0a0a' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            submitting.current = false;
            toast.error('Payment cancelled');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          try {
            // Server-side HMAC signature verification
            await paymentApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             data.orderId,
            });
            clearCart();
            toast.success('Payment successful! Order confirmed.');
            router.push(`/order-success?id=${data.orderId}`);
          } catch {
            toast.error('Payment verification failed — please contact support.');
            setLoading(false);
            submitting.current = false;
          }
        },
      };

      new RazorpayClass(options).open();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Something went wrong. Please try again.');
      setLoading(false);
      submitting.current = false;
    }
  };

  /* ─── Render ─── */
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar />
      <CartDrawer />

      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem 6rem', maxWidth: 900 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.6rem' }}>Secure Checkout</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#0a0a0a' }}>COMPLETE YOUR ORDER</h1>
          </div>

          <StepDots step={step} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <style>{`@media(min-width:900px){.co-grid{grid-template-columns:1fr 360px !important;}}`}</style>
            <div className="co-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'start' }}>

              {/* ── LEFT PANEL ── */}
              <div>

                {/* ════ STEP 1: Account Info ════ */}
                {step === 0 && (
                  <SectionCard icon={<User size={18} />} title="Your Information">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Field label="Full Name" id="acct-name" type="text" value={account.name} onChange={e => setAccount(p => ({ ...p, name: e.target.value }))} placeholder="Rahul Sharma" required />
                      </div>
                      <Field label="Email Address" id="acct-email" type="email" value={account.email} onChange={e => setAccount(p => ({ ...p, email: e.target.value }))} placeholder="rahul@gmail.com" required />
                      <Field label="Phone Number" id="acct-phone" type="tel" value={account.phone} onChange={e => setAccount(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" required />
                    </div>

                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(201,169,110,0.08)', borderRadius: 8, border: `1px solid rgba(201,169,110,0.25)`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={13} color={ACCENT} />
                      <p style={{ fontSize: '0.73rem', color: '#4b5563', fontFamily: "'Space Grotesk', sans-serif" }}>Your details are only used for order fulfilment. We never share them.</p>
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      disabled={!step1Valid}
                      style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', borderRadius: 12, border: 'none', background: step1Valid ? ACCENT : '#f3f4f6', color: step1Valid ? '#000' : '#9ca3af', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', cursor: step1Valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                    >
                      Continue to Delivery <ChevronRight size={16} />
                    </button>
                  </SectionCard>
                )}

                {/* ════ STEP 2: Delivery Address ════ */}
                {step === 1 && (
                  <SectionCard icon={<Truck size={18} />} title="Delivery Address">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Field label="Address Line 1" id="addr-l1" type="text" value={address.line1} onChange={e => setAddress(p => ({ ...p, line1: e.target.value }))} placeholder="House/Flat No., Street, Area" required />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Field label="Address Line 2 (Optional)" id="addr-l2" type="text" value={address.line2} onChange={e => setAddress(p => ({ ...p, line2: e.target.value }))} placeholder="Landmark, Colony" />
                      </div>
                      <Field label="City" id="addr-city" type="text" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" required />
                      <Field label="State" id="addr-state" type="text" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" required />
                      <Field label="PIN Code" id="addr-pin" type="text" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value.slice(0, 6) }))} placeholder="400001" maxLength={6} required />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button onClick={() => setStep(0)} style={{ flex: 1, padding: '1rem', borderRadius: 12, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                        Back
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!step2Valid}
                        style={{ flex: 2, padding: '1rem', borderRadius: 12, border: 'none', background: step2Valid ? ACCENT : '#f3f4f6', color: step2Valid ? '#000' : '#9ca3af', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', cursor: step2Valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        Continue to Payment <ChevronRight size={16} />
                      </button>
                    </div>
                  </SectionCard>
                )}

                {/* ════ STEP 3: Payment ════ */}
                {step === 2 && (
                  <SectionCard icon={<CreditCard size={18} />} title="Payment Method">
                    {loading ? (
                      /* While Razorpay loads / modal is open — show single loading state */
                      <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.25rem' }} />
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#111827', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                          {payMethod === 'COD' ? 'Placing your order…' : 'Opening payment gateway…'}
                        </p>
                        <p style={{ fontSize: '0.73rem', color: '#6b7280', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {payMethod === 'COD' ? 'Please wait a moment.' : 'Complete payment in the Razorpay window.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Method selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          {([
                            { value: 'RAZORPAY', label: 'Pay Online',      sub: 'UPI · Cards · NetBanking · Wallets' },
                            { value: 'COD',      label: 'Cash on Delivery', sub: 'Pay when your order arrives'       },
                          ] as const).map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem', border: `1.5px solid ${payMethod === opt.value ? ACCENT : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer', background: payMethod === opt.value ? 'rgba(201,169,110,0.08)' : '#ffffff', transition: 'all 0.2s', boxShadow: payMethod === opt.value ? `0 0 0 3px ${ACCENT_GLOW}` : 'none' }}>
                              <input type="radio" name="pay" value={opt.value} checked={payMethod === opt.value} onChange={() => setPayMethod(opt.value)} style={{ accentColor: ACCENT, width: 16, height: 16 }} />
                              <div>
                                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.2rem' }}>{opt.label}</p>
                                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.75rem', color: '#6b7280' }}>{opt.sub}</p>
                              </div>
                              {payMethod === opt.value && <Check size={16} color={ACCENT} style={{ marginLeft: 'auto' }} />}
                            </label>
                          ))}
                        </div>

                        {/* Summary of filled info */}
                        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                          {[
                            { label: 'Name',       value: account.name },
                            { label: 'Email',      value: account.email },
                            { label: 'Phone',      value: account.phone },
                            { label: 'Deliver to', value: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} — ${address.pincode}` },
                          ].map(r => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb', gap: '1rem' }}>
                              <span style={{ fontSize: '0.72rem', fontFamily: "'Space Grotesk', sans-serif", color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>{r.label}</span>
                              <span style={{ fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif", color: '#111827', textAlign: 'right', wordBreak: 'break-word', fontWeight: 500 }}>{r.value}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1rem', borderRadius: 12, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                            Back
                          </button>
                          <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            style={{ flex: 2, padding: '1rem', borderRadius: 12, border: 'none', background: ACCENT, color: '#000', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: `0 4px 24px ${ACCENT_GLOW}`, transition: 'opacity 0.2s' }}
                          >
                            {payMethod === 'COD'
                              ? <><ShoppingBag size={16} /> Place Order</>
                              : <><Lock size={15} /> Pay ₹{total.toLocaleString('en-IN')}</>
                            }
                          </button>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: '0.68rem', color: '#6b7280', marginTop: '1rem', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}>
                          Secured by Razorpay · 256-bit SSL
                        </p>
                      </>
                    )}
                  </SectionCard>
                )}

              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 'calc(40px + 72px + 2rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem', color: '#111827' }}>
                  Order Summary <span style={{ color: '#6b7280', fontWeight: 500 }}>({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                </h2>

                {/* Cart items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', maxHeight: 280, overflowY: 'auto' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {/* thumbnail */}
                      <div style={{ width: 52, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f4f4f5', border: '1px solid #e5e7eb' }}>
                        {item.customization?.snapshotUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.customization.snapshotUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : item.product.images[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : null}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#111827' }}>{item.product.name}</p>
                        {item.variant && <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Size: {item.variant.size}</p>}
                        <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#111827', flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  {[
                    { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}` },
                    { label: 'Shipping', value: shipping === 0 ? 'FREE' : `₹${shipping}` },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.83rem', color: '#4b5563' }}>
                      <span>{r.label}</span>
                      <span style={{ color: r.value === 'FREE' ? '#16a34a' : '#111827', fontWeight: 600 }}>{r.value}</span>
                    </div>
                  ))}
                  {shipping > 0 && <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.75rem' }}>Add ₹{(threshold - subtotal).toLocaleString('en-IN')} more for free shipping</p>}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', color: '#111827' }}>
                    <span>Total</span>
                    <span style={{ color: ACCENT }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Security badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', padding: '0.65rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <Lock size={12} color={ACCENT} />
                  <span style={{ fontSize: '0.68rem', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', color: '#6b7280' }}>256-BIT SSL SECURED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
