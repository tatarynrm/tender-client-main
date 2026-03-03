import { useState, useEffect } from "react";
import { intervalToDuration } from "date-fns";
import { cn } from "@/shared/utils";

interface TenderTimerProps {
  targetDate: string | Date | null | undefined;
  label: string;
  variant?: "orange" | "blue";
}

export const TenderTimer = ({
  targetDate,
  label,
  variant = "orange",
}: TenderTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    // Якщо дати немає, відразу виходимо
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const end = new Date(targetDate);

      if (isNaN(end.getTime())) {
        setTimeLeft(null);
        return;
      }

      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const duration = intervalToDuration({ start: now, end });
      const pad = (num: number | undefined) => String(num ?? 0).padStart(2, "0");

      const hms = [
        pad(duration.hours),
        pad(duration.minutes),
        pad(duration.seconds),
      ].join(":");

      // Додаємо роки/місяці якщо потрібно, або тільки дні
      const daysStr = duration.days ? `${duration.days}д ` : "";
      const monthsStr = duration.months ? `${duration.months}м ` : "";
      
      setTimeLeft(`${monthsStr}${daysStr}${hms}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const styles = {
    orange: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-all animate-in fade-in",
      styles[variant]
    )}>
      <div className="flex flex-col items-end leading-none">
        {label && (
          <span className="text-[8px] uppercase font-black tracking-wider opacity-80 whitespace-nowrap">
            {label}
          </span>
        )}
        <span className="text-[11px] font-mono font-black animate-pulse">
          {timeLeft}
        </span>
      </div>
    </div>
  );
};