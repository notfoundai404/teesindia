/**
 * lib/serverData.ts
 *
 * Server-side data fetching with Next.js cache tags.
 * These functions run on the server (RSC / Route Handlers) and use
 * Next.js fetch() which integrates with the Data Cache.
 *
 * Cache tags enable on-demand revalidation:
 * - revalidateTag('products', 'max') purges ALL product fetches at once
 * - revalidateTag('settings', 'max') purges ALL settings fetches at once
 *
 * ISR revalidation periods:
 * - settings: 60s  (refresh every minute in background)
 * - products: 300s (refresh every 5 minutes in background)
 * - collections: 300s
 * - blog: 3600s (1 hour)
 *
 * Usage in Server Components:
 *   const settings = await fetchSettingsServer();
 *   const products = await fetchProductsServer({ limit: 8 });
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Store Settings ───────────────────────────────────────────────────────────

export async function fetchSettingsServer() {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      next: {
        revalidate: 60,        // ISR: rebuild from DB at most every 60s
        tags: ['settings'],    // Tag: revalidateTag('settings') to purge instantly
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.settings ?? null;
  } catch {
    return null;
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductsQueryParams {
  category?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export async function fetchProductsServer(params: ProductsQueryParams = {}) {
  const qs = new URLSearchParams();
  if (params.category)  qs.set('category',  params.category);
  if (params.sort)      qs.set('sort',       params.sort);
  if (params.search)    qs.set('search',     params.search);
  if (params.page)      qs.set('page',       String(params.page));
  if (params.limit)     qs.set('limit',      String(params.limit));
  if (params.featured)  qs.set('featured',   'true');

  try {
    const res = await fetch(`${API_BASE}/products?${qs.toString()}`, {
      next: {
        revalidate: 300,       // ISR: 5-minute background refresh
        tags: ['products'],    // Tag: revalidateTag('products') to purge instantly
      },
    });
    if (!res.ok) return { products: [], total: 0, pages: 1 };
    return await res.json();
  } catch {
    return { products: [], total: 0, pages: 1 };
  }
}

// ─── Single Product ────────────────────────────────────────────────────────────

export async function fetchProductServer(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, {
      next: {
        revalidate: 300,
        tags: ['products', `product-${slug}`],
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product ?? null;
  } catch {
    return null;
  }
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function fetchCollectionsServer() {
  try {
    const res = await fetch(`${API_BASE}/collections`, {
      next: {
        revalidate: 300,
        tags: ['collections'],
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.collections ?? [];
  } catch {
    return [];
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function fetchCategoriesServer() {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: {
        revalidate: 300,
        tags: ['categories'],
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch {
    return [];
  }
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function fetchBlogPostsServer(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page)  qs.set('page',  String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  try {
    const res = await fetch(`${API_BASE}/blog?${qs.toString()}`, {
      next: {
        revalidate: 3600,
        tags: ['blog'],
      },
    });
    if (!res.ok) return { posts: [], total: 0, pages: 1 };
    return await res.json();
  } catch {
    return { posts: [], total: 0, pages: 1 };
  }
}
