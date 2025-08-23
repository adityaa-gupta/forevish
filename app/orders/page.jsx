"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserOrders, getProductsByIds } from "@/app/lib/services/orders";
import formatPrice from "@/app/lib/helpers/formatPrice";
import {
  Loader2,
  RefreshCw,
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  Ban,
  RotateCcw,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const STATUS_META = {
  pending: {
    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock,
    label: "Pending",
  },
  processing: {
    cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: RotateCcw,
    label: "Processing",
  },
  shipped: {
    cls: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CheckCircle2,
    label: "Delivered",
  },
  cancelled: {
    cls: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    icon: Ban,
    label: "Cancelled",
  },
  refunded: {
    cls: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
    icon: RotateCcw,
    label: "Refunded",
  },
};

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const {
    isLoggedIn,
    userInfo,
    loading: authLoading,
  } = useSelector((s) => s.user);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadOrders = useCallback(async () => {
    if (!userInfo?.uid && !userInfo?.id) return;
    setError("");
    setRefreshing(true);
    if (!orders.length) setLoading(true);
    try {
      const res = await getUserOrders(userInfo.uid || userInfo.id);
      if (!res.success) throw new Error(res.error || "Failed to load orders");
      setOrders(res.data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo, orders.length]);

  // Fetch product details for thumbnails (first 3 distinct productIds across page)
  const fetchProducts = useCallback(
    async (ordersSubset) => {
      try {
        const ids = Array.from(
          new Set(
            ordersSubset.flatMap((o) =>
              (o.items || [])
                .slice(0, 3)
                .map((it) => it.productId)
                .filter(Boolean)
            )
          )
        ).filter((id) => !productsMap[id]);
        if (!ids.length) return;
        setProductsLoading(true);
        const res = await getProductsByIds(ids);
        if (res.success) {
          setProductsMap((prev) => ({ ...prev, ...res.data }));
        }
      } finally {
        setProductsLoading(false);
      }
    },
    [productsMap]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }
    loadOrders();
  }, [authLoading, isLoggedIn, loadOrders, router]);

  // Filter + paginate
  useEffect(() => {
    const s = search.trim().toLowerCase();
    let filtered = orders;
    if (s) {
      filtered = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          (o.orderNumber || "").toLowerCase().includes(s) ||
          (o.status || "").toLowerCase().includes(s)
      );
    }
    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);
    setDisplayOrders(slice);
    fetchProducts(slice);
  }, [orders, search, page, fetchProducts]);

  const totalPages = useMemo(() => {
    const s = search.trim().toLowerCase();
    const count = s
      ? orders.filter(
          (o) =>
            o.id.toLowerCase().includes(s) ||
            (o.orderNumber || "").toLowerCase().includes(s) ||
            (o.status || "").toLowerCase().includes(s)
        ).length
      : orders.length;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [orders, search]);

  const stats = useMemo(() => {
    if (!orders.length)
      return { total: 0, spent: 0, pending: 0, lastDate: null };
    const spent = orders.reduce(
      (acc, o) =>
        acc +
        (o.amounts?.total ??
          o.netAmount ??
          o.items?.reduce(
            (a, it) =>
              a + (it.lineTotal || (it.unitPrice || 0) * (it.quantity || 0)),
            0
          )),
      0
    );
    const pending = orders.filter((o) =>
      ["pending", "processing", "shipped"].includes(o.status)
    ).length;
    const lastDate = orders[0]?.createdAt?.toDate
      ? new Date(orders[0].createdAt.toDate())
      : null;
    return { total: orders.length, spent, pending, lastDate };
  }, [orders]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (authLoading || (!isLoggedIn && authLoading)) {
    return (
      <FullCenter>
        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
      </FullCenter>
    );
  }
  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-neutral-50/70 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header + Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              My Orders
            </h1>
            <p className="text-sm text-neutral-500">
              Track, review and manage your purchases.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search order # / status..."
                className="w-full pl-9 pr-3 h-10 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-neutral-300 bg-white text-sm font-medium hover:bg-neutral-100/60 disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={ShoppingBag}
            accent="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="In Progress"
            value={stats.pending}
            icon={Truck}
            accent="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Total Spent"
            value={formatPrice(stats.spent)}
            icon={CheckCircle2}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Latest Order"
            value={stats.lastDate ? stats.lastDate.toLocaleDateString() : "—"}
            icon={Clock}
            accent="bg-neutral-100 text-neutral-600"
          />
        </div>

        {/* Content Container */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100/70 text-neutral-600 text-[11px] uppercase tracking-wide">
                <tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th className="min-w-[180px]">Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading && <SkeletonRows />}
                {!loading && error && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-rose-600 text-sm"
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && !orders.length && <EmptyRow />}
                {!loading &&
                  !error &&
                  displayOrders.map((o) => {
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
                    const created =
                      o.createdAt?.toDate &&
                      new Date(o.createdAt.toDate()).toLocaleDateString();
                    const thumbs = (o.items || []).slice(0, 3).map((it) => ({
                      id: it.productId,
                      img:
                        productsMap[it.productId]?.mainImages?.[0] ||
                        "/placeholder.svg?height=60&width=60",
                    }));
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <Td className="font-medium text-neutral-800 align-middle">
                          {o.orderNumber || o.id.slice(-8).toUpperCase()}
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {o.id}
                          </div>
                        </Td>
                        <Td className="text-neutral-600 align-middle">
                          {created || "—"}
                        </Td>
                        <Td className="py-2">
                          <div className="flex items-center gap-2">
                            <ThumbStack thumbs={thumbs} />
                            <div className="text-xs text-neutral-500">
                              {o.items?.length || 0} item
                              {(o.items?.length || 0) === 1 ? "" : "s"}
                            </div>
                          </div>
                        </Td>
                        <Td className="font-semibold text-neutral-900 align-middle">
                          {formatPrice(total)}
                        </Td>
                        <Td className="align-middle">
                          <StatusBadge status={o.status} />
                        </Td>
                        <Td className="align-middle">
                          <PaymentBadge status={o.paymentStatus} />
                        </Td>
                        <Td className="text-right pr-4 align-middle">
                          <Link
                            href={`/orders/${o.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            View
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </Td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {loading && <MobileSkeleton />}
            {!loading && error && (
              <div className="py-12 text-center text-rose-600 text-sm">
                {error}
              </div>
            )}
            {!loading && !error && !orders.length && <MobileEmpty />}
            {!loading &&
              !error &&
              displayOrders.map((o) => {
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
                const created =
                  o.createdAt?.toDate &&
                  new Date(o.createdAt.toDate()).toLocaleDateString();
                const thumbs = (o.items || []).slice(0, 3).map((it) => ({
                  id: it.productId,
                  img:
                    productsMap[it.productId]?.mainImages?.[0] ||
                    "/placeholder.svg?height=60&width=60",
                }));
                return (
                  <div key={o.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-neutral-800 text-sm">
                          {o.orderNumber || o.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {o.id}
                        </div>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <ThumbStack thumbs={thumbs} size="sm" />
                      <div className="text-xs text-neutral-500">
                        {o.items?.length || 0} item
                        {(o.items?.length || 0) === 1 ? "" : "s"}
                        <div className="mt-1 text-neutral-400">
                          {created || "—"}
                        </div>
                      </div>
                      <div className="ml-auto text-sm font-semibold text-neutral-900">
                        {formatPrice(total)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <PaymentBadge status={o.paymentStatus} />
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-xs text-blue-600 font-medium inline-flex items-center gap-1"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          {!loading && !error && orders.length > 0 && (
            <div className="flex items-center justify-between gap-4 px-4 py-4 border-t border-neutral-200 flex-wrap">
              <p className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <PageBtn
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pNum) => {
                    if (totalPages <= 5) return true;
                    if (
                      pNum === 1 ||
                      pNum === totalPages ||
                      Math.abs(pNum - page) <= 1
                    )
                      return true;
                    return false;
                  })
                  .map((pNum, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && pNum - prev > 1;
                    return (
                      <span key={pNum} className="flex">
                        {showEllipsis && (
                          <span className="px-2 text-neutral-400">…</span>
                        )}
                        <PageBtn
                          active={pNum === page}
                          onClick={() => setPage(pNum)}
                        >
                          {pNum}
                        </PageBtn>
                      </span>
                    );
                  })}
                <PageBtn
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </PageBtn>
              </div>
            </div>
          )}
        </div>
        {productsLoading && (
          <p className="text-[10px] text-neutral-400">
            Loading product thumbnails...
          </p>
        )}
      </div>
    </div>
  );
}

/* Reusable Components */

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${meta.cls}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

function PaymentBadge({ status }) {
  const paid = status === "paid";
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
        paid
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
      }`}
    >
      {paid ? "Paid" : status || "Unpaid"}
    </span>
  );
}

function ThumbStack({ thumbs = [], size = "md" }) {
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  return (
    <div className="flex -space-x-3">
      {thumbs.map((t, i) => (
        <div
          key={t.id + i}
          className={`relative ${dim} rounded-md overflow-hidden ring-2 ring-white bg-neutral-100 flex items-center justify-center`}
        >
          <img
            src={t.img}
            alt=""
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {i === 2 && thumbs.length > 3 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[10px] text-white font-medium">
              +{thumbs.length - 3}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center gap-4 shadow-sm">
      <div
        className={`h-11 w-11 rounded-lg flex items-center justify-center text-sm font-medium ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] uppercase font-medium tracking-wide text-neutral-500">
          {label}
        </div>
        <div className="text-sm font-semibold text-neutral-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <Td>
            <div className="h-4 w-28 bg-neutral-200 rounded" />
            <div className="h-2 w-16 bg-neutral-100 rounded mt-2" />
          </Td>
          <Td>
            <div className="h-4 w-20 bg-neutral-200 rounded" />
          </Td>
          <Td>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-md bg-neutral-200" />
              <div className="h-10 w-10 rounded-md bg-neutral-200" />
              <div className="h-10 w-10 rounded-md bg-neutral-200" />
            </div>
          </Td>
          <Td>
            <div className="h-4 w-16 bg-neutral-200 rounded" />
          </Td>
          <Td>
            <div className="h-5 w-20 bg-neutral-200 rounded-full" />
          </Td>
          <Td>
            <div className="h-5 w-16 bg-neutral-200 rounded-full" />
          </Td>
          <Td>
            <div className="h-4 w-10 bg-neutral-200 rounded ml-auto" />
          </Td>
        </tr>
      ))}
    </>
  );
}

function MobileSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse space-y-4">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-md bg-neutral-200" />
            <div className="h-10 w-10 rounded-md bg-neutral-200" />
            <div className="h-10 w-10 rounded-md bg-neutral-200" />
          </div>
          <div className="flex justify-between">
            <div className="h-5 w-20 bg-neutral-200 rounded-full" />
            <div className="h-5 w-12 bg-neutral-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Package className="w-8 h-8" />
          <p className="text-sm">No orders yet.</p>
          <Link
            href="/"
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Start shopping →
          </Link>
        </div>
      </td>
    </tr>
  );
}

function MobileEmpty() {
  return (
    <div className="py-16 text-center">
      <div className="flex flex-col items-center gap-3 text-neutral-500">
        <Package className="w-8 h-8" />
        <p className="text-sm">No orders yet.</p>
        <Link
          href="/"
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          Start shopping →
        </Link>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`text-left px-4 py-3 font-semibold text-[11px] tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top text-sm ${className}`}>{children}</td>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-8 min-w-8 px-3 text-xs rounded-md border transition font-medium ${
        active
          ? "bg-blue-600 border-blue-600 text-white"
          : disabled
          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200"
          : "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function FullCenter({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-neutral-500 gap-2">
      {children}
    </div>
  );
}
