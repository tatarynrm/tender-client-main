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
  MapPin,
  Weight,
  Box,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender, ITenderRate } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import TenderActions from "./TenderActions/TenderActions";

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

  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM",
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter((p) =>
    ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point),
  );

  const getPointLabel = (type: string) => {
    switch (type) {
      case "CUSTOM_UP":
        return "Зам.";
      case "BORDER":
        return "Корд.";
      case "CUSTOM_DOWN":
        return "Розм.";
      default:
        return "";
    }
  };

  const stars =
    Number(cargo.rating) === 2 ? 5 : Number(cargo.rating) === 1 ? 3 : 1;

  return (
    <Card className="w-full border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden mb-2">
      {/* HEADER - Більш вузький */}
      <div className="bg-slate-50 dark:bg-white/[0.03] px-3 py-1.5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-black text-slate-400 dark:text-slate-500 tracking-tighter",
              title,
            )}
          >
            #{cargo.id}
          </span>
          <span
            className={cn(
              "font-bold text-blue-600 dark:text-blue-400 uppercase",
              label,
            )}
          >
            {cargo.tender_type}
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < stars
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cargo.time_start && (
            <TenderTimer
              targetDate={cargo.time_start}
              label=""
              variant="blue"
            />
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10">
            <Calendar size={icon - 2} className="text-slate-400" />
            <span
              className={cn(
                "font-mono font-bold text-slate-600 dark:text-slate-300",
                label,
              )}
            >
              {cargo.time_start
                ? format(new Date(cargo.time_start), "dd.MM HH:mm")
                : "—"}
            </span>
          </div>
        </div>
        <TenderActions tender={cargo} />
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5">
          {/* 1. МАРШРУТ - Компактні колонки */}
          <div className="lg:col-span-5 p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase text-emerald-600 mb-1",
                    label,
                  )}
                >
                  Відправка
                </p>
                {fromPoints.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 mb-1 last:mb-0"
                  >
                    <Flag
                      country={p.ids_country ?? "UA"}
                      size={12}
                      className="shrink-0"
                    />
                    <span
                      className={cn(
                        "truncate font-bold text-slate-800 dark:text-slate-200",
                        label,
                      )}
                    >
                      {p.city}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-x border-dashed border-slate-200 dark:border-white/10 px-2 min-w-0">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase text-amber-500 mb-1",
                    label,
                  )}
                >
                  Транзит
                </p>
                {transitPoints.length > 0 ? (
                  transitPoints.slice(0, 2).map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col mb-1 last:mb-0 leading-tight"
                    >
                      <span
                        className={cn(
                          "text-[9px] font-bold text-slate-400 uppercase",
                          label,
                        )}
                      >
                        {getPointLabel(p.ids_point)}
                      </span>
                      <span
                        className={cn(
                          "truncate font-medium text-slate-500",
                          label,
                        )}
                      >
                        {p.city}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className={cn("text-slate-300 italic", label)}>
                    Прямий
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase text-rose-600 mb-1",
                    label,
                  )}
                >
                  Прибуття
                </p>
                {toPoints.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 mb-1 last:mb-0"
                  >
                    <Flag
                      country={p.ids_country ?? "UA"}
                      size={12}
                      className="shrink-0"
                    />
                    <span
                      className={cn(
                        "truncate font-bold text-slate-800 dark:text-slate-200",
                        label,
                      )}
                    >
                      {p.city}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ТЕХНІЧНІ ДАНІ - В один ряд для економії місця */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-center bg-slate-50/30 dark:bg-transparent gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Truck size={icon} className="text-blue-500" />
                <span
                  className={cn(
                    "font-black text-slate-700 dark:text-slate-200",
                    main,
                  )}
                >
                  {cargo.car_count_actual || 1}
                  <span className="text-[10px] ml-0.5 opacity-50">АВТ</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-500">
                  <Weight size={12} />
                  <span className={cn("font-bold", label)}>
                    {cargo.weight}т
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Box size={12} />
                  <span className={cn("font-bold", label)}>
                    {cargo.volume}м³
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {cargo.tender_trailer?.slice(0, 2).map((t, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase border border-slate-200 dark:border-white/5",
                    label,
                  )}
                >
                  {t.trailer_type_name}
                </span>
              ))}
              <span
                className={cn(
                  "ml-auto font-bold text-blue-600/70 dark:text-blue-400/70 truncate max-w-[100px]",
                  label,
                )}
              >
                {cargo.cargo}
              </span>
            </div>
          </div>

          {/* 3. ЦІНА ТА ДІЇ - Компактний блок */}
          <div className="lg:col-span-3 p-2 flex flex-col justify-center gap-1.5 bg-blue-50/10 dark:bg-blue-500/[0.02]">
            <div className="text-right px-1">
              <div
                className={cn(
                  "font-black tracking-tighter text-lg leading-none",
                  displayPrice
                    ? "text-slate-900 dark:text-white"
                    : "text-blue-500",
                )}
              >
                {displayPrice ? (
                  <>
                    {displayPrice}{" "}
                    <span className="text-[10px] text-slate-400">
                      {cargo.valut_name}
                    </span>
                  </>
                ) : (
                  "Запит ціни"
                )}
              </div>
              {cargo.without_vat && (
                <span className="text-[9px] font-black text-rose-500 uppercase">
                  Без ПДВ
                </span>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                onClick={onOpenDetails}
                className="flex-1 h-7 px-2 text-[10px] font-bold border-slate-200 dark:border-white/10"
              >
                ДЕТАЛІ
              </Button>
              <button
                onClick={() => setIsRatesOpen(!isRatesOpen)}
                disabled={!cargo.rate_company?.length}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2 h-7 rounded-md border transition-all min-w-[70px]",
                  isRatesOpen
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-white/10",
                  !cargo.rate_company?.length && "opacity-30 grayscale",
                )}
              >
                <Layers size={12} />
                <span className="text-[10px] font-black">
                  {cargo.rate_company?.length || 0}
                </span>
                {isRatesOpen ? (
                  <ChevronUp size={10} />
                ) : (
                  <ChevronDown size={10} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ПАНЕЛЬ СТАВОК */}
        {isRatesOpen && (
          <div className="border-t border-slate-100 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-black/20">
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
