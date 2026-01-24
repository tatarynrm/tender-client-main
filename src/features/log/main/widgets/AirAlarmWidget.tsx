"use client";

import React, { useState } from "react";
import { ShieldAlert, Map, X } from "lucide-react";
import { cn } from "@/shared/utils";

export const AirAlarmWidget = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div className="relative">
      {/* Кнопка в хедері */}
      <button
        onClick={() => setIsMapOpen(true)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-0.5 rounded-xl border transition-all active:scale-95 shadow-sm",
          "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-red-400 dark:hover:border-red-500 group"
        )}
      >
        <div className="p-1 bg-red-50 dark:bg-red-500/10 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
          <ShieldAlert size={14} className="text-red-500 group-hover:text-white" />
        </div>

        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">
            Карта тривог
          </span>
          <span className="text-[8px] opacity-60 font-bold uppercase text-slate-500 dark:text-slate-400">
            Україна
          </span>
        </div>

        <Map size={12} className="ml-1 opacity-30 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Модальне вікно (рендер на весь екран) */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 cursor-zoom-out" 
            onClick={() => setIsMapOpen(false)} 
          />
          
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Header модалки */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Оперативна карта повітряних тривог
                </h3>
              </div>
              <button
                onClick={() => setIsMapOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Контент карти */}
            <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-950">
              <iframe
                src="https://alerts.in.ua/"
                className="w-full h-full border-none"
                title="Air Alarm Map Ukraine"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};