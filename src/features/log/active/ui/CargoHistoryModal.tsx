"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { History, User, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface HistoryItem {
  id: number;
  action: string;
  user_name: string;
  created_at: string;
  details?: string;
}

export function CargoHistoryModal({
  open,
  onOpenChange,
  loadId,
  historyData = [], // Дані, які прийдуть з API
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadId: number;
  historyData?: HistoryItem[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg">
              <History size={18} className="text-white dark:text-zinc-900" />
            </div>
            Історія заявки{" "}
            <span className="text-zinc-400 font-mono text-sm ml-auto">
              #{loadId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] px-6 py-4">
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
            {historyData.length > 0 ? (
              historyData.map((item, idx) => (
                <div key={item.id} className="relative pl-8 group">
                  {/* Крапка на таймлайні */}
                  <div className="absolute left-[9px] top-1 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 border-2 border-white dark:border-zinc-950 group-hover:bg-blue-500 transition-colors z-10" />

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                        {item.action}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 tabular-nums">
                        {format(new Date(item.created_at), "dd MMMM, HH:mm", {
                          locale: uk,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <User size={10} />
                      <span className="text-[10px] font-bold">
                        {item.user_name}
                      </span>
                    </div>

                    {item.details && (
                      <p className="text-[10px] text-zinc-500 italic bg-zinc-50 dark:bg-white/5 p-2 rounded mt-1 border border-zinc-100 dark:border-white/5">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-400 text-xs font-medium">
                Історія змін порожня
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
