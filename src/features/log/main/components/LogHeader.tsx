"use client";

import React, { useState, useRef, useEffect } from "react"; // 👈 Додали хуки
import {
  Columns2,
  Menu,
  PanelRight,
  LayoutGrid, // 👈 Додали іконку для віджетів
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ToggleTheme } from "@/shared/components/ui";
import { IUserProfile } from "@/shared/types/user.types";
import { motion, AnimatePresence } from "framer-motion"; // 👈 Додали AnimatePresence для плавного меню
import DynamicHeaderMenu from "@/shared/components/Group/Header/DynamicHeaderMenu";
import { GlobalSettings } from "@/shared/components/GlobalSettings/GlobalSettings";
import { cn } from "@/shared/utils";
import { UserAvatarMenu } from "@/shared/components/Avatar/UserAvatarMenu";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { HeaderWidgetContainer } from "../widgets/HeaderWidgetContainer";
import { DateTimeWidget } from "../widgets/DateTimeWidget";
import { FeedbackButton } from "@/shared/components/Modals/FeedbackButton/FeedbackGoogleFormModal";
import { TrainingButton } from "@/shared/components/Modals/Training/TrainingButton";
import { FuelWidget } from "../widgets/FuelWidget";
import { WeatherWidget } from "../widgets/WeatherWidget";
import { AirAlarmWidget } from "../widgets/AirAlarmWidget";
import { CurrencyWidget } from "../widgets/CurrencyWidget";

// Уявімо, що ви вже імпортували ваші віджети:
// import { FuelWidget } from "../widgets/FuelWidget";
// import { WeatherWidget } from "../widgets/WeatherWidget";

export default function LogHeader({
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
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  // --- Стейт та логіка для меню віджетів ---
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const widgetsRef = useRef<HTMLDivElement>(null);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetsRef.current &&
        !widgetsRef.current.contains(event.target as Node)
      ) {
        setIsWidgetsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-all duration-300">
      {/* Ліва частина: Управління та Профіль */}
      <div className="flex items-center gap-3 sm:gap-6 relative">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="text-slate-600 dark:text-slate-300 w-6 h-6" />
        </button>

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
      <div className="flex items-center gap-1.5 sm:gap-4">
        {/* Додаткові інструменти (зменшені на мобілці) */}
        <div className="flex items-center gap-1.5 mr-1 sm:mr-2">
          <TrainingButton />
          <FeedbackButton />
        </div>

        {/* Налаштування (можна було б сховати на дуже малих екранах, але поки залишимо) */}
        <div className="hidden sm:flex items-center gap-1.5 focus-within:ring-0">
          <Link 
            href="/log/settings"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-blue-500 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Налаштування сповіщень"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <GlobalSettings />
          <ToggleTheme />
        </div>

        {/* Головні дії: Додати та Профіль */}
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-200 dark:border-white/10">
          <DynamicHeaderMenu />
          <UserAvatarMenu />
        </div>
      </div>
    </header>
  );
}
