"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Heart, ShoppingCart, Minus } from "lucide-react";
import { getAllProducts } from "../lib/services/products";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../_store/features/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../_store/features/wishlistSlice";
import { setFilterLoading } from "../_store/features/filterSlice";
import ProductFilter from "./ProductFilter";
import Link from "next/link";
import formatPrice from "../lib/helpers/formatPrice";

export function ProductListing() {
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColors, setSelectedColors] = useState({});

  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Helper function to check if product is in cart
  const isProductInCart = (productId, selectedColor) => {
    const cartItemId = `${productId}-${selectedColor}`;
    return cartItems.some((item) => item.id === cartItemId);
  };

  // Helper function to get cart item quantity
  const getCartItemQuantity = (productId, selectedColor) => {
    const cartItemId = `${productId}-${selectedColor}`;
    const cartItem = cartItems.find((item) => item.id === cartItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Helper function to check if product is in wishlist
  const isProductInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Transform fetched product data to component format
  const transformProduct = (product) => {
    const allColors = [];
    const allSizes = [];
    let totalStock = 0;

    product.variants?.forEach((variant) => {
      allSizes.push(variant.size);
      variant.colors?.forEach((colorData) => {
        const existingColor = allColors.find(
          (c) => c.value === colorData.color.toLowerCase()
        );
        if (!existingColor) {
          allColors.push({
            name: colorData.color,
            value: colorData.color.toLowerCase(),
            hex: getColorHex(colorData.color),
            stock: colorData.stock,
            images: colorData.images,
          });
        }
        totalStock += colorData.stock || 0;
      });
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.mainImages?.[0] || "/placeholder.svg?height=400&width=300",
      colors: allColors,
      sizes: [...new Set(allSizes)],
      stock: totalStock,
      category: product.category,
      isActive: product.isActive,
      isNew: product.isNew || false,
      isOnSale: product.originalPrice && product.originalPrice > product.price,
      createdAt: product.createdAt,
      variants: product.variants,
    };
  };

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
    return colorMap[colorName.toLowerCase()] || "#6b7280";
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllProducts();

      if (result.success) {
        const transformedProducts = result.data.map(transformProduct);
        setProducts(transformedProducts);
        // console.log("Products fetched successfully:", transformedProducts);
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes with API call
  const handleFilterChange = useCallback(async () => {
    dispatch(setFilterLoading(true));

    // Here you can make an API call with filters
    // For now, we'll just simulate a delay
    setTimeout(() => {
      dispatch(setFilterLoading(false));
    }, 500);
  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleColorChange = (productId, colorValue) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: colorValue,
    }));
  };

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
    const cartItem = {
      id: `${product.id}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      quantity: 1,
    };
    dispatch(addItemToCart(cartItem));
  };

  const handleRemoveFromCart = (productId, selectedColor) => {
    const cartItemId = `${productId}-${selectedColor}`;
    dispatch(removeItemFromCart({ id: cartItemId }));
  };

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

  // Apply filters to products
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (
      filters.category !== "all" &&
      product.category.toLowerCase() !== filters.category
    ) {
      return false;
    }

    // Size filter
    if (filters.selectedSizes.length > 0) {
      const hasSelectedSize = filters.selectedSizes.some((size) =>
        product.sizes.includes(size)
      );
      if (!hasSelectedSize) return false;
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const price = product.price;
      switch (filters.priceRange) {
        case "under-300":
          if (price >= 300) return false;
          break;
        case "300-500":
          if (price < 300 || price > 500) return false;
          break;
        case "500-1000":
          if (price < 500 || price > 1000) return false;
          break;
        case "over-1000":
          if (price <= 1000) return false;
          break;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAt?.seconds * 1000) -
          new Date(a.createdAt?.seconds * 1000)
        );
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Loading skeleton remains the same */}
            {/* <ProductFilter onFilterChange={handleFilterChange} /> */}
            <main className="flex-1">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="h-80 bg-gray-200 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Component */}
          <ProductFilter onFilterChange={handleFilterChange} />

          {/* Product Grid */}
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
                {sortedProducts.map((product) => {
                  const selectedColor =
                    selectedColors[product.id] || product.colors[0]?.value;
                  const currentColor =
                    product.colors.find((c) => c.value === selectedColor) ||
                    product.colors[0];
                  const stockStatus = getStockStatus(product.stock);
                  const inCart = isProductInCart(product.id, selectedColor);
                  const cartQuantity = getCartItemQuantity(
                    product.id,
                    selectedColor
                  );
                  const inWishlist = isProductInWishlist(product.id);

                  return (
                    <div
                      href={`/product/${product.id}`}
                      key={product.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={currentColor?.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badges */}
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
                              In Cart ({cartQuantity})
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${stockStatus.className}`}
                          >
                            {stockStatus.text}
                          </span>
                        </div>

                        {/* Wishlist Button */}
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

                        {/* Color Swatches */}
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

                          {/* Dynamic Cart Button */}

                          <Link
                            href={`/product/${product.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={product.stock === 0}
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
          </main>
        </div>
      </div>
    </div>
  );
}
