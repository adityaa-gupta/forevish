"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/app/lib/services/products";
import ProductCard from "@/app/components/ProductCard";
import formatINR from "@/app/lib/helpers/formatPrice";
import { Loader2, Filter, X, ChevronDown } from "lucide-react";

// Helper to convert slug to display name
const slugToName = {
  "coord-sets": "Co-ord set",
  lehengas: "Lehanga",
  indowestern: "Indowestern",
  gowns: "Gown",
  suits: "Suit",
};

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryName =
    slugToName[slug] ||
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Get all products and filter by category
        const result = await getAllProducts();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch products");
        }

        // Filter products by category
        const categoryProducts = result.data.filter(
          (product) =>
            product.category &&
            product.category.toLowerCase() === categoryName.toLowerCase()
        );

        setProducts(categoryProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching category products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [slug, categoryName]);

  // Sort and filter products
  const displayedProducts = (() => {
    let filtered = [...products].filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-low-high":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return filtered.sort((a, b) => b.price - a.price);
      case "newest":
        return filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      default:
        return filtered;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
          <p className="mt-2 text-gray-600">
            Explore our collection of {categoryName.toLowerCase()} for every
            occasion
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <button
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex-1 md:block">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden md:inline">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {displayedProducts.length}{" "}
            {displayedProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Mobile Filters Modal */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
            filtersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transition-transform ${
              filtersOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-medium">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        parseInt(e.target.value) || 0,
                        priceRange[1],
                      ])
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseInt(e.target.value) || 0,
                      ])
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Max"
                  />
                </div>
              </div>

              <button
                className="w-full py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => setFiltersOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="mb-4">
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                }
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value) || 0])
                }
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            // Loading state
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
              >
                <div className="h-60 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : displayedProducts.length === 0 ? (
            // No products state
            <div className="col-span-full text-center py-16">
              <div className="inline-block p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any {categoryName.toLowerCase()} matching
                  your filters.
                </p>
                <Link href={`/category/${slug}`}>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => {
                      setPriceRange([0, 100000]);
                      setSortBy("newest");
                    }}
                  >
                    Clear Filters
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // Products grid
            displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
