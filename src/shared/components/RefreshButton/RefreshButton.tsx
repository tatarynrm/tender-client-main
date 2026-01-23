"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "../ui";
import { toast } from "sonner";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

interface RefreshButtonProps {
  autoRefreshInterval?: number;
  className?: string;
}

export const RefreshButton = ({
  autoRefreshInterval,
  className,
}: RefreshButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Стейт для ліміту запитів (не зберігаємо в LS, щоб дати шанс після рефрешу)
  const [clickCount, setClickCount] = useState(0);
  
  // Зберігаємо в LS час, КОЛИ розблокувати кнопку (timestamp)
  const [unlockTime, setUnlockTime] = useLocalStorage<number | null>("refresh-unlock-timestamp", null);
  
  const [countdown, setCountdown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Логіка ініціалізації та таймера
  useEffect(() => {
    const checkLock = () => {
      if (!unlockTime) {
        setIsLocked(false);
        setCountdown(0);
        return;
      }

      const now = Date.now();
      const remaining = Math.ceil((unlockTime - now) / 1000);

      if (remaining > 0) {
        setIsLocked(true);
        setCountdown(remaining);
      } else {
        setIsLocked(false);
        setCountdown(0);
        setUnlockTime(null);
      }
    };

    checkLock(); // Перевірка при монті
    
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, [unlockTime, setUnlockTime]);

  const handleRefresh = () => {
    if (isLocked) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      const lockUntil = Date.now() + 20000; // 20 секунд від тепер
      setUnlockTime(lockUntil);
      setClickCount(0);
      toast.warning("Забагато запитів", {
        description: "Кнопку заблоковано на 20 секунд для запобігання спаму.",
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  // Скидання лічильника кліків (м'який ліміт)
  useEffect(() => {
    if (clickCount > 0 && !isLocked) {
      const timeout = setTimeout(() => setClickCount(0), 10000);
      return () => clearTimeout(timeout);
    }
  }, [clickCount, isLocked]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      disabled={isPending || isLocked}
      className={cn(
        "relative flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm",
        "bg-white dark:bg-slate-900 text-slate-400 transition-all active:scale-95",
        !isLocked && "hover:text-blue-500 hover:border-blue-200",
        isLocked && "cursor-not-allowed border-amber-200 bg-amber-50/30 dark:bg-amber-500/5",
        className,
      )}
      title={isLocked ? `Оновлення заблоковано на ${countdown}с` : "Оновити дані"}
    >
      {isLocked ? (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 tabular-nums leading-none">
            {countdown}
          </span>
          <span className="text-[7px] font-bold text-amber-600/70 uppercase leading-none mt-0.5">
            sec
          </span>
        </div>
      ) : (
        <RefreshCcw size={14} className={cn(isPending && "animate-spin")} />
      )}

      {/* Індикатор кліків */}
      {!isLocked && clickCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 border border-white dark:border-slate-900"></span>
        </span>
      )}
    </Button>
  );
};