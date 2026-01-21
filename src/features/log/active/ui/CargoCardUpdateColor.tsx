import { cn } from "@/shared/utils";
import { differenceInMinutes } from "date-fns";

// Окремий компонент для верхньої кольорової смужки
export const StatusIndicator = ({ updatedAt }: { updatedAt: string | null }) => {
  if (!updatedAt) return null;

  const diffInMinutes = differenceInMinutes(new Date(), new Date(updatedAt));
  
  let bgColor = "";

  if (diffInMinutes < 60) {
    // До 1 години — Зелений
    bgColor = "bg-emerald-500";
  } else if (diffInMinutes < 180) {
    // Від 1 до 3 годин (60-179 хв) — Оранжевий
    bgColor = "bg-orange-300";
  } else {
    // Більше 3 годин (180+ хв) — Червоний
    bgColor = "bg-red-500";
  }

  return (
    <div className={cn("absolute top-0 left-0 right-0 h-1 z-10", bgColor)} />
  );
};