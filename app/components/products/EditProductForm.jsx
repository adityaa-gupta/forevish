"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiImage,
  FiArrowLeft,
  FiPercent,
} from "react-icons/fi";
import Button from "../Button";
import { updateProduct } from "@/app/lib/services/products";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const EditProductForm = ({ initialData }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories and options
  const categories = ["Co-ord set", "Lehanga", "Indowestern", "Gown", "Suit"];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const colorOptions = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Pink",
    "Orange",
    "Gray",
    "Brown",
    "Navy",
  ];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      originalPrice: "", // New field for original price
      discountPercentage: "", // New field for discount percentage
      mainImages: [],
      colors: [
        {
          color: "",
          images: [],
        },
      ],
      sizes: [
        {
          size: "",
          colorStock: [
            {
              color: "",
              stock: "",
            },
          ],
        },
      ],
    },
  });

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: "colors",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const [mainImagePreview, setMainImagePreview] = useState([]);
  const [colorImagePreviews, setColorImagePreviews] = useState({});
  const [newMainImages, setNewMainImages] = useState([]);
  const [newColorImages, setNewColorImages] = useState({});

  // Watch price fields for calculations
  const watchedPrice = watch("price");
  const watchedOriginalPrice = watch("originalPrice");
  const watchedDiscountPercentage = watch("discountPercentage");

  // Calculate discount percentage from prices
  const calculateDiscountPercentage = (original, current) => {
    if (!original || !current || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  // Calculate discounted price from percentage
  const calculateDiscountedPrice = (original, percentage) => {
    if (!original || !percentage) return original;
    return Math.round(original * (1 - percentage / 100) * 100) / 100;
  };

  // Handle original price change
  const handleOriginalPriceChange = (e) => {
    const originalPrice = parseFloat(e.target.value) || 0;
    setValue("originalPrice", originalPrice);

    if (watchedDiscountPercentage && originalPrice) {
      const discountedPrice = calculateDiscountedPrice(
        originalPrice,
        watchedDiscountPercentage
      );
      setValue("price", discountedPrice);
    }
  };

  // Handle discount percentage change
  const handleDiscountPercentageChange = (e) => {
    const percentage = parseFloat(e.target.value) || 0;
    setValue("discountPercentage", percentage);

    if (watchedOriginalPrice && percentage) {
      const discountedPrice = calculateDiscountedPrice(
        watchedOriginalPrice,
        percentage
      );
      setValue("price", discountedPrice);
    }
  };

  // Handle final price change (recalculate discount percentage)
  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    setValue("price", price);

    if (watchedOriginalPrice && price) {
      const percentage = calculateDiscountPercentage(
        watchedOriginalPrice,
        price
      );
      setValue("discountPercentage", percentage);
    }
  };

  // Convert old structure to new structure
  const convertOldToNewStructure = (oldData) => {
    if (!oldData.variants) {
      return oldData; // Already in new structure
    }

    // Extract unique colors with their images
    const colorsMap = new Map();
    const sizesMap = new Map();

    oldData.variants.forEach((variant) => {
      const size = variant.size;

      variant.colors.forEach((colorItem) => {
        // Collect colors and their images
        if (!colorsMap.has(colorItem.color)) {
          colorsMap.set(colorItem.color, {
            color: colorItem.color,
            images: colorItem.images || [],
          });
        } else {
          // Merge images if the same color appears in multiple variants
          const existingColor = colorsMap.get(colorItem.color);
          const newImages = colorItem.images || [];
          existingColor.images = [
            ...new Set([...existingColor.images, ...newImages]),
          ];
        }

        // Collect sizes and their color stock
        if (!sizesMap.has(size)) {
          sizesMap.set(size, {
            size: size,
            colorStock: [],
          });
        }

        const sizeData = sizesMap.get(size);
        sizeData.colorStock.push({
          color: colorItem.color,
          stock: colorItem.stock || "",
        });
      });
    });

    return {
      ...oldData,
      colors: Array.from(colorsMap.values()),
      sizes: Array.from(sizesMap.values()),
      variants: undefined, // Remove old structure
    };
  };

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Setting form data:", initialData);

      // Convert old structure to new structure if needed
      const convertedData = convertOldToNewStructure(initialData);
      console.log("Converted data:", convertedData);

      // Calculate discount percentage if both prices exist
      let discountPercentage = 0;
      if (convertedData.originalPrice && convertedData.price) {
        discountPercentage = calculateDiscountPercentage(
          convertedData.originalPrice,
          convertedData.price
        );
      }

      // Reset form with converted data
      reset({
        name: convertedData.name || "",
        description: convertedData.description || "",
        category: convertedData.category || "",
        price: convertedData.price?.toString() || "",
        originalPrice: convertedData.originalPrice?.toString() || "",
        discountPercentage: discountPercentage?.toString() || "",
        mainImages: convertedData.mainImages || [],
        colors: convertedData.colors || [{ color: "", images: [] }],
        sizes: convertedData.sizes || [
          { size: "", colorStock: [{ color: "", stock: "" }] },
        ],
      });

      // Set image previews
      setMainImagePreview(convertedData.mainImages || []);

      // Set color image previews
      const colorPreviews = {};
      convertedData.colors?.forEach((color, colorIndex) => {
        if (color.images && color.images.length > 0) {
          colorPreviews[colorIndex.toString()] = color.images;
        }
      });
      setColorImagePreviews(colorPreviews);
    }
  }, [initialData, reset]);

  // Handle main product image upload
  const handleMainImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setNewMainImages((prev) => [...prev, ...files]);
    setMainImagePreview((prev) => [...prev, ...previews]);

    const currentImages = watch("mainImages");
    setValue("mainImages", [...currentImages, ...files]);
  };

  // Remove main image
  const removeMainImage = (index) => {
    const currentImages = watch("mainImages");
    const imageToRemove = currentImages[index];

    if (imageToRemove instanceof File) {
      const newImageIndex = newMainImages.findIndex(
        (img) => img === imageToRemove
      );
      if (newImageIndex !== -1) {
        setNewMainImages((prev) => prev.filter((_, i) => i !== newImageIndex));
      }
    }

    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = mainImagePreview.filter((_, i) => i !== index);

    setValue("mainImages", newImages);
    setMainImagePreview(newPreviews);
  };

  // Handle color-specific image upload
  const handleColorImageUpload = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    const key = colorIndex.toString();

    setNewColorImages((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));

    setColorImagePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...previews],
    }));

    // Update form values
    const currentColors = watch("colors");
    const updatedColors = [...currentColors];
    const currentColorImages = updatedColors[colorIndex].images || [];
    updatedColors[colorIndex].images = [...currentColorImages, ...files];
    setValue("colors", updatedColors);
  };

  // Remove color-specific image
  const removeColorImage = (colorIndex, imageIndex) => {
    const key = colorIndex.toString();
    const currentPreviews = colorImagePreviews[key] || [];

    const currentColors = watch("colors");
    const currentColorImages = currentColors[colorIndex].images || [];
    const formImageToRemove = currentColorImages[imageIndex];

    if (formImageToRemove instanceof File) {
      const newImages = newColorImages[key] || [];
      const newImageIndex = newImages.findIndex(
        (img) => img === formImageToRemove
      );
      if (newImageIndex !== -1) {
        setNewColorImages((prev) => ({
          ...prev,
          [key]: prev[key]?.filter((_, i) => i !== newImageIndex) || [],
        }));
      }
    }

    const newPreviews = currentPreviews.filter((_, i) => i !== imageIndex);

    setColorImagePreviews((prev) => ({
      ...prev,
      [key]: newPreviews,
    }));

    const updatedColors = [...currentColors];
    updatedColors[colorIndex].images = currentColorImages.filter(
      (_, i) => i !== imageIndex
    );
    setValue("colors", updatedColors);
  };

  // Add stock option to a size
  const addStockOption = (sizeIndex) => {
    const currentSizes = watch("sizes");
    const updatedSizes = [...currentSizes];
    updatedSizes[sizeIndex].colorStock.push({
      color: "",
      stock: "",
    });
    setValue("sizes", updatedSizes);
  };

  // Remove stock option from a size
  const removeStockOption = (sizeIndex, stockIndex) => {
    const currentSizes = watch("sizes");
    const updatedSizes = [...currentSizes];
    updatedSizes[sizeIndex].colorStock = updatedSizes[
      sizeIndex
    ].colorStock.filter((_, i) => i !== stockIndex);
    setValue("sizes", updatedSizes);
  };

  // Get available colors for dropdown
  const getAvailableColors = () => {
    const colors = watch("colors") || [];
    return colors
      .filter((colorItem) => colorItem.color) // Only return colors that have been selected
      .map((colorItem) => colorItem.color);
  };

  // Form submission
  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Updating product...", {
      position: "top-center",
    });

    try {
      setIsSubmitting(true);

      // Prepare form data with proper price handling
      const formData = {
        ...data,
        // Convert string values to numbers for database storage
        price: parseFloat(data.price) || 0,
        originalPrice: data.originalPrice
          ? parseFloat(data.originalPrice)
          : null,
        discountPercentage: data.discountPercentage
          ? parseFloat(data.discountPercentage)
          : null,

        // Calculate derived fields for easier querying
        isOnSale:
          data.originalPrice &&
          parseFloat(data.originalPrice) > parseFloat(data.price),
        discountAmount: data.originalPrice
          ? parseFloat(data.originalPrice) - parseFloat(data.price)
          : 0,

        // Add metadata
        updatedAt: new Date().toISOString(),
      };

      console.log("Submitting form data:", formData);

      const result = await updateProduct(initialData.id, formData);

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Product updated successfully!", {
          duration: 3000,
          icon: "✅",
          style: {
            borderRadius: "10px",
            background: "#10b981",
            color: "#fff",
          },
        });

        // Redirect after a brief delay to show the success message
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update product: ${result.error}`, {
          duration: 4000,
          icon: "❌",
          style: {
            borderRadius: "10px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred while updating the product", {
        duration: 4000,
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if no initial data yet
  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-black p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        <p className="text-gray-600 mt-1">
          Update product information and inventory
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              {...register("name", { required: "Product name is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pricing & Discount
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price
                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("originalPrice", { min: 0 })}
                onChange={handleOriginalPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if no discount
              </p>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount %
                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("discountPercentage", { min: 0, max: 100 })}
                  onChange={handleDiscountPercentageChange}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {watchedDiscountPercentage > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {watchedDiscountPercentage}% discount applied
                </p>
              )}
            </div>

            {/* Final/Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: 0,
                })}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
              {watchedOriginalPrice &&
                watchedPrice &&
                watchedOriginalPrice > watchedPrice && (
                  <p className="text-xs text-green-600 mt-1">
                    Save ${(watchedOriginalPrice - watchedPrice).toFixed(2)}
                  </p>
                )}
            </div>
          </div>

          {/* Price Preview */}
          {watchedOriginalPrice &&
            watchedPrice &&
            watchedOriginalPrice > watchedPrice && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">
                      Price Preview:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-green-600">
                        ${watchedPrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${watchedOriginalPrice}
                      </span>
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        -{watchedDiscountPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Customer Saves</p>
                    <p className="text-lg font-medium text-green-600">
                      ${(watchedOriginalPrice - watchedPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Main Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Product Images
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload general product images that represent the overall product
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMainImageUpload}
              className="hidden"
              id="main-image-upload"
            />
            <label
              htmlFor="main-image-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Click to upload additional images
              </span>
            </label>
          </div>

          {/* Main Image Previews */}
          {mainImagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {mainImagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Main Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeMainImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Available Colors *
            </label>
            <button
              type="button"
              onClick={() => appendColor({ color: "", images: [] })}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FiPlus className="w-4 h-4" />
              Add Color
            </button>
          </div>

          <div className="space-y-4">
            {colorFields.map((colorField, colorIndex) => (
              <div
                key={colorField.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Color {colorIndex + 1}
                  </h4>
                  {colorFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(colorIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <select
                    {...register(`colors.${colorIndex}.color`, {
                      required: "Color is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Color</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  {errors.colors?.[colorIndex]?.color && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.colors[colorIndex].color.message}
                    </p>
                  )}
                </div>

                {/* Color-specific Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Images
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleColorImageUpload(e, colorIndex)}
                      className="hidden"
                      id={`color-image-upload-${colorIndex}`}
                    />
                    <label
                      htmlFor={`color-image-upload-${colorIndex}`}
                      className="cursor-pointer flex flex-col items-center justify-center py-2"
                    >
                      <FiImage className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">
                        Upload additional images for this color
                      </span>
                    </label>
                  </div>

                  {/* Color Image Previews */}
                  {colorImagePreviews[colorIndex.toString()]?.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
                      {colorImagePreviews[colorIndex.toString()].map(
                        (preview, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <img
                              src={preview}
                              alt={`Color Preview ${imageIndex}`}
                              className="w-full h-16 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeColorImage(colorIndex, imageIndex)
                              }
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            >
                              <FiTrash2 className="w-2 h-2" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes & Stock Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Sizes & Stock *
            </label>
            <button
              type="button"
              onClick={() =>
                appendSize({
                  size: "",
                  colorStock: [{ color: "", stock: "" }],
                })
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FiPlus className="w-4 h-4" />
              Add Size
            </button>
          </div>

          <div className="space-y-6">
            {sizeFields.map((sizeField, sizeIndex) => (
              <div
                key={sizeField.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Size {sizeIndex + 1}
                  </h4>
                  {sizeFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(sizeIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Size Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size *
                  </label>
                  <select
                    {...register(`sizes.${sizeIndex}.size`, {
                      required: "Size is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    {sizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.sizes?.[sizeIndex]?.size && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.sizes[sizeIndex].size.message}
                    </p>
                  )}
                </div>

                {/* Color Stock for this size */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Stock
                    </label>
                    <button
                      type="button"
                      onClick={() => addStockOption(sizeIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Color Stock
                    </button>
                  </div>

                  <div className="space-y-3">
                    {watch(`sizes.${sizeIndex}.colorStock`)?.map(
                      (stockItem, stockIndex) => (
                        <div
                          key={stockIndex}
                          className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          {/* Color Selection */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Color *
                            </label>
                            <select
                              {...register(
                                `sizes.${sizeIndex}.colorStock.${stockIndex}.color`,
                                {
                                  required: "Color is required",
                                }
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Color</option>
                              {getAvailableColors().map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Stock */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Stock *
                            </label>
                            <input
                              type="number"
                              min="0"
                              {...register(
                                `sizes.${sizeIndex}.colorStock.${stockIndex}.stock`,
                                {
                                  required: "Stock is required",
                                  min: 0,
                                }
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>

                          {/* Remove Button */}
                          <div className="flex items-end">
                            {watch(`sizes.${sizeIndex}.colorStock`)?.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeStockOption(sizeIndex, stockIndex)
                                }
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/admin/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variation="primary"
            size="medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
