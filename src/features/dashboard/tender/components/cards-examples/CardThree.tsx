"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import {
  MapPin,
  Package,
  Truck,
  Info,
  ShieldCheck,
  Scale,
  AlertCircle,
  Timer,
  ArrowDown,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender, ITenderRoute } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { TenderTimer } from "../TenderTimer";
import { ManualPriceDialog } from "../ManualPriceDialog";
import { useTenderActions } from "../../hooks/useTenderActions";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

// Допоміжні функції
const formatTenderDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month} (${hours}:${minutes})`;
};

const formatRouteDate = (dateString?: string | null) => {
  if (!dateString) return;
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month} - ${hours}:${minutes}`;
};

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

// Допоміжний маппер для назв митних пунктів
const getTransitLabel = (pointId: string) => {
  switch (pointId) {
    case "CUSTOM_UP":
      return "Замитнення";
    case "CUSTOM_DOWN":
      return "Розмитнення";
    case "BORDER":
      return "Кордон";
    default:
      return "Транзит";
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

  // ==========================================
  // ЛОГІКА МАРШРУТІВ (MULTIPLE POINTS)
  // ==========================================
  const { loadPoints, unloadPoints, transitPoints } = useMemo(() => {
    // 1. Спочатку сортуємо всі точки по order_num
    const sortedRoutes = [...(cargo.tender_route || [])].sort(
      (a, b) => (a.order_num || 0) - (b.order_num || 0),
    );

    // 2. Розбиваємо на категорії
    return {
      loadPoints: sortedRoutes.filter((r) => r.ids_point === "LOAD_FROM"),
      unloadPoints: sortedRoutes.filter((r) => r.ids_point === "LOAD_TO"),
      transitPoints: sortedRoutes.filter((r) =>
        ["CUSTOM_UP", "CUSTOM_DOWN", "BORDER"].includes(r.ids_point),
      ),
    };
  }, [cargo.tender_route]);

  const trailers =
    cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "—";
  const loadTypes =
    cargo.tender_load?.map((l) => l.load_type_name).join(", ") || "";
  const currencySymbol = getCurrencySymbol(cargo.valut_name);

  const isAuction = cargo.ids_type === "AUCTION";
  const isReduction = cargo.ids_type === "REDUCTION";
  const isRedemption = cargo.ids_type === "REDUCTION_WITH_REDEMPTION";
  const isActive = cargo.ids_status === "ACTIVE";
  const isAnalyze = cargo.ids_status === "ANALYZE";
  const isPlan = cargo.ids_status === "PLAN";
  const isWinByCompany = cargo.company_winner_car_count > 0;

  const isHalfPrice =
    !!cargo.price_proposed &&
    !!cargo.price_next &&
    cargo.price_proposed < cargo.price_next * 0.5;

  return (
    <>
      <div className="w-full relative mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-blue-500/40 transition-all duration-500 bg-white dark:bg-zinc-950/40 backdrop-blur-xl group font-sans">

        {/* Лейбл "Аналізуємо" / "Ви виграли" */}
        {isAnalyze && !isWinByCompany && (
          <div className="absolute -top-[1px] -left-[1px] z-50 flex items-center gap-1.5 rounded-br-lg bg-blue-50/90 dark:bg-blue-950/60 border-b border-r border-blue-200 dark:border-blue-500/30 px-2.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">
              Аналізуємо
            </span>
          </div>
        )}
        {isWinByCompany && (
          <div className="absolute -top-[1px] -left-[1px] z-50 flex items-center gap-1.5 rounded-br-lg bg-emerald-50/90 dark:bg-emerald-950/60 border-b border-r border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              Ви виграли
            </span>
          </div>
        )}

        {/* СУЧАСНИЙ ТАБЛИЧНИЙ LAYOUT (ВІДПОВІДНО ДО ЗОБРАЖЕННЯ) */}

        {/* 1) HEADER ROW - тільки для великих екранів */}
        <div className="hidden lg:grid grid-cols-[60px_1fr_1fr_1fr_minmax(60px,0.6fr)_minmax(80px,0.8fr)_minmax(60px,0.6fr)_minmax(110px,1fr)_320px] border-b border-zinc-200/80 dark:border-zinc-800 text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 divide-x divide-zinc-200/80 dark:divide-zinc-800 bg-zinc-50/80 dark:bg-white/5">
          <div className="flex items-center justify-center p-2 text-[14px] font-black tracking-tighter text-zinc-400 dark:text-zinc-500">№</div>
          <div className="flex items-center justify-center p-2">Завантаження</div>
          <div className="flex items-center justify-center p-2">Митне оформлення</div>
          <div className="flex items-center justify-center p-2">Розвантаження</div>
          <div className="flex items-center justify-center p-2">Вантаж</div>
          <div className="flex items-center justify-center p-2 text-center leading-tight">Тип<br />транспорту</div>
          <div className="flex items-center justify-center p-2">Вага</div>
          <div className="flex items-center justify-center p-2 text-center leading-tight">Додаткова<br />інформація</div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center py-1.5 border-b border-zinc-200/80 dark:border-zinc-800">Інформація по тендеру</div>
            <div className="grid grid-cols-[1fr_1fr_1fr] divide-x divide-zinc-200/80 dark:divide-zinc-800 flex-1">
              <div className="flex items-center justify-center text-[10px]">Ціна</div>
              <div className="flex items-center justify-center text-[10px]">Час тендера</div>
              <div className="flex items-center justify-center text-[10px]">Ставка</div>
            </div>
          </div>
        </div>

        {/* 2) DATA ROW */}
        <div className="grid grid-cols-12 lg:grid-cols-[60px_1fr_1fr_1fr_minmax(60px,0.6fr)_minmax(80px,0.8fr)_minmax(60px,0.6fr)_minmax(110px,1fr)_320px] bg-white dark:bg-transparent">

          {/* 1. № */}
          <div
            className="col-span-12 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-zinc-800 p-2 lg:p-0 flex lg:flex-col items-center justify-between lg:justify-center gap-1.5 bg-zinc-50/50 dark:bg-white/[0.02] cursor-pointer lg:hover:bg-sky-50 dark:lg:hover:bg-sky-500/10 transition-colors group/num"
            onClick={onOpenDetails}
          >
            <div className="flex items-center gap-2 lg:flex-col lg:gap-1.5">
              <span className="lg:hidden text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Замовлення:</span>
              <span className="text-[13px] lg:text-sm font-black text-zinc-800 dark:text-zinc-100 group-hover/num:text-blue-600 dark:group-hover/num:text-blue-400 transition-colors leading-none">
                {cargo.id}
              </span>
            </div>
            {cargo.tender_type && (
              <span className="text-[9px] lg:text-[8px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20 px-1.5 py-0.5 rounded border border-transparent dark:border-sky-500/20">
                {cargo.tender_type}
              </span>
            )}
          </div>

          {/* 2. Завантаження */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center gap-1.5 dark:bg-emerald-500/[0.02]">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Завант.</span>
            {loadPoints.length === 0 && <span className="text-zinc-400 font-medium text-[10px] lg:text-[11.5px] text-center w-full block">—</span>}
            {loadPoints.map((pt, i) => {
              const ptAny = pt as any;
              const dStr = ptAny.date_time || ptAny.date_from || ptAny.date;
              return (
                <div key={i} className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 lg:gap-1.5 font-bold text-zinc-800 dark:text-zinc-100 text-[9px] lg:text-[11.5px]">
                    {pt.ids_country && <Flag country={pt.ids_country} size={12} className="rounded-[2px] shadow-sm lg:w-[14px] lg:h-[14px]" />}
                    <span className="truncate max-w-[50px] lg:max-w-none">{pt.ids_country ? `${pt.ids_country}-` : ""}{ptAny.zip_code ? `${ptAny.zip_code}, ` : ""}{pt.city}</span>
                  </div>
                  {dStr && (
                    <span className="text-[8.5px] lg:text-[10.5px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5 lg:mt-1">
                      {formatRouteDate(dStr)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Митне оформлення */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col justify-center gap-1.5 lg:gap-2.5 bg-zinc-50/30 dark:bg-white/[0.03]">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Митниця</span>

            {(() => {
              const customUp = transitPoints.filter(p => p.ids_point === "CUSTOM_UP");
              const customDown = transitPoints.filter(p => p.ids_point === "CUSTOM_DOWN");

              return (
                <div className="flex flex-col gap-1 lg:gap-2.5">
                  {customUp.map((pt, i) => (
                    <div key={`up-${i}`} className="flex flex-col text-center lg:text-left leading-tight">
                      <span className="text-[8px] lg:text-[8.5px] text-emerald-600 dark:text-emerald-400 font-black mb-0.5 uppercase tracking-tighter">Замитнення</span>
                      <span className="font-bold text-[9px] lg:text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[60px] lg:max-w-none mx-auto lg:mx-0">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}{(pt as any).zip_code ? `${(pt as any).zip_code}, ` : ""}{pt.city}
                      </span>
                    </div>
                  ))}
                  {customDown.map((pt, i) => (
                    <div key={`down-${i}`} className="flex flex-col text-center lg:text-left leading-tight">
                      <span className="text-[8px] lg:text-[8.5px] text-blue-600 dark:text-blue-400 font-black mb-0.5 uppercase tracking-tighter">Розмитнення</span>
                      <span className="font-bold text-[9px] lg:text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[60px] lg:max-w-none mx-auto lg:mx-0">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}{(pt as any).zip_code ? `${(pt as any).zip_code}, ` : ""}{pt.city}
                      </span>
                    </div>
                  ))}
                  {customUp.length === 0 && customDown.length === 0 && transitPoints.filter(p => p.ids_point === "BORDER").map((pt, i) => (
                    <div key={`border-${i}`} className="flex flex-col text-center lg:text-left leading-tight">
                      <span className="text-[8px] lg:text-[8.5px] text-zinc-500 dark:text-zinc-400 font-black mb-0.5 uppercase tracking-tighter">Кордон</span>
                      <span className="font-bold text-[9px] lg:text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[60px] lg:max-w-none mx-auto lg:mx-0">
                        {pt.city}
                      </span>
                    </div>
                  ))}
                  {customUp.length === 0 && customDown.length === 0 && transitPoints.filter(p => p.ids_point === "BORDER").length === 0 && (
                    <span className="text-zinc-400 font-medium text-[10px] lg:text-[11.5px] text-center block">—</span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 4. Розвантаження */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center gap-1.5 dark:bg-blue-500/[0.02]">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Розвант.</span>
            {unloadPoints.length === 0 && <span className="text-zinc-400 font-medium text-[10px] lg:text-[11.5px] text-center w-full block">—</span>}
            {unloadPoints.map((pt, i) => {
              const ptAny = pt as any;
              const dStr = ptAny.date_time || ptAny.date_to || ptAny.date;
              return (
                <div key={i} className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 lg:gap-1.5 font-bold text-zinc-800 dark:text-zinc-100 text-[9px] lg:text-[11.5px]">
                    {pt.ids_country && <Flag country={pt.ids_country} size={12} className="rounded-sm shadow-sm lg:w-[14px] lg:h-[14px]" />}
                    <span className="truncate max-w-[50px] lg:max-w-none">{pt.ids_country ? `${pt.ids_country}-` : ""}{ptAny.zip_code ? `${ptAny.zip_code}, ` : ""}{pt.city}</span>
                  </div>
                  {dStr && (
                    <span className="text-[8.5px] lg:text-[10.5px] font-black text-blue-600 dark:text-blue-400 mt-0.5 lg:mt-1">
                      {formatRouteDate(dStr)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 5. Вантаж */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-white/[0.01]">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Вантаж</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-100 text-[10.5px] lg:text-[11px] text-center line-clamp-2">
              {cargo.cargo || "ТНП"}
            </span>
          </div>

          {/* 6. Тип транспорту */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Трансп.</span>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[10.5px] lg:text-[11px] line-clamp-2 leading-tight">{trailers}</span>
              {loadTypes && <span className="font-medium text-[9px] text-zinc-500 mt-0.5 line-clamp-1">{loadTypes}</span>}
            </div>
          </div>

          {/* 7. Вага */}
          <div className="col-span-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-white/[0.02]">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-0.5">Вага</span>
            <div className="flex flex-col items-center justify-center text-center font-bold text-zinc-800 dark:text-zinc-100 text-[10.5px] lg:text-[11px] leading-tight">
              {cargo.volume && <span>{cargo.volume} м³</span>}
              {cargo.weight && <span className={cn(cargo.volume && "mt-0.5")}>{cargo.weight} т.</span>}
              {!cargo.volume && !cargo.weight && <span className="text-zinc-500">—</span>}
            </div>
          </div>

          {/* 8. Додаткова інформація */}
          <div className="col-span-12 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-zinc-800 p-1.5 lg:p-2 flex flex-col items-center justify-center">
            <span className="lg:hidden text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest text-center w-full block mb-1">Додаткова інформація</span>
            <span className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium text-center leading-snug line-clamp-1 lg:line-clamp-none max-w-[280px] lg:max-w-[200px] mx-auto">
              {cargo.notes || "—"}
            </span>
          </div>

          {/* 9. Інформація по тендеру (Subgrid) */}
          <div className="col-span-12 lg:col-span-1 grid grid-cols-3 divide-x divide-zinc-200/80 dark:divide-zinc-800 h-full">

            {/* 9.1 Ціна */}
            <div className="flex flex-col h-full bg-zinc-50/30 dark:bg-white/[0.02] min-h-[60px] lg:min-h-[80px]">
              <div className="p-1.5 lg:p-1 flex-grow flex flex-col items-center justify-center w-full">
                <span className="lg:hidden text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5 w-full text-center">Ціна</span>
                {!isAuction ? (
                  <>
                    <div className="flex items-center gap-0.5 font-black text-[13px] lg:text-[14px] text-zinc-800 dark:text-zinc-100">
                      {cargo.price_next}<span>{currencySymbol}</span>
                    </div>
                    {(isReduction || isRedemption) && cargo.price_step && (
                      <span className="text-[8px] lg:text-[9px] text-zinc-500 dark:text-zinc-400 font-bold mt-0.5">крок {cargo.price_step} {currencySymbol}</span>
                    )}
                  </>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600 font-black text-[13px] lg:text-[14px]">—</span>
                )}
              </div>

              {/* Блок Викупу (якщо є) */}
              {isRedemption && cargo.price_redemption && (
                <button
                  onClick={() => setActiveModal("buyout")}
                  disabled={!isActive}
                  className="w-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 py-1.5 transition-all flex flex-col items-center justify-center border-t border-emerald-100 dark:border-emerald-500/20 mt-auto px-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/buyout shadow-sm"
                >
                  <span className="text-[8px] lg:text-[9px] text-emerald-700 dark:text-emerald-400 font-black mb-0 uppercase tracking-widest">Викуп</span>
                  <div className="font-black text-[10.5px] lg:text-[12.5px] text-emerald-600 dark:text-emerald-300 leading-none group-hover/buyout:scale-110 transition-transform mt-0.5">
                    {cargo.price_redemption}<span className="text-[9px] lg:text-[10px] ml-[1px]">{currencySymbol}</span>
                  </div>
                </button>
              )}
            </div>

            {/* 9.2 Час тендера */}
            <div className="p-1.5 flex flex-col items-center justify-center bg-red-50/20 dark:bg-red-500/[0.05] text-center min-h-[60px] lg:min-h-[80px]">
              <span className="text-[8.5px] lg:text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mb-1.5 leading-none uppercase tracking-tighter">Залишилось</span>
              <span className="font-black text-red-500 dark:text-red-400 text-[11.5px] lg:text-[13.5px] tracking-tight leading-none drop-shadow-sm">
                <TenderTimer label="" targetDate={isPlan ? cargo.time_start : cargo.time_end} />
              </span>
            </div>

            {/* 9.3 Ставка */}
            <div className="p-1 lg:p-1.5 flex flex-col items-center justify-center bg-emerald-50/40 dark:bg-emerald-500/[0.05] w-full min-h-[60px] lg:min-h-[80px]">

              {/* Ваша ставка */}
              <div className="flex flex-col items-center text-center w-full mb-1 lg:mb-2">
                <span className="text-[8px] lg:text-[9px] text-zinc-500 dark:text-zinc-500 font-bold mb-0.5 leading-none uppercase tracking-tighter">Ваша ставка</span>
                <div className="font-black text-emerald-600 dark:text-emerald-400 text-[11px] lg:text-[14px] h-[14px] lg:h-[18px] flex items-center leading-none">
                  {cargo.price_proposed ? `${cargo.price_proposed} ${currencySymbol}` : <span className="opacity-0">—</span>}
                </div>
              </div>

              {/* Екшн кнопки */}
              <div className="w-full flex justify-center items-center flex-col gap-1.5 mt-auto pb-0.5 px-0.5 lg:px-0">
                {/* Основна кнопка "Підтвердити крок [value]" */}
                {!isAuction && (
                  <Button
                    size="sm"
                    className="w-full h-[24px] lg:h-[28px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-[8px] lg:text-[9.5px] font-black uppercase tracking-wider px-1 rounded-md shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 flex gap-0.5 items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => setActiveModal("confirm")}
                    disabled={!canBid || !isActive}
                  >
                    <span className="truncate">Підтвердити крок</span>
                    {cargo.price_step && <span className="whitespace-nowrap ml-0.5">{cargo.price_step}</span>}
                  </Button>
                )}

                {/* Додаткова кнопка "Своя ціна" */}
                {isAuction ? (
                  <Button
                    size="sm"
                    className="w-full h-[24px] lg:h-[28px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-[8px] lg:text-[9.5px] font-black uppercase tracking-wider px-1 rounded-md shadow-lg shadow-indigo-500/20 flex gap-1 items-center justify-center transition-all hover:scale-[1.02]"
                    onClick={() => setActiveModal("manual")}
                    disabled={!canBid || !isActive}
                  >
                    Своя ціна
                  </Button>
                ) : (
                  <button
                    onClick={() => setActiveModal("manual")}
                    disabled={!canBid || !isActive}
                    className="w-full h-auto text-[9.5px] lg:text-[10px] font-bold text-zinc-500 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors py-0.5 disabled:opacity-50 disabled:cursor-not-allowed leading-none underline-offset-2 hover:underline"
                  >
                    Своя ціна
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* === МОДАЛЬНІ ВІКНА === */}
      {(isReduction || isRedemption || isAuction) && (
        <ConfirmDialog
          open={activeModal === "confirm"}
          onOpenChange={closeModal}
          title="Підтвердження ставки"
          description={`Ви впевнені, що хочете зробити ставку: ${cargo.price_next} ${currencySymbol}?`}
          onConfirm={onConfirmReduction}
          variant="default"
        />
      )}

      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_start}
        onConfirm={onManualPrice}
        currentValut={cargo.valut_name}
        isHalfPrice={isHalfPrice}
      />

      {isRedemption && (
        <ConfirmDialog
          open={activeModal === "buyout"}
          onOpenChange={closeModal}
          title="Підтвердження викупу"
          description={`Ви впевнені, що хочете викупити рейс за ${cargo.price_redemption} ${currencySymbol}?`}
          onConfirm={onBuyout}
          variant="success"
          confirmText="Викупити зараз"
        />
      )}
    </>
  );
}
