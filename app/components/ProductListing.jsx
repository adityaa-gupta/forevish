"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const suits = [
  {
    id: 1,
    name: "Executive Power Suit",
    price: 299,
    originalPrice: 399,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Midnight Black", value: "black", hex: "#1a1a1a" },
      { name: "Navy Blue", value: "navy", hex: "#1e3a8a" },
      { name: "Charcoal Gray", value: "gray", hex: "#374151" },
    ],
    stock: 15,
    sizes: ["XS", "S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: 2,
    name: "Modern Blazer Set",
    price: 249,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Stone Gray", value: "stone", hex: "#78716c" },
      { name: "Cream White", value: "cream", hex: "#fef7ed" },
      { name: "Dusty Rose", value: "rose", hex: "#f43f5e" },
    ],
    stock: 8,
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
  },
  {
    id: 3,
    name: "Classic Pinstripe Suit",
    price: 349,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Navy Pinstripe", value: "navy-pin", hex: "#1e40af" },
      { name: "Black Pinstripe", value: "black-pin", hex: "#111827" },
    ],
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "Contemporary Slim Fit",
    price: 279,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Burgundy", value: "burgundy", hex: "#991b1b" },
      { name: "Forest Green", value: "green", hex: "#166534" },
      { name: "Deep Purple", value: "purple", hex: "#7c3aed" },
    ],
    stock: 6,
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
  },
  {
    id: 5,
    name: "Tailored Business Suit",
    price: 329,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Camel Brown", value: "camel", hex: "#a16207" },
      { name: "Slate Blue", value: "slate", hex: "#475569" },
    ],
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: 6,
    name: "Designer Evening Suit",
    price: 449,
    originalPrice: 599,
    image: "/placeholder.svg?height=400&width=300",
    colors: [
      { name: "Midnight Blue", value: "midnight", hex: "#0f172a" },
      { name: "Emerald Green", value: "emerald", hex: "#059669" },
    ],
    stock: 4,
    sizes: ["S", "M", "L", "XL"],
    isOnSale: true,
  },
];

export function ProductListing() {
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const handleColorChange = (suitId, colorValue) => {
    setSelectedColors((prev) => ({
      ...prev,
      [suitId]: colorValue,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="font-semibold text-lg mb-6 text-gray-900">
                Filters
              </h2>

              {/* Size Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-900 mb-3 block">
                  Size
                </label>
                <div className="space-y-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={size}
                        checked={selectedSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, size]);
                          } else {
                            setSelectedSizes(
                              selectedSizes.filter((s) => s !== size)
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={size} className="text-sm text-gray-700">
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-900 mb-3 block">
                  Price Range
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                  >
                    <span className="text-gray-700">
                      {priceRange === "all"
                        ? "All Prices"
                        : priceRange === "under-300"
                        ? "Under $300"
                        : priceRange === "300-400"
                        ? "$300 - $400"
                        : "Over $400"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {isPriceDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {[
                        { value: "all", label: "All Prices" },
                        { value: "under-300", label: "Under $300" },
                        { value: "300-400", label: "$300 - $400" },
                        { value: "over-400", label: "Over $400" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setPriceRange(option.value);
                            setIsPriceDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">
                  Sort By
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                  >
                    <span className="text-gray-700">
                      {sortBy === "featured"
                        ? "Featured"
                        : sortBy === "price-low"
                        ? "Price: Low to High"
                        : sortBy === "price-high"
                        ? "Price: High to Low"
                        : "Newest First"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {[
                        { value: "featured", label: "Featured" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "newest", label: "Newest First" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Women's Professional Suits
              </h2>
              <p className="text-gray-600">{suits.length} products</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suits.map((suit) => {
                const selectedColor =
                  selectedColors[suit.id] || suit.colors[0].value;
                const currentColor =
                  suit.colors.find((c) => c.value === selectedColor) ||
                  suit.colors[0];
                const stockStatus = getStockStatus(suit.stock);

                return (
                  <div
                    key={suit.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={suit.image || "/placeholder.svg"}
                          alt={suit.name}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {suit.isNew && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {suit.isOnSale && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Sale
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
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {suit.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            ${suit.price}
                          </span>
                          {suit.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              ${suit.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Color Swatches */}
                        <div className="mb-4">
                          <label className="text-sm text-gray-600 mb-2 block">
                            Color: {currentColor.name}
                          </label>
                          <div className="flex gap-2">
                            {suit.colors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() =>
                                  handleColorChange(suit.id, color.value)
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

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {suit.stock} in stock
                          </span>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={suit.stock === 0}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
