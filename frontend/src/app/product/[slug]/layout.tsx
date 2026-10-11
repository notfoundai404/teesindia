import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teesindia.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      const product = data.product;
      if (product) {
        const cleanDesc = product.description
          ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 160)
          : 'Shop premium streetwear and luxury heavyweight apparel at TEESINDIA.';

        const imageUrl = product.images?.[0]?.url
          ? (product.images[0].url.startsWith('http') ? product.images[0].url : `${SITE_URL}${product.images[0].url}`)
          : `${SITE_URL}/logo.svg`;

        return {
          title: `${product.name} — Premium Apparel`,
          description: cleanDesc,
          alternates: {
            canonical: `/product/${slug}`,
          },
          openGraph: {
            title: `${product.name} | TEESINDIA™`,
            description: cleanDesc,
            url: `${SITE_URL}/product/${slug}`,
            type: 'website',
            images: [
              {
                url: imageUrl,
                width: 800,
                height: 1000,
                alt: product.name,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: `${product.name} | TEESINDIA™`,
            description: cleanDesc,
            images: [imageUrl],
          },
        };
      }
    }
  } catch {
    // API not reachable at build/SSR time
  }

  // Fallback for customizer QR product or fetch error
  const isQR = slug === 'teesindia-qr-tshirt';
  const fallbackTitle = isQR ? 'Viral Custom QR T-Shirt — Live Customizer' : 'Product Details';
  const fallbackDesc = isQR
    ? 'Design your custom QR code t-shirt with real-time text phrases and premium garment colorways at TEESINDIA.'
    : 'Discover handcrafted luxury clothing and streetwear at TEESINDIA.';

  return {
    title: fallbackTitle,
    description: fallbackDesc,
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { slug } = await params;
  let productJsonLd: any = null;

  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      const product = data.product;
      if (product) {
        const imageUrls = product.images?.map((img: any) =>
          img.url.startsWith('http') ? img.url : `${SITE_URL}${img.url}`
        ) || [];

        productJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: imageUrls.length ? imageUrls : [`${SITE_URL}/logo.svg`],
          description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 500) || product.name,
          brand: {
            '@type': 'Brand',
            name: 'TEESINDIA',
          },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/product/${slug}`,
            priceCurrency: 'INR',
            price: Number(product.price) || 0,
            availability: (product.stock > 0 || product.variants?.some((v: any) => v.stock > 0))
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        };
      }
    }
  } catch {
    // ignore
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
