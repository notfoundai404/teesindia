import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate
 *
 * On-Demand Revalidation webhook — called by the backend whenever an admin
 * saves settings, publishes a product, or modifies a collection.
 *
 * This instantly purges the Next.js Data Cache (and Vercel Edge Cache when
 * deployed), so the very next shopper sees the updated storefront without
 * waiting for the CDN TTL to expire.
 *
 * How it works (Flipkart/Amazon pattern):
 *   1. Admin saves settings in admin panel.
 *   2. Backend saves to DB, then fires POST /api/revalidate with the secret.
 *   3. Next.js purges cached pages from its Data Cache.
 *   4. Next CDN request rebuilds the page on-the-fly (ISR), caches it again.
 *   TTFB stays low; content is always fresh.
 *
 * Security: request must include X-Revalidate-Secret header matching
 * the REVALIDATE_SECRET env var (shared between backend and frontend).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-revalidate-secret');

  // Auth guard
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid revalidation secret.' },
      { status: 401 }
    );
  }

  let body: { paths?: string[]; tags?: string[]; scope?: string } = {};
  try {
    body = await req.json();
  } catch {
    // No body is fine - default to full revalidation
  }

  const revalidated: string[] = [];

  // Tag-based revalidation (most targeted)
  if (body.tags && body.tags.length > 0) {
    for (const tag of body.tags) {
      revalidateTag(tag, 'max');
      revalidated.push(`tag:${tag}`);
    }
  }

  // Path-based revalidation
  if (body.paths && body.paths.length > 0) {
    for (const p of body.paths) {
      revalidatePath(p, 'page');
      revalidated.push(`path:${p}`);
    }
  }

  // Scope-based revalidation (convenience shortcuts)
  const scope = body.scope;

  if (!scope || scope === 'all') {
    // Full storefront purge - called when settings change (theme, hero, nav...)
    revalidatePath('/', 'layout');
    revalidateTag('settings', 'max' as any);
    revalidated.push('scope:all');
  }

  if (scope === 'settings') {
    // Settings only - called after PUT /api/settings/admin
    revalidatePath('/', 'layout');
    revalidateTag('settings', 'max' as any);
    revalidated.push('scope:settings');
  }

  if (scope === 'products') {
    // Product catalog changed - new product, price change, stock update
    revalidatePath('/shop', 'page');
    revalidatePath('/[...slug]', 'layout'); // Just to be safe for products
    revalidateTag('products', 'max' as any);
    revalidated.push('scope:products');
  }

  if (scope === 'collections') {
    // Collection updated
    revalidatePath('/collections', 'page');
    revalidatePath('/[...slug]', 'layout');
    revalidateTag('collections', 'max' as any);
    revalidated.push('scope:collections');
  }

  if (scope === 'blog') {
    revalidatePath('/blog', 'page');
    revalidateTag('blog', 'max' as any);
    revalidated.push('scope:blog');
  }

  return NextResponse.json({
    revalidated: true,
    revalidated_items: revalidated,
    timestamp: new Date().toISOString(),
  });
}
