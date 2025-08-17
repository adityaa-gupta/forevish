// Dynamic product page now server component (no "use client") so we can supply metadata.
// If getProductById relies on client-only Firebase config, you may need a server-safe fetch.
// Fallback metadata used if fetch fails.

import ProductPageClient from "@/app/components/ProductPage";
import { getProductByIdServer } from "@/app/lib/server/products";

// Helper: serialize Firestore Timestamp-like objects (seconds/nanoseconds) to ISO strings
function serializeValue(val) {
  if (!val || typeof val !== "object") return val;
  // Firestore Timestamp instance (has toDate)
  if (typeof val.toDate === "function") {
    try {
      return val.toDate().toISOString();
    } catch {
      return val.toString();
    }
  }
  // Plain object with seconds & nanoseconds
  if (
    Object.prototype.hasOwnProperty.call(val, "seconds") &&
    Object.prototype.hasOwnProperty.call(val, "nanoseconds")
  ) {
    const ms = val.seconds * 1000 + Math.floor(val.nanoseconds / 1e6);
    return new Date(ms).toISOString();
  }
  return val;
}

function deepSerialize(obj) {
  if (Array.isArray(obj)) return obj.map(deepSerialize);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k in obj) {
      const v = obj[k];
      if (v && typeof v === "object") {
        const serialized = serializeValue(v);
        // If serialization converted it (string), use it; else recurse
        out[k] =
          typeof serialized === "string" || serialized !== v
            ? serialized
            : deepSerialize(serialized);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return obj;
}

function buildImages(product) {
  const imgs = (product?.mainImages || []).filter(Boolean).slice(0, 4);
  return imgs.length ? imgs : ["/default.png"];
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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

// Optional ISR (uncomment if you want periodic revalidation)
// export const revalidate = 300;

export default async function ProductPageWrapper({ params }) {
  const { id } = await params;
  const res = await getProductByIdServer(id);
  const product = res.success ? deepSerialize(res.data) : null;

  // Structured Data (Product) - keep minimal if product not found
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `https://forevish.vercel.app/product/${product.id}`,
        name: product.name,
        description: (product.description || "").slice(0, 500),
        image: (product.mainImages || []).slice(0, 6),
        sku: product.id,
        brand: { "@type": "Brand", name: "Forevish" },
        category: product.category || "Apparel",
        offers: {
          "@type": "Offer",
          url: `https://forevish.vercel.app/product/${product.id}`,
          priceCurrency: "INR",
          price: String(product.discountPrice || product.price || 0),
          availability:
            (product.variants || []).some((v) =>
              (v.colors || []).some((c) => (c.stock || 0) > 0)
            ) || product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(product.rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                ratingCount: product.reviewCount || 1,
              },
            }
          : {}),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Product Not Found",
        description: "Requested product could not be located.",
      };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductPageClient id={id} initialProduct={product} />
    </>
  );
}
