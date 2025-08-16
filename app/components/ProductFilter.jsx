"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, X, Filter, SlidersHorizontal } from "lucide-react";
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // Filter content component (reusable for desktop and mobile)
  const FilterContent = ({ isMobile = false }) => (
    <div
      className={`bg-white ${
        isMobile ? "p-4" : "rounded-lg p-6 border border-gray-200 shadow-sm"
      }`}
    >
      {/* Header with Reset */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg text-gray-900 flex items-center">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
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

      {/* Mobile Sort (Only on mobile) */}
      {isMobile && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Sort By
          </label>
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="w-full px-3 py-3 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700 truncate font-medium">
                {getCurrentSortLabel()}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                  isSortDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>
            {isSortDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-3 py-3 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      filters.sortBy === option.value
                        ? "bg-blue-50 text-blue-700 font-medium"
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
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-900 mb-3 block">
          Category
        </label>
        <div className="relative">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full px-3 py-3 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <span className="text-gray-700 truncate font-medium">
              {getCurrentCategoryLabel()}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                isCategoryDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isCategoryDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCategoryChange(option.value)}
                  className={`w-full px-3 py-3 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                    filters.category === option.value
                      ? "bg-blue-50 text-blue-700 font-medium"
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
        <div className="grid grid-cols-3 gap-2 mb-3">
          {sizeOptions.map((size) => (
            <label
              key={size}
              className={`
                flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-all
                ${
                  filters.selectedSizes.includes(size)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }
              `}
            >
              <input
                type="checkbox"
                checked={filters.selectedSizes.includes(size)}
                onChange={(e) => handleSizeChange(size, e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{size}</span>
            </label>
          ))}
        </div>
        {filters.selectedSizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.selectedSizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg"
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
            className="w-full px-3 py-3 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <span className="text-gray-700 truncate font-medium">
              {getCurrentPriceLabel()}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                isPriceDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isPriceDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePriceChange(option.value)}
                  className={`w-full px-3 py-3 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                    filters.priceRange === option.value
                      ? "bg-blue-50 text-blue-700 font-medium"
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

      {/* Desktop Sort (Only on desktop) */}
      {!isMobile && (
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 mb-3 block">
            Sort By
          </label>
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="w-full px-3 py-3 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700 truncate font-medium">
                {getCurrentSortLabel()}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                  isSortDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>
            {isSortDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-3 py-3 text-left text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      filters.sortBy === option.value
                        ? "bg-blue-50 text-blue-700 font-medium"
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
      )}

      {/* Loading State */}
      {filters.isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Applying filters...
          </span>
        </div>
      )}

      {/* Mobile Apply Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileFilterOpen(false)}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="h-full overflow-y-auto pb-20">
              <FilterContent isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilter;
