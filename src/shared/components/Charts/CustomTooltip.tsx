"use client";

import { useFontSize } from "@/shared/providers/FontSizeProvider";

export const CustomTooltip = ({ active, payload, label }: any) => {
  const { config } = useFontSize();

  if (active && payload && payload.length) {
    return (
      <div
        className="
        bg-white/90 dark:bg-zinc-900/90 
        backdrop-blur-xl 
        border border-zinc-200 dark:border-white/10 
        p-4 rounded-2xl shadow-2xl 
        ring-1 ring-black/5 dark:ring-white/5 
        animate-in zoom-in-95 duration-200"
      >
        <p
          className={`${config.label} font-bold text-zinc-500 dark:text-zinc-400 mb-2 border-b border-zinc-100 dark:border-white/5 pb-1`}
        >
          {label}
        </p>

        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            // ВИПРАВЛЕННЯ: якщо в color прийшов градієнт url(...), 
            // беремо колір з stroke або шукаємо в об'єкті payload
            const indicatorColor = entry.stroke || entry.payload.fill || entry.color;

            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ 
                    backgroundColor: indicatorColor,
                    boxShadow: `0 0 8px ${indicatorColor}40` // додаємо легке свічення
                  }}
                />
                <div className="flex flex-col">
                  <span
                    className={`${config.label} text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-black tracking-wider`}
                  >
                    {entry.name}
                  </span>
                  <span
                    className={`${config.main} font-bold text-zinc-900 dark:text-white`}
                  >
                    {entry.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};