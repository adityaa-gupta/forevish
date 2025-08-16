"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiHeart,
} from "react-icons/fi";
import { ChevronDown, HeartIcon } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get cart count from Redux store
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get wishlist count from Redux store
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                Forevish
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/new-arrivals"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              New Arrivals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              href="/suits"
              className="text-sm text-gray-900 font-medium relative group"
            >
              Suits
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            </Link>
            <Link
              href="/blazers"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              Blazers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              href="/accessories"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              Accessories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Search & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Search suits..."
                className="pl-10 w-48 lg:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Wishlist Button with Count */}
            <Link href="/wishlist">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FiHeart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Profile Button */}
            <Link href="/profile">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FiUser className="h-5 w-5" />
              </button>
            </Link>

            {/* Cart Button with Count */}
            <Link href="/cart">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FiShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <FiSearch className="h-5 w-5" />
            </button>

            {/* Mobile Cart Button with Count */}
            <Link href="/cart">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FiShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-bounce">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-gray-200 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Search suits..."
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              <Link
                href="/new-arrivals"
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/suits"
                className="block py-2 text-gray-900 font-medium"
              >
                Suits
              </Link>
              <Link
                href="/blazers"
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blazers
              </Link>
              <Link
                href="/accessories"
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Accessories
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Link href="/wishlist">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <div className="relative">
                    <FiHeart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm">Wishlist</span>
                </button>
              </Link>
              <Link href="/profile">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <FiUser className="h-5 w-5" />
                  <span className="text-sm">Profile</span>
                </button>
              </Link>
            </div>

            {/* Mobile Cart Summary */}
            <div className="pt-4 border-t border-gray-200">
              <Link href="/cart">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <FiShoppingCart className="h-5 w-5 text-gray-600" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Cart {cartCount > 0 && `(${cartCount} items)`}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">View →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
