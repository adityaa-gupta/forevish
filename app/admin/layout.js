import SideBar from "@/app/components/SideBar";
import React from "react";

export default function AdminLayout({ children }) {
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
