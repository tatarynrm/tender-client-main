"use client";

import React from "react";
import { differenceInMinutes, format } from "date-fns";
import Flag from "react-flagkit";
import {
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  History,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { StatusIndicator } from "@/features/log/active/ui/CargoCardUpdateColor";
import { CarrierLoadItem } from "../types/carrier-load.type";

interface Props {
  load: CarrierLoadItem;
}

const fmtDate = (date?: string | null) =>
  date ? format(new Date(date), "dd.MM.yyyy") : null;

const fmtDateTime = (date?: string | null) =>
  date ? format(new Date(date), "dd.MM HH:mm") : "—";

/** Підпис колонки — як заголовки «ВАНТАЖ», «ТИП ТРАНСПОРТУ» у менеджерській картці. */
const ColLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
    {children}
  </span>
);

/** Рядок маршруту: прапорець + місто + (код країни) + область. */
const RoutePoint = ({
  country,
  city,
  region,
  dotClass,
}: {
  country: string | null;
  city: string | null;
  region: string | null;
  dotClass: string;
}) => (
  <div className="flex items-center gap-2 min-w-0">
    {country ? (
      <Flag
        country={country}
        size={16}
        className="rounded-[2px] shadow-sm shrink-0"
      />
    ) : null}
    <span className={cn("w-2 h-2 rounded-full shrink-0", dotClass)} />
    <span className="font-bold text-zinc-800 dark:text-white truncate">
      {city || "—"}
    </span>
    {country && (
      <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
        ({country})
      </span>
    )}
    {region && (
      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
        {region}
      </span>
    )}
  </div>
);

/**
 * Картка заявки для перевізника — за зразком менеджерської картки
 * (features/log/active/ui), але без чату переписки, без назви замовника
 * і без дій менеджера. Виводить лише поля, які віддає crm_load_list_per.
 */
export function CarrierLoadCard({ load }: Props) {
  const dateLoad = fmtDate(load.date_load);
  const dateLoad2 = fmtDate(load.date_load2);
  const dateUnload = fmtDate(load.date_unload);

  // «Оновлено» — якщо заявку редагували після створення (різниця понад хвилину).
  const isUpdated =
    !!load.updated_at &&
    !!load.created_at &&
    differenceInMinutes(new Date(load.updated_at), new Date(load.created_at)) >
      0;

  const isActive = (load.car_count_actual ?? 0) > 0;

  const trailers = (load.crm_load_trailer ?? [])
    .map((t) => t.trailer_type_name || t.ids_trailer_type)
    .filter(Boolean);

  const carStats = [
    {
      icon: Truck,
      val: load.car_count_actual ?? 0,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
      title: "Потрібно авто",
    },
    {
      icon: CheckCircle2,
      val: load.car_count_closed ?? 0,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      title: "Закрито авто",
    },
    {
      icon: XCircle,
      val: load.car_count_canceled ?? 0,
      color: "text-red-500 bg-red-50 dark:bg-red-500/10",
      title: "Скасовано авто",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-slate-900 dark:hover:border-zinc-700">
      {/* Кольорова смужка свіжості, як у менеджерів */}
      <StatusIndicator updatedAt={load.updated_at} />

      <div className="grid grid-cols-1 gap-0 pt-1 lg:grid-cols-[150px_minmax(260px,1.6fr)_minmax(180px,1fr)_minmax(200px,1fr)] divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80 dark:divide-white/10">
        {/* 1. Статус, номер, оновлено, лічильники */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 p-3 lg:flex-col lg:items-start lg:justify-start">
          <span
            className={cn(
              "rounded-lg border-2 px-3 py-0.5 text-xs font-bold",
              isActive
                ? "border-sky-300 bg-sky-50 text-sky-600 dark:bg-sky-500/10"
                : "border-zinc-300 bg-zinc-50 text-zinc-500 dark:bg-zinc-800",
            )}
          >
            {isActive ? "активна" : "неактивна"}
          </span>

          <span className="text-2xl font-black leading-none text-blue-600 dark:text-blue-400">
            {load.id}
          </span>

          <div className="flex flex-col gap-1">
            {isUpdated && (
              <span className="w-fit rounded-md border-2 border-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                оновлено
              </span>
            )}
            <span
              className="flex items-center gap-1 text-[11px] text-zinc-400 tabular-nums"
              title={isUpdated ? "Час оновлення" : "Час створення"}
            >
              <History size={11} strokeWidth={2.5} />
              {fmtDateTime(load.updated_at || load.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {carStats.map((stat) => (
              <div
                key={stat.title}
                title={stat.title}
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold",
                  stat.color,
                )}
              >
                <stat.icon size={12} />
                <span className="tabular-nums">{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Маршрут і дати */}
        <div className="flex flex-col justify-center gap-3 p-3 text-sm">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Завантаження:{" "}
              <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                {dateLoad ?? "—"}
                {dateLoad2 && ` — ${dateLoad2}`}
              </span>
            </span>
            <RoutePoint
              country={load.ids_country_from}
              city={load.city_from}
              region={load.region_from}
              dotClass="bg-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Розвантаження:{" "}
              <span className="tabular-nums text-blue-600 dark:text-blue-400">
                {dateUnload ?? "—"}
              </span>
            </span>
            <RoutePoint
              country={load.ids_country_to}
              city={load.city_to}
              region={load.region_to}
              dotClass="bg-blue-500"
            />
          </div>
        </div>

        {/* 3. Тип транспорту */}
        <div className="flex flex-col items-start justify-center gap-2 p-3 lg:items-center lg:text-center">
          <ColLabel>Тип транспорту</ColLabel>
          {trailers.length > 0 ? (
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-black uppercase leading-tight tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {trailers.join(", ")}
            </span>
          ) : (
            <span className="text-zinc-400">—</span>
          )}
          {load.transit_type && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {load.transit_type}
            </span>
          )}
          {(load.is_collective || load.is_price_request) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {load.is_collective && (
                <span className="flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/10">
                  <Boxes size={12} />
                  Збірний вантаж
                </span>
              )}
              {load.is_price_request && (
                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">
                  <CircleDollarSign size={12} />
                  Запит ціни
                </span>
              )}
            </div>
          )}
        </div>

        {/* 4. Менеджер, який розмістив заявку.
            load_info (внутрішня інформація по заявці) бекенд перевізникам не віддає. */}
        <div className="flex flex-col gap-2 p-3">
          <ColLabel>Менеджер ICT</ColLabel>
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <UserRound size={16} />
            </span>
            <span className="truncate text-sm font-bold text-zinc-800 dark:text-white">
              {load.author || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
