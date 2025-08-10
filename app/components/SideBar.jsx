"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiShoppingBag,
  FiPackage,
} from "react-icons/fi";

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    { name: "Dashboard", path: "/admin/", icon: <FiHome size={20} /> },
    { name: "Users", path: "/admin/users", icon: <FiUsers size={20} /> },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FiSettings size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <FiShoppingBag size={20} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <FiPackage size={20} />,
    },
  ];

  const [activeRoute, setActiveRoute] = useState(routes[0].path);

  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname]);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4">
      <div className="text-2xl font-bold mb-8 p-2">Admin Panel</div>
      <nav>
        <ul className="space-y-2">
          {routes.map((route) => (
            <li key={route.path}>
              <Link href={route.path}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    activeRoute === route.path
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className="text-gray-300">{route.icon}</span>
                  <span>{route.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
