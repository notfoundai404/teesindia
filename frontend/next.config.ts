import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
    unoptimized: true,
  },

  // ─── HTTP Cache-Control Headers (CDN / Vercel Edge) ─────────────────────────
  // These tell Cloudflare / Vercel Edge to cache pages close to the user.
  // - s-maxage          → how long the CDN stores a fresh copy (public cache)
  // - stale-while-revalidate → serve stale while fetching fresh in the background
  async headers() {
    return [
      // Store Settings API response — short TTL, very fast stale serve
      {
        source: '/api/settings',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      // Storefront homepage — cached at edge for 60s, stale-serve for 5 min
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      // Shop & collections — products change infrequently, 5 min fresh cache
      {
        source: '/shop',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/collections',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // Individual product pages — 5 min cache, 10 min stale
      {
        source: '/product/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // Static brand pages (about, faqs, blog) — 1 hour cache
      {
        source: '/(about|faqs|blog|contact|size-guide|shipping-policy|return-policy)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },
    ];
  },

  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const serverBase = apiBase.replace(/\/api\/?$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${serverBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
