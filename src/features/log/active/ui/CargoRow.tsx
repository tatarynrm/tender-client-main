"use client";

import React from "react";
import { format } from "date-fns";
import Flag from "react-flagkit";
import {
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  History,
  Info,
  Map,
  MessageCircle,
  Truck,
  XCircle,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

import { Dropdowns, LoadApiItem, LoadRouteItem } from "../../types/load.type";
import { CargoActions } from "./CargoActions";
import { StatusIndicator } from "./CargoCardUpdateColor";
import { CargoCardModals } from "./CargoCardModals";
import { EVENT_LABELS, useCargoCard } from "../hooks/useCargoCard";
import { CARGO_COL } from "./cargoColumns";

interface CargoRowProps {
  load: LoadApiItem;
  filters?: Dropdowns;
}

const fmt = (date?: string | Date | null) =>
  date ? format(new Date(date), "dd.MM") : null;

/**
 * Клітинка полоски. Від 1000px — колонка таблиці, нижче — рядок
 * «підпис ліворуч, значення праворуч», щоб картка читалась на планшеті.
 */
const Cell = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 px-3 py-2 min-w-0",
      "min-[1000px]:flex-col min-[1000px]:justify-center min-[1000px]:gap-1 min-[1000px]:p-2 min-[1000px]:h-full min-[1000px]:overflow-hidden",
      className,
    )}
  >
    <span className="min-[1000px]:hidden shrink-0 text-[10px] font-black uppercase tracking-widest text-zinc-400">
      {label}
    </span>
    <div className="flex flex-col items-end min-[1000px]:items-center gap-1 min-w-0 w-full">
      {children}
    </div>
  </div>
);

