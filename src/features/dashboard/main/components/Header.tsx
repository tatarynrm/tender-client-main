"use client";

import { Columns2, Menu, PanelRight, ShieldCheck } from "lucide-react";
import { ToggleTheme } from "@/shared/components/ui";
import { IUserProfile } from "@/shared/types/user.types";
import { motion } from "framer-motion";
import DynamicHeaderMenu from "@/shared/components/Group/Header/DynamicHeaderMenu";
import { GlobalSettings } from "@/shared/components/GlobalSettings/GlobalSettings";
import NotificationMenu from "./NotificationMenu";
import { cn } from "@/shared/utils";

export default function Header({
  onMenuClick,
  toggleSidebarState,
  closeSidebarState,
  profile,
}: {
  onMenuClick?: () => void;
  toggleSidebarState?: () => void;
  closeSidebarState?: boolean;
  profile?: IUserProfile;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-all duration-300">
      
      {/* Ліва частина: Управління та Профіль */}
      <div className="flex items-center gap-6">
        {/* Кнопка мобільного меню */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="text-slate-600 dark:text-slate-300 w-6 h-6" />
        </button>

        {/* Перемикач сайдбару (Десктоп) */}
        <div className="hidden md:flex items-center">
          {closeSidebarState ? (
            <motion.div
              initial={{ rotate: 0, scale: 0.9 }}
              animate={{ rotate: 90, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <PanelRight
                size={28}
                className="text-blue-500 cursor-pointer drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                onClick={toggleSidebarState}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ rotate: 270, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Columns2
                size={28}
                className="text-blue-500 cursor-pointer drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                onClick={toggleSidebarState}
              />
            </motion.div>
          )}
        </div>

        {/* Інформація про користувача */}
        <div className="hidden lg:flex flex-col border-l border-slate-200 dark:border-white/10 pl-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[250px]">
              {profile?.company.company_name}
            </span>
            {profile?.verified && (
              <ShieldCheck size={14} className="text-blue-500" />
            )}
          </div>
          <span className="text-xs text-slate-500 font-bold opacity-70">
            {profile?.person.surname} {profile?.person.name?.charAt(0)}.{profile?.person.last_name?.charAt(0)}.
          </span>
        </div>
      </div>

      {/* Права частина: Налаштування, Повідомлення та Дії */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Системний блок: Налаштування + Повідомлення + Тема */}
        <div className="flex items-center p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <GlobalSettings />
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <NotificationMenu />
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <ToggleTheme />
        </div>

        {/* Меню профілю */}
        <div className="relative pl-2 sm:pl-4 border-l border-slate-200 dark:border-white/10">
          <DynamicHeaderMenu  />
        </div>
      </div>
    </header>
  );
}