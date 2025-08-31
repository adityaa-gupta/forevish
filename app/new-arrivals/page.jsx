"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/app/lib/services/products";
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  Loader2,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import formatINR from "@/app/lib/helpers/formatPrice";

export default function NewArrivalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("new");
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const result = await getAllProducts();
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch products");
        }

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Filter for new arrivals (within last 30 days)
        const recent = result.data
          .filter((product) => {
            const createdAt =
              product.createdAt?.toDate?.() || new Date(product.createdAt);
            return createdAt >= thirtyDaysAgo;
          })
          .sort((a, b) => {
            // Sort by newest first
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return dateB - dateA;
          });

        // For demo, assume some products have salesCount, or generate random counts
        // In production, you would use actual sales data
        const withSalesData = result.data.map((product) => ({
          ...product,
          salesCount: product.salesCount || Math.floor(Math.random() * 100),
        }));

        // Get trending products by sorting on salesCount
        const trending = [...withSalesData]
          .sort((a, b) => b.salesCount - a.salesCount)
          .slice(0, 12);

        setNewArrivals(recent);
        setTrendingProducts(trending);
        setError(null);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  const getDaysAgo = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="relative bg-blue-900 text-white py-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500"></div>
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-purple-500"></div>
          <div className="absolute -bottom-16 right-32 w-48 h-48 rounded-full bg-indigo-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">New Arrivals</h1>
            <p className="text-blue-200 text-lg">
              Discover our latest collections and trending designs, crafted to
              keep you ahead of the style curve. Explore what's fresh and what's
              popular.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
              activeTab === "new"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar
              className={`h-4 w-4 ${
                activeTab === "new" ? "text-blue-200" : "text-blue-600"
              }`}
            />
            New Arrivals
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
              activeTab === "trending"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${
                activeTab === "trending" ? "text-blue-200" : "text-blue-600"
              }`}
            />
            Trending Now
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* New Arrivals Content */}
        {activeTab === "new" && !loading && !error && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Latest Arrivals{" "}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last 30 days)
                </span>
              </h2>
              <p className="text-gray-500">{newArrivals.length} products</p>
            </div>

            {newArrivals.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No new arrivals yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back soon for new products!
                </p>
                <Link href="/">
                  <span className="inline-block px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Browse All Products
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge={{
                      text: getDaysAgo(product.createdAt),
                      color: "bg-blue-100 text-blue-800",
                    }}
                    showTimestamp={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Products Content */}
        {activeTab === "trending" && !loading && !error && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Flame className="mr-2 h-5 w-5 text-orange-500" />
                Trending Products
              </h2>
              <p className="text-gray-500">
                {trendingProducts.length} products
              </p>
            </div>

            {trendingProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No trending products
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back soon for popular items!
                </p>
                <Link href="/">
                  <span className="inline-block px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Browse All Products
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge={{
                      text: `${product.salesCount}+ sold`,
                      color: "bg-orange-100 text-orange-800",
                    }}
                    trendingRank={trendingProducts.indexOf(product) + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Collection Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-white text-3xl font-bold mb-4">
                New Seasonal Collection
              </h2>
              <p className="text-blue-100 mb-6">
                Explore our carefully curated seasonal collection, featuring
                vibrant colors and comfortable designs perfect for the upcoming
                season.
              </p>
              <Link href="/category/seasonal-collection">
                <span className="inline-flex items-center px-5 py-3 bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors font-medium">
                  View Collection <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </div>
            <div className="relative h-64 md:h-auto overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Seasonal Collection"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, badge, showTimestamp, trendingRank }) {
  const router = useRouter();

  // Calculate total stock across all variants
  const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => {
      const variantStock =
        variant.colors?.reduce(
          (colorTotal, color) => colorTotal + (color.stock || 0),
          0
        ) || 0;
      return total + variantStock;
    }, 0);
  };

  const totalStock = getTotalStock(product.variants);
  const mainImage = product.mainImages?.[0] || "/placeholder-product.jpg";
  const stockStatus =
    totalStock > 10
      ? "In Stock"
      : totalStock > 0
      ? "Low Stock"
      : "Out of Stock";
  const stockClassName =
    totalStock > 10
      ? "bg-green-100 text-green-800"
      : totalStock > 0
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      <div className="relative">
        {/* Trending Rank Badge */}
        {trendingRank && trendingRank <= 3 && (
          <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center z-10 rounded-br-xl shadow-lg">
            <span className="font-bold text-lg">{trendingRank}</span>
          </div>
        )}

        {/* Main Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {badge && (
              <span
                className={`${badge.color} text-xs font-medium px-2 py-1 rounded-full`}
              >
                {badge.text}
              </span>
            )}
            <span
              className={`${stockClassName} text-xs font-medium px-2 py-1 rounded-full`}
            >
              {stockStatus}
            </span>
          </div>

          {/* Improved Quick Shop Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <span className="bg-white text-blue-600 px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg hover:bg-blue-50 transition-colors transform group-hover:translate-y-0 translate-y-4 transition-transform duration-300">
              <ShoppingBag className="h-4 w-4" />
              Quick View
            </span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-auto">
          <span className="font-semibold text-gray-900">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="text-xs font-medium text-red-600">
              {product.discountPercentage}% off
            </span>
          )}
        </div>

        {/* Timestamp for new products */}
        {showTimestamp && product.createdAt && (
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Added on {formatDate(product.createdAt)}
          </div>
        )}

        {/* Trending indicator */}
        {product.salesCount > 0 && !showTimestamp && (
          <div className="mt-3 flex items-center text-xs text-orange-500">
            <Flame className="h-3 w-3 mr-1" />
            {product.salesCount} sold recently
          </div>
        )}
      </div>
    </div>
  );
}
