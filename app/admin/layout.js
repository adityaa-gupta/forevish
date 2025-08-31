"use client";

import SideBar from "@/app/components/SideBar";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const { isLoggedIn, userInfo, loading } = useSelector((state) => state.user);
  const router = useRouter();

  console.log(userInfo);

  useEffect(() => {
    // Only redirect after authentication state is determined
    if (!loading) {
      // Check if user is not logged in or doesn't have admin role
      if (!isLoggedIn || userInfo?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [isLoggedIn, userInfo, loading, router]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not admin, don't render anything (they'll be redirected)
  if (!isLoggedIn || userInfo?.role !== "admin") {
    return null;
  }

  // Render admin layout for authenticated admins
  return (
    <div className="flex flex-col h-screen font-sans">
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex-shrink-0">
          <SideBar />
        </aside>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
