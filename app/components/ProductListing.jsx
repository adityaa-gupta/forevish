"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Heart, ShoppingCart } from "lucide-react";
import {
  addItemToCart,
  removeItemFromCart,
} from "../_store/features/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../_store/features/wishlistSlice";
import { setFilterLoading } from "../_store/features/filterSlice";
import ProductFilter from "./ProductFilter";
import Link from "next/link";
import formatPrice from "../lib/helpers/formatPrice";

export function ProductListing({ initialProducts = [], fetchError = null }) {
  const [selectedColors, setSelectedColors] = useState({});
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isProductInCart = (productId, selectedColor) =>
    cartItems.some((item) => item.id === `${productId}-${selectedColor}`);

  const getCartItemQuantity = (productId, selectedColor) => {
    const cartItem = cartItems.find(
      (item) => item.id === `${productId}-${selectedColor}`
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const isProductInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const getColorHex = (colorName) => {
    const colorMap = {
      red: "#dc2626",
      white: "#ffffff",
      black: "#000000",
      blue: "#2563eb",
      green: "#16a34a",
      yellow: "#eab308",
      purple: "#9333ea",
      pink: "#ec4899",
      gray: "#6b7280",
      brown: "#a16207",
    };
    return colorMap[colorName?.toLowerCase()] || "#6b7280";
  };

  const transformed = useMemo(() => {
    return initialProducts.map((product) => {
      const allColors = [];
      const allSizes = [];
      let totalStock = 0;
      product.variants?.forEach((variant) => {
        allSizes.push(variant.size);
        variant.colors?.forEach((c) => {
          if (
            c?.color &&
            !allColors.find((x) => x.value === c.color.toLowerCase())
          ) {
            allColors.push({
              name: c.color,
              value: c.color.toLowerCase(),
              hex: getColorHex(c.color),
              stock: c.stock,
              images: c.images,
            });
          }
          totalStock += c.stock || 0;
        });
      });
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image:
          product.mainImages?.[0] || "/placeholder.svg?height=400&width=300",
        colors: allColors,
        sizes: [...new Set(allSizes)],
        stock: totalStock,
        category: product.category || "",
        isActive: product.isActive,
        isNew: product.isNew || false,
        isOnSale:
          product.originalPrice && product.originalPrice > product.price,
        createdAtISO: product.createdAtISO,
        variants: product.variants,
      };
    });
  }, [initialProducts]);

  const handleFilterChange = () => {
    dispatch(setFilterLoading(true));
    setTimeout(() => dispatch(setFilterLoading(false)), 300);
  };

  const handleColorChange = (productId, colorValue) =>
    setSelectedColors((prev) => ({ ...prev, [productId]: colorValue }));

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { text: "Out of Stock", className: "bg-red-100 text-red-800" };
    if (stock <= 5)
      return {
        text: "Limited Stock",
        className: "bg-yellow-100 text-yellow-800",
      };
    return { text: "In Stock", className: "bg-green-100 text-green-800" };
  };

  const handleAddToCart = (product, selectedColor) => {
    dispatch(
      addItemToCart({
        id: `${product.id}-${selectedColor}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: selectedColor,
        quantity: 1,
      })
    );
  };

  const handleRemoveFromCart = (productId, selectedColor) =>
    dispatch(removeItemFromCart({ id: `${productId}-${selectedColor}` }));

  const handleWishlistToggle = (product) => {
    if (isProductInWishlist(product.id)) {
      dispatch(removeFromWishlist({ id: product.id }));
    } else {
      dispatch(
        addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        })
      );
    }
  };

  // Filters
  const filteredProducts = transformed.filter((product) => {
    if (
      filters.category !== "all" &&
      product.category.toLowerCase() !== filters.category
    )
      return false;

    if (filters.selectedSizes.length > 0) {
      const hasSize = filters.selectedSizes.some((s) =>
        product.sizes.includes(s)
      );
      if (!hasSize) return false;
    }

    if (filters.priceRange !== "all") {
      const price = product.price;
      if (
        (filters.priceRange === "under-300" && price >= 300) ||
        (filters.priceRange === "300-500" && (price < 300 || price > 500)) ||
        (filters.priceRange === "500-1000" && (price < 500 || price > 1000)) ||
        (filters.priceRange === "over-1000" && price <= 1000)
      ) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAtISO || 0).getTime() -
          new Date(a.createdAtISO || 0).getTime()
        );
      default:
        return 0;
    }
  });

  // Add pagination state & derived values
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE) || 1;
  const currentProducts = useMemo(
    () =>
      sortedProducts.slice(
        (page - 1) * PAGE_SIZE,
        (page - 1) * PAGE_SIZE + PAGE_SIZE
      ),
    [sortedProducts, page]
  );
  useEffect(() => {
    setPage(1);
  }, [filters, sortedProducts.length]);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load products
          </h2>
          <p className="text-gray-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <ProductFilter onFilterChange={handleFilterChange} />
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Women's Professional Suits
              </h2>
              <p className="text-gray-600">{sortedProducts.length} products</p>
            </div>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => {
                  const selectedColor =
                    selectedColors[product.id] || product.colors[0]?.value;
                  const currentColor =
                    product.colors.find((c) => c.value === selectedColor) ||
                    product.colors[0];
                  const stockStatus = getStockStatus(product.stock);
                  const inCart = isProductInCart(product.id, selectedColor);
                  const cartQty = getCartItemQuantity(
                    product.id,
                    selectedColor
                  );
                  const inWishlist = isProductInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={currentColor?.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.isNew && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Sale
                            </span>
                          )}
                          {inCart && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              In Cart ({cartQty})
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${stockStatus.className}`}
                          >
                            {stockStatus.text}
                          </span>
                        </div>
                        <button
                          onClick={() => handleWishlistToggle(product)}
                          className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              inWishlist
                                ? "text-red-500 fill-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {product.colors.length > 0 && (
                          <div className="mb-4">
                            <label className="text-sm text-gray-600 mb-2 block">
                              Color: {currentColor?.name || "Select Color"}
                            </label>
                            <div className="flex gap-2">
                              {product.colors.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() =>
                                    handleColorChange(product.id, color.value)
                                  }
                                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                                    selectedColor === color.value
                                      ? "border-blue-500 shadow-lg scale-110"
                                      : "border-gray-300 hover:border-blue-300"
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {product.stock} in stock
                          </span>
                          <Link
                            href={`/product/${product.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Explore
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {sortedProducts.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded border text-sm ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    // Show first, last, current, neighbors; collapse others
                    if (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded border text-sm font-medium ${
                            p === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (
                      (p === 2 && page > 3) ||
                      (p === totalPages - 1 && page < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={p}
                          className="px-2 text-gray-400 select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-2 rounded border text-sm ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
