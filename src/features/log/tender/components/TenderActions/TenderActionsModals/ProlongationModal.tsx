"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Loader2 } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";

import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";
import api from "@/shared/api/instance.api";
import { useSaveTender } from "@/features/log/hooks/useSaveTender";
import { buildProlongTenderDto } from "@/features/log/tender/copy/buildCopyTenderDto";
import { cn } from "@/shared/utils";

export const ProlongationModal = ({
  tender,
  onClose,
}: {
  // Обʼєкт тендера з картки (щонайменше id та time_end для префілу).
  tender: any;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutateAsync: saveTender, isPending } = useSaveTender();

  const methods = useForm({
    defaultValues: {
      // Префіл — поточний час завершення тендера.
      time: tender?.time_end ? new Date(tender.time_end) : (null as Date | null),
    },
  });

  const { watch, control } = methods;
  const newTime = watch("time");
  const busy = loading || isPending;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  const handleProlong = async () => {
    if (!newTime || busy) return;
    try {
      setLoading(true);

      // Беремо ПОВНИЙ запис тендера (як форма редагування), щоб tender_save
      // оновив лише час завершення й не затер інші поля.
      const { data } = await api.get(`/tender/${tender.id}`);
      const full = data?.content?.[0];
      if (!full) {
        toast.error("Не вдалося завантажити тендер");
        return;
      }

      const dto = buildProlongTenderDto(full, newTime);
      await saveTender(dto);
      onClose();
    } catch (e: any) {
      // Помилка zod-валідації або мережі.
      const msg =
        e?.errors?.[0]?.message ||
        e?.response?.data?.message ||
        "Не вдалося продовжити тендер";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      data-prolongation-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
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
            Продовжити тендер
          </h3>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">
            Тендер #{tender?.id}
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
              disabled={!newTime || busy}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200/50 dark:shadow-none active:scale-95",
                !newTime || busy
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700",
              )}
            >
              {busy ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Продовжити тендер"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={busy}
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
