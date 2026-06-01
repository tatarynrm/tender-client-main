"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ActivityCharts } from "../../users/components/ActivityCharts";
import { adminCompanyService } from "../../services/admin.company.service";
import api from "@/shared/api/instance.api";
import { IUserActivitiesResponse, ICompanyActivitySummary } from "@/shared/types/user.types";
import { Loader2, TrendingUp, Clock, MousePointerClick, UserCheck, Filter } from "lucide-react";
import { translateActivityPath, translateAction } from "@/shared/utils/activity.utils";
import { ManagerActivityBreakdown } from "./ManagerActivityBreakdown";

interface Props {
  companyId: number;
}

const fetchLatestActivities = async (companyId: number, params?: { startDate?: string; endDate?: string }) => {
  const { data } = await api.get(`/admin/company/${companyId}/activities`, {
    params: { limit: 200, ...params } // Fetch last 200 for analytics
  });
  return data as IUserActivitiesResponse;
};

export function CompanyAnalyticsDashboard({ companyId }: Props) {
  const [dateFilter, setDateFilter] = useState("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const getDateParams = () => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = today.toISOString();
    } else if (dateFilter === "this_week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek.toISOString();
    } else if (dateFilter === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = startOfMonth.toISOString();
    } else if (dateFilter === "custom") {
      startDate = customStartDate ? new Date(customStartDate).toISOString() : undefined;
      endDate = customEndDate ? new Date(customEndDate).toISOString() : undefined;
      if (endDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        endDate = end.toISOString();
      }
    }
    return { startDate, endDate };
  };

  const params = getDateParams();

  const { data: managersSummary, isPending: isSummaryPending, isFetching: isSummaryFetching } = useQuery<ICompanyActivitySummary[]>({
    queryKey: ["company-activities-summary", companyId, params],
    queryFn: () => adminCompanyService.getCompanyActivitiesSummary(companyId, params),
    placeholderData: keepPreviousData,
  });

  const { data: activitiesData, isPending: isActivitiesPending, isFetching: isActivitiesFetching } = useQuery({
    queryKey: ["company-activities-analytics", companyId, params],
    queryFn: () => fetchLatestActivities(companyId, params),
    placeholderData: keepPreviousData,
  });

  if (isSummaryPending || isActivitiesPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  const activities = activitiesData?.activities || [];
  
  // --- Smart Analytics Calculations ---
  
  // 1. Most active hour
  const hourCounts = new Map<number, number>();
  activities.forEach(a => {
    const hour = new Date(a.created_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  let peakHour = -1;
  let peakHourCount = -1;
  hourCounts.forEach((count, hour) => {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = hour;
    }
  });

  // 2. Most visited page
  const pageCounts = new Map<string, number>();
  activities.forEach(a => {
    if (a.path) {
      pageCounts.set(a.path, (pageCounts.get(a.path) || 0) + 1);
    }
  });
  let topPage = "";
  let topPageCount = -1;
  pageCounts.forEach((count, path) => {
    if (count > topPageCount) {
      topPageCount = count;
      topPage = path;
    }
  });

  // 3. Most common action
  const actionCounts = new Map<string, number>();
  activities.forEach(a => {
    actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1);
  });
  let topAction = "";
  let topActionCount = -1;
  actionCounts.forEach((count, action) => {
    if (count > topActionCount) {
      topActionCount = count;
      topAction = action;
    }
  });

  // 4. Most active manager (from summary)
  const topManager = managersSummary && managersSummary.length > 0 ? managersSummary[0] : null;

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          <Filter size={18} />
          <span className="font-medium">Фільтр за періодом:</span>
          {(isSummaryFetching || isActivitiesFetching) && (
            <Loader2 className="animate-spin text-blue-500 w-4 h-4 ml-2" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="today">Сьогодні</option>
            <option value="this_week">Цей тиждень</option>
            <option value="this_month">Цей місяць</option>
            <option value="all_time">За весь час</option>
            <option value="custom">Довільний період</option>
          </select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <span className="text-zinc-400">-</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Smart Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Widget 1: Peak Hour */}
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Пікова активність</p>
            <h4 className="text-xl font-bold mt-1 text-zinc-900 dark:text-white">
              {peakHour !== -1 
                ? `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 1) % 24).padStart(2, '0')}:00` 
                : "Немає даних"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">Години з найбільшою кількістю дій</p>
          </div>
        </div>

        {/* Widget 2: Top Page */}
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-500 font-medium">Популярна сторінка</p>
            <h4 className="text-xl font-bold mt-1 text-zinc-900 dark:text-white truncate" title={translateActivityPath(topPage)}>
              {topPage ? translateActivityPath(topPage) : "Немає даних"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">{topPageCount > 0 ? `${topPageCount} відвідувань` : ""}</p>
          </div>
        </div>

        {/* Widget 3: Top Action */}
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-xl">
            <MousePointerClick size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-500 font-medium">Найчастіша дія</p>
            <h4 className="text-xl font-bold mt-1 text-zinc-900 dark:text-white truncate">
              {topAction ? translateAction(topAction) : "Немає даних"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">{topActionCount > 0 ? `${topActionCount} разів` : ""}</p>
          </div>
        </div>

        {/* Widget 4: Top Manager */}
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-500 font-medium">Найактивніший менеджер</p>
            <h4 className="text-xl font-bold mt-1 text-zinc-900 dark:text-white truncate" title={topManager ? `${topManager.surname} ${topManager.name || ""}` : ""}>
              {topManager ? `${topManager.surname} ${topManager.name || ""}` : "Немає даних"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">{topManager ? `${topManager.activity_count} дій` : ""}</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      {activities.length > 0 ? (
        <>
          <ActivityCharts activities={activities} />
          <ManagerActivityBreakdown activities={activities} />
        </>
      ) : (
        <div className="text-center p-8 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          Немає записів активності для створення графіків.
        </div>
      )}

    </div>
  );
}
