"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils";
import { motion, LayoutGroup } from "framer-motion";

export interface TabOption {
  id: string;
  label: string;
  count?: number; // Можна додавати цифри (баджі)
}

interface AppTabsProps {
  tabs: TabOption[];
  activeTab?: string;
  onChange?: (id: string) => void;
  variant?: "default" | "pills";
  className?: string;
  queryParam?: string; // Назва параметру в URL (дефолтно "tab")
}

export const AppTabs = ({
  tabs,
  activeTab,
  onChange,
  className,
  queryParam = "tab",
}: AppTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Визначаємо активний таб: або з пропсів, або з URL, або перший зі списку
  const currentTab = activeTab || searchParams.get(queryParam) || tabs[0]?.id;

  const handleTabClick = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      // Якщо onChange не передано, автоматично керуємо URL
      const params = new URLSearchParams(searchParams.toString());
      params.set(queryParam, id);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className={cn("flex p-1 gap-1 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/30 dark:border-zinc-800/50 rounded-2xl w-fit", className)}>
      <LayoutGroup id={`tabs-${queryParam}`}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 outline-none",
                isActive 
                  ? "text-teal-600 dark:text-teal-400" 
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              )}
            >
              {/* Плавна підкладка */}
              {isActive && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              
              <span className="relative z-10 flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[9px] transition-colors",
                    isActive ? "bg-teal-100 dark:bg-teal-500/20 text-teal-700" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                  )}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  );
};