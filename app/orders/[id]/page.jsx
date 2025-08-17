"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getOrderById, getProductsByIds } from "@/app/lib/services/orders";
import formatPrice from "@/app/lib/helpers/formatPrice";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await getOrderById(id);
    if (res.success) setOrder(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    (async () => {
      if (!order?.items?.length) return;
      const ids = Array.from(
        new Set(order.items.map((it) => it.productId).filter(Boolean))
      ).filter(Boolean);
      if (!ids.length) return;
      setProductsLoading(true);
      const res = await getProductsByIds(ids);
      if (res.success) setProducts(res.data || {});
      setProductsLoading(false);
    })();
  }, [order]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading order...
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 text-sm">Order not found.</p>
        <button
          onClick={() => router.push("/orders")}
          className="px-4 h-10 rounded-lg border text-sm hover:bg-neutral-50"
        >
          Back to Orders
        </button>
      </div>
    );

  const total =
    order.amounts?.total ??
    order.netAmount ??
    order.items?.reduce(
      (acc, it) =>
        acc + (it.lineTotal || (it.unitPrice || 0) * (it.quantity || 0)),
      0
    );

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="h-10 w-10 flex items-center justify-center rounded-lg border bg-white hover:bg-neutral-50"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Order {order.orderNumber || order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[11px] text-neutral-500 font-mono">{order.id}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-2 py-1 rounded-md bg-neutral-900 text-white font-medium">
              {order.status}
            </span>
            <span
              className={`px-2 py-1 rounded-md font-medium ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {order.paymentStatus || "unpaid"}
            </span>
            <span className="text-neutral-500">
              Created:{" "}
              {order.createdAt?.toDate
                ? new Date(order.createdAt.toDate()).toLocaleString()
                : "—"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                Items ({order.items?.length || 0})
              </h2>
              {productsLoading && (
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading product info…
                </span>
              )}
            </div>
            <ul className="divide-y divide-neutral-200">
              {order.items?.map((it, i) => {
                const product = products[it.productId] || null;

                let productImage =
                  it.image ||
                  product?.mainImages?.[0] ||
                  (product?.variants || [])
                    .flatMap((v) => v.colors || [])
                    .map((c) => c.images?.[0])
                    .find(Boolean);

                const productName = it.name || product?.name || "Product";

                return (
                  <li
                    key={it.cartItemId || it.productId + i}
                    className="py-4 flex items-start gap-4"
                  >
                    <Link
                      href={it.productId ? `/product/${it.productId}` : "#"}
                      className="w-16 h-16 rounded-md bg-neutral-100 border flex items-center justify-center overflow-hidden text-[10px] text-neutral-400 shrink-0 group"
                      title={productName}
                    >
                      {productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        "IMG"
                      )}
                    </Link>
                    <div className="flex-1 text-sm flex flex-col gap-1">
                      <Link
                        href={it.productId ? `/product/${it.productId}` : "#"}
                        className="font-medium text-neutral-800 hover:text-neutral-900 hover:underline"
                      >
                        {productName}
                      </Link>
                      <div className="flex gap-2 flex-wrap text-xs text-neutral-500">
                        <span>Qty: {it.quantity}</span>
                        {it.size && <span>Size: {it.size}</span>}
                        {it.color && <span>Color: {it.color}</span>}
                      </div>
                      {product && (
                        <div className="text-[11px] text-neutral-400 flex gap-3">
                          {product.category && (
                            <span>Cat: {product.category}</span>
                          )}
                          {product.discountPercentage ? (
                            <span>Disc: {product.discountPercentage}%</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">
                        {formatPrice(
                          it.lineTotal ||
                            (it.unitPrice || 0) * (it.quantity || 0)
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">
                        @ {formatPrice(it.unitPrice || 0)}
                      </p>
                      {product?.price &&
                        it.unitPrice &&
                        it.unitPrice !== product.price && (
                          <p className="text-[10px] text-neutral-400">
                            Current: {formatPrice(product.price)}
                          </p>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-200 space-y-2 text-sm max-w-sm">
            <Row
              label="Subtotal"
              value={formatPrice(order.amounts?.subtotal ?? total)}
            />
            <Row
              label="Shipping"
              value={
                order.amounts?.shipping
                  ? formatPrice(order.amounts.shipping)
                  : "Free"
              }
            />
            <Row label="Tax" value={formatPrice(order.amounts?.tax ?? 0)} />
            <div className="pt-2 border-t border-neutral-200">
              <Row label="Total" strong value={formatPrice(total)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-neutral-500">{label}</span>
      <span
        className={
          strong ? "font-semibold text-neutral-900" : "text-neutral-700"
        }
      >
        {value}
      </span>
    </div>
  );
}
