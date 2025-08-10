"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiImage,
  FiArrowLeft,
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
  const categories = [
    "Clothing",
    "Shoes",
    "Accessories",
    "Electronics",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Books",
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const colors = [
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
      mainImages: [],
      variants: [
        {
          size: "",
          colors: [
            {
              color: "",
              stock: "",
              images: [],
            },
          ],
        },
      ],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const [mainImagePreview, setMainImagePreview] = useState([]);
  const [colorImagePreviews, setColorImagePreviews] = useState({});
  const [newMainImages, setNewMainImages] = useState([]);
  const [newColorImages, setNewColorImages] = useState({});

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Setting form data:", initialData);

      // Reset form with new data
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        price: initialData.price?.toString() || "",
        mainImages: initialData.mainImages || [],
        variants: initialData.variants || [
          {
            size: "",
            colors: [
              {
                color: "",
                stock: "",
                images: [],
              },
            ],
          },
        ],
      });

      // Set image previews
      setMainImagePreview(initialData.mainImages || []);

      // Set color image previews
      const colorPreviews = {};
      initialData.variants?.forEach((variant, variantIndex) => {
        variant.colors?.forEach((color, colorIndex) => {
          const key = `${variantIndex}-${colorIndex}`;
          if (color.images && color.images.length > 0) {
            colorPreviews[key] = color.images;
          }
        });
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
  const handleColorImageUpload = (e, variantIndex, colorIndex) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    const key = `${variantIndex}-${colorIndex}`;

    setNewColorImages((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));

    setColorImagePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...previews],
    }));

    const currentVariants = watch("variants");
    const updatedVariants = [...currentVariants];
    const currentColorImages =
      updatedVariants[variantIndex].colors[colorIndex].images || [];
    updatedVariants[variantIndex].colors[colorIndex].images = [
      ...currentColorImages,
      ...files,
    ];
    setValue("variants", updatedVariants);
  };

  // Remove color-specific image
  const removeColorImage = (variantIndex, colorIndex, imageIndex) => {
    const key = `${variantIndex}-${colorIndex}`;
    const currentPreviews = colorImagePreviews[key] || [];

    const currentVariants = watch("variants");
    const currentColorImages =
      currentVariants[variantIndex].colors[colorIndex].images || [];
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

    const updatedVariants = [...currentVariants];
    updatedVariants[variantIndex].colors[colorIndex].images =
      currentColorImages.filter((_, i) => i !== imageIndex);
    setValue("variants", updatedVariants);
  };

  // Add color to variant
  const addColor = (variantIndex) => {
    const currentVariants = watch("variants");
    const updatedVariants = [...currentVariants];
    updatedVariants[variantIndex].colors.push({
      color: "",
      stock: "",
      images: [],
    });
    setValue("variants", updatedVariants);
  };

  // Remove color from variant
  const removeColor = (variantIndex, colorIndex) => {
    const currentVariants = watch("variants");
    const updatedVariants = [...currentVariants];
    updatedVariants[variantIndex].colors = updatedVariants[
      variantIndex
    ].colors.filter((_, i) => i !== colorIndex);
    setValue("variants", updatedVariants);

    const key = `${variantIndex}-${colorIndex}`;
    setColorImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[key];
      return newPreviews;
    });

    setNewColorImages((prev) => {
      const newImages = { ...prev };
      delete newImages[key];
      return newImages;
    });
  };

  // Form submission
  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Updating product...", {
      position: "top-center",
    });

    try {
      setIsSubmitting(true);

      console.log("Submitting form data:", data);

      const result = await updateProduct(initialData.id, data);

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

        {/* Price */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { required: "Price is required", min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
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

        {/* Size and Color Variants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Size & Color Variants *
            </label>
            <button
              type="button"
              onClick={() =>
                appendVariant({
                  size: "",
                  colors: [{ color: "", stock: "", images: [] }],
                })
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FiPlus className="w-4 h-4" />
              Add Size
            </button>
          </div>

          <div className="space-y-6">
            {variantFields.map((variant, variantIndex) => (
              <div
                key={variant.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Size Variant {variantIndex + 1}
                  </h4>
                  {variantFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Size Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    {...register(`variants.${variantIndex}.size`, {
                      required: "Size is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.variants?.[variantIndex]?.size && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.variants[variantIndex].size.message}
                    </p>
                  )}
                </div>

                {/* Colors for this size */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Colors, Stock & Images
                    </label>
                    <button
                      type="button"
                      onClick={() => addColor(variantIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Color
                    </button>
                  </div>

                  <div className="space-y-4">
                    {watch(`variants.${variantIndex}.colors`)?.map(
                      (colorItem, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="border border-gray-100 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            {/* Color */}
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Color
                              </label>
                              <select
                                {...register(
                                  `variants.${variantIndex}.colors.${colorIndex}.color`,
                                  {
                                    required: "Color is required",
                                  }
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select Color</option>
                                {colors.map((color) => (
                                  <option key={color} value={color}>
                                    {color}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Stock
                              </label>
                              <input
                                type="number"
                                min="0"
                                {...register(
                                  `variants.${variantIndex}.colors.${colorIndex}.stock`,
                                  {
                                    required: "Stock is required",
                                    min: 0,
                                  }
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>

                            {/* Remove Color Button */}
                            <div className="flex items-end">
                              {watch(`variants.${variantIndex}.colors`)
                                ?.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeColor(variantIndex, colorIndex)
                                  }
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Color-specific Image Upload */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Color-specific Images
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  handleColorImageUpload(
                                    e,
                                    variantIndex,
                                    colorIndex
                                  )
                                }
                                className="hidden"
                                id={`color-image-upload-${variantIndex}-${colorIndex}`}
                              />
                              <label
                                htmlFor={`color-image-upload-${variantIndex}-${colorIndex}`}
                                className="cursor-pointer flex flex-col items-center justify-center py-2"
                              >
                                <FiImage className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">
                                  Upload additional images for this color
                                </span>
                              </label>
                            </div>

                            {/* Color Image Previews */}
                            {colorImagePreviews[`${variantIndex}-${colorIndex}`]
                              ?.length > 0 && (
                              <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
                                {colorImagePreviews[
                                  `${variantIndex}-${colorIndex}`
                                ].map((preview, imageIndex) => (
                                  <div key={imageIndex} className="relative">
                                    <img
                                      src={preview}
                                      alt={`Color Preview ${imageIndex}`}
                                      className="w-full h-16 object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeColorImage(
                                          variantIndex,
                                          colorIndex,
                                          imageIndex
                                        )
                                      }
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                    >
                                      <FiTrash2 className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                              </div>
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
