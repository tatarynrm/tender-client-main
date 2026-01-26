"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  History,
  User,
  Loader2,
  Info,
  Banknote,
  Delete,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import api from "@/shared/api/instance.api";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui";
import { useAuth } from "@/shared/providers/AuthCheckProvider";

// Оновлений інтерфейс згідно з вашим JSON
interface HistoryItem {
  id: number;
  price: string; // Додано поле price
  table: string;
  manager: string;
  car_count: number;
  information: string;
  operation_name: string;
  operation_time: string;
  id_usr: number;
  enable_delete: boolean;
}

const fetchCargoHistory = async (loadId: number): Promise<HistoryItem[]> => {
  const { data } = await api.get(`/crm/load/load-history/${loadId}`);
  return data.content || [];
};

export function CargoHistoryModal({
  open,
  onOpenChange,
  loadId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadId: number;
}) {
  const queryClient = useQueryClient();
  const {
    data: historyData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cargo-history", loadId],
    queryFn: () => fetchCargoHistory(loadId),
    enabled: open,
  });
  const deleteMutation = useMutation({
    mutationFn: async (item: HistoryItem) => {
      return await api.post(`/crm/load/load-history/delete`, {
        id: item.id,
        table: item.table, // передаємо назву таблиці
      });
    },
    onSuccess: () => {
      // Оновлюємо дані в списку після видалення
      queryClient.invalidateQueries({ queryKey: ["cargo-history", loadId] });
    },
  });
  const { profile } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg">
              <History size={18} className="text-white dark:text-zinc-900" />
            </div>
            Історія заявки
            <span className="text-zinc-400 font-mono text-sm ml-auto">
              #{loadId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[550px] px-6 py-6">
          <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-3 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Завантаження історії...</span>
              </div>
            )}

            {isError && (
              <div className="text-center py-10 text-red-400 text-xs">
                Не вдалося завантажити історію
              </div>
            )}

            {!isLoading && !isError && historyData.length > 0
              ? historyData.map((item) => (
                  <div key={item.id} className="relative pl-8 group">
                    {/* Крапка на таймлайні */}
                    <div
                      className={cn(
                        "absolute left-[9px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 transition-colors z-10",
                        item.operation_name === "Закрито"
                          ? "bg-emerald-500"
                          : "bg-zinc-300 dark:bg-zinc-700",
                      )}
                    />

                    <div className="flex flex-col gap-3">
                      {/* Шапка події */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded w-fit",
                              item.operation_name === "Закрито"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-300",
                            )}
                          >
                            {item.operation_name}
                          </span>

                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <User size={12} className="text-zinc-400" />
                            <span className="text-[11px] font-bold">
                              {item.manager}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-zinc-400 tabular-nums whitespace-nowrap bg-zinc-50 dark:bg-white/5 px-2 py-1 rounded">
                          {format(
                            new Date(item.operation_time),
                            "dd MMM, HH:mm:ss",
                            {
                              locale: uk,
                            },
                          )}
                        </span>
                      </div>

                      {/* Блок з деталями */}
                      <div className="bg-zinc-50 dark:bg-white/5 p-3 rounded-xl border border-zinc-100 dark:border-white/5 transition-all group-hover:border-zinc-200 dark:group-hover:border-white/10">
                        <div className="flex flex-col gap-2.5">
                          {/* Інформація */}
                          {item.information && (
                            <div className="flex gap-2">
                              <Info
                                size={14}
                                className="text-blue-500 shrink-0 mt-0.5"
                              />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">
                                  Інформація
                                </span>
                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 leading-snug">
                                  {item.information}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Ціна та К-сть авто (в один рядок) */}
                          <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-200/50 dark:border-white/5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Banknote
                                  size={14}
                                  className="text-emerald-500"
                                />
                                <span className="text-[12px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                                  {item.price}
                                </span>
                              </div>

                              {item.car_count > 0 && (
                                <div className="text-[11px] font-medium text-zinc-400 bg-zinc-200/50 dark:bg-white/10 px-2 py-0.5 rounded-md">
                                  Авто: {item.car_count}
                                </div>
                              )}
                            </div>
                            {profile?.id === item.id_usr &&
                              item.enable_delete && (
                                <Button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Ви впевнені, що хочете видалити цей запис?",
                                      )
                                    ) {
                                      deleteMutation.mutate(item);
                                    }
                                  }}
                                  className="bg-red-400"
                                  size={"icon"}
                                >
                                  <Trash />
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : !isLoading && (
                  <div className="text-center py-20">
                    <div className="inline-flex p-3 rounded-full bg-zinc-50 dark:bg-white/5 mb-3">
                      <History size={20} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 text-xs font-medium">
                      Історія змін порожня
                    </p>
                  </div>
                )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
