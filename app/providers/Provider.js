"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Remove storage import since we're using Supabase
import Navbar from "../components/Navbar";
import { store } from "../_store/store";
import { login, logout, setAuthLoading } from "../_store/features/userSlice";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWjIdiuzInlLOhCULHryvygMaWoL7wWNM",
  authDomain: "forevish-store.firebaseapp.com",
  projectId: "forevish-store",
  storageBucket: "forevish-store.firebasestorage.app",
  messagingSenderId: "775516129882",
  appId: "1:775516129882:web:83c26a77269832fa8c2663",
  measurementId: "G-YCMSFNB3YY",
};

// Initialize Firebase at the entry point (Auth + Firestore only)
let app, db, auth, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Configure Google provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope("email");
  googleProvider.addScope("profile");

  console.log("✅ Firebase initialized successfully (Auth + Firestore)");
  console.log("📁 Using Supabase for storage");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

// Export Firebase services (no storage since we use Supabase)
export { app, db, auth, googleProvider, GoogleAuthProvider };

// ---- Product helper (fetch product by id) ----
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetch a single product by its Firestore document ID.
 * @param {string} productId
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function fetchProductById(productId) {
  if (!productId) {
    return { success: false, error: "Missing productId" };
  }
  if (!db) {
    return { success: false, error: "Firestore not initialized" };
  }
  try {
    const ref = doc(db, "products", productId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: "Product not found" };
    }
    const data = snap.data();
    return {
      success: true,
      data: {
        id: snap.id,
        ...data,
        // Normalize optional fields
        mainImages: data.mainImages || [],
        variants: data.variants || [],
        category: data.category || "",
        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? null,
        originalPrice: data.originalPrice ?? data.price ?? 0,
      },
    };
  } catch (e) {
    return { success: false, error: e.message || "Failed to fetch product" };
  }
}
// ---- end product helper ----

// Auth State Manager Component
function AuthStateManager() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      dispatch(setAuthLoading(false));
      return;
    }

    console.log("🔄 Setting up auth state listener...");

    // Set up auth state persistence listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log(
          "🔐 Auth state changed:",
          user ? "User logged in" : "User logged out"
        );

        if (user) {
          // User is signed in
          dispatch(
            login({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            })
          );
        } else {
          // User is signed out
          dispatch(logout());
        }

        // Auth loading complete
        dispatch(setAuthLoading(false));
      },
      (error) => {
        console.error("❌ Auth state change error:", error);
        dispatch(setAuthLoading(false));
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log("🧹 Cleaning up auth state listener");
      unsubscribe();
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      {/* Initialize auth state management */}
      <AuthStateManager />

      {/* Main app content */}
      <Navbar />
      {children}
    </Provider>
  );
}
