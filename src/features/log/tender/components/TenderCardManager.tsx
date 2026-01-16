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
  Star,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender, ITenderRate } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function TenderCardManagers({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main, title, icon } = config;

  const [isRatesOpen, setIsRatesOpen] = React.useState(false);
  const displayPrice = cargo.price_proposed || cargo.price_start;

  // Розподіл точок для триколонкового маршруту
  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM"
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter((p) =>
    ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point)
  );

  // Мапінг технічних назв на українські
  const getPointLabel = (type: string) => {
    switch (type) {
      case "CUSTOM_UP":
        return "Замитнення";
      case "BORDER":
        return "Кордон";
      case "CUSTOM_DOWN":
        return "Розмитнення";
      default:
        return "";
    }
  };

  const stars =
    Number(cargo.rating) === 2 ? 5 : Number(cargo.rating) === 1 ? 3 : 1;

  return (
    <Card className="w-full border-gray-200 dark:border-slate-700 bg-[#eff4fc] dark:bg-slate-800 hover:shadow-md transition-all rounded-xl overflow-hidden mb-1">
      {/* HEADER */}
      <div className="bg-zinc-50 dark:bg-slate-900/50 px-3 py-1 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "uppercase font-black tracking-widest text-zinc-400",
                title
              )}
            >
              № {cargo.id}
            </span>
            <span
              className={cn(
                "font-bold text-blue-600 dark:text-blue-400 uppercase",
                main
              )}
            >
              {cargo.tender_type}
            </span>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < stars
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted/20 text-muted"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {cargo.time_start && (
            <TenderTimer
              targetDate={cargo.time_start}
              label="Старт"
              variant="blue"
            />
          )}
          <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 shadow-sm">
            <Calendar size={icon} className="text-emerald-500" />
            <span
              className={cn(
                "font-mono font-bold text-zinc-700 dark:text-zinc-200",
                main
              )}
            >
              {cargo.time_start
                ? format(new Date(cargo.time_start), "dd.MM HH:mm")
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-slate-700">
          {/* 1. МАРШРУТ (3 КОЛОНКИ) */}
          <div className="lg:col-span-6 p-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Колонка: ВІД */}
              <div className="space-y-1 min-w-0">
                <span
                  className={cn(
                    "font-black uppercase text-emerald-600 tracking-tighter block mb-1",
                    label
                  )}
                >
                  Відправлення
                </span>
                {fromPoints.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 min-w-0",
                      main
                    )}
                  >
                    <Flag country={p.ids_country ?? "UA"} size={icon} />
                    <span className="truncate leading-tight">{p.city}</span>
                  </div>
                ))}
              </div>

              {/* Колонка: ТРАНЗИТ / МИТНИЦЯ */}
              <div className="space-y-1.5 border-x border-dashed border-slate-200 dark:border-slate-700 px-2 min-w-0">
                <span
                  className={cn(
                    "font-black uppercase text-amber-500 tracking-tighter block mb-1",
                    label
                  )}
                >
                  Транзит / Мито
                </span>
                {transitPoints.length > 0 ? (
                  transitPoints.map((p) => (
                    <div key={p.id} className="flex flex-col leading-none">
                      <div
                        className={cn(
                          "flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300",
                          label
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate uppercase">
                          {getPointLabel(p.ids_point)}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "pl-2.5 truncate text-slate-400 dark:text-slate-500 font-semibold",
                          label
                        )}
                      >
                        {p.city}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={cn("text-slate-300 italic py-1", label)}>
                    Прямий рейс
                  </div>
                )}
              </div>

              {/* Колонка: ДО */}
              <div className="space-y-1 min-w-0">
                <span
                  className={cn(
                    "font-black uppercase text-rose-600 tracking-tighter block mb-1",
                    label
                  )}
                >
                  Прибуття
                </span>
                {toPoints.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 min-w-0",
                      main
                    )}
                  >
                    <Flag country={p.ids_country ?? "UA"} size={icon} />
                    <span className="truncate leading-tight">{p.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ТЕХНІЧНІ ДАНІ */}
          <div className="lg:col-span-3 p-3 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-slate-100">
                  <Truck size={icon + 2} className="text-blue-500" />
                  <span className={main}>
                    {cargo.car_count_actual || 1}{" "}
                    <small className="opacity-50">АВТ</small>
                  </span>
                </div>
                <div
                  className={cn(
                    "font-black text-slate-800 dark:text-slate-200",
                    main
                  )}
                >
                  {cargo.weight}т / {cargo.volume}м³
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {cargo.tender_trailer?.map((t, i) => (
                  <span
                    key={i}
                    className={cn(
                      "px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-700 rounded font-bold uppercase",
                      label
                    )}
                  >
                    {t.trailer_type_name}
                  </span>
                ))}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded border-l-2 border-amber-400">
                <p
                  className={cn(
                    "font-black text-slate-800 dark:text-slate-200 uppercase leading-none mb-0.5",
                    label
                  )}
                >
                  {cargo.cargo || "Вантаж"}
                </p>
                <p
                  className={cn(
                    "italic text-slate-500 text-[11px] line-clamp-1 leading-tight",
                    label
                  )}
                >
                  {cargo.notes || "Без приміток"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <User size={icon} className="text-slate-400" />
              <span
                className={cn(
                  "font-bold text-slate-500 uppercase truncate",
                  label
                )}
              >
                {cargo.author}
              </span>
            </div>
          </div>

          {/* 3. ЦІНА ТА СТАВКИ */}
          <div className="lg:col-span-3 p-3 bg-zinc-50/50 dark:bg-slate-900/20 flex flex-col justify-center gap-2">
            <div className="text-center">
              <span
                className={cn(
                  "font-bold text-slate-400 uppercase tracking-tighter block",
                  label
                )}
              >
                {displayPrice ? "Ціна" : "Тендер"}
              </span>
              <div
                className={cn(
                  "font-black leading-none truncate",
                  displayPrice
                    ? "text-xl text-slate-900 dark:text-white"
                    : cn("text-blue-600", main)
                )}
              >
                {displayPrice
                  ? `${displayPrice} ${cargo.valut_name}`
                  : "Запит ціни"}
              </div>
              {cargo.without_vat && displayPrice && (
                <div
                  className={cn(
                    "font-bold text-rose-500 uppercase mt-0.5",
                    label
                  )}
                >
                  Без ПДВ
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={onOpenDetails}
              className={cn("w-full h-8 font-bold border-zinc-300", label)}
            >
              ДЕТАЛІ <Info size={icon} className="ml-1.5" />
            </Button>

            <button
              onClick={() => setIsRatesOpen(!isRatesOpen)}
              disabled={!cargo.rate_company?.length}
              className={cn(
                "flex items-center justify-between w-full p-1.5 rounded border transition-all",
                isRatesOpen
                  ? "bg-white border-blue-200"
                  : "bg-transparent border-transparent hover:bg-white/50",
                !cargo.rate_company?.length && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <Layers
                  size={icon}
                  className={isRatesOpen ? "text-blue-500" : "text-slate-400"}
                />
                <span
                  className={cn("font-black uppercase text-slate-500", label)}
                >
                  Ставки ({cargo.rate_company?.length || 0})
                </span>
              </div>
              {isRatesOpen ? (
                <ChevronUp size={icon} />
              ) : (
                <ChevronDown size={icon} />
              )}
            </button>
          </div>
        </div>

        {/* ПАНЕЛЬ СТАВОК */}
        {isRatesOpen && (
          <div className="border-t border-zinc-100 dark:border-slate-700 p-2 bg-white/50 dark:bg-slate-900/50">
            <TenderRatesList
              rates={cargo.rate_company as unknown as ITenderRate[]}
              currency={cargo.valut_name ?? "грн"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
