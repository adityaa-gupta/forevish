// Dynamic product page now server component (no "use client") so we can supply metadata.
// If getProductById relies on client-only Firebase config, you may need a server-safe fetch.
// Fallback metadata used if fetch fails.

import ProductPageClient from "@/app/components/ProductPage";
import { getProductByIdServer } from "@/app/lib/server/products";

function buildImages(product) {
  const imgs = (product?.mainImages || []).filter(Boolean).slice(0, 4);
  if (!imgs.length)
    return [
      { url: "/default.png", width: 800, height: 800, alt: "Forevish Product" },
    ];
  return imgs.map((url, i) => ({
    url,
    width: 800,
    height: 1000,
    alt: `${product.name}${i ? ` Image ${i + 1}` : ""}`,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const res = await getProductByIdServer(id);

  if (!res.success) {
    return {
      title: "Product Not Found | Forevish",
      description:
        "Requested product could not be located. Explore premium tailored women's suits and blazers at Forevish.",
      alternates: { canonical: `/product/${id}` },
      openGraph: {
        title: "Product Not Found | Forevish",
        description:
          "Requested product could not be located. Explore premium tailored women's suits and blazers at Forevish.",
        // type removed (Next.js metadata validation was rejecting 'product')
        images: ["/default.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: "Product Not Found | Forevish",
        description:
          "Requested product could not be located. Explore premium tailored women's suits and blazers at Forevish.",
        images: ["/default.png"],
      },
    };
  }

  const p = res.data;
  const title = `${p.name} | Forevish`;
  const rawDesc =
    p.description ||
    `Discover ${p.name} from Forevish premium women's professional collection.`;
  const description =
    rawDesc.length > 155 ? rawDesc.slice(0, 152).trim() + "..." : rawDesc;
  const images = buildImages(p);

  return {
    title,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title,
      description,
      // type removed to avoid "Invalid OpenGraph type: product"
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

// Optional ISR (uncomment if you want periodic revalidation)
// export const revalidate = 300;

export default function ProductPageWrapper({ params }) {
  return <ProductPageClient id={params.id} />;
}
