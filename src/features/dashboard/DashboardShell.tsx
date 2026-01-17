"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./main/components/Sidebar";
import Header from "./main/components/Header";

export default function DashboardShell({
  profile,
  children,
}: {
  profile?: any;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Гідрація
  useEffect(() => {
    const savedState = localStorage.getItem("closeSidebar");
    if (savedState !== null) setCloseSidebar(savedState === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("closeSidebar", closeSidebar.toString());
    }
  }, [closeSidebar, mounted]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleSidebarState = () => setCloseSidebar((prev) => !prev);

  if (!mounted)
    return <div className="min-h-screen bg-gray-100 dark:bg-slate-900" />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      {/* Мобільний Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Сайдбар з підтримкою анімації приховування на десктопі */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-999999 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out
          
          /* Мобільна логіка */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Десктопна логіка */
          ${
            closeSidebar
              ? "md:-translate-x-full md:fixed"
              : "md:static md:translate-x-0 md:shadow-none"
          }
        `}
      >
        <Sidebar onSelect={() => setSidebarOpen(false)} profile={profile} />
      </aside>

      {/* Контейнер контенту, який автоматично займає вільне місце */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header
          profile={profile}
          onMenuClick={toggleSidebar}
          toggleSidebarState={toggleSidebarState}
          closeSidebarState={closeSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
