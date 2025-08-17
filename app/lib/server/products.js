// Server-safe Firestore access (no "use client")
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWjIdiuzInlLOhCULHryvygMaWoL7wWNM",
  authDomain: "forevish-store.firebaseapp.com",
  projectId: "forevish-store",
  storageBucket: "forevish-store.firebasestorage.app",
  messagingSenderId: "775516129882",
  appId: "1:775516129882:web:83c26a77269832fa8c2663",
  measurementId: "G-YCMSFNB3YY",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const serverDb = getFirestore(app);

export async function getProductByIdServer(id) {
  if (!id) return { success: false, error: "Missing id" };
  try {
    const ref = doc(serverDb, "products", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: "Not found" };
    const data = snap.data();
    return {
      success: true,
      data: {
        id: snap.id,
        ...data,
        mainImages: data.mainImages || [],
        variants: data.variants || [],
        category: data.category || "",
        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? null,
        originalPrice: data.originalPrice ?? data.price ?? 0,
        description: data.description || "",
        name: data.name || "Product",
      },
    };
  } catch (e) {
    return { success: false, error: e.message || "Fetch failed" };
  }
}
