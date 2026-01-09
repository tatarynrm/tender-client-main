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

  // 1. Чекаємо монтування, щоб безпечно працювати з localStorage та уникнути помилок гідрації
  useEffect(() => {
    const savedState = localStorage.getItem("closeSidebar");
    if (savedState !== null) setCloseSidebar(savedState === "true");
    setMounted(true);
  }, []);

  // 2. Зберігаємо стан тільки після того, як компонент змонтувався
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("closeSidebar", closeSidebar.toString());
    }
  }, [closeSidebar, mounted]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleSidebarState = () => setCloseSidebar((prev) => !prev);

  // Поки не змонтовано, повертаємо порожній контейнер, щоб уникнути "стрибка" інтерфейсу
  if (!mounted) return <div className="h-screen bg-gray-100 dark:bg-slate-900" />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      
      {/* BACKDROP (Оверлей для мобілки) */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* ASIDE (Сайдбар) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out
          /* Мобільна логіка: translate залежить від sidebarOpen */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Десктопна логіка: md:static вимикає фіксацію, md:hidden ховає повністю, якщо closeSidebar === true */
          /* md:translate-x-0 повертає сайдбар у видиму зону на десктопі */
          ${closeSidebar ? "md:hidden" : "md:static md:translate-x-0 md:shadow-none"}
        `}
      >
        <AdminSidebar onSelect={() => setSidebarOpen(false)} profile={profile} />
      </aside>

      {/* CONTENT (Основна частина) */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <AdminHeader
          onMenuClick={toggleSidebar}
          toggleSidebarState={toggleSidebarState}
          closeSidebarState={closeSidebar}
          profile={profile}
        />
        <main className="flex-1 overflow-y-auto p-2 bg-gray-100 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}