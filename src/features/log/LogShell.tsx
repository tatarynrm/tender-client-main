"use client";

import React, { useState, useEffect } from "react";
import LogHeader from "@/features/log/main/components/LogHeader";
import LogSidebar from "@/features/log/main/components/LogSidebar";

export default function LogShell({
  profile,
  children,
}: {
  profile: any;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Для мобілок (відкрито/закрито)
  const [closeSidebar, setCloseSidebar] = useState(false); // Для десктопа (сховано/показано)
  const [mounted, setMounted] = useState(false);

  // 1. Гідрація та завантаження стану
  useEffect(() => {
    const savedState = localStorage.getItem("closeSidebar");
    if (savedState !== null) setCloseSidebar(savedState === "true");
    setMounted(true);
  }, []);

  // 2. Збереження стану десктопного сайдбара
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("closeSidebar", closeSidebar.toString());
    }
  }, [closeSidebar, mounted]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev); // Мобільний тогл
  const toggleSidebarState = () => setCloseSidebar((prev) => !prev); // Десктопний тогл

  // Запобігання Layout Shift (миготіння при завантаженні)
  if (!mounted) {
    return <div className="h-screen bg-gray-100 dark:bg-slate-900" />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      {/* Мобільний Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Сайдбар */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out
          
          /* Мобільна поведінка */Q
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Десктопна поведінка */
          ${
            closeSidebar
              ? "md:-translate-x-full md:fixed"
              : "md:static md:translate-x-0 md:shadow-none"
          }
        `}
      >
        <LogSidebar onSelect={() => setSidebarOpen(false)} profile={profile} />
      </aside>

      {/* Основний контент */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <LogHeader
          onMenuClick={toggleSidebar}
          toggleSidebarState={toggleSidebarState}
          closeSidebarState={closeSidebar}
          profile={profile}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
          <div className="mx-auto w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
