"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/_store/features/wishlistSlice";
// import { addToCart } from "@/app/_store/features/cartSlice";
import { Heart, ShoppingBag } from "lucide-react";
import formatINR from "@/app/lib/helpers/formatPrice";
import { useState } from "react";
import toast from "react-hot-toast";
import { addItemToCart } from "../_store/features/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.user);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.mainImages?.[0] || "/placeholder-product.jpg";

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(
        addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: mainImage,
          category: product.category,
        })
      );
      toast.success("Added to wishlist", {
        icon: "💖",
      });
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      // If has variants, redirect to product page
      window.location.href = `/product/${product.id}`;
      return;
    }

    // Simple add to cart
    dispatch(
      addItemToCart({
        id: `${product.id}_default`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        quantity: 1,
        stock: 10, // Default stock if not specified
        category: product.category,
      })
    );

    toast.success("Added to cart");
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />

          {/* Sale Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {Math.round((1 - product.price / product.originalPrice) * 100)}%
              OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              isInWishlist
                ? "bg-pink-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`}
            />
          </button>

          {/* Quick Add Button */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white py-3 px-4 transition-all duration-300 ${
              isHovered ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.variants?.length > 0 ? "View Details" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 mb-2">{product.category}</p>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {formatINR(product.price)}
            </span>

            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
