import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn, // Rename the import
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

// Import from Provider for guaranteed initialization
import { auth, db, googleProvider } from "@/app/providers/Provider";

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
        createdAt,
        updatedAt: createdAt,
        isActive: true,
        role: "customer",
        preferences: {
          newsletter: true,
          notifications: true,
        },
        ...additionalData,
      });
    }

    return userDocRef;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Sign up with email and password
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
    await createUserProfile(user, { name });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    // Use the renamed Firebase function
    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

// Sign in with Google
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
    await createUserProfile(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
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
