"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  RefreshCw,
  XCircle,
  Building2,
  User2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { DashboardStats, PeriodStats } from "../types/crm.types";
import { ActiveStatsGrid } from "./components/ActiveStatisticCard";
import { PublishedStatisticCard } from "./components/PublishedStatisticCard";
import { ClosedStatisticCard } from "./components/ClosedStatisticCard";
import { GroupedDistributionChart } from "./components/GroupedDistributionChart";
import { useProfile } from "@/shared/hooks";
import { InputDate } from "@/shared/components/Inputs/InputDate";
import { cn } from "@/shared/utils";
import api from "@/shared/api/instance.api";
import { HeaderWidgetContainer } from "./widgets/HeaderWidgetContainer";

const EMPTY_PERIOD: PeriodStats = {
  day_current: 0,
  day_prev: 0,
  week_current: 0,
  week_prev: 0,
  month_current: 0,
  month_prev: 0,
};

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-48 bg-zinc-100 dark:bg-slate-800 rounded-[2rem]"
      />
    ))}
  </div>
);

export default function LogDashboardClientPage() {
  const { profile } = useProfile();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"company" | "my">("company");

  const { control, watch, reset } = useForm({
    defaultValues: { date1: "", date2: "" },
  });

  const formValues = watch();

  const loadStats = useCallback(
    async (overrides?: { d1?: string; d2?: string }) => {
      setIsLoading(true);
      try {
        const payload = {
          date1:
            overrides?.d1 !== undefined
              ? overrides.d1 || null
              : formValues.date1 || null,
          date2:
            overrides?.d2 !== undefined
              ? overrides.d2 || null
              : formValues.date2 || null,
          id_usr: activeTab === "my" ? profile?.id : null,
        };
        const response = await api.post<DashboardStats>(
          "/crm/statistic/stats",
          payload,
        );
        setData(response.data);
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [formValues.date1, formValues.date2, activeTab, profile?.id],
  );

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const handleClearAll = () => {
    reset({ date1: "", date2: "" });
    loadStats({ d1: "", d2: "" });
  };

  const currentMonthName = format(new Date(), "LLLL yyyy", { locale: uk });

  return (
    <div className="p-1 space-y-8  mx-auto transition-all duration-500 pb-20">
      <HeaderWidgetContainer />
      {/* 1. ПАНЕЛЬ КЕРУВАННЯ (З високим Z-INDEX для календаря) */}
      <div className=" flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-5">
          {/* ТАБИ */}
          <div className="inline-flex p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
            {[
              { id: "company", label: "Компанія", icon: Building2 },
              { id: "my", label: "Моя", icon: User2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase rounded-xl transition-all",
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 shadow-md text-teal-600"
                    : "text-zinc-400",
                )}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* ФІЛЬТРИ ДАТ */}
          <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
            <InputDate
              control={control}
              name="date1"
              label="Від"
              className="w-full sm:w-40"
            />
            <InputDate
              control={control}
              name="date2"
              label="До"
              className="w-full sm:w-40"
            />
            <button
              onClick={() => loadStats()}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl text-[11px] font-bold uppercase flex items-center gap-3"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <TrendingUp size={16} />
              )}
              Застосувати
            </button>
          </div>
        </div>

        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 text-zinc-400 hover:text-red-500 text-[11px] font-bold uppercase"
        >
          <XCircle size={20} />
          <span>Скинути</span>
        </button>
      </div>

      {/* 2. ІНФОРМАЦІЙНИЙ РЯДОК */}
      <div className=" min-h-[40px] flex items-center mb-6">
        {(!isLoading || data) && (
          <div className="flex items-center gap-2 px-5 py-2 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 rounded-full animate-in fade-in slide-in-from-left-4 shadow-sm">
            <Calendar size={14} className="text-teal-600" />
            <span className="text-[12px] font-semibold text-teal-800 dark:text-teal-400">
              {formValues.date1 || formValues.date2
                ? `Період: ${formValues.date1 || "..."} — ${formValues.date2 || "сьогодні"}`
                : `Статистика за ${currentMonthName}`}
            </span>
          </div>
        )}
      </div>

      {/* 3. КАРТКИ СТАТИСТИКИ */}
      <div className="">
        {isLoading && !data ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
            <ActiveStatsGrid
              data={
                data?.car_actual?.[0] || {
                  all: 0,
                  export: 0,
                  import: 0,
                  region: 0,
                  transit: 0,
                }
              }
            />
            <PublishedStatisticCard
              title="Опубліковано"
              data={data?.car_published?.[0] || EMPTY_PERIOD}
            />
            <ClosedStatisticCard
              title="Закрито"
              data={data?.car_closed?.[0] || EMPTY_PERIOD}
            />
          </div>
        )}
      </div>

      {/* 4. ГРАФІКИ (З низьким Z-INDEX) */}
      <div className="  grid grid-cols-1 gap-8">
        {!data && isLoading ? (
          <div className="h-[400px] bg-zinc-50 dark:bg-slate-900/20 rounded-[2.5rem] animate-pulse" />
        ) : (
          <>
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <GroupedDistributionChart
                label={
                  activeTab === "my" ? "Мої Клієнти" : "Аналітика по Клієнтах"
                }
                data={
                  data?.chart_clients?.map((c) => ({
                    name: c.company_name,
                    Додано: c.added,
                    Закрито: c.closed,
                    Скасовано: c.canceled,
                  })) || []
                }
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <GroupedDistributionChart
                label={
                  activeTab === "my"
                    ? "Мої Напрямки (Країни)"
                    : "Аналітика по Країнах"
                }
                data={
                  data?.chart_countries?.map((c) => ({
                    name: c.country_name || "Не визначено",
                    Додано: c.added,
                    Закрито: c.closed,
                    Скасовано: c.canceled,
                  })) || []
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
