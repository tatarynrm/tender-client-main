// import { useState, useEffect } from "react";
// import { intervalToDuration } from "date-fns";

// export const TenderTimer = ({ endTime }: { endTime: string }) => {
//   const [timeLeft, setTimeLeft] = useState<string>("");
//   const [isUrgent, setIsUrgent] = useState<boolean>(false);

//   useEffect(() => {
//     const calculateTime = () => {
//       const now = new Date();
//       const end = new Date(endTime);
//       const diff = end.getTime() - now.getTime();

//       if (diff <= 0) {
//         setTimeLeft("Завершено");
//         return;
//       }

//       // Визначаємо терміновість (менше 5 хвилин)
//       setIsUrgent(diff < 5 * 60 * 1000);

//       const duration = intervalToDuration({ start: now, end });

//       const pad = (num: number | undefined) =>
//         String(num ?? 0).padStart(2, "0");

//       const parts = [];
//       if (duration.days) parts.push(`${duration.days}д`);

//       // Додаємо години, хвилини та секунди у форматі 00:00:00
//       const hms = [
//         pad(duration.hours),
//         pad(duration.minutes),
//         pad(duration.seconds),
//       ].join(":");

//       parts.push(hms);
//       setTimeLeft(parts.join(" "));
//     };

//     calculateTime();
//     const timer = setInterval(calculateTime, 1000); // Оновлення щосекунди

//     return () => clearInterval(timer);
//   }, [endTime]);

//   if (timeLeft === "Завершено") return null;

//   return (
//     <div
//       className={`
//       flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-colors duration-500
//       ${
//         isUrgent
//           ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
//           : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50"
//       }
//     `}
//     >
//       <div className="flex flex-col items-end leading-none">
//         <span
//           className={`
//           text-[8px] uppercase font-black tracking-wider
//           ${
//             isUrgent
//               ? "text-rose-600 dark:text-rose-500"
//               : "text-orange-600 dark:text-orange-500"
//           }
//         `}
//         >
//           Залишилось
//         </span>
//         <span
//           className={`
//           text-[11px] font-mono font-black animate-pulse
//           ${
//             isUrgent
//               ? "text-rose-700 dark:text-rose-400"
//               : "text-orange-700 dark:text-orange-400"
//           }
//         `}
//         >
//           {timeLeft}
//         </span>
//       </div>
//     </div>
//   );
// };
import { useState, useEffect } from "react";
import { intervalToDuration, isBefore } from "date-fns";
import { cn } from "@/shared/utils";

interface ITimerProps {
  targetDate: string;
  label: string;
  variant: "start" | "end";
}

export const TenderTimer = ({ 
  targetDate, 
  label, 
  variant = "orange" 
}: { 
  targetDate: string; 
  label: string; 
  variant?: "orange" | "blue" 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const end = new Date(targetDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const duration = intervalToDuration({ start: now, end });
      const pad = (num: number | undefined) => String(num ?? 0).padStart(2, "0");

      const hms = [
        pad(duration.hours),
        pad(duration.minutes),
        pad(duration.seconds)
      ].join(":");

      const result = duration.days ? `${duration.days}д ${hms}` : hms;
      setTimeLeft(result);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const styles = {
    orange: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 text-orange-600",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-600"
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm", styles[variant])}>
      <div className="flex flex-col items-end leading-none">
        <span className="text-[8px] uppercase font-black tracking-wider opacity-80">{label}</span>
        <span className="text-[11px] font-mono font-black animate-pulse">
          {timeLeft}
        </span>
      </div>
    </div>
  );
};