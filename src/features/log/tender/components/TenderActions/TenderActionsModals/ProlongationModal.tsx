"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Loader2, X, Calendar } from "lucide-react";
import { useTenderProlongation } from "@/features/log/hooks/useTenderProlongation";
import { cn } from "@/shared/utils";

import { useForm, FormProvider } from "react-hook-form";
import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";

import { format } from "date-fns";

export const ProlongationModal = ({
  tenderId,
  onClose,
}: {
  tenderId: number | string;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const { mutateAsync: prolong, isPending } = useTenderProlongation();

  const methods = useForm({
    defaultValues: {
      time: null as Date | null,
    },
  });

  const { watch, control } = methods;
  const newTime = watch("time");

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  const handleProlong = async () => {
    if (!newTime) return;
    try {
      await prolong({
        id_tender: tenderId,
        time: format(newTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });
      onClose();
    } catch (e) {}
  };

  return createPortal(
    <div
      data-prolongation-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-zinc-200 dark:border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
            <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Пролонгація
          </h3>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">
            Тендер #{tenderId}
          </p>
        </div>

        <div className="space-y-6">
          <FormProvider {...methods}>
            <div className="space-y-3">
              <InputDateWithTime
                name="time"
                control={control}
                label="Новий час завершення"
                required
              />
            </div>
          </FormProvider>

          <div className="pt-2 space-y-3">
            <button
              onClick={handleProlong}
              disabled={!newTime || isPending}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200/50 dark:shadow-none active:scale-95",
                !newTime || isPending
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700",
              )}
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Продовжити тендер"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isPending}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
