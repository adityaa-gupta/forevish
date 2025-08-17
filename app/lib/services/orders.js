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
  limit,
  startAfter,
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

// Update getUserOrders to gracefully fallback when composite index missing.
export async function getUserOrders(userId) {
  try {
    const qRef = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // needs composite index (userId + createdAt desc)
    );
    const snap = await getDocs(qRef);
    return {
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (e) {
    const missingIndex =
      e.code === "failed-precondition" &&
      /create_composite/.test(e.message || "");
    if (missingIndex) {
      // Fallback: run without orderBy (no composite index needed) then sort in memory.
      try {
        const fallbackQ = query(
          collection(db, "orders"),
          where("userId", "==", userId)
        );
        const snap = await getDocs(fallbackQ);
        let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );
        // Extract index creation URL (optional)
        const match = e.message.match(
          /https:\/\/console\.firebase\.google\.com[^\s"]+/
        );
        return {
          success: true,
          data,
          warning:
            "Using fallback sorting (create composite index for better performance)." +
            (match ? " Create index: " + match[0] : ""),
        };
      } catch (inner) {
        return {
          success: false,
          error: "Fallback query failed: " + inner.message,
        };
      }
    }
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

// Admin: get all orders with optional status/search & cursor pagination
export async function getAllOrders({
  status,
  search,
  limit: take = 20,
  cursor,
} = {}) {
  try {
    let qRef = collection(db, "orders");
    const constraints = [orderBy("createdAt", "desc"), limit(take)];

    if (status) constraints.unshift(where("status", "==", status));

    // For lightweight search: fetch then filter client-side (since Firestore OR is limited)
    const qBuilt = query(qRef, ...constraints);
    let snap = await getDocs(qBuilt);

    let docs = snap.docs;

    // NOTE: cursor pagination simplified: pass last doc's createdAt externally if needed
    if (cursor) {
      // When cursor provided: build a new query starting after
      const afterQ = query(
        qRef,
        ...(status ? [where("status", "==", status)] : []),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(take)
      );
      snap = await getDocs(afterQ);
      docs = snap.docs;
    }

    let data = docs.map((d) => ({ id: d.id, ...d.data() }));
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
          (o.userId && o.userId.toLowerCase().includes(s))
      );
    }

    const nextCursor = docs.length === take ? docs[docs.length - 1] : null;

    return { success: true, data, nextCursor };
  } catch (e) {
    console.error("getAllOrders error", e);
    return { success: false, error: e.message };
  }
}

// NEW: Fetch single order by id
export async function getOrderById(orderId) {
  try {
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: "Order not found" };
    return { success: true, data: { id: snap.id, ...snap.data() } };
  } catch (e) {
    console.error("getOrderById error", e);
    return { success: false, error: e.message };
  }
}

// NEW: Update payment status
export async function updateOrderPaymentStatus(
  orderId,
  paymentStatus = "paid"
) {
  try {
    const ref = doc(db, "orders", orderId);
    await updateDoc(ref, {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e) {
    console.error("updateOrderPaymentStatus error", e);
    return { success: false, error: e.message };
  }
}

// OPTIONAL: Fetch products by ids (batched)
export async function getProductsByIds(ids = []) {
  if (!ids.length) return { success: true, data: {} };
  try {
    const result = {};
    // Firestore IN cap 10
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    for (const chunk of chunks) {
      const qRef = query(
        collection(db, "products"),
        where("__name__", "in", chunk)
      );
      const snap = await getDocs(qRef);
      snap.docs.forEach((d) => (result[d.id] = d.data()));
    }
    return { success: true, data: result };
  } catch (e) {
    console.error("getProductsByIds error", e);
    return { success: false, error: e.message };
  }
}

// Helper: fetch multiple orders by ids (returns map)
export async function getOrdersByIds(ids = []) {
  try {
    if (!ids.length) return { success: true, data: {} };
    const result = {};
    const chunkSize = 10;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const snap = await getDocs(
        query(collection(db, "orders"), where("__name__", "in", chunk))
      );
      snap.docs.forEach((d) => (result[d.id] = { id: d.id, ...d.data() }));
    }
    return { success: true, data: result };
  } catch (e) {
    console.error("getOrdersByIds error", e);
    return { success: false, error: e.message };
  }
}
