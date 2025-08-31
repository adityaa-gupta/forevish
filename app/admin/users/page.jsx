"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  where,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/app/providers/Provider";
import {
  getOrdersByIds, // add this helper in orders service if not present
  getOrderById,
} from "@/app/lib/services/orders";
import {
  Loader2,
  Search,
  RefreshCw,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import formatINR from "@/app/lib/helpers/formatPrice";

const USERS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [augmented, setAugmented] = useState([]); // with order stats
  const [displayedUsers, setDisplayedUsers] = useState([]); // paginated users
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), limit(200)));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllUsers(list);
      setUsers(list);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const enrichUsers = useCallback(async (baseUsers) => {
    setStatsLoading(true);
    try {
      // Gather all order ids
      const allOrderIds = baseUsers
        .flatMap((u) => u.orders || [])
        .filter(Boolean);
      const uniqueOrderIds = Array.from(new Set(allOrderIds));
      let ordersMap = {};
      if (uniqueOrderIds.length) {
        // chunk IN queries
        const chunkSize = 10;
        for (let i = 0; i < uniqueOrderIds.length; i += chunkSize) {
          const chunk = uniqueOrderIds.slice(i, i + chunkSize);
          const ordersSnap = await getDocs(
            query(collection(db, "orders"), where("__name__", "in", chunk))
          );
          ordersSnap.docs.forEach((d) => {
            ordersMap[d.id] = { id: d.id, ...d.data() };
          });
        }
      }
      let grandTotal = 0;
      const augmentedUsers = baseUsers.map((u) => {
        const orderIds = (u.orders || []).filter((id) => ordersMap[id]);
        const orderCount = orderIds.length;
        const revenue = orderIds.reduce(
          (acc, oid) =>
            acc +
            (ordersMap[oid]?.amounts?.total || ordersMap[oid]?.netAmount || 0),
          0
        );
        grandTotal += revenue;
        return {
          ...u,
          orderCount,
          revenue,
          lastOrderAt:
            orderIds
              .map((oid) => ordersMap[oid]?.createdAt)
              .filter(Boolean)
              .sort(
                (a, b) => (b?.toMillis?.() || 0) - (a?.toMillis?.() || 0)
              )[0] || null,
        };
      });
      setTotalRevenue(grandTotal);
      setAugmented(augmentedUsers);
    } catch (e) {
      console.error(e);
      toast.error("Failed to compute stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (users.length) enrichUsers(users);
  }, [users, enrichUsers]);

  // Derived filtered list
  const filtered = (() => {
    if (!search) return augmented;
    // If looks like an order id (firestore random ~20+ chars)
    if (search.length >= 12 && !search.includes(" ")) {
      // Try to find which user has that order id
      const match = augmented.filter((u) =>
        (u.orders || []).some((oid) =>
          oid.toLowerCase().includes(search.toLowerCase())
        )
      );
      if (match.length) return match;
    }
    const s = search.toLowerCase();
    return augmented.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        u.id.toLowerCase().includes(s)
    );
  })();

  // Update pagination when filtered results change
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / USERS_PER_PAGE));

    // Reset to first page if the current page exceeds the new total pages
    if (currentPage > Math.ceil(filtered.length / USERS_PER_PAGE)) {
      setCurrentPage(1);
    }

    // Update displayed users based on pagination
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = Math.min(startIndex + USERS_PER_PAGE, filtered.length);
    setDisplayedUsers(filtered.slice(startIndex, endIndex));
  }, [filtered, currentPage]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-neutral-700" />
              Users
            </h1>
            <p className="text-sm text-neutral-500">
              Overview of registered users & order activity.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border bg-white text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              {refreshing && <Loader2 className="w-4 h-4 animate-spin" />}
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            label="Total Users"
            value={loading ? "—" : users.length.toLocaleString()}
          />
          <StatCard
            label="Total Orders"
            value={
              statsLoading
                ? "—"
                : augmented
                    .reduce((acc, u) => acc + (u.orderCount || 0), 0)
                    .toLocaleString()
            }
          />
          <StatCard
            label="Total Revenue"
            value={statsLoading ? "—" : formatINR(totalRevenue)}
            icon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              placeholder="Search by name, email, user id, order id..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700/20"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100/70 text-neutral-600 text-xs uppercase tracking-wide">
              <tr>
                <Th>#</Th>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Orders</Th>
                <Th>Revenue</Th>
                <Th>Last Order</Th>
                <Th>User ID</Th>
              </tr>
            </thead>
            <tbody>
              {(loading || statsLoading) && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-neutral-500"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    {loading
                      ? "Loading users..."
                      : "Calculating order stats..."}
                  </td>
                </tr>
              )}
              {!loading && !statsLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-neutral-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
              {!loading &&
                !statsLoading &&
                displayedUsers.map((u, i) => (
                  <tr
                    key={u.id}
                    className="border-t border-neutral-100 hover:bg-neutral-50/70 transition"
                  >
                    <Td className="font-mono text-[11px] text-neutral-500">
                      {(currentPage - 1) * USERS_PER_PAGE + i + 1}
                    </Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800">
                          {u.displayName || "—"}
                        </span>
                      </div>
                    </Td>
                    <Td className="text-xs text-neutral-600">
                      {u.email || "—"}
                    </Td>
                    <Td className="text-xs">{u.orderCount || 0}</Td>
                    <Td className="text-xs font-medium text-neutral-800">
                      {formatINR(u.revenue || 0)}
                    </Td>
                    <Td className="text-[11px] text-neutral-500">
                      {u.lastOrderAt?.toDate
                        ? new Date(u.lastOrderAt.toDate()).toLocaleDateString()
                        : "—"}
                    </Td>
                    <Td className="font-mono text-[11px] text-neutral-500">
                      {u.id}
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {!loading && !statsLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * USERS_PER_PAGE, filtered.length)} of{" "}
                {filtered.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-8 h-8 rounded-md ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (pageNum) =>
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                    )
                    .map((pageNum, i, array) => {
                      // Add ellipsis when there are gaps in the page numbers
                      if (i > 0 && pageNum > array[i - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${pageNum}`}>
                            <span className="px-2 text-gray-400">...</span>
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`flex items-center justify-center w-8 h-8 rounded-md ${
                                currentPage === pageNum
                                  ? "bg-neutral-900 text-white"
                                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex items-center justify-center w-8 h-8 rounded-md ${
                            currentPage === pageNum
                              ? "bg-neutral-900 text-white"
                              : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-8 h-8 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                  }`}
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

function StatCard({ label, value, icon }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-neutral-900">{value}</span>
        {icon}
      </div>
    </div>
  );
}
