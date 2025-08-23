"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { removeFromWishlist } from "@/app/_store/features/wishlistSlice";
import { addItemToCart } from "@/app/_store/features/cartSlice"; // adjust path if different
import { Heart, ShoppingCart, Trash2, ArrowRight, X } from "lucide-react";
import formatPrice from "@/app/lib/helpers/formatPrice";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist.items) || [];
  const cartItems = useSelector((s) => s.cart?.items) || [];

  const isInCart = useCallback(
    (id) => cartItems.some((c) => c.productId === id || c.id === id),
    [cartItems]
  );

  const handleRemove = (id) => dispatch(removeFromWishlist({ id }));
  const handleMoveToCart = (item) => {
    if (isInCart(item.id)) {
      handleRemove(item.id);
      return;
    }
    dispatch(
      addItemToCart({
        id: item.id, // or `${item.id}-default`
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      })
    );
    handleRemove(item.id);
  };

  const clearAll = () =>
    wishlistItems.forEach((it) => dispatch(removeFromWishlist({ id: it.id })));

  const totalValue = useMemo(
    () => wishlistItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0),
    [wishlistItems]
  );

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-100" />
              My Wishlist
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {wishlistItems.length
                ? `You have ${wishlistItems.length} item${
                    wishlistItems.length === 1 ? "" : "s"
                  } saved`
                : "Save products you love for later."}
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-white border border-neutral-200 px-4 py-2 text-xs text-neutral-500 shadow-sm">
                Est. total value:{" "}
                <span className="font-medium text-neutral-800">
                  {formatPrice(totalValue)}
                </span>
              </div>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100/70 text-neutral-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-600/90 shadow-sm"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm py-24 px-6 flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-100" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-semibold text-neutral-500">
                0
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="text-lg font-semibold text-neutral-900">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-neutral-500">
                Browse our newest arrivals and save your favorites. They will
                stay here for quick access.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-600/90"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Grid */}
        {wishlistItems.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <li
                key={item.id}
                className="group relative bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative">
                  <Link
                    href={`/product/${item.id}`}
                    className="block aspect-[4/5] bg-neutral-100 overflow-hidden"
                  >
                    <img
                      src={
                        item.image ||
                        "/placeholder.svg?height=600&width=480&text=Product"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-rose-600 hover:border-rose-300 shadow-sm transition"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isInCart(item.id) && (
                    <span className="absolute bottom-3 left-3 text-[10px] px-2 py-1 rounded-full bg-emerald-600 text-white font-medium shadow">
                      In Cart
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-4 pt-3 gap-3">
                  <div className="space-y-1">
                    <Link
                      href={`/product/${item.id}`}
                      className="text-sm font-medium text-neutral-900 line-clamp-2 hover:text-blue-600 transition"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <span className="text-[11px] line-through text-neutral-400">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className={`inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition ${
                        isInCart(item.id)
                          ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                          : "bg-neutral-900 text-white hover:bg-neutral-800"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isInCart(item.id) ? "In Cart" : "Add to Cart"}
                    </button>
                    <Link
                      href={`/product/${item.id}`}
                      className="inline-flex items-center justify-center h-10 rounded-lg text-xs font-medium border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer actions (mobile emphasis) */}
        {wishlistItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-neutral-500">
              Saved items are not reserved. Prices & availability may change.
            </p>
            <div className="flex gap-3">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-600/90 shadow-sm"
              >
                Go to Cart
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border border-neutral-300 bg-white hover:bg-neutral-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
