"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, X } from "lucide-react";
import {
  addSize,
  removeSize,
  setPriceRange,
  setSortBy,
  setCategory,
  resetFilters,
} from "../_store/features/filterSlice";

const ProductFilter = ({ onFilterChange }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);

  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Available filter options
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "under-300", label: "Under $300" },
    { value: "300-500", label: "$300 - $500" },
    { value: "500-1000", label: "$500 - $1000" },
    { value: "over-1000", label: "Over $1000" },
  ];
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "suits", label: "Suits" },
    { value: "blazers", label: "Blazers" },
    { value: "indowestern", label: "Indo-Western" },
    { value: "formal", label: "Formal Wear" },
  ];

  // Handle size selection
  const handleSizeChange = (size, isChecked) => {
    if (isChecked) {
      dispatch(addSize(size));
    } else {
      dispatch(removeSize(size));
    }
    // Trigger filter change callback
    onFilterChange?.();
  };

  // Handle price range change
  const handlePriceChange = (priceRange) => {
    dispatch(setPriceRange(priceRange));
    setIsPriceDropdownOpen(false);
    onFilterChange?.();
  };

  // Handle sort change
  const handleSortChange = (sortBy) => {
    dispatch(setSortBy(sortBy));
    setIsSortDropdownOpen(false);
    onFilterChange?.();
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    dispatch(setCategory(category));
    setIsCategoryDropdownOpen(false);
    onFilterChange?.();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    dispatch(resetFilters());
    onFilterChange?.();
  };

  // Get current filter labels
  const getCurrentPriceLabel = () => {
    return (
      priceOptions.find((option) => option.value === filters.priceRange)
        ?.label || "All Prices"
    );
  };

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === filters.sortBy)?.label ||
      "Featured"
    );
  };

  const getCurrentCategoryLabel = () => {
    return (
      categoryOptions.find((option) => option.value === filters.category)
        ?.label || "All Categories"
    );
  };

  // Count active filters
  const activeFilterCount =
    filters.selectedSizes.length +
    (filters.priceRange !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0);

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-20">
        {/* Header with Reset */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg text-gray-900">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Category
          </label>
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700 truncate">
                {getCurrentCategoryLabel()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCategoryChange(option.value)}
                    className={`w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                      filters.category === option.value
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Size Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Size
          </label>
          <div className="space-y-2">
            {sizeOptions.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={size}
                  checked={filters.selectedSizes.includes(size)}
                  onChange={(e) => handleSizeChange(size, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={size}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {size}
                </label>
              </div>
            ))}
          </div>
          {filters.selectedSizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  {size}
                  <button
                    onClick={() => handleSizeChange(size, false)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Price Range
          </label>
          <div className="relative">
            <button
              onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
              className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700 truncate">
                {getCurrentPriceLabel()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {isPriceDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {priceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePriceChange(option.value)}
                    className={`w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                      filters.priceRange === option.value
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sort By Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Sort By
          </label>
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700 truncate">
                {getCurrentSortLabel()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {isSortDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                      filters.sortBy === option.value
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {filters.isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">
              Applying filters...
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProductFilter;
