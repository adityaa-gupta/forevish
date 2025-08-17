// Server-safe Firestore access (no "use client")
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

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

function serializeTimestamp(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate().toISOString();
  if (ts.seconds) {
    const ms = ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
    return new Date(ms).toISOString();
  }
  return null;
}

export async function getAllProductsServer() {
  try {
    const col = collection(serverDb, "products");
    const snap = await getDocs(col);
    const data = snap.docs.map((d) => {
      const raw = d.data();
      return {
        id: d.id,
        ...raw,
        mainImages: raw.mainImages || [],
        variants: raw.variants || [],
        category: raw.category || "",
        price: raw.price ?? 0,
        discountPrice: raw.discountPrice ?? null,
        originalPrice: raw.originalPrice ?? raw.price ?? 0,
        createdAtISO: serializeTimestamp(raw.createdAt),
        updatedAtISO: serializeTimestamp(raw.updatedAt),
      };
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message || "Failed to fetch products" };
  }
}
