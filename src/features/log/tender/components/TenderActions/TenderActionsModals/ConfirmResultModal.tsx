"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { Loader2, BellRing, AlertCircle } from "lucide-react";

export const ConfirmResultModal = ({
  tenderId,
  onClose,
  onConfirm,
  isPending,
}: {
  tenderId: string | number;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      data-notification-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border border-zinc-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-500/5">
            <BellRing className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          </div>

          <h3 className="text-2xl font-black mb-2 text-zinc-900 dark:text-zinc-100">
            Надіслати результати?
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed px-4">
            Ви збираєтесь надіслати офіційні результати тендеру{" "}
            <span className="font-bold text-zinc-900 dark:text-zinc-200">
              #{tenderId}
            </span>
            . Сповіщення отримають{" "}
            <span className="font-bold text-emerald-600">
              всі учасники даного тендеру
            </span>
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 dark:shadow-none",
                isPending
                  ? "bg-zinc-200 dark:bg-zinc-800 cursor-not-allowed text-zinc-400"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]",
              )}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Так, надіслати всім</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isPending}
              className="w-full h-12 text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5" />
          <p className="text-[10px] leading-normal text-zinc-500 dark:text-zinc-400 font-medium">
            Ця дія запустить автоматичну розсилку у Веб-інтерфейс, Telegram та
            на Email згідно з налаштованими шаблонами системи.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};
