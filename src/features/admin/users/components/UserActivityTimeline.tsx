"use client";

import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { UserActivityBadge } from "./UserActivityBadge";
import { ActivityCharts } from "./ActivityCharts";
import { Button } from "@/shared/components/ui/button";
import { format } from "date-fns";
import { Activity, Code, Globe, Loader2, MonitorSmartphone, User } from "lucide-react";
import { translateActivityPath } from "@/shared/utils/activity.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { IUserActivitiesResponse } from "@/shared/types/user.types";

interface UserActivityTimelineProps {
  userId: number | string;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds} сек`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} хв ${s} сек` : `${m} хв`;
};


export function UserActivityTimeline({ userId }: UserActivityTimelineProps) {
  const [selectedMetadata, setSelectedMetadata] = useState<any | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery<IUserActivitiesResponse, Error>({
    queryKey: ["user-activities", userId],
    queryFn: async ({ pageParam }) => {
      return userService.getUserActivities(userId, pageParam as string | null, 10);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: null,
  });

  if (isPending) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
        Помилка завантаження активності.
      </div>
    );
  }

  const activities = data?.pages.flatMap((page) => page.activities) || [];

  return (
    <div className="space-y-6">
      {activities.length === 0 ? (
        <div className="text-center p-8 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          Немає записів активності для цього користувача.
        </div>
      ) : (
        <>
          <ActivityCharts activities={activities} />
          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 ring-4 ring-white dark:ring-zinc-950">
                <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              </div>

              <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-400" />
                    <UserActivityBadge action={activity.action} />
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    {format(new Date(activity.created_at), "dd.MM.yyyy HH:mm:ss")}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Globe size={14} className="opacity-70" />
                    <span className="truncate">{activity.ip_address || "Невідомий IP"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <MonitorSmartphone size={14} className="opacity-70" />
                    <span className="truncate" title={activity.usr_agent || ""}>
                      {activity.usr_agent ? activity.usr_agent.split(" ")[0] : "Невідомий пристрій"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 sm:col-span-2">
                    <User size={14} className="opacity-70" />
                    <span>
                      {activity.surname 
                        ? `${activity.surname} ${activity.name || ""} ${activity.last_name || ""}` 
                        : `User ID: ${activity.id_usr}`}
                    </span>
                  </div>
                  {activity.path && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:col-span-2">
                      <Code size={14} className="opacity-70" />
                      <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                        {translateActivityPath(activity.path)}
                      </span>
                      {activity.duration ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                          ({formatDuration(activity.duration)})
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {activity.metadata && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      onClick={() => setSelectedMetadata(activity.metadata)}
                    >
                      <Code size={12} />
                      Деталі
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            className="w-full sm:w-auto rounded-xl bg-zinc-100/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin opacity-70" />
                <span>Завантаження...</span>
              </div>
            ) : (
              "Завантажити ще"
            )}
          </Button>
        </div>
      )}

      {/* Metadata Modal */}
      <Dialog open={!!selectedMetadata} onOpenChange={(open) => !open && setSelectedMetadata(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <DialogHeader className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Code size={16} className="text-indigo-500" />
              Додаткова інформація
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-auto max-h-[60vh]">
            <pre className="text-[11px] bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto shadow-inner font-mono leading-relaxed">
              {JSON.stringify(selectedMetadata, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
