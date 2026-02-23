"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import {
  TrendingDown,
  Zap,
  MapPin,
  Package,
  Truck,
  Info,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { TenderTimer } from "../TenderTimer";
import { ManualPriceDialog } from "../ManualPriceDialog";
import { useTenderActions } from "../../hooks/useTenderActions";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

// Допоміжна функція для форматування дати "ДД.ММ (ГГ:ХХ)"
const formatTenderDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month} (${hours}:${minutes})`;
};

// Допоміжна функція для відображення знаку валюти
const getCurrencySymbol = (currencyCode?: string) => {
  switch (currencyCode) {
    case "UAH":
      return "₴";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "PLN":
      return "zł";
    default:
      return currencyCode || "₴";
  }
};

export function TenderCardThree({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main, icon } = config;

  const {
    activeModal,
    setActiveModal,
    closeModal,
    onConfirmReduction,
    onManualPrice,
    onBuyout,
  } = useTenderActions(cargo.id, cargo.price_next, cargo.price_redemption);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { canBid } = useMemo(() => {
    const start = cargo.time_start ? new Date(cargo.time_start).getTime() : 0;
    const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
    const currentTime = now.getTime();
    return {
      canBid: currentTime >= start && (end === 0 || currentTime <= end),
    };
  }, [now, cargo.time_start, cargo.time_end]);

  // Витягуємо маршрути
  const routeFrom = cargo.tender_route?.find(
    (r) => r.ids_point === "LOAD_FROM",
  );
  const routeTo = cargo.tender_route?.find((r) => r.ids_point === "LOAD_TO");

  // Витягуємо митні пункти
  const customsFrom =
    cargo.tender_route?.find((r) => r.ids_point === "CUSTOMS_FROM") ||
    (routeFrom?.customs ? routeFrom : null);
  const customsTo =
    cargo.tender_route?.find((r) => r.ids_point === "CUSTOMS_TO") ||
    (routeTo?.customs ? routeTo : null);

  // Формуємо характеристики
  const trailers =
    cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "—";
  const loadTypes =
    cargo.tender_load?.map((l) => l.load_type_name).join(", ") || "";
  const currencySymbol = getCurrencySymbol(cargo.valut_name);

  // === ЛОГІКА ТИПІВ ТОРГІВ ===
  const isAuction = cargo.ids_type === "AUCTION";
  const isReduction = cargo.ids_type === "REDUCTION";
  const isRedemption = cargo.ids_type === "REDUCTION_WITH_REDEMPTION";

  const isActive = cargo.ids_status === "ACTIVE";
  const isAnalyze = cargo.ids_status === "ANALYZE";
  const isHalfPrice =
    !!cargo.price_proposed &&
    !!cargo.price_next &&
    cargo.price_proposed < cargo.price_next * 0.5;
  return (
    <>
      <Card className="w-full relative mb-2 md:mb-1 overflow-hidden border border-zinc-300 dark:border-white/10 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-white dark:bg-zinc-950">
        {isAnalyze && (
          <div className="absolute top-0 left-4 z-50 flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 shadow-sm dark:bg-blue-900/30 dark:border-blue-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Аналізуємо
            </span>
          </div>
        )}
        <CardContent className="p-0 relative">
          <div className="flex flex-col md:grid md:grid-cols-12 text-[11px] leading-tight">
            {/* 1. Замовлення № */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10 p-2 flex items-center justify-between md:flex-col md:justify-center bg-zinc-50/50 dark:bg-transparent">
              <span className="md:hidden text-zinc-400 font-bold uppercase text-[9px]">
                Замовлення
              </span>
              <span className="md:hidden text-zinc-400 font-bold uppercase text-[9px]">
                {cargo.tender_type}
              </span>
              <span
                className="text-sky-600 font-bold hover:underline cursor-pointer text-[13px] md:text-[11px]"
                onClick={onOpenDetails}
              >
                {cargo.id}
              </span>
            </div>

            {/* 2 & 3. Маршрут */}
            <div className="grid grid-cols-2 md:contents">
              {/* Точка А */}
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center">
                <div className="font-bold flex flex-col items-center gap-0.5">
                  {routeFrom?.ids_country && (
                    <Flag country={routeFrom.ids_country} size={14} />
                  )}
                  <span className="truncate w-full max-w-[80px] md:max-w-none">
                    {routeFrom?.ids_country}-{routeFrom?.city || "—"}
                  </span>
                </div>
              </div>

              {/* 4. Митне оформлення */}
              <div className="md:col-span-2 border-y md:border-y-0 md:border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col justify-center gap-1 bg-zinc-50/30 dark:bg-transparent">
                {customsFrom && (
                  <div className="flex gap-1 md:block">
                    <span className="text-sky-500 min-w-[70px]">Замитн.:</span>{" "}
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {customsFrom.ids_country}-{customsFrom.city}
                    </span>
                  </div>
                )}
                {customsTo && (
                  <div className="flex gap-1 md:block">
                    <span className="text-sky-500 min-w-[70px]">Розмитн.:</span>{" "}
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {customsTo.ids_country}-{customsTo.city}
                    </span>
                  </div>
                )}
                {!customsFrom && !customsTo && (
                  <div className="flex gap-1 md:block">
                    <span className="text-sky-500 min-w-[70px]">Вантаж:</span>{" "}
                    <span className="text-zinc-700 dark:text-zinc-300 truncate">
                      {cargo.cargo || "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* Точка Б */}
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center">
                <div className="font-bold flex flex-col items-center gap-0.5">
                  {routeTo?.ids_country && (
                    <Flag country={routeTo.ids_country} size={14} />
                  )}
                  <span className="truncate w-full max-w-[80px] md:max-w-none">
                    {routeTo?.ids_country}-{routeTo?.city || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 5, 6, 7. Характеристики */}
            <div className="grid grid-cols-3 md:contents border-b md:border-b-0 border-zinc-200 dark:border-white/10">
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center">
                <span>{trailers}</span>
                {loadTypes && (
                  <span className="text-[9px] text-zinc-500">{loadTypes}</span>
                )}
              </div>
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center font-semibold">
                <span>{cargo.volume ? `${cargo.volume} м³` : "—"},</span>
                <span>{cargo.weight ? `${cargo.weight} т` : "—"}</span>
              </div>
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center text-sky-500">
                <span className="truncate max-w-[80px] md:max-w-none">
                  {cargo.notes || "—"}
                </span>
              </div>
            </div>

            {/* 8. ТОРГИ */}
            <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-3 bg-zinc-50 dark:bg-white/[0.02] md:bg-transparent h-full">
              {/* Ціни та Викуп */}
              <div className="flex flex-col border-r border-zinc-200 dark:border-white/10">
                <div className="flex-1 bg-zinc-100 dark:bg-white/5 p-2 flex flex-col items-center justify-center text-center border-b border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-500 text-[9px] md:text-[10px]">
                    {!isAuction && <>Старт {cargo.price_start}</>}
                  </span>
                  {!isAuction && (
                    <span className="text-[8px] italic text-zinc-400">
                      крок {cargo.price_step}
                    </span>
                  )}
                </div>
              </div>

              {/* Таймер */}
              <div className="flex flex-col items-center justify-center p-1 border-r border-zinc-200 dark:border-white/10 text-center">
                <span className="text-[9px] text-zinc-400 mb-1">
                  Залишилось
                </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-200 text-[10px] md:text-[11px]">
                  {cargo.time_end ? (
                    <TenderTimer label="Card 3" targetDate={cargo.time_end} />
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              {/* Ставка Action */}
              <div className="flex flex-col font-bold">
                <div className="hidden md:flex flex-col p-1 text-center border-b border-zinc-200 dark:border-white/10">
                  <span className="block text-[9px] text-zinc-400">
                    Ваша ставка
                  </span>
                  <span className="text-red-600 truncate">
                    {cargo.price_proposed
                      ? `${cargo.price_proposed} ${currencySymbol}`
                      : "—"}
                  </span>
                </div>

                {/* Блок з кнопками Крок / Своя ціна / Викуп */}
                <div className="flex flex-col flex-1 w-full bg-zinc-50 dark:bg-transparent">
                  {/* 1. Крок (Тільки для REDUCTION та REDUCTION_WITH_REDEMPTION) */}
                  {(isReduction || isRedemption) && (
                    <button
                      disabled={!canBid || !isActive}
                      onClick={() => setActiveModal("confirm")}
                      className={cn(
                        "flex-1 py-1 transition-all uppercase text-[10px] flex flex-col items-center justify-center",
                        canBid
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                          : "bg-zinc-200 text-zinc-400 cursor-not-allowed",
                      )}
                    >
                      Крок
                      <span className="text-[9px] font-normal">
                        ({cargo.price_step})
                      </span>
                    </button>
                  )}

                  {/* 2. Своя ціна (Для всіх) */}
                  <button
                    disabled={!canBid || !isActive}
                    onClick={() => setActiveModal("manual")}
                    className={cn(
                      "flex-1 transition-all uppercase text-[9px] flex items-center justify-center",
                      // Якщо це Аукціон, робимо кнопку "Своя ціна" головною (темною) і трохи більшою
                      isAuction &&
                        canBid &&
                        "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 py-2",
                      // Якщо це Редукціон, робимо кнопку "Своя ціна" другорядною (світлою)
                      !isAuction &&
                        canBid &&
                        "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 border-t border-zinc-200 dark:border-white/10 py-1",
                      // Стан disabled
                      !canBid &&
                        "bg-zinc-200 text-zinc-400 cursor-not-allowed border-t border-zinc-300 py-1",
                    )}
                  >
                    Своя ціна
                  </button>

                  {/* 3. Викуп (Тільки для REDUCTION_WITH_REDEMPTION) */}
                  {isRedemption && (
                    <button
                      disabled={!cargo.price_redemption || !isActive}
                      onClick={() => setActiveModal("buyout")}
                      className={cn(
                        "flex-1 transition-all uppercase text-[9px] flex items-center justify-center gap-1 border-t border-zinc-200 dark:border-white/10 py-1",
                        cargo.price_redemption
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold"
                          : "bg-zinc-200 text-zinc-400 cursor-not-allowed",
                      )}
                    >
                      Викуп
                      <span className="font-normal text-[9px]">
                        ({cargo.price_redemption || "—"} {currencySymbol})
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-1 text-center bg-white dark:bg-transparent md:bg-transparent border-t border-zinc-200 dark:border-white/10">
                  <span className="md:hidden block text-[8px] text-zinc-400 uppercase">
                    Краща
                  </span>
                  <span className="text-emerald-600 text-[10px]">
                    {cargo.price_next || "—"} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === МОДАЛЬНІ ВІКНА === */}

      {/* Крок ставки (Тільки для REDUCTION та REDUCTION_WITH_REDEMPTION) */}
      {(isReduction || isRedemption) && (
        <ConfirmDialog
          open={activeModal === "confirm"}
          onOpenChange={closeModal}
          title="Ставка"
          description={`Зробити ставку: ${cargo.price_next} ${currencySymbol}?`}
          onConfirm={onConfirmReduction}
        />
      )}

      {/* Своя ціна (Доступна для ВСІХ типів) */}
      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_start}
        onConfirm={onManualPrice}
        currentValut={cargo.valut_name}
        isHalfPrice={isHalfPrice}
      />

      {/* Викуп (Тільки для REDUCTION_WITH_REDEMPTION) */}
      {isRedemption && (
        <ConfirmDialog
          open={activeModal === "buyout"}
          onOpenChange={closeModal}
          title="Викуп"
          description={`Викупити рейс за ${cargo.price_redemption} ${currencySymbol}?`}
          onConfirm={onBuyout}
        />
      )}
    </>
  );
}
