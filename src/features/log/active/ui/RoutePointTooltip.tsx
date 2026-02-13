import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import Flag from "react-flagkit";

// Визначаємо інтерфейс, який приймає і string, і null, і undefined
interface RoutePointProps {
  point: {
    country?: string | null;
    region?: string | null;
    city?: string | null;
    street?: string | null;
    house?: string | null;
    post_code?: string | null;
    ids_route_type?: string | null;
  };
  isMain?: boolean;
}

export const RoutePoint = ({ point, isMain = false }: RoutePointProps) => {
  if (!point) return null;

  // Використовуємо оператор ?? для заміни null на дефолтне значення
  const countryCode = point.country ?? "UA";
  const isUkraine = countryCode === "UA";
  const isLoad = point.ids_route_type === "LOAD_FROM";

  const fullAddress = useMemo(() => {
    return [
      point.country,
      point.region,
      point.city,
      point.street,
      point.house,
      point.post_code,
    ]
      .filter((item): item is string => Boolean(item)) // Фільтруємо null, undefined та порожні рядки
      .join(", ");
  }, [point]);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer group/point w-fit">
            <Flag
              country={countryCode}
              size={14}
              className={cn(
                "shrink-0 transition-transform group-hover/point:scale-110",
                isUkraine ? "rounded-sm" : "rounded-none shadow-sm"
              )}
            />

            <div
              className={cn(
                "rounded-full shrink-0 transition-all duration-300",
                isMain ? "w-2.5 h-2.5" : "w-2 h-2",
                isLoad
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              )}
            />

            <span
              className={cn(
                "font-black truncate tracking-tight flex items-baseline gap-1",
                isMain
                  ? "text-[16px] text-zinc-800 dark:text-zinc-100"
                  : "text-[14px] text-zinc-700 dark:text-zinc-100 font-bold"
              )}
            >
              {point.city}
              
              {point.country && (
                <span className="text-[10px] font-bold opacity-60 uppercase">
                  ({point.country})
                </span>
              )}
            </span>
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          className="bg-white dark:bg-slate-800 border-zinc-200 dark:border-zinc-700 p-2 shadow-xl z-50"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-700 pb-1 mb-1">
              <Flag country={countryCode} size={14} />
              <span className="text-[10px] uppercase font-black text-zinc-400">
                Детальна інформація
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-600 dark:text-white max-w-[220px] leading-snug">
              {fullAddress}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};