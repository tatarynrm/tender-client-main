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
} from "lucide-react";
import { cn } from "@/shared/utils";

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

      {/* Drawer Panel */}
      <div
        className={cn(
          "relative w-full lg:max-w-[1200px] bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-500 ease-out",
          "h-[90vh] lg:h-[85vh] rounded-t-[24px] flex flex-col overflow-hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Decorative Handle */}
        <div className="mx-auto w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mt-3 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 w-1.5 h-6 rounded-full" />
            <h2 className="text-2xl font-black tracking-tight dark:text-white">
              Вантаж <span className="text-blue-600">#{cargo.id}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X size={24} className="text-zinc-500" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          {/* ЛІВА ПАНЕЛЬ: Інформація */}
          <div className="w-full lg:w-[450px] p-1 space-y-6 lg:overflow-y-auto border-r border-zinc-100 dark:border-zinc-900 custom-scrollbar">
            {/* Load Info - ВЕРТИКАЛЬНЕ КОМПОНУВАННЯ */}
            {cargo.load_info && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 shadow-sm">
                <div className="flex flex-col gap-3">
                  {/* Шапка блоку з іконкою та заголовком */}
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-500 rounded-lg p-1.5 shrink-0 shadow-sm shadow-amber-500/20">
                      <Info size={16} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest">
                      Додаткова інформація
                    </p>
                  </div>

                  {/* Текстова частина */}
                  <div className="space-y-1 pl-1">
                    <p className="text-[14px] leading-relaxed font-semibold text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                      {cargo.load_info}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Менеджер та Компанія */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mb-2">
                  Менеджер
                </p>
                <div className="flex items-center gap-2 font-bold dark:text-white">
                  <User size={16} className="text-blue-500" />{" "}
                  {cargo.author || "—"}
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mb-2">
                  Компанія
                </p>
                <div className="flex items-center gap-2 font-bold dark:text-white truncate">
                  <Building2 size={16} className="text-blue-500" />{" "}
                  {cargo.company_name || "—"}
                </div>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mb-1">
                Ставка / Оплата
              </p>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                  <DollarSign
                    size={18}
                    className="text-emerald-600 dark:text-emerald-500"
                  />
                </div>
                <p className="text-xl font-black dark:text-white tabular-nums">
                  {cargo.price ? (
                    `${cargo.price.toLocaleString()} ${cargo.valut_name}`
                  ) : (
                    <span className="font-bold text-red-500">
                      Ціна перевезення не вказана
                    </span>
                  )}
                </p>
              </div>
            </div>
            {/* Маршрут */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative">
              <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      Звідки
                    </p>
                    <p className="text-sm font-black dark:text-white uppercase leading-tight">
                      {cargo.crm_load_route_from.map((f) => f.city).join(" • ")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      Куди
                    </p>
                    <p className="text-sm font-black dark:text-white uppercase leading-tight">
                      {cargo.crm_load_route_to.map((t) => t.city).join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-zinc-900 p-4 rounded-2xl shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    v: cargo.car_count_actual,
                    l: "Актуальні",
                    c: "text-blue-400",
                  },
                  { v: cargo.car_count_add, l: "Додано", c: "text-zinc-400" },

                  {
                    v: cargo.car_count_closed,
                    l: "Закрито",
                    c: "text-emerald-400",
                  },
                  {
                    v: cargo.car_count_canceled,
                    l: "Відмінено",
                    c: "text-red-400",
                  },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[9px] font-black uppercase text-zinc-500">
                      {item.l}
                    </p>
                    <p
                      className={cn("text-xl font-black tabular-nums", item.c)}
                    >
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>
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
