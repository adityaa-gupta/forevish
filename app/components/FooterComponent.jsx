"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Github,
} from "lucide-react";

export default function FooterComponent() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("Enter a valid email");
      return;
    }
    // TODO: hook to real API
    setStatus("Subscribed!");
    setEmail("");
    setTimeout(() => setStatus(""), 2500);
  }

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-neutral-200 bg-gradient-to-b from-white to-neutral-50 text-neutral-600">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-40 bg-gradient-to-r from-blue-100/40 via-pink-100/30 to-emerald-100/40 blur-3xl opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Top CTA */}
        <div className="grid gap-10 lg:grid-cols-2 mb-16">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Elevate your professional wardrobe
            </h2>
            <p className="text-sm leading-relaxed max-w-md">
              Join our newsletter for new arrivals, tailored style tips, and
              exclusive member offers.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md"
              aria-label="Newsletter subscription form"
            >
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-neutral-300 bg-white/70 backdrop-blur text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition"
                  aria-label="Email address"
                  required
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </form>
            {status && (
              <p
                className={`text-xs font-medium ${
                  status === "Subscribed!"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
                role="status"
              >
                {status}
              </p>
            )}
          </div>

          <div className="grid xs:grid-cols-2 sm:grid-cols-3 gap-8 lg:justify-end">
            <FooterColumn
              title="Shop"
              links={[
                { href: "/shop/new", label: "New Arrivals" },
                { href: "/shop/bestsellers", label: "Bestsellers" },
                { href: "/shop/suits", label: "Suits" },
                { href: "/shop/blazers", label: "Blazers" },
                { href: "/shop/accessories", label: "Accessories" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { href: "/about", label: "About Us" },
                { href: "/careers", label: "Careers" },
                { href: "/blog", label: "Blog" },
                { href: "/press", label: "Press" },
                { href: "/contact", label: "Contact" },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { href: "/help", label: "Help Center" },
                { href: "/shipping", label: "Shipping" },
                { href: "/returns", label: "Returns" },
                { href: "/size-guide", label: "Size Guide" },
                { href: "/privacy", label: "Privacy Policy" },
              ]}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mb-10" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              Forevish
            </Link>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              Premium tailored womenswear for modern professionals. Crafted with
              precision, designed for confidence.
            </p>
            <p className="text-[11px] text-neutral-400">
              &copy; {year} Forevish. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <SocialLinks />
            <div className="flex flex-wrap gap-4 text-[11px] text-neutral-500">
              <Link href="/terms" className="hover:text-neutral-800">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-neutral-800">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-neutral-800">
                Cookies
              </Link>
              <Link href="/sustainability" className="hover:text-neutral-800">
                Sustainability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links = [] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-700 mb-4">
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-neutral-500 hover:text-neutral-900 transition inline-flex items-center gap-1"
            >
              <span>{l.label}</span>
              <span className="sr-only">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLinks() {
  const socials = [
    {
      href: "https://instagram.com/forevish",
      icon: Instagram,
      label: "Instagram",
    },
    { href: "https://twitter.com/forevish", icon: Twitter, label: "Twitter" },
    {
      href: "https://facebook.com/forevish",
      icon: Facebook,
      label: "Facebook",
    },
    { href: "https://youtube.com/@forevish", icon: Youtube, label: "YouTube" },
    { href: "https://github.com/forevish", icon: Github, label: "GitHub" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {socials.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          target="_blank"
          className="group h-10 w-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-900 hover:border-neutral-900 flex items-center justify-center transition shadow-sm"
        >
          <Icon className="w-4 h-4 text-neutral-600 group-hover:text-white transition" />
        </Link>
      ))}
    </div>
  );
}
