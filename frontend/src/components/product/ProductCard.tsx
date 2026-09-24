'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { cartApi } from '@/lib/api';

// ─── Product type ─────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  badge?: string; // e.g. 'NEW', 'SALE', 'HOT'
  isNew?: boolean;
  isSale?: boolean;
  variants?: { id: string; size: string; color?: string; stock: number }[];
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const mainImage = product.images?.[0]?.url ?? '';
  const hoverImage = product.images?.[1]?.url ?? mainImage;

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use first available variant or no variant
    const firstVariant = product.variants?.find((v) => v.stock > 0);

    setAddingToCart(true);
    try {
      await cartApi.add({
        productId: product.id,
        variantId: firstVariant?.id,
        quantity: 1,
      });

      addItem({
        id: `${product.id}-${firstVariant?.id ?? 'default'}`,
        productId: product.id,
        variantId: firstVariant?.id,
        quantity: 1,
        product: {
          name: product.name,
          price: product.price,
          images: product.images,
          slug: product.slug,
        },
        variant: firstVariant ? { size: firstVariant.size, color: firstVariant.color } : undefined,
      });

      openCart();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const badgeLabel = product.badge ?? (product.isNew ? 'NEW' : product.isSale ? 'SALE' : '');

  return (
    <Link href={`/product/${product.slug}`} className={`product-card ${className}`}>
      {/* ── Image wrapper ── */}
      <div className="product-card__image-wrap">
        {/* Badge */}
        {badgeLabel && (
          <span className={`product-card__badge${product.isSale ? ' sale' : ''}`}>
            {badgeLabel}
          </span>
        )}

        {/* Wishlist */}
        <button
          className="product-card__wishlist"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            fill={wishlisted ? '#e11d48' : 'none'}
            stroke={wishlisted ? '#e11d48' : 'currentColor'}
          />
        </button>

        {/* Main image */}
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={product.images?.[0]?.alt ?? product.name}
            className="product-card__image-main"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 50%, #f4f4f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={40} color="rgba(0,0,0,0.2)" />
          </div>
        )}

        {/* Hover image */}
        {hoverImage && hoverImage !== mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            className="product-card__image-hover"
            loading="lazy"
          />
        )}

        {/* Quick-add button */}
        <button
          className="product-card__quick-add"
          onClick={handleQuickAdd}
          disabled={addingToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {addingToCart ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Adding…
            </span>
          ) : (
            'Quick Add'
          )}
        </button>
      </div>

      {/* ── Product info ── */}
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <p>
          <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <>
              <span className="product-card__compare-price">
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
              <span
                style={{
                  marginLeft: '0.4rem',
                  fontSize: '0.75rem',
                  color: '#aaa',
                  fontWeight: 600,
                }}
              >
                ({discount}% off)
              </span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
