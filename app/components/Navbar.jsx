"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiHeart,
  FiLogOut,
} from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import { logout, performLogout } from "@/app/_store/features/userSlice";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // User state
  const { isLoggedIn, userInfo } = useSelector((s) => s.user);

  // Dropdown state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const esc = (e) => e.key === "Escape" && setUserMenuOpen(false);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const handleLogout = () => {
    dispatch(performLogout());
    setUserMenuOpen(false);
    router.push("/");
  };

  const avatarInitials = (() => {
    if (!userInfo) return "";
    const name =
      userInfo.displayName ||
      userInfo.fullName ||
      userInfo.name ||
      userInfo.email ||
      "";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  })();

  const isProductPage = pathname === pathname.startsWith("/products/");

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  if (isProductPage) {
    return <></>;
  }

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

            {/* User Menu (desktop) */}
            {isLoggedIn && userInfo ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition text-sm"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                    {userInfo.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userInfo.photoURL}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : avatarInitials ? (
                      <span className="text-xs font-semibold text-gray-700">
                        {avatarInitials}
                      </span>
                    ) : (
                      <FiUser className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <span className="max-w-[110px] truncate font-medium text-gray-700">
                    {userInfo.displayName ||
                      userInfo.fullName ||
                      userInfo.name ||
                      "Account"}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-500 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3 4l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-2 text-sm z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800 truncate">
                        {userInfo.displayName ||
                          userInfo.fullName ||
                          userInfo.name ||
                          "User"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {userInfo.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                      role="menuitem"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <button className="px-4 h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>
            )}
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
            isMenuOpen ? "max-h-[640px] opacity-100 mt-4" : "max-h-0 opacity-0"
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

            {/* Mobile user block */}
            <div className="pt-4 border-t border-gray-200">
              {isLoggedIn && userInfo ? (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {userInfo.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userInfo.photoURL}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : avatarInitials ? (
                      <span className="text-sm font-semibold text-gray-700">
                        {avatarInitials}
                      </span>
                    ) : (
                      <FiUser className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {userInfo.displayName ||
                        userInfo.fullName ||
                        userInfo.name ||
                        "Account"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/auth">
                  <button className="w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                    Login / Sign Up
                  </button>
                </Link>
              )}

              {isLoggedIn && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    href="/profile"
                    className="text-xs px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="text-xs px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="text-xs px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-xs px-3 py-2 rounded-md bg-red-50 text-red-600 text-center"
                  >
                    Logout
                  </button>
                </div>
              )}
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
