"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/features/dashboard/main/components/Sidebar";
import Header from "@/features/dashboard/main/components/Header";

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

  // Гідрація: чекаємо, поки компонент змонтується, щоб уникнути помилок з localStorage
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

  // Якщо ми ще не зчитали localStorage, рендеримо нейтральний стан або скелетон
  if (!mounted) return <div className="min-h-screen bg-gray-100 dark:bg-slate-900" />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      {/* Мобільний Overlay (Backdrop) */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Сайдбар */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out
          /* Мобільна логіка: виїжджає при sidebarOpen */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Десктопна логіка: якщо closeSidebar = true, ховаємо повністю (md:hidden) */
          /* Якщо false — ставимо в потік (md:static) і прибираємо зміщення (md:translate-x-0) */
          ${closeSidebar ? "md:hidden" : "md:static md:translate-x-0 md:shadow-none"}
        `}
      >
        <Sidebar onSelect={() => setSidebarOpen(false)} profile={profile} />
      </aside>

      {/* Основна частина контенту */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header
          profile={profile}
          onMenuClick={toggleSidebar}
          toggleSidebarState={toggleSidebarState}
          closeSidebarState={closeSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}