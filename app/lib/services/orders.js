// Firestore order helpers
// Adjust import path to your firebase config.
import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion, // <-- added
  setDoc,
} from "firebase/firestore";
// import { db } from "../firebase"; // <-- ensure this exists

import { db } from "@/app/providers/Provider";

// Create order and (optionally) decrement product stock atomically (best-effort)
export async function createOrder(order) {
  try {
    if (!order?.userId) throw new Error("Missing userId");

    const ordersCol = collection(db, "orders");
    const batch = writeBatch(db);

    // Pre-create order doc ref to know ID
    const docRef = doc(ordersCol);
    const orderId = docRef.id;

    // Decrement stock (simple example)
    for (const item of order.items) {
      const prodRef = doc(db, "products", item.productId);
      const snap = await getDoc(prodRef);
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.stock === "number") {
          const newStock = Math.max(0, data.stock - item.quantity);
          batch.update(prodRef, { stock: newStock });
        }
      }
    }

    // Write order
    batch.set(docRef, {
      userId: order.userId,
      items: order.items,
      shipping: order.shipping,
      amounts: order.amounts,
      netAmount: order.amounts?.total,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      orderNumber: orderId.slice(-8).toUpperCase(),
    });

    // Append order id to user doc (ensure array exists)
    const userRef = doc(db, "users", order.userId);
    batch.set(
      userRef,
      {
        orders: arrayUnion(orderId),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();
    return { success: true, id: orderId };
  } catch (e) {
    console.error("createOrder error", e);
    return { success: false, error: e.message };
  }
}

export async function getUserOrders(userId) {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: list };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const ref = doc(db, "orders", orderId);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
