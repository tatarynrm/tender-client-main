"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlarmClockPlus, Loader2 } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { addHours, format } from "date-fns";

import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";
import { useTenderProlong } from "@/features/log/hooks/useTenderProlong";
import { cn } from "@/shared/utils";

const MAX_PROLONG_HOURS = 24;

const fmt = (d: Date) => format(d, "dd.MM.yyyy HH:mm");

// Пролонгація АКТИВНОГО тендера: новий час завершення — після поточного
// і не пізніше ніж +24 години від ЗАРАЗ (від моменту пролонгації), а не
// від поточного завершення тендера.
export const ActiveProlongModal = ({
  tender,
  onClose,
}: {
  tender: any;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const { mutateAsync: prolong, isPending } = useTenderProlong();

  const currentEnd = tender?.time_end ? new Date(tender.time_end) : null;
  // Фіксуємо "зараз" на момент відкриття модалки, щоб межа не повзла,
  // поки менеджер обирає дату.
  const [now] = useState(() => new Date());
  const maxEnd = currentEnd ? addHours(now, MAX_PROLONG_HOURS) : null;
  // Якщо тендер уже завершується пізніше за максимум (now+24) — пролонгувати нікуди.
  const noRoom = !!(currentEnd && maxEnd && currentEnd >= maxEnd);

  const methods = useForm({
    defaultValues: { time: null as Date | null },
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

  let error: string | null = null;
  if (newTime && currentEnd && maxEnd && !noRoom) {
    if (newTime <= currentEnd) {
      error = `Новий час має бути пізніше за поточне завершення (${fmt(currentEnd)})`;
    } else if (newTime > maxEnd) {
      error = `Не можна пролонгувати більш ніж на ${MAX_PROLONG_HOURS} год від поточного моменту — максимум до ${fmt(maxEnd)}`;
    }
  }

  const canSubmit =
    !!newTime && !!currentEnd && !noRoom && !error && !isPending;

  const handleSubmit = async () => {
    if (!canSubmit || !newTime) return;
    try {
      await prolong({ id_tender: tender.id, time: newTime.toISOString() });
      onClose();
    } catch {
      // toast показує хук
    }
  };

  return createPortal(
    <div
      data-prolongation-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-zinc-200 dark:border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
            <AlarmClockPlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Пролонгація тендера
          </h3>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">
            Тендер #{tender?.id}
          </p>
        </div>

        {currentEnd && maxEnd && !noRoom ? (
          <div className="mb-5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 p-3 text-xs space-y-1">
            <div className="flex justify-between gap-2">
              <span className="text-zinc-500">Поточне завершення</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100">
                {fmt(currentEnd)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-zinc-500">Максимум до (+{MAX_PROLONG_HOURS} год від зараз)</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {fmt(maxEnd)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mb-5 text-xs text-red-500 text-center">
            {!currentEnd
              ? "У тендера не вказано час завершення — пролонгація неможлива."
              : `Поточне завершення тендера вже пізніше за дозволений максимум (+${MAX_PROLONG_HOURS} год від зараз) — пролонгація неможлива.`}
          </p>
        )}

        <div className="space-y-6">
          <FormProvider {...methods}>
            <InputDateWithTime
              name="time"
              control={control}
              label="Новий час завершення"
              required
              minDate={currentEnd ?? undefined}
              maxDate={maxEnd ?? undefined}
            />
          </FormProvider>

          {error && (
            <p className="text-[11px] font-semibold text-red-500 -mt-3">
              {error}
            </p>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200/50 dark:shadow-none active:scale-95",
                canSubmit
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none",
              )}
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Пролонгувати"
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
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
