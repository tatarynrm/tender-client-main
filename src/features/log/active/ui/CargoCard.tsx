"use client";

import React from "react";
import { format } from "date-fns";
import {
  MessageCircle,
  History,
  Info,
  Truck,
  CheckCircle2,
  XCircle,
  Copy,
  Map,
  Boxes,
  CircleDollarSign,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { Dropdowns, LoadApiItem } from "../../types/load.type";
import { CargoActions } from "./CargoActions";
import { StatusIndicator } from "./CargoCardUpdateColor";
import { RoutePoint } from "./RoutePointTooltip";
import { CargoCardModals } from "./CargoCardModals";
import { EVENT_LABELS, useCargoCard } from "../hooks/useCargoCard";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
}

export function CargoCard({ load, filters }: CargoCardProps) {
  const { config, size } = useFontSize(); // Отримуємо динамічний конфіг
  const ctrl = useCargoCard(load);
  const {
    profile,
    isOnline,
    isJustCreated,
    lastEvent,
    isShaking,
    firstPoint,
    lastPoint,
    middlePoints,
    canDelete,
    hasUnreadMessages,
    handleCopyLoad,
    handleOpenGoogleMaps,
  } = ctrl;

  // ── Shared class tokens ────────────────────────────────────────────────────
  const dateCellCls =
    "bg-white dark:bg-slate-900 py-1.5 px-4 flex gap-2 items-center justify-center sm:justify-start";
  const footerBtnCls =
    "p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-400 transition-colors";

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700",
          isJustCreated && "animate-in fade-in slide-in-from-bottom-1",
          isShaking && "animate-shake border-blue-500",
        )}
      >
        <StatusIndicator updatedAt={load.updated_at} />
        {/* ЕФЕКТНИЙ БЕЙДЖ ПОДІЇ */}
        <div
          className={cn(
            "absolute top-2 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-500",
            lastEvent
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4",
          )}
        >
          <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-400/50 uppercase tracking-widest whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            {EVENT_LABELS[lastEvent || ""] || "Оновлення"}
          </div>
        </div>
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 gap-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 min-w-0 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={cn(
                "flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md bg-blue-600 text-white font-bold tracking-wider shrink-0",
                config.label, // ДИНАМІЧНИЙ РОЗМІР
              )}
            >
              {load.id}
            </span>

            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full shrink-0">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isOnline
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-zinc-300 dark:bg-zinc-600",
                  )}
                />
                <span
                  className={cn(
                    "font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter",
                    config.label,
                  )}
                >
                  {load.author}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden group/marquee">
                <span className="text-zinc-300 dark:text-zinc-700 shrink-0">
                  |
                </span>
                <div className="relative overflow-hidden w-full h-5 flex items-center cursor-help">
                  <div
                    className="flex whitespace-nowrap transition-transform duration-[2000ms] ease-in-out w-max"
                    onMouseEnter={(e) => {
                      const t = e.currentTarget;
                      const p = t.parentElement;
                      if (p && t.scrollWidth > p.offsetWidth) {
                        t.style.transform = `translateX(-${t.scrollWidth - p.offsetWidth + 10}px)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span
                      className={cn(
                        "font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide",
                        config.main,
                      )}
                    >
                      {load.company_name || "-----"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <div className="hidden md:flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              <History size={config.icon - 4} strokeWidth={2.5} />
              <span className={cn("font-medium tabular-nums", config.label)}>
                {load.created_at
                  ? format(new Date(load.created_at), "dd.MM HH:mm")
                  : "—"}
              </span>
            </div>

            <div className="flex items-center border-l border-zinc-100 dark:border-zinc-800 pl-2">
              <CargoActions
                load={load}
                profile={profile}
                onAddCars={() => ctrl.setOpenAddCars(true)}
                onRemoveCars={() => ctrl.setOpenRemoveCars(true)}
                onCloseCargo={() => ctrl.setOpenCloseCargoByManager(true)}
                canDelete={canDelete}
              />
            </div>
          </div>
        </div>

        {/* DATES BAR */}
        <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 font-bold">
          <div className={dateCellCls}>
            <span className={cn("text-zinc-400 uppercase", config.label)}>
              Зав.:
            </span>
            <span
              className={cn(
                "text-emerald-600 dark:text-emerald-500",
                config.main,
              )}
            >
              {load.date_load ? format(new Date(load.date_load), "dd.MM") : "—"}
              {load.date_load2 && (
                <>
                  <span className="mx-1 text-zinc-300">—</span>
                  {format(new Date(load.date_load2), "dd.MM")}
                </>
              )}
            </span>
          </div>
          <div className={dateCellCls}>
            <span className={cn("text-zinc-400 uppercase", config.label)}>
              Розв.:
            </span>
            <span
              className={cn("text-blue-600 dark:text-blue-400", config.main)}
            >
              {load.date_unload
                ? format(new Date(load.date_unload), "dd.MM")
                : "—"}
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
          <div className="flex-[1.5] flex flex-col gap-0.5 min-w-0">
            <div className="flex-[1.5] flex flex-col min-w-0 ">
              <RoutePoint point={firstPoint} isMain />
              <div
                className={cn(
                  "ml-[25px] border-l border-dashed flex flex-col gap-1.5 py-1",
                  firstPoint?.ids_route_type === "LOAD_FROM"
                    ? "border-emerald-300 dark:border-emerald-900/50"
                    : "border-blue-300 dark:border-blue-900/50",
                )}
              >
                {middlePoints.map((p, i) => (
                  <div key={i} className="pl-3">
                    <RoutePoint point={p} />
                  </div>
                ))}
              </div>
              <RoutePoint point={lastPoint} isMain />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <div
                className={cn(
                  "px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 font-black uppercase tracking-wider",
                  config.label,
                )}
              >
                {load.crm_load_trailer?.length > 0
                  ? load.crm_load_trailer
                    .map((t) => t.trailer_type_name)
                    .join(", ")
                  : "ТЕНТ"}
              </div>
              <div
                className={cn(
                  "px-2.5 py-0.5 text-white rounded font-black",
                  config.label,
                )}
              >
                {load.price ? (
                  <span className="bg-blue-500 p-1 rounded-xl">{`${load.price.toLocaleString()} ${load.valut_name}`}</span>
                ) : (
                  <span className="bg-red-500 p-1 rounded-xl">
                    Ціна не вказана
                  </span>
                )}
              </div>

              <div className="flex items-center text-center">
                {load.is_collective && (
                  <span title="Збірний вантаж">
                    <Boxes className="text-blue-500 ml-1" />
                  </span>
                )}
                {load.is_price_request && (
                  <span title="Запит ціни">
                    {" "}
                    <CircleDollarSign className="text-green-500 ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* column divider */}
          <div className="hidden md:block w-px bg-zinc-100 dark:bg-zinc-800" />

          <div className="flex-1 flex flex-col min-w-0">
            <h3
              className={cn(
                "text-zinc-400 font-bold uppercase tracking-widest mb-1.5",
                config.label,
              )}
            >
              Інформація
            </h3>
            <div
              className={cn(
                "text-zinc-500 dark:text-zinc-400 leading-snug overflow-y-auto max-h-[160px] pr-1 scrollbar-thin break-words whitespace-pre-wrap",
                config.main,
              )}
            >
              {load.load_info || "---"}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex gap-1.5">
            {[
              {
                icon: Truck,
                val: load.car_count_actual,
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: CheckCircle2,
                val: load.car_count_closed,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                icon: XCircle,
                val: load.car_count_canceled,
                color: "text-red-500 bg-red-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg dark:bg-zinc-800/50",
                  stat.color,
                )}
              >
                <stat.icon size={config.icon - 2} />
                <span className={cn("font-bold", config.main)}>{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[
              {
                icon: Map,
                onClick: handleOpenGoogleMaps,
                title: "Переглянути на GoogleMaps",
                hover: "hover:text-emerald-500",
              },
              {
                icon: Copy,
                onClick: handleCopyLoad,
                title: "Копіювати",
                hover: "hover:text-emerald-500",
              },
              {
                icon: History,
                onClick: () => ctrl.setOpenHistory(true),
                title: "Історія",
                hover: "hover:text-blue-500",
              },
              {
                icon: Info,
                onClick: () => ctrl.setSelectedCargo(load),
                title: "Інфо",
                hover: "hover:text-blue-500",
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                className={cn(footerBtnCls, btn.hover)}
              >
                <btn.icon size={config.icon - 2} />
              </button>
            ))}
            <button
              onClick={() => ctrl.setChatCargo(load)}
              className={cn(
                footerBtnCls,
                "relative hover:bg-zinc-50 dark:hover:bg-slate-700",
              )}
            >
              <MessageCircle size={config.icon - 2} className="text-zinc-400" />
              {load.comment_count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900",
                    size === "xs"
                      ? "w-4 h-4 text-[9px]"
                      : "w-5 h-5 text-[10px]",
                  )}
                >
                  {load.comment_count}
                </span>
              )}
              {hasUnreadMessages && (
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      <CargoCardModals load={load} filters={filters} ctrl={ctrl} />
    </>
  );
}
