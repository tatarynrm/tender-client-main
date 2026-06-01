"use client";

import { useMemo, useState } from "react";
import { IUserActivity } from "@/shared/types/user.types";
import { UserActivityTimeline } from "../../users/components/UserActivityTimeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Eye, User } from "lucide-react";

interface Props {
  activities: IUserActivity[];
}

interface ManagerStats {
  id: string;
  fullName: string;
  total: number;
  logins: number;
  comments: number;
  bids: number;
  lastActive: string;
}

export function ManagerActivityBreakdown({ activities }: Props) {
  const [selectedManager, setSelectedManager] = useState<ManagerStats | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, ManagerStats>();

    // Activities are usually sorted by created_at desc
    activities.forEach((act) => {
      if (!act.id_usr) return;

      const fullName =
        [act.surname, act.name, act.last_name].filter(Boolean).join(" ") ||
        `Користувач ID: ${act.id_usr}`;

      if (!map.has(act.id_usr)) {
        map.set(act.id_usr, {
          id: act.id_usr,
          fullName,
          total: 0,
          logins: 0,
          comments: 0,
          bids: 0,
          lastActive: act.created_at,
        });
      }

      const manager = map.get(act.id_usr)!;
      manager.total += 1;
      
      // Update last active if we find a newer one
      if (new Date(act.created_at) > new Date(manager.lastActive)) {
        manager.lastActive = act.created_at;
      }

      if (act.action === "LOGIN") manager.logins += 1;
      if (act.action === "ADDED_COMMENT") manager.comments += 1;
      if (act.action.startsWith("PLACED_BID")) manager.bids += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [activities]);

  if (stats.length === 0) return null;

  return (
    <>
      <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm mt-6 overflow-hidden">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">
          Детальна розбивка по менеджерам
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Менеджер</th>
                <th className="py-3 px-4 font-medium text-center">Загалом дій</th>
                <th className="py-3 px-4 font-medium text-center">Входи (Логін)</th>
                <th className="py-3 px-4 font-medium text-center">Коментарі</th>
                <th className="py-3 px-4 font-medium text-center">Ставки</th>
                <th className="py-3 px-4 font-medium text-center">Остання активність</th>
                <th className="py-3 px-4 font-medium text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {stats.map((manager) => (
                <tr
                  key={manager.id}
                  className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {manager.fullName}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                    {manager.total}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-600 dark:text-zinc-400">
                    {manager.logins}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-600 dark:text-zinc-400">
                    {manager.comments}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-600 dark:text-zinc-400">
                    {manager.bids}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-600 dark:text-zinc-400">
                    {new Date(manager.lastActive).toLocaleString("uk-UA")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedManager(manager)}
                      className="h-8 gap-2 border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                    >
                      <Eye size={14} />
                      Деталі
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedManager} onOpenChange={(open) => !open && setSelectedManager(null)}>
        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <DialogHeader className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="flex items-center gap-2">
              <User size={18} className="text-indigo-500" />
              Активність менеджера: <span className="text-indigo-600">{selectedManager?.fullName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {selectedManager && (
              <UserActivityTimeline userId={Number(selectedManager.id)} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
