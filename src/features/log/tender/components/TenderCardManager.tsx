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
  ThermometerSnowflake,
  ThermometerSun,
  Snowflake,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { IRateCompany, ITender } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import TenderActions from "./TenderActions/TenderActions";
import { useTenderSetWinner } from "../../hooks/useTenderSetWinner";

export function TenderCardManagers({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main, title, icon } = config;
  const { mutateAsync: setWinner, isPending } = useTenderSetWinner();
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
  const isRef = cargo?.tender_trailer?.some(
    (t) => t.ids_trailer_type === "REF",
  );

  // Допоміжна функція для знаків (якщо ще не додали)
  const formatTemp = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return "";
    return temp > 0 ? `+${temp}` : temp.toString();
  };

  const handleSetWinner = async (rate: IRateCompany, carCount: number) => {
    if (!rate.id) return;
    try {
      await setWinner({
        id_tender_rate: rate.id,
        car_count: carCount, // Тепер передаємо обрану кількість!
      });
    } catch (e) {
      // обробка помилки
    }
  };

  // Функція для скасування переможця
  const handleRemoveWinner = async (rate: IRateCompany) => {
    if (!rate.id) return;

    try {
      await setWinner({
        id_tender_rate: rate.id,
        car_count: 0, // Передаємо 0, щоб скасувати
      });
    } catch (e) {
      // Помилка вже оброблена в хуку
    }
  };
  return (
    <Card className="w-full border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden mb-2">
      {/* Декоративні сніжинки для REF режиму */}
      {isRef && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <Snowflake className="absolute -top-1 -right-1 text-blue-400/10 w-12 h-12 rotate-12" />
          <Snowflake className="absolute top-4 -right-3 text-blue-500/5 w-8 h-8 -rotate-12" />
          <Snowflake className="absolute -bottom-2 right-10 text-blue-300/10 w-10 h-10 rotate-45" />
        </div>
      )}
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
                  transitPoints.map((p) => (
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
              {cargo.tender_trailer?.map((t, i) => {
                const isRef = t.ids_trailer_type === "REF";
                const hasTemp =
                  cargo?.ref_temperature_from !== undefined ||
                  cargo?.ref_temperature_to !== undefined;

                return (
                  <div key={i} className="flex items-center gap-1">
                    {/* Назва причепа */}
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors",
                        isRef
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                          : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-400",
                        label,
                      )}
                    >
                      {t.trailer_type_name}
                    </span>

                    {/* Температурний режим (тільки для REF) */}
                    {isRef && hasTemp && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-full animate-in fade-in zoom-in duration-300">
                        {/* Іконка: сніжинка якщо мінус, сонце якщо плюс */}
                        {(cargo.ref_temperature_from ?? 0) < 0 ? (
                          <ThermometerSnowflake className="w-3 h-3 text-blue-500 animate-pulse" />
                        ) : (
                          <ThermometerSun className="w-3 h-3 text-orange-500" />
                        )}

                        <span className="text-[10px] font-bold text-slate-700 dark:text-rose-300 tracking-tighter">
                          {formatTemp(cargo.ref_temperature_from)}°..
                          {formatTemp(cargo.ref_temperature_to)}°C
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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
              onSetWinner={handleSetWinner}
              onRemoveWinner={handleRemoveWinner}
              cargo={cargo}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
