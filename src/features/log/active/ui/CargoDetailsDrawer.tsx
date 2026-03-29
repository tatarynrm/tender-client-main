"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CargoMap } from "./CargoMap";
import { LoadApiItem } from "../../types/load.type";
import {
  User,
  Building2,
  Info,
  Calendar,
  Activity,
  X,
  Map as MapIcon,
  Copy,
  DollarSign,
  Boxes,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { getRegionName } from "@/shared/utils/region.utils";
import { formatTenderDate } from "@/shared/utils/date.utils";

interface CargoDetailsDrawerProps {
  cargo?: LoadApiItem;
  open: boolean;
  onClose: () => void;
}

export function CargoDetailsDrawer({
  cargo,
  open,
  onClose,
}: CargoDetailsDrawerProps) {
  const [mounted, setMounted] = useState(false);

  // Гідратація для SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокування скролу при відкритті
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!mounted || !cargo) return null;

  const content = (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-end transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Backdrop (Затемнення) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-[1240px] bg-white dark:bg-zinc-950 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out",
          "h-[90vh] lg:h-[85vh] rounded-[32px] flex flex-col overflow-hidden",
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-8",
        )}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-500/20">
               <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                 № {cargo.id}
               </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          {/* ЛІВА ПАНЕЛЬ: Інформація */}
          <div className="w-full lg:w-[420px] bg-white dark:bg-zinc-950 flex flex-col shrink-0 border-r border-zinc-100 dark:border-zinc-900 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">
              
              {/* ДОДАТКОВА ІНФОРМАЦІЯ (Amber Card) */}
              <div className="bg-amber-50/80 dark:bg-amber-500/5 p-5 rounded-[2rem] border border-amber-100/50 dark:border-amber-500/10 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-amber-500 rounded-lg p-1.5 shrink-0 shadow-sm shadow-amber-500/20">
                    <Info size={14} className="text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest leading-none">
                    Додаткова інформація
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed font-bold text-amber-900/80 dark:text-amber-200/80 whitespace-pre-wrap">
                  {cargo.load_info || "Додаткові умови обговорюються при завантаженні."}
                </p>
              </div>

              {/* INFO BLOCKS: Manager, Company, Price */}
              <div className="space-y-3">
                {/* Менеджер */}
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-[1.5rem] border border-zinc-100/50 dark:border-white/5 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                    <User size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 leading-none">Менеджер</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white uppercase leading-tight">{cargo.author || "—"}</span>
                  </div>
                </div>

                {/* Компанія */}
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-[1.5rem] border border-zinc-100/50 dark:border-white/5 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 leading-none">Компанія</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white uppercase leading-tight truncate">{cargo.company_name || "—"}</span>
                  </div>
                </div>

                {/* Ціна */}
                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-[1.5rem] border border-emerald-500/20 group hover:bg-emerald-500/15 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-emerald-500 shadow-sm">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-0.5 leading-none">Ціна</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                      {cargo.price ? (
                         `${cargo.price.toLocaleString()} ${cargo.valut_name}`
                      ) : "Запит"}
                    </span>
                  </div>
                </div>
              </div>

              {/* МАРШРУТ (Timeline) */}
              <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Маршрут</h4>
                <div className="relative pl-10 space-y-10">
                  {/* Timeline Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-indigo-100 dark:bg-indigo-900/30" />

                  {/* Point From */}
                  <div className="relative">
                    <div className="absolute -left-[32px] top-0 w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1 leading-none">Завантаження</span>
                      <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
                        {cargo.crm_load_route_from.map((f) => f.city).join(" — ")}
                        {cargo.crm_load_route_from[0]?.ids_region && (
                          <span className="text-zinc-400 font-bold ml-1 text-sm">({getRegionName(cargo.crm_load_route_from[0].ids_region)})</span>
                        )}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1.5">{cargo.crm_load_route_from[0]?.ids_country} • {formatTenderDate(cargo.date_load)}</p>
                    </div>
                  </div>
 
                  {/* Point To */}
                  <div className="relative">
                    <div className="absolute -left-[32px] top-0 w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-1 leading-none">Розвантаження</span>
                      <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
                        {cargo.crm_load_route_to.map((t) => t.city).join(" — ")}
                        {cargo.crm_load_route_to[0]?.ids_region && (
                          <span className="text-zinc-400 font-bold ml-1 text-sm">({getRegionName(cargo.crm_load_route_to[0].ids_region)})</span>
                        )}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1.5">{cargo.crm_load_route_to[0]?.ids_country} • {formatTenderDate(cargo.date_unload)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Stats inside Sidebar */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 pt-5 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-4 gap-2">
              {[
                { v: cargo.car_count_actual, l: "Акт.", c: "text-indigo-600 bg-indigo-50" },
                { v: cargo.car_count_add, l: "Дод.", c: "text-zinc-500 bg-zinc-100" },
                { v: cargo.car_count_closed, l: "Закр.", c: "text-emerald-600 bg-emerald-50" },
                { v: cargo.car_count_canceled, l: "Відм.", c: "text-rose-600 bg-rose-50" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.l}</span>
                  <div className={cn("w-full py-1.5 rounded-lg text-center font-black text-sm tabular-nums transition-transform hover:scale-105", item.c + " dark:bg-white/5 dark:text-zinc-400")}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ПРАВА ПАНЕЛЬ: Карта */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative min-h-[400px]">
            <CargoMap cargo={cargo} />
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/80 dark:bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                <MapIcon size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase dark:text-white">
                  Інтерактивна карта
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
