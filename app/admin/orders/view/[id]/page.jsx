// filepath: /Users/adityagupta/forevish/app/admin/orders/view/[id]/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getProductsByIds,
} from "@/app/lib/services/orders";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Package,
  User as UserIcon,
  MapPin,
  Calendar,
  AlertTriangle,
  DollarSign,
  CircleDollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrderViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const res = await getOrderById(id);
      if (!res.success) {
        toast.error(res.error || "Order not found");
        setOrder(null);
        return;
      }
      setOrder(res.data);

      // Load user (keep lightweight – still direct fetch or move to users service)
      if (res.data.userId) {
        const { getDoc, doc } = await import("firebase/firestore");
        const { db } = await import("@/app/providers/Provider");
        const uSnap = await getDoc(doc(db, "users", res.data.userId));
        if (uSnap.exists()) setUser({ id: uSnap.id, ...uSnap.data() });
      }

      // Load product metadata
      const productIds = Array.from(
        new Set(res.data.items?.map((i) => i.productId).filter(Boolean))
      );
      if (productIds.length) {
        const pRes = await getProductsByIds(productIds);
        if (pRes.success) setProducts(pRes.data);
      }
    } catch (e) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const changeStatus = async (status) => {
    if (!order || status === order.status) return;
    if (!confirm(`Change status to ${status}?`)) return;
    setUpdatingStatus(true);
    const prev = order.status;
    setOrder((o) => ({ ...o, status }));
    const res = await updateOrderStatus(order.id, status);
    if (!res.success) {
      setOrder((o) => ({ ...o, status: prev }));
      toast.error("Status update failed");
    } else toast.success("Status updated");
    setUpdatingStatus(false);
  };

  const markPaid = async () => {
    if (!order || order.paymentStatus === "paid") return;
    if (!confirm("Mark as paid?")) return;
    setUpdatingPayment(true);
    const prev = order.paymentStatus;
    setOrder((o) => ({ ...o, paymentStatus: "paid" }));
    const res = await updateOrderPaymentStatus(order.id, "paid");
    if (!res.success) {
      setOrder((o) => ({ ...o, paymentStatus: prev }));
      toast.error("Payment update failed");
    } else toast.success("Payment marked as paid");
    setUpdatingPayment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 text-sm">Order not found</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="px-4 h-10 rounded-lg border text-sm hover:bg-neutral-50"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const amounts = order.amounts || {};
  const created = order.createdAt?.toDate
    ? format(order.createdAt.toDate(), "yyyy-MM-dd HH:mm")
    : "—";
  const updated = order.updatedAt?.toDate
    ? format(order.updatedAt.toDate(), "yyyy-MM-dd HH:mm")
    : "—";

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/orders")}
              className="h-10 w-10 flex items-center justify-center rounded-lg border bg-white hover:bg-neutral-50"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Order {order.orderNumber || order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-xs text-neutral-500 font-mono">{order.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchOrder}
              disabled={refreshing}
              className="h-10 px-4 rounded-lg border bg-white text-sm flex items-center gap-2 hover:bg-neutral-50 disabled:opacity-50"
            >
              {refreshing && <Loader2 className="w-4 h-4 animate-spin" />}
              Refresh
            </button>
            {order.paymentStatus !== "paid" && (
              <button
                onClick={markPaid}
                disabled={updatingPayment}
                className="h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-2 hover:bg-emerald-500 disabled:opacity-50"
              >
                <CircleDollarSign className="w-4 h-4" />
                {updatingPayment ? "Updating..." : "Mark Paid"}
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status & meta */}
            <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created {created}
                </div>
                <div className="text-xs text-neutral-400">
                  Updated {updated}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    disabled={updatingStatus || order.status === s}
                    onClick={() => changeStatus(s)}
                    className={`px-3 h-8 rounded-full text-xs font-medium border transition ${
                      order.status === s
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700"
                    } disabled:opacity-50`}
                  >
                    {order.status === s && updatingStatus ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {s}
                      </span>
                    ) : (
                      s
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Items */}
            <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Items ({order.items?.length || 0})
              </h2>
              <ul className="divide-y divide-neutral-200">
                {order.items?.map((it, i) => {
                  const prod = products[it.productId];
                  return (
                    <Link
                      href={`/admin/products/view/${it.productId}`}
                      key={it.cartItemId || it.productId + i}
                      className="py-4 flex gap-4 items-start"
                    >
                      <div className="w-16 h-16 rounded-md bg-neutral-100 border overflow-hidden flex items-center justify-center text-[10px] text-neutral-400">
                        {/* If you have thumbnail field store it in prod.thumbnail or it.image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {prod?.images?.[0] || it.image ? (
                          <img
                            src={prod?.images?.[0] || it.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "IMG"
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 text-sm">
                        <span className="font-medium text-neutral-800">
                          {it.name || prod?.name || "Product"}
                        </span>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                          {it.size && (
                            <span className="px-2 py-0.5 bg-neutral-100 rounded">
                              Size: {it.size}
                            </span>
                          )}
                          {it.color && (
                            <span className="px-2 py-0.5 bg-neutral-100 rounded">
                              Color: {it.color}
                            </span>
                          )}
                          <span>Qty: {it.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-neutral-800">
                          $
                          {(it.lineTotal || it.unitPrice * it.quantity).toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-neutral-500">
                          @ ${it.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Pricing */}
            <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </h2>
              <div className="space-y-2 text-sm">
                <Row
                  label="Subtotal"
                  value={`$${(amounts.subtotal ?? 0).toFixed(2)}`}
                />
                <Row
                  label="Shipping"
                  value={
                    amounts.shipping === 0
                      ? "Free"
                      : `$${(amounts.shipping ?? 0).toFixed(2)}`
                  }
                />
                <Row label="Tax" value={`$${(amounts.tax ?? 0).toFixed(2)}`} />
                <div className="pt-2 border-t border-neutral-200">
                  <Row
                    label="Total"
                    value={`$${(amounts.total ?? order.netAmount ?? 0).toFixed(
                      2
                    )}`}
                    strong
                  />
                </div>
                <div className="text-[11px] text-neutral-500">
                  Payment: {order.paymentStatus || "unpaid"}
                </div>
              </div>
            </section>

            {/* User */}
            <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Customer
              </h2>
              {user ? (
                <div className="text-sm space-y-2">
                  <p className="font-medium text-neutral-800">
                    {user.displayName || user.fullName || "—"}
                  </p>
                  <div className="text-neutral-600 space-y-1 text-xs">
                    <p>Email: {user.email || "—"}</p>
                    {user.phone && <p>Phone: {user.phone}</p>}
                  </div>
                  <div className="pt-2 border-t border-neutral-200 space-y-1">
                    <p className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Shipping Address
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {order.shipping?.addressLine1}
                      {order.shipping?.addressLine2 && (
                        <>
                          <br />
                          {order.shipping.addressLine2}
                        </>
                      )}
                      <br />
                      {order.shipping?.city}, {order.shipping?.state}{" "}
                      {order.shipping?.postalCode}
                      <br />
                      {order.shipping?.country}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No user info</p>
              )}
            </section>

            {/* Notes / Flags */}
            {order.status === "cancelled" && (
              <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-lg flex gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p>Order was cancelled. Further edits are restricted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    refunded: "bg-neutral-200 text-neutral-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize ${
        map[status] || "bg-neutral-200 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const map = {
    paid: "bg-emerald-100 text-emerald-700",
    unpaid: "bg-neutral-200 text-neutral-700",
    refunded: "bg-neutral-200 text-neutral-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize ${
        map[status] || "bg-neutral-200 text-neutral-700"
      }`}
    >
      {status || "unpaid"}
    </span>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`${
          strong ? "font-semibold text-neutral-900" : "text-neutral-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
