import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import Flag from "react-flagkit";

interface RoutePointProps {
  point: any;
  isMain?: boolean;
}

export const RoutePoint = ({ point, isMain = false }: RoutePointProps) => {
  if (!point) return null;

  const isUkraine = point.country === "UA" || !point.country;
  const isLoad = point.ids_route_type === "LOAD_FROM";

  // Формуємо чистий рядок адреси
  const fullAddress = [
    point.country,
    point.region,
    point.city,
    point.street,
    point.house,
    point.post_code
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer group/point">
            <Flag
              country={point.country || "UA"}
              size={isUkraine ? 14 : 14}
              className={cn(
                "shrink-0 transition-transform group-hover/point:scale-110",
                !isUkraine ? "rounded-none shadow-sm" : "rounded-sm",
              )}
            />
            <div
              className={cn(
                "rounded-full shrink-0 transition-all duration-300",
                isMain ? "w-2.5 h-2.5" : "w-1.5 h-1.5",
                isLoad
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
              )}
            />
            <span
              className={cn(
                "font-black truncate tracking-tight",
                isMain
                  ? "text-[16px] text-zinc-800 dark:text-zinc-100"
                  : "text-[11px] text-zinc-400 font-bold",
              )}
            >
              {point.city}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-white dark:bg-slate-800 border-zinc-200 dark:border-zinc-700 p-2 shadow-xl"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-700 pb-1 mb-1">
              <Flag country={point.country || "UA"} size={14} />
              <span className="text-[10px] uppercase font-black text-zinc-400 ">
                Детальна інформація
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 max-w-[200px] leading-snug">
              {fullAddress}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
