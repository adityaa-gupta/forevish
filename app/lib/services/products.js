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

// Import from Provider instead of config
import { db } from "@/app/providers/Provider";

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
// export const createProduct = async (productData) => {
//   ("Creating product with data:", productData);
//   try {
//     // Upload main images
//     let mainImageUrls = [];
//     if (productData.mainImages && productData.mainImages.length > 0) {
//       mainImageUrls = await uploadImages(
//         productData.mainImages,
//         "product-images/main" // This will be stored in forevish bucket
//       );
//     }

//     // Process variants and upload color-specific images
//     const processedVariants = await Promise.all(
//       productData.variants.map(async (variant) => {
//         const processedColors = await Promise.all(
//           variant.colors.map(async (color) => {
//             let colorImageUrls = [];
//             if (color.images && color.images.length > 0) {
//               colorImageUrls = await uploadImages(
//                 color.images,
//                 `product-images/colors/${color.color.toLowerCase()}`
//               );
//             }

//             return {
//               color: color.color,
//               stock: parseInt(color.stock),
//               images: colorImageUrls,
//             };
//           })
//         );

//         return {
//           size: variant.size,
//           colors: processedColors,
//         };
//       })
//     );

//     // Create the product document
//     const productDocument = {
//       name: productData.name,
//       description: productData.description,
//       category: productData.category,
//       price: parseFloat(productData.price),
//       mainImages: mainImageUrls,
//       variants: processedVariants,
//       isActive: true,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     ("Creating product with data:", productDocument);

//     const docRef = await addDoc(
//       collection(db, COLLECTION_NAME),
//       productDocument
//     );

