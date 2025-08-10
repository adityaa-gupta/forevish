"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/app/lib/services/products";
import Link from "next/link";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiTag,
  FiCalendar,
  FiDollarSign,
  FiImage,
  FiShoppingBag,
} from "react-icons/fi";

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching product with ID:", id);

        const result = await getProductById(id);
        console.log("Product fetch result:", result);

        if (result.success) {
          setProduct(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch product");
          console.error("Failed to fetch product:", result.error);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;

    return variants.reduce((total, variant) => {
      const variantStock = variant.colors.reduce((colorTotal, color) => {
        return colorTotal + (parseInt(color.stock) || 0);
      }, 0);
      return total + variantStock;
    }, 0);
  };

  const getAvailableSizes = (variants) => {
    if (!variants || variants.length === 0) return [];
    return variants.map((variant) => variant.size);
  };

  const getAvailableColors = (variants) => {
    if (!variants || variants.length === 0) return [];
    const colors = new Set();
    variants.forEach((variant) => {
      variant.colors.forEach((color) => {
        colors.add(color.color);
      });
    });
    return Array.from(colors);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Link>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <h3 className="text-lg font-medium mb-2">Error</h3>
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/products"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Go Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">
              The product you're looking for doesn't exist.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/products"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalStock = getTotalStock(product.variants);
  const availableSizes = getAvailableSizes(product.variants);
  const availableColors = getAvailableColors(product.variants);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/products"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Link>
            <div className="flex space-x-3">
              <Link
                href={`/admin/products/edit/${product.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                Edit Product
              </Link>
              <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FiTrash2 className="w-4 h-4 mr-2" />
                Delete Product
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.mainImages && product.mainImages.length > 0 ? (
                <img
                  src={product.mainImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.mainImages && product.mainImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.mainImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Product Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiDollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600 w-20">Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="flex items-center">
                  <FiTag className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600 w-20">Category:</span>
                  <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center">
                  <FiPackage className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600 w-20">Stock:</span>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      totalStock > 20
                        ? "bg-green-100 text-green-800"
                        : totalStock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {totalStock} units
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20 ml-8">
                    Status:
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600 w-20">Created:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Available Options */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Options
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Sizes:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 text-gray-800"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Colors:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableColors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 text-gray-800"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Details */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Size & Color Variants
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {product.variants?.map((variant, variantIndex) => (
                <div key={variantIndex} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Size: {variant.size}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variant.colors?.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {color.color}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              color.stock > 10
                                ? "bg-green-100 text-green-800"
                                : color.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {color.stock} in stock
                          </span>
                        </div>

                        {/* Color-specific images */}
                        {color.images && color.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {color.images
                              .slice(0, 3)
                              .map((image, imageIndex) => (
                                <div
                                  key={imageIndex}
                                  className="aspect-square bg-gray-100 rounded overflow-hidden"
                                >
                                  <img
                                    src={image}
                                    alt={`${color.color} variant`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            {color.images.length > 3 && (
                              <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  +{color.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
