"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/providers/Provider";
import formatPrice from "@/app/lib/helpers/formatPrice";
import {
  Loader2,
  RefreshCw,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

/* Dynamic (client-only) Recharts load */
let RC = {};
if (typeof window !== "undefined") {
  const R = require("recharts");
  RC = {
    ResponsiveContainer: R.ResponsiveContainer,
    AreaChart: R.AreaChart,
    Area: R.Area,
    XAxis: R.XAxis,
    YAxis: R.YAxis,
    Tooltip: R.Tooltip,
    CartesianGrid: R.CartesianGrid,
    PieChart: R.PieChart,
    Pie: R.Pie,
    Cell: R.Cell,
    BarChart: R.BarChart,
    Bar: R.Bar,
    Legend: R.Legend,
  };
}

const TIMEFRAMES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

/* Color palettes */
const STATUS_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#0EA5E9",
  "#F472B6",
];
const PRODUCT_BAR_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#D97706",
  "#0D9488",
  "#DB2777",
  "#334155",
];

export default function AdminPage() {
  const [timeframe, setTimeframe] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [ordersWarning, setOrdersWarning] = useState("");

  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState([]);

  const buildFromTimestamp = useCallback(
    () => Timestamp.fromDate(new Date(Date.now() - timeframe * 86400 * 1000)),
    [timeframe]
  );

  const loadCounts = useCallback(async () => {
    try {
      const [usersSnap, productsSnap] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "products")),
      ]);
      setUserCount(usersSnap.data().count);
      setProductCount(productsSnap.data().count);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setError("");
    setOrdersWarning("");
    try {
      const fromTs = buildFromTimestamp();
      const qRef = query(
        collection(db, "orders"),
        where("createdAt", ">=", fromTs),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(qRef);
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      const missingIndex =
        e.code === "failed-precondition" &&
        /create_composite/.test(e.message || "");
      if (missingIndex) {
        try {
          const fromTs = buildFromTimestamp();
          const fallbackQ = query(
            collection(db, "orders"),
            where("createdAt", ">=", fromTs)
          );
          const snap = await getDocs(fallbackQ);
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          data.sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() || 0) -
              (a.createdAt?.toMillis?.() || 0)
          );
          setOrders(data);
          const match = e.message.match(
            /https:\/\/console\.firebase\.google\.com[^\s"]+/
          );
          setOrdersWarning(
            "Fallback sorting – create Firestore index. " +
              (match ? match[0] : "")
          );
        } catch (inner) {
          setError(inner.message);
        }
      } else {
        setError(e.message);
      }
    }
  }, [buildFromTimestamp]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadCounts(), loadOrders()]);
    setLoading(false);
  }, [loadCounts, loadOrders]);

  useEffect(() => {
    loadAll();
  }, [timeframe, loadAll]);

  const refresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  /* Metrics + Chart Data */
  const {
    totalOrders,
    revenue,
    avgOrderValue,
    statusDistribution,
    topProducts,
    dailySeries,
  } = useMemo(() => {
    if (!orders.length)
      return {
        totalOrders: 0,
        revenue: 0,
        avgOrderValue: 0,
        statusDistribution: [],
        topProducts: [],
        dailySeries: [],
      };
    let revenue = 0;
    const statusMap = {};
    const productMap = {};
    const dayMap = {};
    orders.forEach((o) => {
      const orderTotal =
        o.amounts?.total ??
        o.netAmount ??
        (o.items || []).reduce(
          (acc, it) =>
            acc + (it.lineTotal ?? (it.unitPrice || 0) * (it.quantity || 0)),
          0
        ) ??
        0;
      revenue += orderTotal;
      const st = o.status || "pending";
      statusMap[st] = (statusMap[st] || 0) + 1;
      const dayKey = o.createdAt?.toDate
        ? o.createdAt.toDate().toISOString().slice(0, 10)
        : "unknown";
      if (!dayMap[dayKey])
        dayMap[dayKey] = { date: dayKey, revenue: 0, orders: 0 };
      dayMap[dayKey].revenue += orderTotal;
      dayMap[dayKey].orders += 1;
      (o.items || []).forEach((it) => {
        if (!it?.productId) return;
        const key = it.productId;
        if (!productMap[key])
          productMap[key] = {
            productId: key,
            name: it.name || "Product",
            qty: 0,
            revenue: 0,
          };
        productMap[key].qty += it.quantity || 0;
        productMap[key].revenue +=
          it.lineTotal || (it.unitPrice || 0) * (it.quantity || 0);
      });
    });
    /* Fill missing days for smoother chart */
    const start = new Date(Date.now() - timeframe * 86400 * 1000);
    const today = new Date();
    const cursor = new Date(start);
    while (cursor <= today) {
      const k = cursor.toISOString().slice(0, 10);
      if (!dayMap[k]) dayMap[k] = { date: k, revenue: 0, orders: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
    const dailySeries = Object.values(dayMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? revenue / totalOrders : 0;
    const statusDistribution = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
    return {
      totalOrders,
      revenue,
      avgOrderValue,
      statusDistribution,
      topProducts,
      dailySeries,
    };
  }, [orders, timeframe]);

  const ChartsReady = !!RC.ResponsiveContainer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-neutral-700" />
              Admin Analytics
            </h1>
            <p className="text-sm text-neutral-500">
              Performance overview (last {timeframe} days)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.days}
                onClick={() => setTimeframe(t.days)}
                className={`h-9 px-3 rounded-md border text-xs font-medium shadow-sm transition ${
                  timeframe === t.days
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-white hover:bg-neutral-50 text-xs font-medium disabled:opacity-50 shadow-sm"
            >
              {refreshing && <Loader2 className="w-4 h-4 animate-spin" />}
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        {ordersWarning && <Alert tone="amber">{ordersWarning}</Alert>}
        {error && <Alert tone="rose">{error}</Alert>}

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Users"
            value={loading ? "—" : userCount.toLocaleString()}
            icon={<Users className="w-4 h-4" />}
            gradient="from-sky-500/10 to-sky-500/0"
          />
          <StatCard
            label="Products"
            value={loading ? "—" : productCount.toLocaleString()}
            icon={<Package className="w-4 h-4" />}
            gradient="from-violet-500/10 to-violet-500/0"
          />
          <StatCard
            label="Orders"
            value={loading ? "—" : totalOrders.toLocaleString()}
            icon={<ShoppingCart className="w-4 h-4" />}
            gradient="from-emerald-500/10 to-emerald-500/0"
          />
          <StatCard
            label="Revenue"
            value={
              loading ? "—" : formatPrice(revenue, { stripTrailingZeros: true })
            }
            gradient="from-fuchsia-500/10 to-fuchsia-500/0"
          />
          <StatCard
            label="Avg Order"
            value={
              loading
                ? "—"
                : formatPrice(avgOrderValue, { stripTrailingZeros: true })
            }
            gradient="from-amber-500/10 to-amber-500/0"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 xl:grid-cols-12">
          <Panel title="Revenue Trend" className="xl:col-span-6">
            {ChartsReady ? (
              <ChartAreaRevenue data={dailySeries} loading={loading} />
            ) : (
              <ChartSkeleton />
            )}
          </Panel>
          <Panel title="Status Distribution" className="xl:col-span-3">
            {ChartsReady ? (
              <ChartStatusPie data={statusDistribution} loading={loading} />
            ) : (
              <ChartSkeleton />
            )}
          </Panel>
          <Panel title="Top Products (Qty)" className="xl:col-span-3">
            {ChartsReady ? (
              <ChartTopProducts data={topProducts} loading={loading} />
            ) : (
              <ChartSkeleton />
            )}
          </Panel>
        </div>

        {/* Recent Orders */}
        <Panel title="Recent Orders">
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100/70 text-neutral-600 text-xs uppercase tracking-wide">
                <tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-neutral-500"
                    >
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading &&
                  orders.slice(0, 10).map((o) => {
                    const total =
                      o.amounts?.total ??
                      o.netAmount ??
                      (o.items || []).reduce(
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
                        <Td className="font-medium">
                          {o.orderNumber || o.id.slice(-8).toUpperCase()}
                          <div className="font-mono text-[10px] text-neutral-400">
                            {o.id}
                          </div>
                        </Td>
                        <Td className="text-neutral-600">
                          {o.createdAt?.toDate
                            ? new Date(
                                o.createdAt.toDate()
                              ).toLocaleDateString()
                            : "—"}
                        </Td>
                        <Td>{o.items?.length || 0}</Td>
                        <Td className="font-semibold">{formatPrice(total)}</Td>
                        <Td>
                          <span className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-200 capitalize">
                            {o.status || "pending"}
                          </span>
                        </Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {o.paymentStatus || "unpaid"}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                {!loading && !orders.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-neutral-500"
                    >
                      No orders in selected timeframe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-neutral-400 mt-3">
            Ensure indexes for complex multi-field queries.
          </p>
        </Panel>
      </div>
    </div>
  );
}

/* ---- Charts Components ---- */
function ChartAreaRevenue({ data, loading }) {
  const {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } = RC;
  if (loading) return <ChartSkeleton lines={8} />;
  if (!data.length) return <EmptyChart msg="No revenue data" />;
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            formatter={(val) => formatPrice(val)}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#revGrad)"
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartStatusPie({ data, loading }) {
  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } = RC;
  if (loading) return <ChartSkeleton lines={5} />;
  if (!data.length) return <EmptyChart msg="No status data" />;
  const total = data.reduce((a, b) => a + b.count, 0);
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={STATUS_COLORS[i % STATUS_COLORS.length]}
                stroke="white"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(v) => (
              <span className="text-[11px] capitalize text-neutral-600">
                {v}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTopProducts({ data, loading }) {
  const {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } = RC;
  if (loading) return <ChartSkeleton lines={6} />;
  if (!data.length) return <EmptyChart msg="No product data" />;
  const chartData = data.map((p, i) => ({
    name: p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name,
    qty: p.qty,
    revenue: p.revenue,
    color: PRODUCT_BAR_COLORS[i % PRODUCT_BAR_COLORS.length],
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ left: 0, right: 8, top: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            formatter={(val, key) =>
              key === "revenue" ? formatPrice(val) : val
            }
          />
          <Bar
            dataKey="qty"
            radius={[4, 4, 0, 0]}
            label={false}
            name="Quantity"
          >
            {chartData.map((e, i) => (
              <RC.Cell key={i} fill={e.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- UI Helpers ---- */
function StatCard({ label, value, icon, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      {gradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`}
        />
      )}
      <div className="relative flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-neutral-900">
            {value}
          </span>
          {icon && (
            <span className="text-neutral-400 flex items-center">{icon}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4 ${className}`}
    >
      {title && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Alert({ children, tone = "amber" }) {
  const toneMap = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`text-xs px-3 py-2 rounded-md border ${toneMap[tone]}`}>
      {children}
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div className="h-64 flex items-center justify-center text-xs text-neutral-400">
      {msg}
    </div>
  );
}

function ChartSkeleton({ lines = 8 }) {
  return (
    <div className="h-64 grid grid-rows-6 gap-2">
      {[...Array(Math.min(lines, 10))].map((_, i) => (
        <div
          key={i}
          className="w-full h-full bg-neutral-100 rounded animate-pulse"
        />
      ))}
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
