"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
  Check,
  Sparkles,
  Eye,
} from "lucide-react";
// Removed client fetch import – data comes from server parent
// import { getProductById } from "@/app/lib/services/products";
import { addItemToCart } from "@/app/_store/features/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/_store/features/wishlistSlice";
import toast from "react-hot-toast";
import formatPrice from "@/app/lib/helpers/formatPrice";

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
  />
);

export default function ProductPageClient({ id, initialProduct }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const { isLoggedIn } = useSelector((s) => s.user);

  // Initialize from server-provided product
  const [product, setProduct] = useState(initialProduct || null);
  const [selectedImages, setSelectedImages] = useState(
    initialProduct?.mainImages || []
  );
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStock, setSelectedStock] = useState(0);
  const [qty, setQty] = useState(1);
  // Loading removed – server already provided data
  const [imgZoom, setImgZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const zoomRef = useRef(null);

  // Derive initial variant selection when product is set
  useEffect(() => {
    if (!product) return;
    if (product.variants?.length && !selectedSize) {
      const v = product.variants[0];
      setSelectedSize(v.size);
      if (v.colors?.length) {
        const c = v.colors[0];
        setSelectedColor(c.color);
        setSelectedStock(c.stock);
        if (c.images?.length) setSelectedImages(c.images);
      }
    } else if (!product.variants?.length) {
      setSelectedStock(product.stock || 0);
    }
  }, [product, selectedSize]);

  const isInWishlist = wishlistItems.some((w) => w.id === id);

  const handleSize = (size) => {
    setSelectedSize(size);
    const variant = product.variants.find((v) => v.size === size);
    if (variant?.colors?.length) {
      const c = variant.colors[0];
      setSelectedColor(c.color);
      setSelectedStock(c.stock);
      setSelectedImages(c.images?.length ? c.images : product.mainImages || []);
      setCurrentImage(0);
    }
  };

  const handleColor = (color) => {
    setSelectedColor(color);
    const variant = product.variants.find((v) => v.size === selectedSize);
    const c = variant?.colors.find((col) => col.color === color);
    if (c) {
      setSelectedStock(c.stock);
      setSelectedImages(c.images?.length ? c.images : product.mainImages || []);
      setCurrentImage(0);
    }
  };

  const addToCartHandler = () => {
    if (!selectedSize && product.variants?.length)
      return toast.error("Select size");
    if (!selectedColor && product.variants?.length)
      return toast.error("Select color");
    if (selectedStock === 0) return toast.error("Out of stock");
    if (qty > selectedStock)
      return toast.error(`Only ${selectedStock} available`);
    dispatch(
      addItemToCart({
        id: `${product.id}_${selectedSize || "NA"}_${selectedColor || "NA"}`,
        productId: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.originalPrice || product.price,
        image: selectedImages[0] || "",
        size: selectedSize || null,
        color: selectedColor || null,
        quantity: qty,
        stock: selectedStock,
        category: product.category,
      })
    );
    toast.success("Added to cart");
    setAddedToCart(true);
  };

  const toggleWishlist = () => {
    if (!isLoggedIn) return toast.error("Login first");
    const item = {
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.mainImages?.[0] || "",
      category: product.category,
      discountPercentage: product.discountPercentage,
    };
    if (isInWishlist) {
      dispatch(removeFromWishlist({ id: product.id }));
      toast("Removed from wishlist", { icon: "💔" });
    } else {
      dispatch(addToWishlist(item));
      toast.success("Wishlisted");
    }
  };

  const savings = product?.originalPrice
    ? product.originalPrice - (product.discountPrice || product.price)
    : 0;
  const discountPct = product?.originalPrice
    ? Math.round((savings / product.originalPrice) * 100)
    : 0;

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleMouseMove = (e) => {
    if (!zoomRef.current) return;
    const rect = zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomRef.current.style.setProperty("--zoom-x", `${x}%`);
    zoomRef.current.style.setProperty("--zoom-y", `${y}%`);
  };

  // If server failed to provide product
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-neutral-700">
            Product not found
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-[#f8f9fb] to-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <nav className="text-xs mb-6 flex items-center gap-2 text-neutral-500">
          <span
            className="hover:text-neutral-700 cursor-pointer"
            onClick={() => window.history.back()}
          >
            &larr; Back
          </span>
          <span>/</span>
          <span className="capitalize">{product.category || "category"}</span>
          <span>/</span>
          <span className="text-neutral-800 font-medium truncate max-w-[180px]">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-12">
          {/* Gallery */}
          <div className="space-y-6">
            <div
              ref={zoomRef}
              onMouseEnter={() => setImgZoom(true)}
              onMouseLeave={() => setImgZoom(false)}
              onMouseMove={handleMouseMove}
              className="group relative aspect-3/4 rounded-3xl bg-neutral-100 overflow-hidden border border-neutral-200 shadow-sm"
              style={{ "--zoom-x": "50%", "--zoom-y": "50%" }}
            >
              <Image
                src={selectedImages[currentImage]}
                alt={product.name}
                priority
                className={`object-cover transition duration-500 ${
                  imgZoom ? "scale-105" : "scale-100"
                }`}
                fill
                // sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                // className="object-cover transition-transform duration-700 hover:scale-105"
              />
              {discountPct > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 shadow">
                  <BadgePercent className="w-3 h-3" /> {discountPct}% OFF
                </div>
              )}
              <button
                onClick={toggleWishlist}
                aria-label="Wishlist"
                className="absolute top-4 right-4 rounded-full backdrop-blur bg-white/70 hover:bg-white shadow p-3 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist
                      ? "text-pink-500 fill-pink-500"
                      : "text-neutral-600"
                  }`}
                />
              </button>
              {selectedImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((p) =>
                        p === 0 ? selectedImages.length - 1 : p - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow border text-neutral-700 backdrop-blur transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImage((p) =>
                        p === selectedImages.length - 1 ? 0 : p + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow border text-neutral-700 backdrop-blur transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {selectedImages.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition ${
                      i === currentImage ? "bg-neutral-800" : "bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {selectedImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {selectedImages.slice(0, 10).map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative aspect-3/4 rounded-xl overflow-hidden border transition group ${
                      currentImage === i
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-transparent hover:border-neutral-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                    {currentImage === i && (
                      <div className="absolute inset-0 bg-blue-600/10" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="relative">
            <div className="sticky top-20 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-1.5 text-xs font-medium shadow">
                  <Sparkles className="w-3.5 h-3.5" /> Premium Selection
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="text-neutral-500 text-sm">{product.subtitle}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 4.5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {product.reviewCount || 128} reviews
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-600">
                    SKU: {product.id.slice(0, 8)}
                  </span>
                  {selectedStock > 0 && selectedStock <= 5 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-pulse">
                      Low stock ({selectedStock})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice >
                      (product.discountPrice || product.price) && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg line-through text-neutral-400">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          Save {formatPrice(savings)}
                        </span>
                      </div>
                    )}
                </div>
                <p className="text-xs text-neutral-500">
                  Taxes calculated at checkout. Free shipping over ₹100 (value).
                </p>
              </div>

              {product.variants?.length > 0 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-neutral-800">Size</h3>
                      {selectedSize && (
                        <span className="text-xs text-neutral-500">
                          Selected: {selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const active = selectedSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => handleSize(v.size)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-medium border backdrop-blur transition ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow"
                                : "border-neutral-300 hover:border-neutral-400 bg-white"
                            }`}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedSize &&
                    product.variants.find((v) => v.size === selectedSize)
                      ?.colors && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-neutral-800">
                            Color
                          </h3>
                          {selectedColor && (
                            <span className="text-xs text-neutral-500">
                              {selectedColor}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.variants
                            .find((v) => v.size === selectedSize)
                            ?.colors.map((c) => {
                              const active = selectedColor === c.color;
                              return (
                                <button
                                  key={c.color}
                                  disabled={c.stock === 0}
                                  onClick={() => handleColor(c.color)}
                                  className={`group relative px-4 py-2 rounded-lg text-sm font-medium border transition ${
                                    active
                                      ? "border-neutral-900 bg-neutral-900 text-white shadow"
                                      : "border-neutral-300 hover:border-neutral-400 bg-white"
                                  } ${
                                    c.stock === 0
                                      ? "opacity-40 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border shadow-inner bg-gradient-to-tr from-white to-neutral-200" />
                                    {c.color}
                                  </span>
                                  {active && c.stock > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                                      In
                                    </span>
                                  )}
                                  {c.stock === 0 && (
                                    <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-neutral-600">
                                      Out
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-14 text-center font-semibold">{qty}</div>
                    <button
                      onClick={() =>
                        setQty((q) => Math.min(selectedStock, q + 1))
                      }
                      disabled={qty >= selectedStock}
                      className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col text-xs text-neutral-500">
                    <span>
                      {selectedStock > 0
                        ? `${selectedStock} available`
                        : "Unavailable"}
                    </span>
                    <span>Max {selectedStock || 0}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {addedToCart ? (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => router.push("/cart")}
                        className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 text-white px-8 py-4 font-medium shadow hover:bg-blue-500 transition"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Proceed to Cart
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setAddedToCart(false)}
                          className="flex-1 h-12 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium transition"
                        >
                          Add More
                        </button>
                        <button
                          onClick={() => router.push("/")}
                          className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium transition"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={addToCartHandler}
                      disabled={
                        (product.variants?.length &&
                          (!selectedSize ||
                            (product.variants?.length &&
                              !selectedColor &&
                              product.variants.some(
                                (v) =>
                                  v.size === selectedSize && v.colors?.length
                              )))) ||
                        selectedStock === 0
                      }
                      className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-neutral-900 text-white px-8 py-4 font-medium tracking-wide shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition"
                    >
                      <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition" />
                      {selectedStock === 0 ? "Out of Stock" : "Add to Cart"}
                      <span className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-neutral-700 transition" />
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={toggleWishlist}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition bg-white hover:bg-neutral-50 ${
                        isInWishlist
                          ? "border-pink-400 text-pink-600"
                          : "border-neutral-300 text-neutral-700"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist ? "fill-pink-500 text-pink-500" : ""
                        }`}
                      />
                      Save
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="h-12 rounded-xl border border-neutral-300 flex items-center justify-center gap-2 text-sm font-medium bg-white hover:bg-neutral-50 transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      {copied ? "Copied" : "Share"}
                    </button>
                    <button className="h-12 rounded-xl border border-neutral-300 flex items-center justify-center gap-2 text-sm font-medium bg-white hover:bg-neutral-50 transition">
                      <RefreshCw className="w-4 h-4" />
                      Compare
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="rounded-xl bg-white border border-neutral-200 p-3 flex flex-col items-center gap-2 text-center">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <p className="text-[11px] font-medium text-neutral-700 leading-tight">
                      Fast Delivery
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-neutral-200 p-3 flex flex-col items-center gap-2 text-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <p className="text-[11px] font-medium text-neutral-700 leading-tight">
                      Secure Warranty
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-neutral-200 p-3 flex flex-col items-center gap-2 text-center">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <p className="text-[11px] font-medium text-neutral-700 leading-tight">
                      Quality Checked
                    </p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="pt-4 border-t border-neutral-200">
                  <h2 className="text-sm font-semibold tracking-wide text-neutral-600 uppercase mb-3">
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 text-xs text-neutral-500">
            Debug: {selectedSize || "—"}/{selectedColor || "—"} stock:
            {selectedStock} qty:{qty}
          </div>
        )}
      </div>
    </div>
  );
}
