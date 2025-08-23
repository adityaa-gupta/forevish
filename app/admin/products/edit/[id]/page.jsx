"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/app/lib/services/products";
import EditProductForm from "@/app/components/products/EditProductForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // ("Fetching product with ID:", id);

        const result = await getProductById(id);
        // ("Product fetch result:", result);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading product data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Product Not Found
            </h1>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Product Not Found
            </h1>
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

  // Success state - render the edit form
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information</p>
        </div>

        <EditProductForm initialData={product} />
      </div>
    </div>
  );
}
