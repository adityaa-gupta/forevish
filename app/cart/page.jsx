"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
  Heart,
  Tag,
  Truck,
  Shield,
  Clock,
} from "lucide-react";

// import {
//   removeItemFromCart,
//   updateCartItemQuantity,
//   ,clearCart,
// } from "../_store/features/cartSlice";
import { addToWishlist } from "../_store/features/wishlistSlice";
import toast from "react-hot-toast";
import {
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../_store/features/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { userInfo, isLoggedIn } = useSelector((state) => state.user);

  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const discountAmount = isPromoApplied ? subtotal * (discount / 100) : 0;
  const total = subtotal + shipping + tax - discountAmount;

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    const item = cartItems.find((item) => item.id === itemId);
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available`, {
        duration: 3000,
        icon: "⚠️",
      });
      return;
    }

    dispatch(updateCartItemQuantity({ id: itemId, quantity: newQuantity }));

    toast.success("Quantity updated", {
      duration: 1500,
      icon: "✅",
    });
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart({ id: itemId }));

    toast.success("Item removed from cart", {
      duration: 2000,
      icon: "🗑️",
    });
  };

  // Handle move to wishlist
  const handleMoveToWishlist = (item) => {
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist", {
        duration: 3000,
        icon: "🔐",
      });
      return;
    }

    const wishlistItem = {
      id: item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
    };

    dispatch(addToWishlist(wishlistItem));
    dispatch(removeItemFromCart({ id: item.id }));

    toast.success("Moved to wishlist", {
      duration: 2000,
      icon: "💖",
      style: {
        borderRadius: "10px",
        background: "#ec4899",
        color: "#fff",
      },
    });
  };

  // Handle promo code
  const handlePromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      WELCOME15: 15,
      NEWUSER20: 20,
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()]);
      setIsPromoApplied(true);

      toast.success(
        `${promoCode.toUpperCase()} applied! ${
          validCodes[promoCode.toUpperCase()]
        }% off`,
        {
          duration: 3000,
          icon: "🎉",
          style: {
            borderRadius: "10px",
            background: "#10b981",
            color: "#fff",
          },
        }
      );
    } else {
      toast.error("Invalid promo code", {
        duration: 3000,
        icon: "❌",
      });
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());

      toast.success("Cart cleared", {
        duration: 2000,
        icon: "🧹",
      });
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error("Please login to proceed to checkout", {
        duration: 3000,
        icon: "🔐",
      });
      router.push("/auth");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty", {
        duration: 3000,
        icon: "🛒",
      });
      return;
    }

    // Navigate to checkout page
    router.push("/checkout");
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h1>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start
                shopping to fill it up!
              </p>

              <Link
                href="/"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/product/${item.productId}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {item.name}
                            </Link>

                            {item.category && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.category}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 mt-2">
                              {item.size && (
                                <span className="text-sm text-gray-600">
                                  Size:{" "}
                                  <span className="font-medium">
                                    {item.size}
                                  </span>
                                </span>
                              )}
                              {item.color && (
                                <span className="text-sm text-gray-600">
                                  Color:{" "}
                                  <span className="font-medium">
                                    {item.color}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Stock Warning */}
                            {item.stock <= 5 && (
                              <p className="text-sm text-orange-600 mt-1">
                                Only {item.stock} left in stock
                              </p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            {item.originalPrice &&
                              item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  $
                                  {(item.originalPrice * item.quantity).toFixed(
                                    2
                                  )}
                                </span>
                              )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {/* Move to Wishlist */}
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="text-gray-400 hover:text-pink-500 transition-colors"
                              title="Move to wishlist"
                            >
                              <Heart className="w-5 h-5" />
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  handleQuantityUpdate(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleQuantityUpdate(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isPromoApplied}
                  />
                  <button
                    onClick={handlePromoCode}
                    disabled={!promoCode.trim() || isPromoApplied}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {isPromoApplied && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {promoCode.toUpperCase()} applied - {discount}% off
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={`font-medium ${
                      shipping === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                {isPromoApplied && discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">
                      Discount ({discount}%)
                    </span>
                    <span className="font-medium text-green-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {subtotal < 100 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    💡 Add ${(100 - subtotal).toFixed(2)} more for free
                    shipping!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span>Fast & reliable shipping</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>30-day return policy</span>
                </div>
              </div>

              {/* Continue Shopping */}
              <Link
                href="/"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
