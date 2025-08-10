import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/app/firebase/config";

// Supabase configuration
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = "https://bolonuxrtdasiutxkvoy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG9udXhydGRhc2l1dHhrdm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzMxODQsImV4cCI6MjA2OTgwOTE4NH0.a-V0gB4OHG8gXwx1Slp6g_XjdBtc5PzqaCDWbCryEmQ";
const supabase = createClient(supabaseUrl, supabaseKey);

const COLLECTION_NAME = "products";
// Fix: Change bucket name to match your actual bucket
const SUPABASE_BUCKET = "forevish"; // Changed from "product-images"

// Helper function to upload images to Supabase Storage
const uploadImages = async (images, folder = "products") => {
  if (!images || images.length === 0) return [];

  const uploadPromises = images.map(async (image, index) => {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const fileExtension = image.name.split(".").pop();
    const fileName = `${folder}/${timestamp}_${uniqueId}.${fileExtension}`;

    try {
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET) // Now using "forevish"
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

// Helper function to delete images from Supabase Storage
const deleteImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;

  const deletePromises = imageUrls.map(async (url) => {
    try {
      // Extract file path from URL for forevish bucket
      // URL structure: https://bolonuxrtdasiutxkvoy.supabase.co/storage/v1/object/public/forevish/path/filename
      const urlPath = url.split("/storage/v1/object/public/forevish/")[1];

      if (!urlPath) {
        console.error("Could not extract file path from URL:", url);
        return;
      }

      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove([urlPath]);

      if (error) {
        console.error("Error deleting image:", error);
      }
    } catch (error) {
      console.error("Error processing image deletion:", error);
    }
  });

  await Promise.all(deletePromises);
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    // Upload main images
    let mainImageUrls = [];
    if (productData.mainImages && productData.mainImages.length > 0) {
      mainImageUrls = await uploadImages(
        productData.mainImages,
        "product-images/main" // This will be stored in forevish bucket
      );
    }

    // Process variants and upload color-specific images
    const processedVariants = await Promise.all(
      productData.variants.map(async (variant) => {
        const processedColors = await Promise.all(
          variant.colors.map(async (color) => {
            let colorImageUrls = [];
            if (color.images && color.images.length > 0) {
              colorImageUrls = await uploadImages(
                color.images,
                `product-images/colors/${color.color.toLowerCase()}`
              );
            }

            return {
              color: color.color,
              stock: parseInt(color.stock),
              images: colorImageUrls,
            };
          })
        );

        return {
          size: variant.size,
          colors: processedColors,
        };
      })
    );

    // Create the product document
    const productDocument = {
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      mainImages: mainImageUrls,
      variants: processedVariants,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Creating product with data:", productDocument);

    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      productDocument
    );

    return {
      success: true,
      id: docRef.id,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
        },
      };
    } else {
      return {
        success: false,
        error: "Product not found",
      };
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update a product
export const updateProduct = async (productId, updateData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete a product (with image cleanup)
export const deleteProduct = async (productId) => {
  try {
    // First get the product to delete associated images
    const productDoc = await getProductById(productId);

    if (productDoc.success) {
      const product = productDoc.data;

      // Delete main images from Supabase
      if (product.mainImages && product.mainImages.length > 0) {
        await deleteImages(product.mainImages);
      }

      // Delete variant color images
      if (product.variants) {
        const allColorImages = product.variants.flatMap((variant) =>
          variant.colors.flatMap((color) => color.images || [])
        );
        if (allColorImages.length > 0) {
          await deleteImages(allColorImages);
        }
      }
    }

    // Delete the product document
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Search products by name
export const searchProducts = async (searchTerm) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff"),
      orderBy("name")
    );

    const querySnapshot = await getDocs(q);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
