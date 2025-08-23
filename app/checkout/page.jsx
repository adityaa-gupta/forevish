"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/lib/services/orders";
import { clearCart } from "@/app/_store/features/cartSlice";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((s) => s.cart);
  const {
    isLoggedIn,
    userInfo,
    loading: authLoading,
  } = useSelector((s) => s.user);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        toast.error("Please login first");
        router.push("/auth?redirect=/checkout");
      } else if (userInfo) {
        setForm((f) => ({
          ...f,
          fullName: userInfo.fullName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          addressLine1: userInfo.addressLine1 || "",
          addressLine2: userInfo.addressLine2 || "",
          city: userInfo.city || "",
          state: userInfo.state || "",
          postalCode: userInfo.postalCode || "",
          country: userInfo.country || "",
        }));
      }
    }
  }, [isLoggedIn, userInfo, authLoading, router]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
        0
      ),
    [cartItems]
  );
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = +(subtotal * 0.07).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const disabled =
    submitting ||
    !form.fullName ||
    !form.email ||
    !form.addressLine1 ||
    !form.city ||
    !form.state ||
    !form.postalCode ||
    !form.country;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart empty");
      return;
    }
    if (disabled) {
      toast.error("Fill required fields");
      return;
    }
    setSubmitting(true);

    // Show a loading toast that we'll update later
    const toastId = toast.loading("Processing your order...");

    try {
      const orderPayload = {
        userId: userInfo?.id || userInfo?.uid,
        shipping: form,
        items: cartItems.map((c) => ({
          productId: c.productId,
          cartItemId: c.id,
          name: c.name,
          quantity: c.quantity,
          unitPrice: c.price,
          size: c.size,
          color: c.color,
          stockAtOrder: c.stock,
          lineTotal: +(c.price * c.quantity).toFixed(2),
        })),
        amounts: {
          subtotal,
          shipping,
          tax,
          total,
        },
      };

      // Create the order
      const { success, id, error } = await createOrder(orderPayload);

      if (!success) throw new Error(error || "Order failed");

      // Update the loading toast with success message
      toast.success("Order placed! Confirmation email sent.", {
        id: toastId,
      });

      // Clear the cart
      dispatch(clearCart());

      // Navigate to order confirmation page
      router.push(`/orders/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-3 gap-10">
        {/* Shipping / Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
            <p className="text-sm text-neutral-500">
              Review your information and place your order.
            </p>
          </div>

          <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Delivery Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <Input
                label="Address Line 1 *"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <Input
                label="Address Line 2"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <Input
                label="City *"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
              <Input
                label="State *"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
              <Input
                label="Postal Code *"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
              />
              <Input
                label="Country *"
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Order Items
            </h2>
            {cartItems.length === 0 && (
              <p className="text-sm text-neutral-500">
                Cart empty.{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  Shop now
                </span>
              </p>
            )}
            <ul className="divide-y divide-neutral-200">
              {cartItems.map((i) => (
                <li key={i.id} className="py-3 flex gap-4 text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{i.name}</p>
                    <p className="text-neutral-500 text-xs">
                      Qty {i.quantity} • {i.size}/{i.color}
                    </p>
                  </div>
                  <p className="font-medium text-neutral-700">
                    ${(i.price * i.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Summary
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              />
              <Row label="Tax (7%)" value={`$${tax.toFixed(2)}`} />
              <div className="pt-2 border-t border-neutral-200">
                <Row
                  label="Total"
                  value={`$${total.toFixed(2)}`}
                  strong
                  large
                />
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={disabled || cartItems.length === 0}
              className="w-full h-12 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Placing..." : "Place Order"}
            </button>
            <p className="text-[11px] text-neutral-500">
              By placing the order you agree to our Terms & Refund Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, className = "", ...rest }) {
  return (
    <label className={`flex flex-col gap-1 text-xs ${className}`}>
      <span className="font-medium text-neutral-600">{label}</span>
      <input
        className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800/20 focus:border-neutral-500 transition bg-white"
        {...rest}
      />
    </label>
  );
}

function Row({ label, value, strong, large }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-neutral-500 ${large ? "text-sm" : "text-xs"}`}>
        {label}
      </span>
      <span
        className={`${
          strong ? "font-semibold text-neutral-900" : "text-neutral-700"
        } ${large ? "text-sm" : "text-xs"}`}
      >
        {value}
      </span>
    </div>
  );
}
