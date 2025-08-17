// filepath: /Users/adityagupta/forevish/app/orders/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserOrders } from "@/app/lib/services/orders";
import formatPrice from "@/app/lib/helpers/formatPrice";
import { Loader2, Package, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-neutral-200 text-neutral-700",
};

export default function OrdersPage() {
  const {
    isLoggedIn,
    userInfo,
    loading: authLoading,
  } = useSelector((s) => s.user);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!userInfo?.uid && !userInfo?.id) return;
    setError("");
    setRefreshing(true);
    if (!orders.length) setLoading(true);
    try {
      const res = await getUserOrders(userInfo.uid || userInfo.id);
      if (!res.success) throw new Error(res.error || "Failed to load orders");
      setOrders(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo, orders.length]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }
    loadOrders();
  }, [authLoading, isLoggedIn, loadOrders, router]);

  if (authLoading || (!isLoggedIn && authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
            <p className="text-sm text-neutral-500">
              Track your purchases & their status.
            </p>
          </div>
          <button
            onClick={loadOrders}
            disabled={refreshing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border bg-white text-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {refreshing && <Loader2 className="w-4 h-4 animate-spin" />}
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100/70 text-neutral-600 text-xs uppercase tracking-wide">
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-neutral-500"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading your orders...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                      <Package className="w-6 h-6" />
                      <p className="text-sm">No orders yet.</p>
                      <Link
                        href="/"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Start shopping →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                orders.map((o) => {
                  const total =
                    o.amounts?.total ??
                    o.netAmount ??
                    o.items?.reduce(
                      (acc, it) =>
                        acc +
                        (it.lineTotal ||
                          (it.unitPrice || 0) * (it.quantity || 0)),
                      0
                    );
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50/70 transition"
                    >
                      <Td className="font-medium text-neutral-800">
                        {o.orderNumber || o.id.slice(-8).toUpperCase()}
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {o.id}
                        </div>
                      </Td>
                      <Td className="text-neutral-600">
                        {o.createdAt?.toDate
                          ? new Date(o.createdAt.toDate()).toLocaleDateString()
                          : "—"}
                      </Td>
                      <Td>{o.items?.length || 0}</Td>
                      <Td className="font-semibold text-neutral-900">
                        {formatPrice(total)}
                      </Td>
                      <Td>
                        <StatusBadge status={o.status} />
                      </Td>
                      <Td>
                        <span
                          className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                            o.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {o.paymentStatus || "unpaid"}
                        </span>
                      </Td>
                      <Td className="text-right pr-3">
                        <Link
                          href={`/orders/${o.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-4 py-3 font-semibold text-[11px] tracking-wide">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top text-sm ${className}`}>{children}</td>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-neutral-200 text-neutral-700";
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize ${cls}`}
    >
      {status || "pending"}
    </span>
  );
}
