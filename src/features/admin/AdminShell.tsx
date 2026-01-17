"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "./main/components/AdminSidebar";
import AdminHeader from "./main/components/AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
  profile?: any;
}

export default function AdminShell({ children, profile }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Гідрація
  useEffect(() => {
    const savedState = localStorage.getItem("closeSidebar");
    if (savedState !== null) setCloseSidebar(savedState === "true");
    setMounted(true);
  }, []);

  // 2. Синхронізація з localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("closeSidebar", closeSidebar.toString());
    }
  }, [closeSidebar, mounted]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleSidebarState = () => setCloseSidebar((prev) => !prev);

  if (!mounted)
    return <div className="h-screen bg-gray-100 dark:bg-slate-900" />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      {/* BACKDROP (Оверлей для мобілки) */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* ASIDE (Сайдбар) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-999999 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out
          
          /* Мобільна логіка: виїжджає при sidebarOpen */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Десктопна логіка: анімоване приховування */
          ${
            closeSidebar
              ? "md:-translate-x-full md:fixed"
              : "md:static md:translate-x-0 md:shadow-none"
          }
        `}
      >
        <AdminSidebar
          onSelect={() => setSidebarOpen(false)}
          profile={profile}
        />
      </aside>

      {/* CONTENT (Основна частина) */}
      <div className="flex flex-col flex-1 min-w-0 h-full transition-all duration-300">
        <AdminHeader
          onMenuClick={toggleSidebar}
          toggleSidebarState={toggleSidebarState}
          closeSidebarState={closeSidebar}
          profile={profile}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
