// Dynamic product page now server component (no "use client") so we can supply metadata.
// If getProductById relies on client-only Firebase config, you may need a server-safe fetch.
// Fallback metadata used if fetch fails.

// import { getProductById } from "@/app/lib/services/products";
import ProductPageClient from "@/app/components/ProductPage"; // renamed client component

// export async function generateMetadata({ params }) {
//   const { id } = params;
//   try {
//     const res = await getProductById(id);
//     if (!res.success || !res.data) {
//       return {
//         title: "Product Not Found",
//         description: "Requested product could not be located.",
//       };
//     }
//     const p = res.data;
//     const title = `${p.name} | Forevish`;
//     const description =
//       (p.description && p.description.slice(0, 155)) ||
//       `Discover ${p.name} from Forevish premium women's professional collection.`;
//     const images = (p.mainImages || []).slice(0, 1).map((url) => ({
//       url,
//       width: 800,
//       height: 1000,
//       alt: p.name,
//     }));
//     return {
//       title,
//       description,
//       openGraph: {
//         title,
//         description,
//         type: "product",
//         images,
//       },
//       twitter: {
//         card: "summary_large_image",
//         title,
//         description,
//         images: images.map((i) => i.url),
//       },
//       alternates: {
//         canonical: `/product/${id}`,
//       },
//     };
//   } catch {
//     return {
//       title: "Product | Forevish",
//       description:
//         "Browse premium tailored women's suits, blazers and accessories at Forevish.",
//     };
//   }
// }

export default function ProductPageWrapper({ params }) {
  return <ProductPageClient id={params.id} />;
}
