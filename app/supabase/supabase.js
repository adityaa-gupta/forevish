import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = "https://bolonuxrtdasiutxkvoy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG9udXhydGRhc2l1dHhrdm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzMxODQsImV4cCI6MjA2OTgwOTE4NH0.a-V0gB4OHG8gXwx1Slp6g_XjdBtc5PzqaCDWbCryEmQ";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (default: 'forevish')
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (file, bucket = "forevish", folder = "") => {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Generate a unique filename to prevent conflicts
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Create the full path including any folder
    // Fix: Ensure there are no extra slashes when folder is empty
    const filePath =
      folder && folder.trim() !== ""
        ? `${folder.trim()}/${fileName}`
        : fileName;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
};

/**
 * Upload multiple images and return their URLs
 * @param {File[]} files - Array of image files to upload
 * @param {string} bucket - The storage bucket name (default: 'forevish')
 * @param {string} folder - Optional folder path
 * @returns {Promise<string[]>} - Array of public URLs
 */
export const uploadMultipleImages = async (
  files,
  bucket = "forevish",
  folder = ""
) => {
  if (!files || !files.length) {
    throw new Error("No files provided");
  }

  const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Supabase Storage
 * @param {string} url - The URL of the image to delete
 * @param {string} bucket - The storage bucket name (default: 'forevish')
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImage = async (url, bucket = "forevish") => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    const filePath = pathSegments
      .slice(pathSegments.indexOf(bucket) + 1)
      .join("/");

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error.message);
    throw error;
  }
};

export default supabase;
