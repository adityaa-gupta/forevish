"use client";
import { getAllProducts } from "@/app/lib/services/products";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await getAllProducts();

      if (result.success) {
        setProducts(result.data);
        setError(null);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => {
      const variantStock = variant.colors.reduce((colorTotal, color) => {
        return colorTotal + (color.stock || 0);
      }, 0);
      return total + variantStock;
    }, 0);
  };

  const getAvailableSizes = (variants) => {
    if (!variants || variants.length === 0) return "N/A";
    return variants.map((variant) => variant.size).join(", ");
  };

  const toggleDropdown = (productId, event) => {
    event.stopPropagation();
    if (activeDropdown === productId) {
      setActiveDropdown(null);
      setMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 224, // 224px = menu width
      });
      setActiveDropdown(productId);
    }
  };

  const handleAction = (action, productId, event) => {
    event.stopPropagation();
    setActiveDropdown(null);
    setMenuPosition(null);
    switch (action) {
      case "view":
        // ("View product:", productId);
        break;
      case "edit":
        // ("Edit product:", productId);
        break;
      case "delete":
        // ("Delete product:", productId);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
        setMenuPosition(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Products Management
        </h1>
        <p className="text-gray-600 mt-2">Manage your product inventory</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="mb-4">
        <Link href="/admin/products/add-product">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            + Add New Product
          </button>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Sizes Available",
                  "Total Stock",
                  "Status",
                  "Created",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const totalStock = getTotalStock(product.variants);
                const availableSizes = getAvailableSizes(product.variants);

                return (
                  <tr key={product.id} className="hover:bg-gray-50 text-black">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">{availableSizes}</td>
                    <td className="px-6 py-4">{totalStock} units</td>
                    <td className="px-6 py-4">
                      {product.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => toggleDropdown(product.id, e)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Portal Dropdown */}
      {activeDropdown &&
        menuPosition &&
        createPortal(
          <div
            className="absolute z-50 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              position: "absolute",
            }}
          >
            <div className="py-1">
              <Link
                href={`/admin/products/view/${activeDropdown}`}
                onClick={(e) => handleAction("view", activeDropdown, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEye className="w-4 h-4 mr-3" /> View Details
              </Link>
              <Link
                href={`/admin/products/edit/${activeDropdown}`}
                onClick={(e) => handleAction("edit", activeDropdown, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit2 className="w-4 h-4 mr-3" /> Edit Product
              </Link>
            </div>
            <div className="py-1">
              <button
                onClick={(e) => handleAction("delete", activeDropdown, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <FiTrash2 className="w-4 h-4 mr-3 text-red-400" /> Delete
                Product
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
