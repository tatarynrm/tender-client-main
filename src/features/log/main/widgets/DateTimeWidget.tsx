"use client";
import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export const DateTimeWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm divide-x divide-slate-100 dark:divide-white/5 overflow-hidden w-full">
      <div className="flex items-center gap-2.5 px-3 py-1.5 min-w-[105px] justify-center">
        <Clock size={13} className="text-blue-500 shrink-0" />
        <span className="text-xs font-black tabular-nums whitespace-nowrap">
          {time.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 dark:bg-white/[0.02] min-w-[75px] justify-center">
        <Calendar size={13} className="text-slate-400 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {time.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
};