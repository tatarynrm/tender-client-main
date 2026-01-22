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
  const currentUser = {
    name: "Олег Петренко",
    email: "oleg.p@example.com",
    avatar: "https://github.com/shadcn.png", // Приклад URL аватара
  };
  console.log(profile, "PROFILEEEEEEEEEEEE");
  console.log(
    `${process.env.NEXT_PUBLIC_SERVER_URL}${profile?.avatar_path}`,
    "PROFILEEEEEEEEEEEE",
  );
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  // 2. Будуємо шлях, тільки якщо є аватар у профілі
  // Також перевіряємо, щоб не було подвійного слеша //
  const avatarUrl = profile?.avatar_path
    ? `${baseUrl.replace(/\/$/, "")}/${profile.avatar_path.replace(/^\//, "")}`
    : undefined;


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
              {profile?.company_name_full}
            </span>
            {profile?.is_ict_admin && (
              <ShieldCheck size={14} className="text-blue-500" />
            )}
          </div>
          <span className="text-xs text-slate-500 font-bold opacity-70">
            {profile?.surname} {profile?.name?.charAt(0)}.
            {profile?.last_name?.charAt(0)}.
          </span>
        </div>
      </div>

      {/* Права частина: Налаштування та Дії */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Група системних кнопок */}
        <div className="flex items-center p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <GlobalSettings />
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <ToggleTheme />
        </div>

        {/* Меню профілю */}
        <div className="relative pl-2 sm:pl-4 border-l border-slate-200 dark:border-white/10">
          <DynamicHeaderMenu profile={profile} />
        </div>
        <UserAvatarMenu
          userName={currentUser.name}
          userEmail={currentUser.email}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  );
}
