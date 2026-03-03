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
      return "Замитн";
    case "CUSTOM_DOWN":
      return "Розмитн";
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
  const isHalfPrice =
    !!cargo.price_proposed &&
    !!cargo.price_next &&
    cargo.price_proposed < cargo.price_next * 0.5;

  return (
    <>
      <Card className="w-full relative mb-4 overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-sky-300/50 dark:hover:border-sky-700/50 transition-all duration-300 bg-white dark:bg-zinc-950/90 backdrop-blur-sm group">
        {/* Лейбл "Аналізуємо" */}
        {isAnalyze && (
          <div className="absolute top-3 left-3 md:top-0 md:left-4 z-50 flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Аналізуємо
            </span>
          </div>
        )}

        <CardContent className="p-0">
          <div className="flex flex-col md:grid md:grid-cols-12 text-[12px] md:text-[11px] items-stretch">
            {/* 1. Замовлення № */}
            <div className="md:col-span-1 p-4 md:p-3 flex items-center justify-between md:flex-col md:justify-center bg-zinc-50/50 dark:bg-white/[0.02] border-b md:border-b-0 md:border-r border-zinc-100 dark:border-white/5 transition-colors group-hover:bg-sky-50/30 dark:group-hover:bg-sky-900/10">
              <span className="md:hidden text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                {cargo.tender_type || "Замовлення"}
              </span>
              <div
                className="flex items-center gap-1.5 cursor-pointer text-sky-600 dark:text-sky-400 hover:text-sky-500 group/id transition-colors"
                onClick={onOpenDetails}
              >
                <span className="font-extrabold text-sm md:text-xs">
                  #{cargo.id}
                </span>
                <Info
                  size={14}
                  className="opacity-0 group-hover/id:opacity-100 transition-opacity hidden md:block"
                />
              </div>
            </div>

            {/* 2 & 3. Маршрут (3 Колонки: А -> Митниця -> Б) */}
            <div className="md:col-span-4 grid grid-cols-[1fr_1.2fr_1fr] border-b md:border-b-0 md:border-r border-zinc-100 dark:border-white/5">
              {/* === КоЛОНКА 1: ТОЧКИ ЗАВАНТАЖЕННЯ === */}
              <div className="p-3 flex flex-col justify-center border-r border-zinc-100 dark:border-white/5 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {loadPoints.length === 0 && (
                  <span className="text-center text-zinc-400">—</span>
                )}

                <div className="flex flex-col gap-1.5 w-full">
                  {loadPoints.map((pt, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className={cn(
                          "flex flex-col",
                          loadPoints.length === 1
                            ? "items-center text-center"
                            : "items-start text-left",
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {pt.ids_country && (
                            <div className="shrink-0 p-0.5 bg-white dark:bg-zinc-900 rounded shadow-sm border border-zinc-100 dark:border-white/10">
                              <Flag
                                country={pt.ids_country}
                                size={12}
                                className="rounded-[2px]"
                              />
                            </div>
                          )}
                          <span className="text-zinc-400 font-semibold text-[9px] uppercase tracking-widest">
                            {pt.ids_country}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "font-bold text-zinc-800 dark:text-zinc-100 truncate w-full",
                            loadPoints.length === 1
                              ? "text-sm md:text-xs px-1"
                              : "text-[11px] leading-tight",
                          )}
                        >
                          {pt.city || "—"}
                        </span>
                        {pt.customs && (
                          <span className="mt-1 text-[8px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-500/20 leading-none">
                            Замитн. на місці
                          </span>
                        )}
                      </div>

                      {/* Стрілочка-розділювач (тільки якщо є наступна точка) */}
                      {idx < loadPoints.length - 1 && (
                        <div className="flex justify-start pl-1.5 py-0.5">
                          <ArrowDown
                            size={14}
                            className="text-zinc-300 dark:text-zinc-600"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* === КоЛОНКА 2: МИТНИЦІ / КОРДОН (ТРАНЗИТ) === */}
              {/* Цей блок залишається без змін */}
              <div className="p-2.5 flex flex-col justify-center gap-1.5 bg-zinc-50/30 dark:bg-transparent border-r border-zinc-100 dark:border-white/5 text-[10px] md:text-[9.5px] overflow-hidden">
                {transitPoints.length === 0 ? (
                  <div className="text-center text-zinc-300 dark:text-zinc-700 font-medium">
                    —
                  </div>
                ) : (
                  transitPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex justify-between items-center px-2 py-1 rounded-md border",
                        pt.ids_point === "CUSTOM_UP"
                          ? "bg-sky-50/50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30"
                          : pt.ids_point === "CUSTOM_DOWN"
                            ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30"
                            : "bg-zinc-100/80 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700",
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold shrink-0 mr-1.5",
                          pt.ids_point === "CUSTOM_UP"
                            ? "text-sky-600 dark:text-sky-400"
                            : pt.ids_point === "CUSTOM_DOWN"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-500 dark:text-zinc-400",
                        )}
                      >
                        {getTransitLabel(pt.ids_point)}:
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                        {pt.city}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* === КоЛОНКА 3: ТОЧКИ РОЗВАНТАЖЕННЯ === */}
              <div className="p-3 flex flex-col justify-center hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {unloadPoints.length === 0 && (
                  <span className="text-center text-zinc-400">—</span>
                )}

                <div className="flex flex-col gap-1.5 w-full">
                  {unloadPoints.map((pt, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className={cn(
                          "flex flex-col",
                          unloadPoints.length === 1
                            ? "items-center text-center"
                            : "items-end text-right",
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-zinc-400 font-semibold text-[9px] uppercase tracking-widest">
                            {pt.ids_country}
                          </span>
                          {pt.ids_country && (
                            <div className="shrink-0 p-0.5 bg-white dark:bg-zinc-900 rounded shadow-sm border border-zinc-100 dark:border-white/10">
                              <Flag
                                country={pt.ids_country}
                                size={12}
                                className="rounded-[2px]"
                              />
                            </div>
                          )}
                        </div>
                        <span
                          className={cn(
                            "font-bold text-zinc-800 dark:text-zinc-100 truncate w-full",
                            unloadPoints.length === 1
                              ? "text-sm md:text-xs px-1"
                              : "text-[11px] leading-tight",
                          )}
                        >
                          {pt.city || "—"}
                        </span>
                        {pt.customs && (
                          <span className="mt-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 leading-none">
                            Розмитн. на місці
                          </span>
                        )}
                      </div>

                      {/* Стрілочка-розділювач (вирівняна по правому краю для розвантажень) */}
                      {idx < unloadPoints.length - 1 && (
                        <div className="flex justify-end pr-1.5 py-0.5">
                          <ArrowDown
                            size={14}
                            className="text-zinc-300 dark:text-zinc-600"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 5, 6, 7. Характеристики (М'які бейджі) */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 md:contents border-b md:border-b-0 border-zinc-100 dark:border-white/5 bg-white dark:bg-transparent">
              {/* Причепи */}
              <div className="p-3 md:p-2 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <div className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md max-w-full">
                  <span
                    className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs md:text-[10px] truncate block"
                    title={trailers}
                  >
                    {trailers}
                  </span>
                </div>
                {loadTypes && (
                  <span className="text-[10px] md:text-[9px] text-zinc-500 font-medium line-clamp-1 px-1">
                    {loadTypes}
                  </span>
                )}
              </div>

              {/* Вантаж */}
              <div className="p-3 md:p-2 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                <span
                  className="font-bold text-zinc-800 dark:text-zinc-200 text-xs md:text-[11px] truncate w-full mb-1.5"
                  title={cargo.cargo || ""}
                >
                  {cargo.cargo || "—"}
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <span className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-1.5 py-0.5 rounded text-[10px] md:text-[9px] text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1">
                    <Package size={10} />{" "}
                    {cargo.volume ? `${cargo.volume}м³` : "—"}
                  </span>
                  <span className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-1.5 py-0.5 rounded text-[10px] md:text-[9px] text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1">
                    <Scale size={10} />{" "}
                    {cargo.weight ? `${cargo.weight}т` : "—"}
                  </span>
                </div>
              </div>

              {/* Примітки */}
              <div className="p-3 md:p-2 border-r border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-full text-[10px] md:text-[9px] italic text-amber-600 dark:text-amber-500/80 line-clamp-3 leading-relaxed px-1">
                  {cargo.notes || "—"}
                </div>
              </div>
            </div>

            {/* 8. ТОРГИ (СУЧАСНИЙ ФІНАНСОВИЙ ВІДЖЕТ) */}
            <div className="md:col-span-4 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/30 dark:to-zinc-950 flex flex-col h-full relative">
              {/* Верхня частина: Таймер та Ціни */}
              <div className="flex justify-between items-stretch border-b border-zinc-200/60 dark:border-white/5 flex-1 p-3">
                {/* Таймер & Старт */}
                <div className="flex flex-col justify-center border-r border-zinc-200/60 dark:border-white/5 pr-4 mr-4 w-1/3">
                  <div className="flex items-center gap-1.5 mb-1 text-zinc-500">
                    <Timer
                      size={12}
                      className={isActive ? "text-sky-500" : ""}
                    />
                    <span className="text-[9px] uppercase font-bold tracking-widest leading-none">
                      {isPlan ? "Старт" : "Час"}
                    </span>
                  </div>
                  <div className="font-black text-zinc-800 dark:text-zinc-100 text-xs md:text-[11px] mb-2 leading-none">
                    <TenderTimer
                      label=""
                      targetDate={isPlan ? cargo.time_start : cargo.time_end}
                    />
                  </div>
                  {!isAuction && (
                    <div className="text-[10px] text-zinc-500 font-medium">
                      Поч:{" "}
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {cargo.price_start}
                      </span>
                    </div>
                  )}
                </div>

                {/* Поточна та Ваша ціна */}
                <div className="flex justify-between items-center flex-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]"></span>
                      )}
                      Наступна ціна:
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg md:text-base leading-none">
                      {cargo.price_next || "—"}{" "}
                      <span className="text-[10px] font-bold opacity-80">
                        {currencySymbol}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
                      Ваша
                    </span>
                    <span
                      className={cn(
                        "font-bold text-sm md:text-xs leading-none",
                        cargo.price_proposed
                          ? "text-red-500"
                          : "text-zinc-300 dark:text-zinc-600",
                      )}
                    >
                      {cargo.price_proposed ? cargo.price_proposed : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Нижня частина: Сучасні Кнопки (з відступами і тінями) */}
              <div className="flex items-center gap-2 p-3 bg-white/40 dark:bg-transparent mt-auto">
                {(isReduction || isRedemption) && (
                  <button
                    disabled={!canBid || !isActive}
                    onClick={() => setActiveModal("confirm")}
                    className={cn(
                      "flex-1 min-h-[36px] rounded-lg transition-all duration-200 uppercase text-[10px] font-extrabold flex items-center justify-center tracking-wider shadow-sm",
                      canBid && isActive
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white active:scale-95 cursor-pointer shadow-[0_2px_10px_-3px_rgba(0,0,0,0.2)] border border-transparent"
                        : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 border border-zinc-200 dark:border-white/5 cursor-not-allowed shadow-none",
                    )}
                  >
                    Крок{" "}
                    <span className="ml-1 opacity-70 font-medium">
                      ({cargo.price_step})
                    </span>
                  </button>
                )}

                <button
                  disabled={!canBid || !isActive}
                  onClick={() => setActiveModal("manual")}
                  className={cn(
                    "flex-1 min-h-[36px] rounded-lg transition-all duration-200 uppercase text-[10px] font-extrabold flex items-center justify-center tracking-wider shadow-sm",
                    isAuction && canBid && isActive
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 active:scale-95 cursor-pointer shadow-[0_2px_10px_-3px_rgba(0,0,0,0.2)] border border-transparent"
                      : canBid && isActive
                        ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 border border-zinc-200 dark:border-white/10 active:scale-95 cursor-pointer hover:shadow-md"
                        : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 border border-zinc-200 dark:border-white/5 cursor-not-allowed shadow-none",
                  )}
                >
                  Своя ціна
                </button>

                {isRedemption && (
                  <button
                    disabled={!cargo.price_redemption || !isActive}
                    onClick={() => setActiveModal("buyout")}
                    className={cn(
                      "flex-1 min-h-[36px] rounded-lg transition-all duration-200 uppercase text-[10px] font-extrabold flex items-center justify-center tracking-wider shadow-sm",
                      cargo.price_redemption && isActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-[0_2px_10px_-3px_rgba(16,185,129,0.4)] border border-transparent"
                        : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 border border-zinc-200 dark:border-white/5 cursor-not-allowed shadow-none",
                    )}
                  >
                    Викуп
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === МОДАЛЬНІ ВІКНА === */}
      {(isReduction || isRedemption) && (
        <ConfirmDialog
          open={activeModal === "confirm"}
          onOpenChange={closeModal}
          title="Підтвердження ставки"
          description={`Ви впевнені, що хочете зробити ставку: ${cargo.price_next} ${currencySymbol}?`}
          onConfirm={onConfirmReduction}
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
        />
      )}
    </>
  );
}
