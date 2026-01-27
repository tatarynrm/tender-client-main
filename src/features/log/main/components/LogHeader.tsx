"use client";

import { Columns2, Menu, PanelRight, ShieldCheck } from "lucide-react";
import { ToggleTheme } from "@/shared/components/ui";
import { IUserProfile } from "@/shared/types/user.types";
import { motion } from "framer-motion";
import DynamicHeaderMenu from "@/shared/components/Group/Header/DynamicHeaderMenu";
import { GlobalSettings } from "@/shared/components/GlobalSettings/GlobalSettings";
import { cn } from "@/shared/utils";
import { UserAvatarMenu } from "@/shared/components/Avatar/UserAvatarMenu";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { HeaderWidgetContainer } from "../widgets/HeaderWidgetContainer";
import { DateTimeWidget } from "../widgets/DateTimeWidget";

export default function LogHeader({
  onMenuClick,
  toggleSidebarState,
  closeSidebarState,
  profile,
}: {
  onMenuClick?: () => void;
  toggleSidebarState?: () => void;
  closeSidebarState?: boolean;
  profile: IUserProfile;
}) {
  // Ці дані будуть надходити з вашого Context, Redux, Zustand або з сервера

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  // 2. Будуємо шлях, тільки якщо є аватар у профілі
  // Також перевіряємо, щоб не було подвійного слеша //
  const avatarUrl = profile?.avatar_path
    ? `${baseUrl.replace(/\/$/, "")}/${profile.avatar_path.replace(/^\//, "")}`
    : undefined;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-all duration-300">
      {/* Ліва частина: Управління та Профіль */}
      <div className="flex items-center gap-6 relative">
        {/* Кнопка мобільного меню */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="text-slate-600 dark:text-slate-300 w-6 h-6" />
        </button>

        {/* Перемикач сайдбару (Десктоп) */}
        <div className="hidden md:flex items-center relative">
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
<div className="hidden sm:block">
  <DateTimeWidget />
</div>
      </div>

      {/* Права частина: Налаштування та Дії */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Група системних кнопок */}

        <GlobalSettings />

        <ToggleTheme />

        {/* Меню профілю */}
        <div className="relative pl-2 sm:pl-4 border-l border-slate-200 dark:border-white/10">
          <DynamicHeaderMenu />
        </div>
        <UserAvatarMenu />
      </div>
    </header>
  );
}