//     return {
//       success: true,
//       id: docRef.id,
//       message: "Product created successfully",
//     };
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };
export const createProduct = async (productData) => {
  "Creating product with data:", productData;
  try {
    // Upload main images
    let mainImageUrls = [];
    if (productData.mainImages && productData.mainImages.length > 0) {
      mainImageUrls = await uploadImages(
        productData.mainImages,
        "product-images/main"
      );
    }

    // Upload all color images once and map them by color name
    const colorImageMap = {};
    if (productData.colors && productData.colors.length > 0) {
      for (const colorObj of productData.colors) {
        let colorImageUrls = [];
        if (colorObj.images && colorObj.images.length > 0) {
          colorImageUrls = await uploadImages(
            colorObj.images,
            `product-images/colors/${colorObj.color.toLowerCase()}`
          );
        }
        colorImageMap[colorObj.color] = colorImageUrls;
      }
    }

    // Build variants array from sizes + colorStock
    const processedVariants = productData.sizes.map((sizeObj) => {
      const processedColors = sizeObj.colorStock.map((cs) => ({
        color: cs.color,
        stock: parseInt(cs.stock),
        images: colorImageMap[cs.color] || [],
      }));

      return {
        size: sizeObj.size,
        colors: processedColors,
      };
    });

    // Create the product document
    const productDocument = {
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      mainImages: mainImageUrls,
      discountPercentage: productData.discountPercentage || 0,
      discountPrice: productData.discountPrice
        ? parseFloat(productData.discountPrice)
        : null,
      originalPrice: productData.originalPrice
        ? parseFloat(productData.originalPrice)
        : null,
      variants: processedVariants,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    "Final product document:", productDocument;

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
// Get a single product by ID (updated with better error handling)
export const getProductById = async (productId) => {
  "🔍 Fetching product by ID:", productId;
  "Product ID type:", typeof productId;
  "Collection name:", COLLECTION_NAME;

  try {
    // Check if db is initialized
    if (!db) {
      console.error("❌ Firestore db is not initialized");
      throw new Error("Database not initialized");
    }

    // Ensure productId is a string and not empty
    if (!productId || typeof productId !== "string") {
      throw new Error("Invalid product ID provided");
    }

    "✅ Firestore db is available:", !!db;

    const docRef = doc(db, COLLECTION_NAME, productId);
    "📄 Document reference created:", docRef.path;

    const docSnap = await getDoc(docRef);
    "📋 Document snapshot exists:", docSnap.exists();

    if (docSnap.exists()) {
      const productData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      "✅ Product data retrieved:", productData.name || "Unnamed Product";

      return {
        success: true,
        data: productData,
      };
    } else {
      "❌ Document does not exist for ID:", productId;
      return {
        success: false,
        error: "Product not found",
        data: null,
      };
    }
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// Update a product

// ...existing code...

// Update a product with image handling
// export const updateProduct = async (productId, updateData) => {
//   try {
//     // Process main images
//     if (updateData.mainImages) {
//       const existingImages = updateData.mainImages.filter(
//         (img) => typeof img === "string"
//       );
//       const newImages = updateData.mainImages.filter(
//         (img) => img instanceof File
//       );

//       let newImageUrls = [];
//       if (newImages.length > 0) {
//         newImageUrls = await uploadImages(newImages, "product-images/main");
//       }

//       updateData.mainImages = [...existingImages, ...newImageUrls];
//     }

//     // Process variant images
//     if (updateData.variants) {
//       updateData.variants = await Promise.all(
//         updateData.variants.map(async (variant) => {
//           const processedColors = await Promise.all(
//             variant.colors.map(async (color) => {
//               if (color.images) {
//                 const existingImages = color.images.filter(
//                   (img) => typeof img === "string"
//                 );
//                 const newImages = color.images.filter(
//                   (img) => img instanceof File
//                 );

//                 let newImageUrls = [];
//                 if (newImages.length > 0) {
//                   newImageUrls = await uploadImages(
//                     newImages,
//                     `product-images/colors/${color.color.toLowerCase()}`
//                   );
//                 }

//                 return {
//                   ...color,
//                   stock: parseInt(color.stock),
//                   images: [...existingImages, ...newImageUrls],
//                 };
//               }
//               return {
//                 ...color,
//                 stock: parseInt(color.stock),
//               };
//             })
//           );

//           return {
//             ...variant,
//             colors: processedColors,
//           };
//         })
//       );
//     }

//     const docRef = doc(db, COLLECTION_NAME, productId);
//     await updateDoc(docRef, {
//       ...updateData,
//       price: parseFloat(updateData.price),
//       updatedAt: serverTimestamp(),
//     });

//     return {
//       success: true,
//       message: "Product updated successfully",
//     };
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };
export const updateProduct = async (productId, updateData) => {
  try {
    // === Handle Main Images ===
    if (updateData.mainImages) {
      const existingMainImages = updateData.mainImages.filter(
        (img) => typeof img === "string"
      );
      const newMainImages = updateData.mainImages.filter(
        (img) => img instanceof File
      );

      let newMainImageUrls = [];
      if (newMainImages.length > 0) {
        newMainImageUrls = await uploadImages(
          newMainImages,
          "product-images/main"
        );
      }

      updateData.mainImages = [...existingMainImages, ...newMainImageUrls];
    }

    // === Handle Colors and Their Images ===
    const colorImageMap = {};
    if (updateData.colors && updateData.colors.length > 0) {
      for (const colorObj of updateData.colors) {
        let existingColorImages = [];
        let newColorImages = [];

        if (colorObj.images && colorObj.images.length > 0) {
          existingColorImages = colorObj.images.filter(
            (img) => typeof img === "string"
          );
          newColorImages = colorObj.images.filter((img) => img instanceof File);
        }

        let newColorImageUrls = [];
        if (newColorImages.length > 0) {
          newColorImageUrls = await uploadImages(
            newColorImages,
            `product-images/colors/${colorObj.color.toLowerCase()}`
          );
        }

        // Save updated image list for this color
        const finalImages = [...existingColorImages, ...newColorImageUrls];
        colorImageMap[colorObj.color] = finalImages;
      }
    }

    // === Build Variants from Sizes and colorStock ===
    let processedVariants = [];
    if (updateData.sizes && updateData.sizes.length > 0) {
      processedVariants = updateData.sizes.map((sizeObj) => {
        const processedColors = sizeObj.colorStock.map((cs) => ({
          color: cs.color,
          stock: parseInt(cs.stock),
          images: colorImageMap[cs.color] || [],
        }));

        return {
          size: sizeObj.size,
          colors: processedColors,
        };
      });
    }

    // Prepare final update object
    const finalUpdateData = {
      ...updateData,
      price: parseFloat(updateData.price),
      discountPercentage: updateData.discountPercentage || 0,
      discountPrice: updateData.discountPrice
        ? parseFloat(updateData.discountPrice)
        : null,
      originalPrice: updateData.originalPrice
        ? parseFloat(updateData.originalPrice)
        : null,
      variants: processedVariants,
      updatedAt: serverTimestamp(),
    };

    // Remove raw colors/sizes arrays from final doc if you only store variants
    delete finalUpdateData.colors;
    delete finalUpdateData.sizes;

    // Update Firestore
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, finalUpdateData);

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

// ...rest of existing code...
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
