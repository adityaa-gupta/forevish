import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Import from Provider for guaranteed initialization (Firebase Auth only)
import { auth, db, googleProvider } from "@/app/providers/Provider";

// Import Supabase for image storage
import { uploadImage, deleteImage } from "@/app/supabase/supabase";

const USERS_COLLECTION = "users";

// Create user profile in Firestore
const createUserProfile = async (user, additionalData = {}) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();

      await setDoc(userDocRef, {
        displayName: displayName || additionalData.name || "",
        email,
        photoURL: photoURL || "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        createdAt,
        updatedAt: createdAt,
        isActive: true,
        role: "customer",
        isNewUser: true, // Flag to identify new users
        preferences: {
          newsletter: true,
          notifications: true,
          smsUpdates: false,
        },
        ...additionalData,
      });

      return { isNewUser: true, userDoc: userDocRef };
    }

    return { isNewUser: false, userDoc: userDocRef };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Check if user is new and needs profile completion
export const checkUserProfileStatus = async (uid) => {
  try {
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        isNewUser: userData.isNewUser || false,
        profileComplete: !!(
          userData.displayName &&
          userData.phone &&
          userData.address?.city
        ),
        data: userData,
      };
    }

    return {
      success: true,
      isNewUser: true,
      profileComplete: false,
      data: null,
    };
  } catch (error) {
    console.error("Error checking user profile status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  try {
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const userDocRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
      isNewUser: false, // Mark as no longer new user
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload profile image using Supabase
export const uploadProfileImage = async (uid, file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must be less than 5MB");
    }

    console.log("🔄 Uploading profile image to Supabase...");

    // Delete existing profile image if it exists
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.photoURL && userData.photoURL.includes("supabase")) {
          console.log("🗑️ Deleting old profile image...");
          await deleteImage(userData.photoURL, "forevish");
        }
      }
    } catch (deleteError) {
      console.warn("Could not delete old image:", deleteError);
      // Continue with upload even if delete fails
    }

    // Upload new image to Supabase Storage
    const photoURL = await uploadImage(
      file,
      "forevish", // bucket name
      `profile-images/${uid}` // folder path
    );

    console.log("✅ Image uploaded successfully:", photoURL);

    // Update user's photoURL in Firebase Auth
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await updateProfile(auth.currentUser, {
        photoURL: photoURL,
      });
      console.log("✅ Firebase Auth profile updated");
    }

    // Update user profile in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDocRef, {
      photoURL: photoURL,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Firestore profile updated");

    return {
      success: true,
      photoURL: photoURL,
    };
  } catch (error) {
    console.error("❌ Error uploading profile image:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image",
    };
  }
};

// Get user profile data
export const getUserProfile = async (uid) => {
  try {
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data(),
      };
    }

    return {
      success: false,
      error: "User profile not found",
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Sign up with email and password (updated)
export const signUpWithEmailAndPassword = async (email, password, name) => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: name,
    });

    // Create user profile in Firestore
    const profileResult = await createUserProfile(user, { name });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: user.photoURL,
      },
      isNewUser: profileResult.isNewUser,
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Sign in with email and password (updated)
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;

    // Check if user profile exists and if it's complete
    const profileStatus = await checkUserProfileStatus(user.uid);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      isNewUser: profileStatus.isNewUser,
      profileComplete: profileStatus.profileComplete,
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Sign in with Google (updated)
export const signInWithGoogle = async () => {
  try {
    if (!auth || !googleProvider) {
      throw new Error("Firebase Auth or Google Provider not initialized");
    }

    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create user profile if it doesn't exist
    const profileResult = await createUserProfile(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      isNewUser: profileResult.isNewUser,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error("Firebase Auth not initialized"));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/operation-not-allowed":
      return "Operation not allowed.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completion.";
    case "auth/cancelled-popup-request":
      return "Only one popup request is allowed at one time.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by the browser.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    default:
      return "An error occurred. Please try again.";
  }
};