/** Точки маршруту — компактний вигляд для полоски. */
const RouteCell = ({
  points,
  emptyLabel = "—",
}: {
  points: LoadRouteItem[];
  emptyLabel?: string;
}) => {
  if (!points?.length)
    return <span className="text-zinc-400 font-medium">{emptyLabel}</span>;

  return (
    <div className="w-full max-h-[64px] overflow-y-auto custom-scrollbar flex flex-col items-end min-[1000px]:items-center gap-1">
      {points.map((p, i) => (
        <div
          key={p.id ?? i}
          className="flex flex-col items-end min-[1000px]:items-center text-right min-[1000px]:text-center leading-tight w-full min-w-0"
        >
          <span className="flex items-center justify-end min-[1000px]:justify-center gap-1.5 font-bold text-zinc-800 dark:text-white w-full min-w-0">
            {p.ids_country && (
              <Flag
                country={p.ids_country}
                size={14}
                className="rounded-[2px] shadow-sm shrink-0 order-first"
              />
            )}
            <span className="truncate">
              {p.ids_country ? `${p.ids_country}-` : ""}
              {p.city}
            </span>
          </span>
          {(p.region || p.post_code) && (
            <span className="text-[10px] text-zinc-500 font-medium truncate w-full">
              {[p.post_code, p.region].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Заявка у вигляді полоски — той самий формат, що список тендерів.
 * Дані й дії ті самі, що в плитці CargoCard (спільний хук useCargoCard).
 */
export function CargoRow({ load, filters }: CargoRowProps) {
  const { config, size } = useFontSize();
  const ctrl = useCargoCard(load);
  const {
    profile,
    isOnline,
    isJustCreated,
    lastEvent,
    isShaking,
    canDelete,
    hasUnreadMessages,
    handleCopyLoad,
    handleOpenGoogleMaps,
  } = ctrl;

  const dateLoad = fmt(load.date_load);
  const dateLoad2 = fmt(load.date_load2);
  const dateUnload = fmt(load.date_unload);

  const trailers =
    load.crm_load_trailer?.length > 0
      ? load.crm_load_trailer.map((t) => t.trailer_type_name).join(", ")
      : "ТЕНТ";

  const actionBtnCls =
    "p-1.5 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-400 transition-colors";

  const actions = [
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
  ];

  const carStats = [
    {
      icon: Truck,
      val: load.car_count_actual,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
      title: "Активні авто",
    },
    {
      icon: CheckCircle2,
      val: load.car_count_closed,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      title: "Закриті",
    },
    {
      icon: XCircle,
      val: load.car_count_canceled,
      color: "text-red-500 bg-red-50 dark:bg-red-500/10",
      title: "Скасовані",
    },
  ];

  return (
    <>
      <div
        className={cn(
          "group relative w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700",
          isJustCreated && "animate-in fade-in slide-in-from-bottom-1",
          isShaking && "animate-shake border-blue-500",
        )}
      >
        {/* Кольорова смужка свіжості зверху — як у плитці */}
        <StatusIndicator updatedAt={load.updated_at} />

        {/* Бейдж події */}
        <div
          className={cn(
            "absolute top-1.5 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-500",
            lastEvent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
          )}
        >
          <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-400/50 uppercase tracking-widest whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            {EVENT_LABELS[lastEvent || ""] || "Оновлення"}
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col min-[1000px]:flex-row w-full min-[1000px]:min-h-[96px] divide-y min-[1000px]:divide-y-0 min-[1000px]:divide-x divide-zinc-200/80 dark:divide-white/10 pt-1",
            config.label,
          )}
        >
          {/* 1. № */}
          <button
            type="button"
            onClick={() => ctrl.setSelectedCargo(load)}
            title="Деталі заявки"
            className={cn(
              CARGO_COL.id,
              "w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors",
            )}
          >
            <span
              className={cn(
                "font-black text-blue-600 dark:text-blue-400 leading-none",
                config.title,
              )}
            >
              {load.id}
            </span>
            <span className="min-[1000px]:hidden text-[10px] font-bold uppercase tracking-widest text-blue-600/70">
              Заявка
            </span>
          </button>

          {/* 2. Завантаження */}
          <Cell label="Завантаження" className={CARGO_COL.from}>
            <RouteCell points={load.crm_load_route_from} />
            {dateLoad && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {dateLoad}
                {dateLoad2 && (
                  <>
                    <span className="mx-1 text-zinc-300">—</span>
                    {dateLoad2}
                  </>
                )}
              </span>
            )}
          </Cell>

          {/* 3. Розвантаження */}
          <Cell label="Розвантаження" className={CARGO_COL.to}>
            <RouteCell points={load.crm_load_route_to} />
            {dateUnload && (
              <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {dateUnload}
              </span>
            )}
          </Cell>

          {/* 4. Транспорт */}
          <Cell label="Транспорт" className={CARGO_COL.transport}>
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 font-black uppercase tracking-wider text-center leading-tight">
              {trailers}
            </span>
            {load.transit_type && (
              <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wide">
                {load.transit_type}
              </span>
            )}
          </Cell>

          {/* 5. Ціна */}
          <Cell label="Ціна" className={CARGO_COL.price}>
            {load.price ? (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white font-black whitespace-nowrap">
                {`${load.price.toLocaleString()} ${load.valut_name ?? ""}`}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-black text-center leading-tight">
                Ціна не вказана
              </span>
            )}
            {(load.is_collective || load.is_price_request) && (
              <div className="flex items-center gap-1.5">
                {load.is_collective && (
                  <span title="Збірний вантаж">
                    <Boxes size={14} className="text-blue-500" />
                  </span>
                )}
                {load.is_price_request && (
                  <span title="Запит ціни">
                    <CircleDollarSign size={14} className="text-emerald-500" />
                  </span>
                )}
              </div>
            )}
          </Cell>

          {/* 6. Авто */}
          <Cell label="Авто" className={cn(CARGO_COL.cars, "min-[1000px]:px-1")}>
            <div className="flex flex-wrap items-center justify-end min-[1000px]:justify-center gap-0.5">
              {carStats.map((stat, i) => (
                <div
                  key={i}
                  title={stat.title}
                  className={cn(
                    "flex items-center gap-1 px-1 py-0.5 rounded-md font-bold",
                    stat.color,
                  )}
                >
                  <stat.icon size={12} />
                  <span className="tabular-nums">{stat.val}</span>
                </div>
              ))}
            </div>
          </Cell>

          {/* 7. Інформація */}
          <Cell label="Інформація" className={CARGO_COL.info}>
            <div className="w-full max-h-[76px] overflow-y-auto custom-scrollbar text-zinc-500 dark:text-zinc-400 leading-snug break-words whitespace-pre-wrap text-right min-[1000px]:text-left">
              {load.load_info || "---"}
            </div>
          </Cell>

          {/* 8. Менеджер */}
          <Cell label="Менеджер" className={CARGO_COL.manager}>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-full max-w-full">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isOnline
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-zinc-300 dark:bg-zinc-600",
                )}
              />
              <span className="font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter truncate">
                {load.author}
              </span>
            </div>
            <span
              className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate max-w-full text-center"
              title={load.company_name || ""}
            >
              {load.company_name || "-----"}
            </span>
            <span className="flex items-center gap-1 text-zinc-400 tabular-nums">
              <History size={11} strokeWidth={2.5} />
              {load.created_at
                ? format(new Date(load.created_at), "dd.MM HH:mm")
                : "—"}
            </span>
          </Cell>

          {/* 9. Дії */}
          <div
            className={cn(
              CARGO_COL.actions,
              "flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 min-[1000px]:p-2 bg-zinc-50/60 dark:bg-zinc-800/30",
            )}
          >
            {actions.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                className={cn(actionBtnCls, btn.hover)}
              >
                <btn.icon size={14} />
              </button>
            ))}

            <button
              onClick={() => ctrl.setChatCargo(load)}
              title="Коментарі"
              className={cn(
                actionBtnCls,
                "relative hover:bg-zinc-50 dark:hover:bg-slate-700",
              )}
            >
              <MessageCircle size={14} className="text-zinc-400" />
              {load.comment_count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900",
                    size === "xs" ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]",
                  )}
                >
                  {load.comment_count}
                </span>
              )}
              {hasUnreadMessages && (
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>

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

      <CargoCardModals load={load} filters={filters} ctrl={ctrl} />
    </>
  );
}
