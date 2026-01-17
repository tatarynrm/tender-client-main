"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Globe,
  Zap,
  LayoutDashboard,
  Calendar,
} from "lucide-react";

import {
  DistributionBarChart,
  TendersAreaChart,
} from "@/shared/components/Charts/Charts";
import Loader from "@/shared/components/Loaders/MainLoader";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { cn } from "@/shared/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { StatsCard } from "@/features/dashboard/main/main-page-components/StatsCard";

// Mock data
const mockData = {
  totalTenders: 24,
  totalEmployees: 15,
  totalClients: 8,
  totalCarriers: 6,
  monthlyTenders: [
    { month: "Січ", count: 2 },
    { month: "Лют", count: 5 },
    { month: "Бер", count: 3 },
    { month: "Квіт", count: 8 },
    { month: "Трав", count: 6 },
    { month: "Черв", count: 9 },
  ],
};

export default function DashboardContainer() {
  const [data, setData] = useState<any>(null);
  const { config } = useFontSize();
  const { title, main, label, icon: iconSize } = config;

  useEffect(() => {
    // Імітація запиту
    const timer = setTimeout(() => setData(mockData), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="p-1 lg:p-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700  mx-auto">
      {/* Хедер дашборду */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">


        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 font-semibold",
            label
          )}
        >
          <Calendar size={iconSize} className="text-blue-500" />
          <span>Сьогодні: {new Date().toLocaleDateString("uk-UA")}</span>
        </div>
      </div>

      {/* Grid Картки Статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Всього тендерів"
          value={data.totalTenders}
          icon={<ShoppingBag size={iconSize + 4} />}
          trend="12.5%"
          subValue="3 нові"
          description="2 активні зараз"
          targetProgress={75}
        />
        <StatsCard
          label="Працівники"
          value={data.totalEmployees}
          icon={<Users size={iconSize + 4} />}
          subValue="14 online"
          description="3 у відпустці"
          targetProgress={90}
        />
        <StatsCard
          label="Клієнти"
          value={data.totalClients}
          icon={<Globe size={iconSize + 4} />}
          trend="4.2%"
          description="LTV підвищено на 5%"
          targetProgress={45}
        />
        <StatsCard
          label="Перевізники"
          value={data.totalCarriers}
          icon={<Zap size={iconSize + 4} />}
          subValue="120 рейсів"
          description="98% успішних доставок"
          targetProgress={100}
        />
      </div>

      {/* Grid Графіки з Glass-ефектом */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[350px] w-full">
          <TendersAreaChart label="" data={data.monthlyTenders} />
        </div>

        <DistributionBarChart
          label=""
          data={[
            { name: "Клієнти", value: data.totalClients },
            { name: "Перевізники", value: data.totalCarriers },
            { name: "Співробітники", value: data.totalEmployees },
          ]}
        />
      </div>

      {/* Додаткова смужка статусу внизу */}
      <div
        className={cn(
          "p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-wrap justify-around gap-4 text-slate-400 font-medium",
          label
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Всі системи працюють штатно
        </div>
        <div className="hidden md:block">|</div>
        <div>Останнє оновлення: щойно</div>
        <div className="hidden md:block">|</div>
        <div className="text-blue-500">Версія системи: 2.4.0-log</div>
      </div>
    </div>
  );
}
