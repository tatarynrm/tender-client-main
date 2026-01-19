import { cn } from "@/shared/utils";
import { differenceInMinutes } from "date-fns";

// Окремий компонент для верхньої кольорової смужки
export const StatusIndicator = ({ updatedAt }: { updatedAt: string | null }) => {
  if (!updatedAt) return null;

  const diffInMinutes = differenceInMinutes(new Date(), new Date(updatedAt));
  
  let bgColor = "bg-red-500"; // Дефолт (більше 3 годин)
  
  if (diffInMinutes < 60) {
    bgColor = "bg-emerald-500"; // Менше 1 години
  } else if (diffInMinutes >= 120 && diffInMinutes <= 180) {
    bgColor = "bg-amber-500"; // Від 2 до 3 годин
  } else if (diffInMinutes >= 60 && diffInMinutes < 120) {
    bgColor = "bg-blue-400"; // Проміжок між 1 та 2 годинами (можна змінити на інший колір)
  }

  return (
    <div className={cn("absolute top-0 left-0 right-0 h-1 z-10", bgColor)} />
  );
};