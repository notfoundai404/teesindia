import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: { url: string }[];
    slug: string;
  };
  variant?: { size: string; color?: string };
  /** Custom-tee preview data — carries the live customizer state into the cart */
  customization?: {
    colorHex: string;
    textColor: string;
    printText: string;
    snapshotUrl?: string;   // base64 PNG — exact canvas-captured preview
    socialLink?: {
      type: string;
      value: string;
    };
  };
}

function sameCustomization(
  left: CartItem['customization'],
  right: CartItem['customization'],
): boolean {
  if (!left || !right) return left === right;
  return left.colorHex === right.colorHex
    && left.textColor === right.textColor
    && left.printText === right.printText
    && left.snapshotUrl === right.snapshotUrl
    && left.socialLink?.type === right.socialLink?.type
    && left.socialLink?.value === right.socialLink?.value;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

// ─── Auth Store ───────────────────────────────────────────
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'teesindia-auth' }
  )
);

// ─── Cart Store ───────────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const existing = get().items.find(
      (i) => i.productId === item.productId
        && i.variantId === item.variantId
        && sameCustomization(i.customization, item.customization)
    );
    if (existing) {
      set({ items: get().items.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i) });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  updateQty: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return; }
    set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: qty } : i) });
  },
  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));

// ─── Wishlist Store ───────────────────────────────────────
interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const ids = get().productIds;
        set({ productIds: ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId] });
      },
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'teesindia-wishlist' }
  )
);
