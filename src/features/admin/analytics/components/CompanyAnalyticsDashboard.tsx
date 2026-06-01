"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivityCharts } from "../../users/components/ActivityCharts";
import { adminCompanyService } from "../../services/admin.company.service";
import api from "@/shared/api/instance.api";
import { IUserActivitiesResponse, ICompanyActivitySummary } from "@/shared/types/user.types";
import { Loader2, TrendingUp, Clock, MousePointerClick, UserCheck } from "lucide-react";
import { translateActivityPath, translateAction } from "@/shared/utils/activity.utils";

interface Props {
  companyId: number;
}

const fetchLatestActivities = async (companyId: number) => {
  const { data } = await api.get(`/admin/company/${companyId}/activities`, {
    params: { limit: 200 } // Fetch last 200 for analytics
  });
  return data as IUserActivitiesResponse;
};

export function CompanyAnalyticsDashboard({ companyId }: Props) {
  const { data: managersSummary, isPending: isSummaryPending } = useQuery<ICompanyActivitySummary[]>({
    queryKey: ["company-activities-summary", companyId],
    queryFn: () => adminCompanyService.getCompanyActivitiesSummary(companyId),
  });

  const { data: activitiesData, isPending: isActivitiesPending } = useQuery({
    queryKey: ["company-activities-analytics", companyId],
    queryFn: () => fetchLatestActivities(companyId),
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
              {peakHour !== -1 ? `${peakHour}:00 - ${peakHour + 1}:00` : "Немає даних"}
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
        <ActivityCharts activities={activities} />
      ) : (
        <div className="text-center p-8 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          Немає записів активності для створення графіків.
        </div>
      )}

    </div>
  );
}
