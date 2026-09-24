'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, Sparkles } from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';

// ─── Custom-tee thumbnail ──────────────────────────────────────
// Uses the canvas-captured snapshot stored at add-to-cart time.
// If snapshot is missing (legacy items), falls back to a simple
// colored box with the shirt silhouette via SVG filter.

function buildColorMatrix(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >>  8) & 255) / 255;
  const b = ( n        & 255) / 255;
  const fmt = (x: number) => x.toFixed(4);
  return [
    `${fmt(1-r)} 0 0 0 ${fmt(r)}`,
    `${fmt(1-g)} 0 0 0 ${fmt(g)}`,
    `${fmt(1-b)} 0 0 0 ${fmt(b)}`,
    '0 0 0 1 0',
  ].join(' ');
}

interface CustomThumbProps {
  customization: NonNullable<CartItem['customization']>;
  name: string;
}

function CustomThumb({ customization, name }: CustomThumbProps) {
  const { snapshotUrl, colorHex } = customization;

  if (snapshotUrl) {
    // ── Exact canvas snapshot captured at add-to-cart time ──
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={snapshotUrl}
        alt={name}
        style={{
          width: 80,
          height: 96,
          objectFit: 'cover',
          borderRadius: 8,
          display: 'block',
          flexShrink: 0,
        }}
      />
    );
  }

  // ── Fallback: SVG filter recolor (no snapshot) ──
  const uid = colorHex.replace('#', '');
  const mat = buildColorMatrix(colorHex);
  return (
    <div style={{ position: 'relative', width: 80, height: 96, flexShrink: 0 }}>
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id={`fb-${uid}`} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix type="matrix" values={mat} />
          </filter>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#f0ede8,#e8e3dc)', borderRadius: 8 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mockups/tshirt-base.png" alt="" aria-hidden="true" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: `url(#fb-${uid})`, padding: 4 }} />
    </div>
  );
}


// ─── Cart Item Row ────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const imageUrl = item.product.images?.[0]?.url || '/placeholder-product.jpg';
  const isCustom = !!item.customization;

  return (
    <div className="cart-item">
      {/* Product Image — mini t-shirt for custom items, regular img otherwise */}
      <div style={{ width: '80px', flexShrink: 0 }}>
        {isCustom ? (
          <CustomThumb
            customization={item.customization!}
            name={item.product.name}
          />
        ) : (
          <img
            src={imageUrl}
            alt={item.product.name}
            className="cart-item__image"
            style={{ width: '80px', height: '107px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: 'var(--black-card)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg'; }}
          />
        )}
      </div>

      {/* Product Details */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Name */}
        <p className="cart-item__name" title={item.product.name}>
          {item.product.name}
        </p>

        {/* Variant */}
        {item.variant && (
          <p className="cart-item__variant">
            {[item.variant.size, item.variant.color]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* Price */}
        <p className="cart-item__price">
          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
          {item.quantity > 1 && (
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--grey-400)',
                marginLeft: '0.4rem',
                fontWeight: 400,
              }}
            >
              (₹{item.product.price.toLocaleString('en-IN')} each)
            </span>
          )}
        </p>

        {/* Quantity Controls */}
        <div className="cart-item__qty">
          <button
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
            title="Decrease quantity"
          >
            <Minus size={13} />
          </button>

          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            title="Increase quantity"
          >
            <Plus size={13} />
          </button>

          {/* Remove */}
          <button
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
            title="Remove item"
            style={{
              marginLeft: 'auto',
              color: 'var(--grey-400)',
              transition: 'color var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'var(--white)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'var(--grey-400)')
            }
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty Cart State ─────────────────────────────────────────
interface EmptyCartProps {
  onClose: () => void;
}

function EmptyCartState({ onClose }: EmptyCartProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1.25rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--grey-400)',
        }}
      >
        <ShoppingBag size={28} />
      </div>

      <div>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.05rem',
            fontWeight: 600,
            marginBottom: '0.4rem',
          }}
        >
          Your cart is empty
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--grey-400)', lineHeight: 1.6 }}>
          Looks like you haven&apos;t added anything yet.
          <br />
          Start exploring our collection!
        </p>
      </div>

      <Link
        href="/shop"
        onClick={onClose}
        className="btn btn-primary btn-sm"
        style={{ marginTop: '0.5rem' }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}

// ─── Main CartDrawer Component ────────────────────────────────
export default function CartDrawer() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const freeShippingThreshold = settings.freeShippingThreshold ?? 999;
  const { items, isOpen, closeCart, updateQty, removeItem, totalItems, totalPrice } =
    useCartStore();

  const itemCount = totalItems();
  const subtotal = totalPrice();

  // ── Lock body scroll when drawer is open ──────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Escape key closes drawer ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  const handleUpdateQty = useCallback(
    (id: string, qty: number) => {
      updateQty(id, qty);
    },
    [updateQty]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* ── Backdrop Overlay ── */}
      <div
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── Drawer Panel ── */}
      <aside
        className={`cart-drawer${isOpen ? ' open' : ''}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              opacity: 0.7,
              transition: 'opacity var(--transition)',
              padding: '0.25rem',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')
            }
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <EmptyCartState onClose={closeCart} />
          ) : (
            <div>
              {/* Free shipping progress */}
              {subtotal < freeShippingThreshold && (
                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem',
                    color: 'var(--grey-300)',
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Truck size={14} color="#855d14" />
                    <span>
                      Add{' '}
                      <strong style={{ color: '#111827' }}>
                        ₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}
                      </strong>{' '}
                      more for complimentary shipping
                    </span>
                  </p>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      height: '4px',
                      borderRadius: '999px',
                      background: '#e5e7eb',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                        height: '100%',
                        background: '#111827',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= freeShippingThreshold && (
                <div
                  style={{
                    background: 'rgba(201,169,110,0.12)',
                    border: '1px solid rgba(201,169,110,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem',
                    color: '#855d14',
                    textAlign: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={14} color="#855d14" /> You have unlocked complimentary shipping!
                </div>
              )}

              {/* Cart Items */}
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer (only shown when items exist) ── */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            {/* Subtotal */}
            <div className="cart-subtotal">
              <div>
                <p className="cart-subtotal__label">Subtotal</p>
                <p
                  style={{ fontSize: '0.75rem', color: 'var(--grey-600)', marginTop: '0.15rem' }}
                >
                  Taxes & shipping calculated at checkout
                </p>
              </div>
              <p className="cart-subtotal__value">
                ₹{subtotal.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full"
              style={{ marginBottom: '0.85rem' }}
            >
              Proceed to Checkout
            </button>

            {/* Continue Shopping */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={closeCart}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--grey-400)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color var(--transition)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    'var(--white)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    'var(--grey-400)')
                }
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
