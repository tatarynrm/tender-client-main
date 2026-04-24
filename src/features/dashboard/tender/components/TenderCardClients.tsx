"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";

import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useTenderActions } from "../hooks/useTenderActions";

import {
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Paperclip as PaperclipIcon,
  Truck,
} from "lucide-react";
import { FilesPreviewModal } from "@/shared/ict_components/FilesPreviewModal/FilesPreviewModal";
import { TenderTimer } from "./TenderTimer";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import TenderActions from "@/features/log/tender/components/TenderActions/TenderActions";
import { getRegionName } from "@/shared/utils/region.utils";
import {
  formatTenderDate,
  getTenderLoadDateString,
} from "@/shared/utils/date.utils";
import { getCurrencySymbol } from "@/shared/utils/currency.utils";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";

export function TenderCardClients({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { confirm, openModal } = useModalStore();
  const bestBidPrice = useMemo(() => {
    if (!cargo.rate_company || cargo.rate_company.length === 0) return null;
    return Math.min(...cargo.rate_company.map((r) => r.price_proposed));
  }, [cargo.rate_company]);

  const nextBidValue =
    bestBidPrice !== null && !isNaN(Number(bestBidPrice))
      ? Number(bestBidPrice) - (Number(cargo.price_step) || 0)
      : cargo.price_next && !isNaN(Number(cargo.price_next))
        ? Number(cargo.price_next)
        : Number(cargo.price_start) || 0;

  const { onConfirmReduction, onManualPrice, onBuyout } = useTenderActions(
    cargo.id,
    nextBidValue,
    cargo.price_redemption,
  );
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const { profile } = useAuth();
  const currencySymbol = getCurrencySymbol(cargo.valut_name);

  const handleConfirmBid = () => {
    confirm({
      title: "Підтвердження ставки",
      description: `Ви впевнені, що хочете зробити ставку: ${nextBidValue} ${currencySymbol}?`,
      onConfirm: onConfirmReduction,
      variant: "default",
      showComment: true,
      commentPlaceholder: "Додайте коментар до вашої ставки (опціонально)...",
    });
  };

  const handleManualPrice = () => {
    openModal(
      <ManualPriceDialog
        currentPrice={myPrice || cargo.price_proposed || cargo.price_start}
        onConfirm={onManualPrice}
        currentValut={cargo.valut_name}
      />,
      { size: "md" },
    );
  };

  const handleBuyoutConfirm = () => {
    confirm({
      title: "Підтвердження викупу",
      description: `Ви впевнені, що хочете викупити рейс за ${cargo.price_redemption} ${currencySymbol}?`,
      onConfirm: onBuyout,
      variant: "success",
      confirmText: "Викупити зараз",
    });
  };

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

  const { loadPoints, unloadPoints, transitPoints } = useMemo(() => {
    const sortedRoutes = [...(cargo.tender_route || [])].sort(
      (a, b) => (a.order_num || 0) - (b.order_num || 0),
    );

    return {
      loadPoints: sortedRoutes.filter((r) => r.ids_point === "LOAD_FROM"),
      unloadPoints: sortedRoutes.filter((r) => r.ids_point === "LOAD_TO"),
      transitPoints: sortedRoutes.filter((r) =>
        ["CUSTOM_UP", "CUSTOM_DOWN", "BORDER"].includes(r.ids_point),
      ),
    };
  }, [cargo.tender_route]);

  const [myPrice, setMyPrice] = useState(0);

  useEffect(() => {
    // 1. Перевіряємо пряме поле від бекенду
    if (cargo.person_price_proposed) {
      setMyPrice(cargo.person_price_proposed);
      return;
    }

    // 2. Фоллбек на ручний пошук у масиві
    if (profile && cargo.rate_company) {
      const personId = profile.person?.id || profile.id;
      const myBids = cargo.rate_company.filter((r) => r.id_author == personId);

      if (myBids.length > 0) {
        const latest = [...myBids].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
        if (latest.price_proposed > 0) {
          setMyPrice(latest.price_proposed);
        }
      }
    }
  }, [cargo.person_price_proposed, cargo.rate_company, profile, cargo.id]);

  const trailers =
    cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "—";
  const loadTypes =
    cargo.tender_load?.map((l) => l.load_type_name).join(", ") || "";

  const isAuction = cargo.ids_type === "AUCTION";
  const isReduction = cargo.ids_type === "REDUCTION";
  const isRedemption = cargo.ids_type === "REDUCTION_WITH_REDEMPTION";
  const isActive = cargo.ids_status === "ACTIVE";
  const isAnalyze = cargo.ids_status === "ANALYZE";
  const isPlan = cargo.ids_status === "PLAN";
  const isFinished = !isActive && !isPlan && !isAnalyze;
  const isWinByCompany = cargo.company_winner_car_count > 0;
  const hasNoBids = !cargo.rate_company || cargo.rate_company.length === 0;

  console.log(profile);
  return (
    <div className="w-full relative mb-1 overflow-hidden border border-zinc-200 dark:border-white/10 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all bg-[#f4f5f8] dark:bg-slate-900/60 font-sans text-xs group/card mt-2">
      {/* HEADER for "Редукціон", "Аукціон", etc - usually outside, but if we need a wrapper we can put it here, or just let the caller do it.
          We will wrap the main content in a white card. */}

      {/* Статус-лейбли */}
      <div className="absolute top-0 left-0 z-50 flex flex-col items-start pointer-events-none">
        {isWinByCompany && (
          <div className="flex items-center gap-1.5 rounded-br-lg bg-emerald-50/90 border-b border-r border-emerald-200 px-2.5 py-1.5 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Ви виграли (к-сть: {cargo.company_winner_car_count} авт.)
            </span>
          </div>
        )}

        {isAnalyze && !isWinByCompany && (
          <div className="flex items-center gap-1.5 rounded-br-lg bg-blue-50/90 border-b border-r border-blue-200 px-2.5 py-1.5 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              Аналізуємо{" "}
              {cargo.company_offer_car_count > 0
                ? "(Ви приймали участь)"
                : "(Ви не приймали участь)"}
            </span>
          </div>
        )}

        {isFinished && !isWinByCompany && (
          <>
            {cargo.company_offer_car_count > 0 ? (
              <div className="flex items-center gap-1.5 rounded-br-lg bg-rose-50/90 border-b border-r border-rose-200 px-2.5 py-1.5 backdrop-blur-md shadow-sm">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  Ви не перемогли
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-br-lg bg-zinc-100/90 border-b border-r border-zinc-300 px-2.5 py-1.5 backdrop-blur-md shadow-sm">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400"></span>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                  Ви не приймали участі
                </span>
              </div>
            )}
          </>
        )}

        {isActive && cargo.company_offer_car_count > 0 && !isWinByCompany && (
          <div className="flex items-center gap-1.5 rounded-br-lg bg-emerald-50/80 border-b border-r border-emerald-100 px-2.5 py-1.5 backdrop-blur-sm shadow-sm">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Ви приймаєте участь
            </span>
          </div>
        )}

        {isFinished && hasNoBids && !isWinByCompany && (
          <div className="flex items-center gap-1.5 rounded-br-lg bg-amber-50/90 border-b border-r border-amber-200 px-2.5 py-1.5 backdrop-blur-md shadow-sm">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 whitespace-nowrap">
              Не відбувся
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Card */}
      <div className="bg-white dark:bg-slate-900 mx-px mt-px rounded-t-xl overflow-hidden flex flex-col">
        {/* ROW 1: 11 Columns - Optimized for XL+ desktop, stacking on tablet/mobile */}
        <div className="flex flex-col xl:flex-row w-full xl:h-[115px] divide-y xl:divide-y-0 xl:divide-x divide-zinc-200/80 dark:divide-white/10">
          {/* 1. № */}
          <div
            className="w-full xl:w-[60px] flex-shrink-0 flex items-center justify-center p-3 xl:p-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all xl:h-full border-r border-zinc-100 dark:border-white/5 group/number relative"
            onClick={onOpenDetails}
          >
            <MyTooltip 
              text="Унікальний номер тендеру. Натисніть для перегляду деталей" 
              className="absolute top-1 right-1" 
              size={10}
            />
            <span className="text-[18px] xl:text-[18px] font-black text-blue-600 dark:text-blue-400 leading-none group-hover/number:scale-110 transition-transform">
              {cargo.id}
            </span>
          </div>

          {/* 2. Завантаження */}
          <div className="flex-1 md:min-w-[150px] flex flex-col items-center justify-center p-3 xl:p-2 xl:h-full">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {loadPoints.length === 0 && (
                <span className="text-zinc-400 font-medium">—</span>
              )}
              {loadPoints.map((pt, i) => {
                const ptAny = pt as any;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center leading-tight mb-1 last:mb-0"
                  >
                    <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-white text-[12px]">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={16}
                          className="rounded-[2px] shadow-sm"
                        />
                      )}
                      <span>
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {pt.ids_country !== "UA" &&
                          ((pt as any).post_code || ptAny.zip_code) && (
                            <span className="text-indigo-600 dark:text-indigo-400 mr-1">
                              {(pt as any).post_code || ptAny.zip_code}
                            </span>
                          )}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {getTenderLoadDateString(cargo.date_load, cargo.date_load2) && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                  {getTenderLoadDateString(cargo.date_load, cargo.date_load2)}
                </span>
                <MyTooltip text="Дата або період завантаження" size={10} />
              </div>
            )}
          </div>

          {/* 3. Розвантаження */}
          <div className="flex-1 md:min-w-[150px] flex flex-col items-center justify-center p-3 xl:p-2 xl:h-full">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {unloadPoints.length === 0 && (
                <span className="text-zinc-400 font-medium">—</span>
              )}
              {unloadPoints.map((pt, i) => {
                const ptAny = pt as any;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center leading-tight mb-1 last:mb-0"
                  >
                    <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-white text-[12px]">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={16}
                          className="rounded-[2px] shadow-sm"
                        />
                      )}
                      <span>
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {pt.ids_country !== "UA" &&
                          ((pt as any).post_code || ptAny.zip_code) && (
                            <span className="text-indigo-600 dark:text-indigo-400 mr-1">
                              {(pt as any).post_code || ptAny.zip_code}
                            </span>
                          )}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {formatTenderDate(cargo.date_unload) && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[12px] font-bold text-indigo-500 dark:text-indigo-400">
                  {formatTenderDate(cargo.date_unload)}
                </span>
                <MyTooltip text="Дата розвантаження" size={10} />
              </div>
            )}
          </div>

          {/* 4. Митне оформлення (Зменшений шрифт) */}
          <div className="flex-1 md:min-w-[150px] flex flex-col items-center justify-center p-3 xl:p-2 text-center overflow-hidden xl:h-full bg-zinc-50/30 dark:bg-white/[0.02]">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {transitPoints.length === 0 && (
                <span className="text-zinc-400 font-medium">—</span>
              )}
              {transitPoints.map((pt, i) => {
                const ptAny = pt as any;
                const isCustomsUp =
                  pt.ids_point === "CUSTOM_UP" || ptAny.customs === true;
                const isCustomsDown = pt.ids_point === "CUSTOM_DOWN";

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center leading-tight mb-2 last:mb-0 w-full px-1"
                  >
                    {(isCustomsUp ||
                      isCustomsDown ||
                      pt.ids_point === "BORDER") && (
                      <span
                        className={cn(
                          "text-[8px] uppercase font-black tracking-tight mb-0.5",
                          isCustomsUp
                            ? "text-emerald-600/70 dark:text-emerald-400/70"
                            : isCustomsDown
                              ? "text-indigo-500/70 dark:text-indigo-400/70"
                              : "text-zinc-400",
                        )}
                      >
                        {isCustomsUp
                          ? "Замитнення"
                          : isCustomsDown
                            ? "Розмитнення"
                            : "Кордон"}
                        <MyTooltip text="Місце митного оформлення або перетину кордону" size={8} className="ml-1 inline-flex" />
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1.5 font-bold text-zinc-600 dark:text-zinc-400 text-[10px] w-full">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={12}
                          className="rounded-[1px] opacity-70 flex-shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {pt.ids_country !== "UA" &&
                        (ptAny.post_code || ptAny.zip_code) ? (
                          <span className="text-indigo-500/70 mr-0.5">
                            {ptAny.post_code || ptAny.zip_code}
                          </span>
                        ) : null}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[9px] text-zinc-400 font-medium truncate w-full">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Вантаж */}
          <div className="w-full xl:w-[150px] flex-shrink-0 flex items-center justify-center p-3 xl:p-2 text-center overflow-hidden xl:h-full">
            <span className="font-semibold text-zinc-800 dark:text-white text-[11px] break-words line-clamp-3 leading-tight">
              {cargo.cargo || "ТНП"}
            </span>
          </div>

          {/* 6. Тип транспорту */}
          <div className="w-full xl:w-[90px] flex-shrink-0 flex flex-col items-center justify-center p-3 xl:p-2 text-center xl:h-full">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full mb-1">
              <Truck size={13} className="text-zinc-500" />
              <span className="font-black text-zinc-800 dark:text-white text-[11px]">
                {cargo.car_count_actual || 1}
              </span>
              <MyTooltip text="Кількість необхідних автомобілів" size={10} />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-white text-[12px] leading-tight">
              {trailers.split(", ").map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  <br />
                </React.Fragment>
              ))}
            </span>
            <span className="font-semibold text-zinc-800 dark:text-white text-[8px] leading-tight">
              {loadTypes.split(", ").map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  <br />
                </React.Fragment>
              ))}
            </span>
          </div>

          {/* 7. Вага/Об'єм */}
          <div className="w-full xl:w-[50px] flex-shrink-0 flex flex-col items-center justify-center p-3 xl:p-2 text-center xl:h-full">
            <div className="flex xl:flex-col items-center gap-2 xl:gap-0">
              {cargo.volume && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                    {cargo.volume} м³
                  </span>
                </div>
              )}
              {cargo.weight && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                    {cargo.weight} т.
                  </span>
                </div>
              )}
              {!cargo.volume && !cargo.weight && (
                <span className="text-zinc-500">—</span>
              )}
            </div>
          </div>

          {/* 8. Нотатки */}
          <div className="flex-1 w-full xl:min-w-[120px] xl:max-w-[140px] flex items-start justify-start p-3 xl:p-2 overflow-hidden relative xl:h-full">
            <div className="max-h-[80px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
              <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium leading-tight break-words whitespace-pre-wrap block text-left">
                {cargo.notes || "—"}
              </span>
            </div>

            {cargo.files && cargo.files.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilesModalOpen(true);
                }}
                className="absolute bottom-1 right-1 p-1 text-[#6366f1] hover:text-indigo-700 transition-colors"
              >
                <PaperclipIcon size={14} className="rotate-45" />
              </button>
            )}
          </div>

          {/* 9. Ціни */}
          <div className="w-full xl:w-[130px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-x border-zinc-100 dark:border-white/5 overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 xl:h-full">
            {isAuction ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#eef7ec] dark:bg-emerald-900/20 p-2 leading-tight text-center">
                <span className="text-[11px] font-bold text-[#2c5f2d] dark:text-emerald-300">
                  Ваша поточна ставка ({currencySymbol})
                </span>
                <span className="text-[13px] font-black text-[#2c5f2d] dark:text-emerald-400 mt-1">
                  {myPrice ? myPrice : "—"}
                </span>
              </div>
            ) : (
              <>
                {/* Level 1: Start Price */}
                <div className="h-[43px] flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none mb-0.5 whitespace-nowrap flex items-center gap-1">
                    Стартова ціна
                  </span>
                  <span className="font-bold text-[13px] text-zinc-800 dark:text-white leading-none">
                    {cargo.price_start}
                    {currencySymbol}
                  </span>
                  {cargo.price_step && (
                    <span className="text-[8px] text-zinc-400 mt-0.5 leading-none flex items-center gap-1">
                      крок {cargo.price_step}
                    </span>
                  )}
                </div>
                {/* Level 2: Custom Price Link (Green BG) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualPrice();
                  }}
                  className="flex-1 cursor-pointer flex flex-col items-center justify-center bg-[#eef7ec] hover:bg-[#dcf3d9] dark:bg-emerald-900/20 p-2 text-center rounded-xl"
                >
                  <button
                    disabled={!isActive}
                    className="text-[11px] font-extrabold text-[#2c5f2d]  uppercase leading-none cursor-pointer rounded-full px-3 py-1"
                  >
                    Ваша ціна
                  </button>
                  <span className="text-[8px] text-[#2c5f2d]/70 font-bold uppercase mt-1 leading-none">
                    поставити власну ставку
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 10. Залишилось / Викуп */}
          <div className="w-full xl:w-[110px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 xl:h-full">
            <div className="flex-1 flex flex-col items-center justify-center p-1 min-h-[43px]">
              <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                Залишилось
                <MyTooltip text="Час до завершення прийому ставок" size={8} />
              </span>
              <span className="font-bold text-[#e03131] dark:text-red-400 text-[15px] tracking-tight leading-none">
                <TenderTimer
                  label={isPlan ? "до старту тендеру" : ""}
                  targetDate={isPlan ? cargo.time_start : cargo.time_end}
                  variant={isPlan ? "blue" : "orange"}
                />
              </span>
            </div>
            {!isAuction && isRedemption && cargo.price_redemption && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyoutConfirm();
                }}
                disabled={!isActive}
                className="h-[43px] flex flex-col cursor-pointer items-center justify-center bg-[#fce8e8] hover:bg-[#fad1d1] transition-colors group disabled:opacity-50"
              >
                <span className="text-[10px] text-[#a61e1e] font-bold uppercase leading-none mb-0.5">
                  Викуп
                </span>
                <span className="text-[14px] font-black text-[#a61e1e] leading-none">
                  {cargo.price_redemption}
                  {currencySymbol}
                </span>
              </button>
            )}
          </div>

          {/* 11. Ставки / Action */}
          <div className="w-full xl:w-[160px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 xl:h-full">
            {/* Top Green: Your Current Bid */}
            {!isAuction && (
              <div className="h-[26px] flex items-center justify-center px-2 bg-[#eef7ec] dark:bg-emerald-900/40 text-center">
                <span className="text-[9px] text-[#2c5f2d] dark:text-emerald-300 font-bold uppercase mr-1.5 leading-none">
                  Ваша поточна ставка ({currencySymbol})
                </span>
                <span className="text-[12px] font-black text-[#2c5f2d] dark:text-emerald-400 leading-none">
                  {myPrice ? myPrice : "—"}
                </span>
              </div>
            )}

            {/* Middle: Submit Button */}
            {isAuction ? (
              <div className="flex-1 flex items-center justify-center p-0 bg-white dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualPrice();
                  }}
                  disabled={!isActive}
                  className="px-6 h-9 bg-[#6366f1] cursor-pointer hover:bg-[#4f46e5] disabled:opacity-50 flex items-center justify-center text-white font-black text-[11px] uppercase tracking-wider transition-all rounded-[6px] shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  Зробити ставку
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmBid();
                }}
                disabled={!isActive}
                className="px-6 h-9 bg-[#6366f1] cursor-pointer hover:bg-[#4f46e5] disabled:opacity-50 flex items-center justify-center text-white font-black text-[11px] uppercase tracking-wider transition-all rounded-[6px] shadow-md shadow-indigo-100 dark:shadow-none"
              >
                Зробити ставку
              </button>
            )}
            {/* Bottom: Best Bid */}
            {!isAuction && (
              <div className="h-[26px] flex items-center justify-center px-2 bg-white dark:bg-slate-900 text-center">
                <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-bold uppercase mr-1.5 leading-none flex items-center gap-1">
                  Краща ставка ({currencySymbol})
                  <MyTooltip text="Найнижча ціна запропонована на даний момент іншим учасником" size={8} />
                </span>
                <span className="text-[12px] font-black text-[#e03131] dark:text-red-400 leading-none">
                  {bestBidPrice ? bestBidPrice : "—"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FLATTENED FOOTER: Manager Info & Tender metadata */}
        <div className="min-h-[26px] py-2 xl:py-0 px-3 flex flex-col xl:flex-row items-center justify-between border-t border-zinc-200/80 dark:border-white/10 bg-white dark:bg-slate-800/30 text-[10px] gap-2 xl:gap-0">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-4 gap-y-2">
            <div className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
              <UserIcon size={13} className="text-zinc-400" />
              <span>{cargo?.author || "Менеджер"}</span>
            </div>
            {cargo?.email && (
              <a
                href={`mailto:${cargo.email}`}
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <MailIcon size={13} />
                <span>{cargo.email}</span>
              </a>
            )}
            {cargo?.usr_phone && cargo.usr_phone.length > 0 && (
              <a
                href={`tel:${cargo.usr_phone[0]?.phone}`}
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <PhoneIcon size={13} />
                <span>{cargo.usr_phone[0]?.phone}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase text-zinc-800 dark:text-white leading-none flex items-center gap-1">
              {isAuction
                ? "АУКЦІОН"
                : isRedemption
                  ? "РЕДУКЦІОН З ВИКУПОМ"
                  : "РЕДУКЦІОН"}
              <MyTooltip 
                text={
                  isAuction 
                    ? "Торги на підвищення: перемагає найвища ставка" 
                    : "Торги на пониження: перемагає найнижча ставка"
                } 
                size={9} 
              />
            </span>
            <span className="text-zinc-400 font-medium lowercase leading-none">
              публікація {formatTenderDate(cargo.time_start)}
            </span>
          </div>
        </div>
      </div>

      <FilesPreviewModal
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        files={cargo.files || []}
        title={`Документи тендеру #${cargo.id}`}
      />
    </div>
  );
}
