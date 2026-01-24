"use client";

import React, { useEffect, useTransition } from "react";
import { Globe, User, LayoutDashboard, RefreshCcw } from "lucide-react";

import {
  DistributionBarChart,
  TendersAreaChart,
} from "@/shared/components/Charts/Charts";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage"; // Ваш кастомний хук
import { cn } from "@/shared/utils";
import { DashboardStats } from "../types/crm.types";
import { ActiveStatsGrid } from "./components/ActiveStatisticCard";
import { PublishedStatisticCard } from "./components/PublishedStatisticCard";
import { ClosedStatisticCard } from "./components/ClosedStatisticCard";
import { HeaderWidgetContainer } from "./widgets/HeaderWidgetContainer";
import { RefreshButton } from "@/shared/components/RefreshButton/RefreshButton";
import BarChartCountry from "./components/BarChartCountry";

interface Props {
  allData: DashboardStats;
  myData: DashboardStats;
}

export default function LogDashboardClientPage({ allData, myData }: Props) {
  const { config } = useFontSize();
  const { label } = config;

  // Використовуємо localStorage для збереження режиму перегляду
  const [viewMode, setViewMode] = useLocalStorage<"all" | "my">(
    "dashboard-view-mode",
    "my",
  );

  const currentData = viewMode === "all" ? allData : myData;

  const active = currentData.active[0];
  const closed = currentData.closed[0];
  const published = currentData.published[0];
  // 1. Функція для ручного оновлення

  return (
    <div className="p-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto pb-60">
      {/* Верхня панель: Віджети + Компактний перемикач */}

      <HeaderWidgetContainer />

      {/* Компактний Switcher */}
      <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm w-fit shrink-0">
        <button
          onClick={() => setViewMode("my")}
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
            viewMode === "my"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
          )}
        >
          <User size={12} strokeWidth={3} />
          Мої дані
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
            viewMode === "all"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
          )}
        >
          <Globe size={12} strokeWidth={3} />
          Всі дані
        </button>
        <RefreshButton />
      </div>

      {/* Grid Картки Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        <ActiveStatsGrid data={active} className="w-full h-full" />

        <PublishedStatisticCard
          title={
            viewMode === "all" ? "Опубліковано (всі)" : "Опубліковано (мною)"
          }
          data={published}
          className="w-full h-full"
        />

        <ClosedStatisticCard
          title={viewMode === "all" ? "Закриті (всі)" : "Закриті (мною)"}
          data={closed}
          className="w-full h-full"
        />
      </div>

      {/* Grid Графіки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TendersAreaChart
          label={viewMode === "all" ? "Загальна динаміка" : "Моя динаміка"}
          data={[
            { month: "Попередній", count: published.month_prev },
            { month: "Поточний", count: published.month_current },
          ]}
        />

        <DistributionBarChart
          label="Розподіл за напрямками"
          data={[
            { name: "Export", value: active.export },
            { name: "Transit", value: active.transit },
            { name: "Region", value: active.region },
            { name: "Import", value: active.import },
          ]}
        />
      </div>
      {/* <BarChartCountry /> */}
      {/* Статус-бар */}
      {/* <div
        className={cn(
          "p-3 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-wrap justify-around gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider",
          label,
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              viewMode === "all" ? "bg-amber-500" : "bg-emerald-500",
            )}
          />
          Режим: {viewMode === "all" ? "Загальний" : "Персональний"}
        </div>
        <div className="hidden md:block opacity-20">|</div>
        <div className="flex items-center gap-2">
          <LayoutDashboard size={12} />
          Оновлено:{" "}
          {new Date().toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div> */}
    </div>
  );
}
