"use client";
import { getAllProducts } from "@/app/lib/services/products";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import formatINR from "@/app/lib/helpers/formatPrice";

const PRODUCTS_PER_PAGE = 10;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await getAllProducts();

      if (result.success) {
        setAllProducts(result.data);
        setTotalPages(Math.ceil(result.data.length / PRODUCTS_PER_PAGE));

        // Set initial page of products
        const startIndex = 0;
        const endIndex = Math.min(PRODUCTS_PER_PAGE, result.data.length);
        setProducts(result.data.slice(startIndex, endIndex));
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update displayed products when page changes
  useEffect(() => {
    if (allProducts.length > 0) {
      const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const endIndex = Math.min(
        startIndex + PRODUCTS_PER_PAGE,
        allProducts.length
      );
      setProducts(allProducts.slice(startIndex, endIndex));
    }
  }, [currentPage, allProducts]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => {
      const variantStock =
        variant.colors?.reduce((colorTotal, color) => {
          return colorTotal + (color.stock || 0);
        }, 0) || 0;
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
                  "#",
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
              {products.map((product, idx) => {
                const totalStock = getTotalStock(product.variants);
                const availableSizes = getAvailableSizes(product.variants);

                return (
                  <tr key={product.id} className="hover:bg-gray-50 text-black">
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {(currentPage - 1) * PRODUCTS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatINR(product.price)}</td>
                    <td className="px-6 py-4">{availableSizes}</td>
                    <td className="px-6 py-4">{totalStock} units</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * PRODUCTS_PER_PAGE, allProducts.length)} of{" "}
              {allProducts.length} products
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  )
                  .map((pageNum, i, array) => {
                    // Add ellipsis when there are gaps in the page numbers
                    if (i > 0 && pageNum > array[i - 1] + 1) {
                      return (
                        <React.Fragment key={`ellipsis-${pageNum}`}>
                          <span className="px-2 text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`flex items-center justify-center w-8 h-8 rounded-md ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
