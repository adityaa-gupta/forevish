"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
// import { submitContactForm } from "../lib/services/firebase"
import { useSelector } from "react-redux";
import { submitContactForm } from "../lib/services/users";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General",
    orderId: "",
    message: "",
  });
  const [status, setStatus] = useState({ state: "idle", error: "" });

  // Get user info from Redux store if available
  const { isLoggedIn, userInfo } = useSelector((state) => state.user);

  // Pre-fill form with user info if logged in
  useState(() => {
    if (isLoggedIn && userInfo) {
      setForm((prev) => ({
        ...prev,
        name: userInfo.displayName || prev.name,
        email: userInfo.email || prev.email,
        phone: userInfo.phone || prev.phone,
      }));
    }
  }, [isLoggedIn, userInfo]);

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "submitting", error: "" });

    // basic validation
    if (!form.name || !form.email || !form.message) {
      setStatus({
        state: "error",
        error: "Please fill name, email, and message.",
      });
      return;
    }

    try {
      // Submit to Firebase
      const result = await submitContactForm(form);

      if (result.success) {
        setStatus({ state: "success", error: "" });
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "General",
          orderId: "",
          message: "",
        });
      } else {
        throw new Error("Failed to submit. Please try again.");
      }
    } catch (err) {
      setStatus({
        state: "error",
        error: err.message || "Failed to submit. Try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name" htmlFor="name" required>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={update}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Phone" htmlFor="phone" tooltip="Optional">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              +91
            </span>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={update}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder="Your phone number"
            />
          </div>
        </Field>

        <Field label="Subject" htmlFor="subject">
          <div className="relative">
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={update}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 appearance-none pr-10 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <option>General</option>
              <option>Order issue</option>
              <option>Returns & exchanges</option>
              <option>Size & fit</option>
              <option>Partnerships</option>
              <option>Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </Field>
      </div>

      <Field label="Order ID" htmlFor="orderId" tooltip="Optional">
        <input
          id="orderId"
          name="orderId"
          value={form.orderId}
          onChange={update}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
          placeholder="e.g., FV-12345"
        />
      </Field>

      <Field label="Message" htmlFor="message" required>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={update}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-colors"
          placeholder="Tell us how we can help..."
        />
      </Field>

      {/* Status Messages */}
      {status.state === "error" && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
            <span className="text-red-600 text-xs font-bold">!</span>
          </div>
          <p>{status.error}</p>
        </div>
      )}

      {status.state === "success" && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
            <svg
              className="w-3 h-3 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <p>
            Thank you! Your message has been sent. We'll get back to you soon.
          </p>
        </div>
      )}

      <div className="pt-2">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={status.state === "submitting"}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-70 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
          >
            {status.state === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send message
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <div className="h-px w-full sm:w-px sm:h-6 bg-gray-200 sm:mx-2"></div>
          <a
            href="mailto:Info.forevish@gmail.com"
            className="text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Email us directly
          </a>
        </div>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, required, tooltip, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-medium text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>

        {tooltip && (
          <div className="relative group">
            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center cursor-help">
              <span className="text-gray-500 text-xs">?</span>
            </div>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-gray-800 text-white text-xs rounded-md py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800"></div>
            </div>
          </div>
        )}
      </div>
      <div>{children}</div>
    </label>
  );
}
