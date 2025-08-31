"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { getAllOrders, updateOrderStatus } from "@/app/lib/services/orders";
import { format } from "date-fns";
import {
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import formatINR from "@/app/lib/helpers/formatPrice";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-neutral-200 text-neutral-700",
};

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (Newest)" },
  { value: "date_asc", label: "Date (Oldest)" },
  { value: "price_desc", label: "Price (High → Low)" },
  { value: "price_asc", label: "Price (Low → High)" },
];

const ORDERS_PER_PAGE = 10;

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { success, data } = await getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
        sort,
      });

      if (!success) throw new Error("Failed to fetch");

      setAllOrders(data);
      setTotalPages(Math.ceil(data.length / ORDERS_PER_PAGE));

      // Set the current page orders based on pagination
      const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
      const endIndex = startIndex + ORDERS_PER_PAGE;
      setOrders(data.slice(startIndex, endIndex));

      // Reset to page 1 if filter changes cause fewer pages
      if (currentPage > Math.ceil(data.length / ORDERS_PER_PAGE)) {
        setCurrentPage(1);
      }
    } catch (e) {
      toast.error(e.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sort, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search, sort, loadOrders]);

  // Update displayed orders when page changes
  useEffect(() => {
    if (allOrders.length > 0) {
      const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
      const endIndex = startIndex + ORDERS_PER_PAGE;
      setOrders(allOrders.slice(startIndex, endIndex));
    }
  }, [currentPage, allOrders]);

  const handleStatusChange = async (id, newStatus) => {
    if (!confirm("Change status to " + newStatus + "?")) return;
    const old = orders;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: newStatus, _updating: true } : o
      )
    );

    setAllOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: newStatus, _updating: true } : o
      )
    );

    const res = await updateOrderStatus(id, newStatus);

    if (!res.success) {
      toast.error("Update failed");
      setOrders(old);
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: old.find((oldOrder) => oldOrder.id === id)?.status,
                _updating: false,
              }
            : o
        )
      );
    } else {
      toast.success("Status updated");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, _updating: false } : o))
      );

      setAllOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, _updating: false } : o))
      );
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-neutral-500">
              Manage all customer orders.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => loadOrders()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border bg-white text-sm hover:bg-neutral-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchRef}
              placeholder="Search by order id, order number, user id..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700/20"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700/20"
            >
              {SORT_OPTIONS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100/60 text-neutral-600 text-xs uppercase tracking-wide">
              <tr>
                <Th>#</Th>
                <Th>Order ID</Th>
                <Th>User</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Created</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-neutral-500"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-neutral-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((o, idx) => {
                  const color =
                    STATUS_COLORS[o.status] ||
                    "bg-neutral-200 text-neutral-700";
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50/60 transition"
                    >
                      <Td className="font-mono text-[11px] text-neutral-500">
                        {(currentPage - 1) * ORDERS_PER_PAGE + idx + 1}
                      </Td>
                      <Td className="font-mono">
                        <span className="font-semibold">
                          {o.orderNumber || o.id.slice(-8).toUpperCase()}
                        </span>
                        <div className="text-[10px] text-neutral-400">
                          {o.id}
                        </div>
                      </Td>
                      <Td className="font-mono text-[11px]">
                        {o.userId || "—"}
                      </Td>
                      <Td>{o.items?.length || 0}</Td>
                      <Td className="font-medium">
                        {formatINR(o.netAmount || o.amounts?.total || 0)}
                      </Td>
                      <Td>
                        <StatusSelect
                          value={o.status}
                          loading={o._updating}
                          onChange={(val) => handleStatusChange(o.id, val)}
                        />
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
                      <Td className="text-xs text-neutral-500">
                        {o.createdAt?.toDate
                          ? format(o.createdAt.toDate(), "yyyy-MM-dd HH:mm")
                          : "—"}
                      </Td>
                      <Td className="text-right pr-3">
                        <Link
                          href={`/admin/orders/view/${o.id}`}
                          onClick={() =>
                            toast(
                              o.items
                                .map(
                                  (it) =>
                                    `${it.quantity}x ${it.name} (${formatINR(
                                      it.unitPrice * it.quantity
                                    )})`
                                )
                                .join("\n")
                            )
                          }
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

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
              <div className="text-sm text-neutral-500">
                Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-
                {Math.min(currentPage * ORDERS_PER_PAGE, allOrders.length)} of{" "}
                {allOrders.length} orders
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-md border bg-white text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, i, array) => {
                      // Add ellipsis
                      if (i > 0 && page > array[i - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="h-8 px-2 flex items-center justify-center text-neutral-400">
                              ...
                            </span>
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`h-8 w-8 flex items-center justify-center rounded-md border ${
                                currentPage === page
                                  ? "bg-neutral-900 text-white border-neutral-900"
                                  : "bg-white text-neutral-600 hover:bg-neutral-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 flex items-center justify-center rounded-md border ${
                            currentPage === page
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 flex items-center justify-center rounded-md border bg-white text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function StatusSelect({ value, onChange, loading }) {
  return (
    <div className="relative">
      <select
        disabled={loading}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pr-6 pl-2 rounded-md border border-neutral-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-700/20"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      {loading && (
        <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-8 top-1/2 -translate-y-1/2 text-neutral-400" />
      )}
    </div>
  );
}
