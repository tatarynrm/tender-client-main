"use client";

import React from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  User,
  Calendar,
  Layers,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender, ITenderRate } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";

export function TenderCardManagers({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const [isRatesOpen, setIsRatesOpen] = React.useState(false);
  const displayPrice = cargo.price_proposed || cargo.price_start;

  // Розподіл точок маршруту
  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM"
  );
  const customUp = cargo.tender_route.filter(
    (p) => p.ids_point === "CUSTOM_UP"
  );
  const border = cargo.tender_route.filter((p) => p.ids_point === "BORDER");
  const customDown = cargo.tender_route.filter(
    (p) => p.ids_point === "CUSTOM_DOWN"
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");

  return (
    <Card className="w-full border-gray-200 dark:border-slate-700 bg-[#eff4fc] dark:bg-slate-800 hover:shadow-md transition-all rounded-xl overflow-hidden mb-1">
      {/* HEADER - Ідентичний клієнтському */}
      <div className="bg-zinc-50 dark:bg-slate-900/50 px-1 py-1 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[14px] uppercase font-black tracking-widest text-zinc-400 leading-none mb-1">
              № {cargo.id}
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-none uppercase">
              {cargo.tender_type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const now = new Date();
            const startTime = cargo.time_start
              ? new Date(cargo.time_start)
              : null;
            const endTime = cargo.time_end ? new Date(cargo.time_end) : null;

            if (startTime && now < startTime) {
              return (
                <TenderTimer
                  targetDate={cargo.time_start!}
                  label="До початку"
                  variant="blue"
                />
              );
            }
            if (endTime && now < endTime) {
              return (
                <TenderTimer
                  targetDate={cargo.time_end!}
                  label="До кінця"
                  variant="orange"
                />
              );
            }
            return null;
          })()}

          <div className="hidden md:flex items-center gap-2 px-1 py-1 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm">
            <Calendar size={12} className="text-emerald-500" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] uppercase font-bold text-emerald-600 tracking-wider">
                Старт
              </span>
              <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-200">
                {cargo.time_start
                  ? format(new Date(cargo.time_start), "dd.MM HH:mm")
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-slate-700">
          {/* 1. ВЕРТИКАЛЬНИЙ МАРШРУТ (СТЕППЕР) */}
          <div className="lg:col-span-4 p-1">
            <div className="relative space-y-5">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
              {[
                {
                  points: fromPoints,
                  label: "Завантаження",
                  color: "bg-emerald-500",
                  text: "text-emerald-600",
                },
                {
                  points: customUp,
                  label: "Замитнення",
                  color: "bg-blue-500",
                  text: "text-blue-500",
                },
                {
                  points: border,
                  label: "Кордон",
                  color: "bg-amber-500",
                  text: "text-amber-500",
                },
                {
                  points: customDown,
                  label: "Розмитнення",
                  color: "bg-blue-500",
                  text: "text-blue-500",
                },
                {
                  points: toPoints,
                  label: "Розвантаження",
                  color: "bg-rose-500",
                  text: "text-rose-600",
                },
              ].map(
                (step, idx) =>
                  step.points.length > 0 && (
                    <div key={idx} className="relative flex gap-4 pl-0.5">
                      <div
                        className={cn(
                          "z-10 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm shrink-0 mt-0.5",
                          step.color
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                            step.text
                          )}
                        >
                          {step.label}
                        </span>
                        {step.points.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 text-sm font-semibold truncate text-slate-800 dark:text-slate-100"
                          >
                            <Flag country={p.ids_country ?? "UA"} size={14} />
                            <span className="truncate">{p.city}</span>
                            <span className="text-[10px] font-normal opacity-50 uppercase">
                              ({p.ids_country})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* 2. ТЕХНІЧНІ ДАНІ (БЕЙДЖІ ТА ОПИС) */}
          <div className="lg:col-span-5 p-1 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <Truck size={18} className="text-blue-500" />
                  <span className="text-lg">
                    {cargo.car_count_actual || 1}{" "}
                    <small className="text-[10px] uppercase opacity-50 font-black">
                      авт.
                    </small>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                    Параметри
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {cargo.weight} т / {cargo.volume} м³
                  </span>
                </div>
              </div>

              {/* Бейджі як у клієнта */}
              <div className="flex flex-wrap gap-1.5">
                {cargo.tender_trailer?.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded text-[10px] font-black uppercase border border-slate-200 dark:border-slate-600"
                  >
                    {t.trailer_type_name}
                  </span>
                ))}
                {cargo.tender_load?.map((l, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800/50"
                  >
                    {l.load_type_name}
                  </span>
                ))}
              </div>

              <div className="text-xs bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border-l-4 border-amber-400">
                <p className="font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-tighter">
                  {cargo.cargo || "Вантаж"}
                </p>
                <p className="italic text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {cargo.notes || "Без приміток"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <User size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                {cargo.author}
              </span>
            </div>
          </div>

          {/* 3. ЦІНА ТА СТАВКИ (ПРАВА ПАНЕЛЬ) */}
          <div className="lg:col-span-3 p-5 bg-zinc-50/50 dark:bg-slate-900/20 flex flex-col justify-center gap-4">
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {displayPrice ? "Актуальна ціна" : "Тендер"}
              </span>
              <div
                className={cn(
                  "font-black leading-tight",
                  displayPrice
                    ? "text-3xl text-slate-900 dark:text-white"
                    : "text-xl text-blue-600 dark:text-blue-400 uppercase"
                )}
              >
                {displayPrice ? (
                  <>
                    {displayPrice}
                    <span className="text-sm font-medium ml-1 text-slate-500 uppercase">
                      {cargo.valut_name}
                    </span>
                  </>
                ) : (
                  "Запит ціни"
                )}
              </div>
              {cargo.without_vat && displayPrice && (
                <div className="text-[10px] font-bold text-rose-500 uppercase">
                  Без ПДВ
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={onOpenDetails}
              className="w-full border-zinc-300 text-zinc-600 hover:bg-white dark:border-slate-700 dark:text-zinc-400 font-bold text-[10px] uppercase h-9"
            >
              Специфікація <Info size={14} className="ml-2" />
            </Button>

            {/* Компактний блок ставок для менеджера */}
            <div className="pt-3 border-t border-zinc-200 dark:border-slate-700">
              {cargo.rate_company && cargo.rate_company.length > 0 ? (
                <>
                  <button
                    onClick={() => setIsRatesOpen(!isRatesOpen)}
                    className="flex items-center justify-between w-full group p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers
                        size={14}
                        className={cn(
                          "transition-colors",
                          isRatesOpen ? "text-blue-500" : "text-slate-400"
                        )}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                        Ставки ({cargo.rate_company.length})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isRatesOpen ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isRatesOpen
                        ? "grid-rows-[1fr] opacity-100 mt-2"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <TenderRatesList
                        rates={cargo.rate_company as unknown as ITenderRate[]}
                        currency={cargo.valut_name ?? "грн"}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Стан, коли ставок немає */
                <div className="flex items-center gap-2 px-1 py-2 opacity-60">
                  <Layers size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Ставки відсутні
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
