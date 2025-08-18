import { ProductListing } from "./components/ProductListing";
import { getAllProductsServer } from "./lib/server/products";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this page

export default async function Home() {
  const res = await getAllProductsServer();
  // Data already sanitized in server util; safe to pass directly.
  const products = res.success ? res.data : [];

  return (
    <div>
      <ProductListing
        initialProducts={products}
        fetchError={res.success ? null : res.error}
      />
    </div>
  );
}
