"use client";

import { useQuery } from "@tanstack/react-query";
import { adminUserService } from "../../services/admin.user.service";
import { Loader2, ShieldAlert, User, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface IctActivity {
  id_usr: number;
  surname: string;
  name: string;
  last_name: string;
  last_activity: string | null;
}

export function IctManagersActivityWidget() {
  const { data: activities, isPending } = useQuery<IctActivity[]>({
    queryKey: ["ict-activity-summary"],
    queryFn: () => adminUserService.getIctActivitySummary(),
  });

  if (isPending) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return null;
  }

  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.last_activity) return -1;
    if (!b.last_activity) return 1;
    return new Date(a.last_activity).getTime() - new Date(b.last_activity).getTime();
  });

  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Активність ICT Менеджерів</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Контроль останнього входу в систему</p>
        </div>
      </div>

      <div className="p-0">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50 max-h-[300px] overflow-y-auto custom-scrollbar">
          {sortedActivities.map((manager) => {
            const fullName = `${manager.surname || ""} ${manager.name || ""} ${manager.last_name || ""}`.trim();
            const neverLogged = !manager.last_activity;
            
            let timeAgo = "";
            let statusColor = "text-zinc-500";
            let bgColor = "bg-zinc-100 dark:bg-zinc-800";
            let icon = <Clock size={14} />;

            if (neverLogged) {
              timeAgo = "Ніколи не заходив";
              statusColor = "text-rose-600 dark:text-rose-400";
              bgColor = "bg-rose-50 dark:bg-rose-500/10";
              icon = <AlertCircle size={14} />;
            } else {
              const lastActivityDate = new Date(manager.last_activity!);
              timeAgo = formatDistanceToNow(lastActivityDate, { addSuffix: true, locale: uk });
              
              const daysAgo = (new Date().getTime() - lastActivityDate.getTime()) / (1000 * 3600 * 24);
              if (daysAgo > 30) {
                statusColor = "text-orange-600 dark:text-orange-400";
                bgColor = "bg-orange-50 dark:bg-orange-500/10";
              } else if (daysAgo > 7) {
                statusColor = "text-amber-600 dark:text-amber-400";
                bgColor = "bg-amber-50 dark:bg-amber-500/10";
              } else {
                statusColor = "text-emerald-600 dark:text-emerald-400";
                bgColor = "bg-emerald-50 dark:bg-emerald-500/10";
              }
            }

            return (
              <li key={manager.id_usr} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <User size={18} className="text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {fullName || "Невідомий користувач"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">ID: {manager.id_usr}</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 ${bgColor} ${statusColor}`}>
                  {icon}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {timeAgo}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
