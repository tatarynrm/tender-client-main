"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useTenderManagersFormData } from "@/features/log/hooks/useTenderManagersFormData";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useUpdateTenderStatus } from "@/features/log/hooks/useUpdateTenderStatus";

export const StatusPickerModal = ({
  tenderId,
  onClose,
}: {
  tenderId: string;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { tenderFilters } = useTenderManagersFormData();
  const { mutateAsync: updateStatus, isPending } = useUpdateTenderStatus();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  const handleProcessUpdate = async () => {
    if (!selectedStatus || isPending) return;
    try {
      await updateStatus({
        id: tenderId,
        ids_status: selectedStatus.ids,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Якщо вибрано статус "Завершено" (CLOSED) - показуємо додаткове попередження
    if (selectedStatus?.ids === "CLOSED") {
      setShowCloseConfirm(true);
    } else {
      handleProcessUpdate();
    }
  };

  return createPortal(
    <div
      data-status-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending && !showCloseConfirm) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 border border-zinc-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {!showCloseConfirm ? (
          <>
            <h3 className="text-xl font-black mb-1 text-zinc-900 dark:text-zinc-100 text-center">
              Зміна статусу
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-center">
              Тендер <span className="font-bold text-zinc-700 dark:text-zinc-300">#{tenderId}</span>
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300">
              {tenderFilters?.tender_status_dropdown?.map((status: any) => (
                <button
                  key={status.ids}
                  type="button"
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStatus(status);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                    selectedStatus?.ids === status.ids
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-500"
                      : "border-zinc-100 dark:border-white/5 hover:border-zinc-300 bg-white dark:bg-white/5",
                    isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "font-bold text-sm",
                      selectedStatus?.ids === status.ids
                        ? "text-indigo-700 dark:text-indigo-400"
                        : "text-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    {status.value}
                  </span>
                  {selectedStatus?.ids === status.ids && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                disabled={!selectedStatus || isPending}
                onClick={handleConfirmClick}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none",
                  selectedStatus && !isPending
                    ? "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                    : "bg-zinc-200 dark:bg-zinc-800 cursor-not-allowed text-zinc-400",
                )}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Підтвердити зміну"
                )}
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Скасувати
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-6 ring-8 ring-amber-50/50 dark:ring-amber-500/5">
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
            </div>

            <h3 className="text-xl font-black mb-3 text-zinc-900 dark:text-zinc-100 text-center">
              Завершити тендер?
            </h3>
            
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl mb-8">
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400 font-medium text-center">
                    Якщо ви зараз зробите цю дію, цей тендер буде вважатись закритим і ви вже <span className="font-black underline">не зможете</span> обрати знову переможців по ньому.
                </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProcessUpdate();
                }}
                className="w-full h-14 rounded-2xl font-black bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Так, завершити остаточно</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloseConfirm(false);
                }}
                className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Повернутись назад
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};