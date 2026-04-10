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

export function TenderCardClients({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { confirm, openModal } = useModalStore();
  const { onConfirmReduction, onManualPrice, onBuyout } = useTenderActions(
    cargo.id,
    cargo.price_next,
    cargo.price_redemption,
  );
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const { profile } = useAuth();
  const currencySymbol = getCurrencySymbol(cargo.valut_name);

  const handleConfirmBid = () => {
    confirm({
      title: "Підтвердження ставки",
      description: `Ви впевнені, що хочете зробити ставку: ${cargo.price_next} ${currencySymbol}?`,
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

  const bestBidPrice = useMemo(() => {
    if (!cargo.rate_company || cargo.rate_company.length === 0) {
      return null;
    }
    // For transport, mostly it's lowest price wins (Reduction)
    // If it's an auction (bidding up), we take the max.
    if (cargo.ids_type === "AUCTION") {
      return Math.max(...cargo.rate_company.map((r) => r.price_proposed));
    }
    return Math.min(...cargo.rate_company.map((r) => r.price_proposed));
  }, [cargo.rate_company, cargo.ids_type]);

  const myPrice = useMemo(() => {
    if (!profile || !cargo.rate_company) return 0;
    const myLatestBid = [...cargo.rate_company]
      .filter((r) => r.id_author === profile.id)
      .sort((a, b) => b.id - a.id)[0];
    return myLatestBid ? myLatestBid.price_proposed : 0;
  }, [cargo.rate_company, profile]);

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
  const isWinByCompany = cargo.company_winner_car_count > 0;

  console.log(profile);
  return (
    <div className="w-full relative mb-1 overflow-hidden border border-zinc-200 dark:border-white/10 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all bg-[#f4f5f8] dark:bg-slate-900/60 font-sans text-xs group/card">
      {/* HEADER for "Редукціон", "Аукціон", etc - usually outside, but if we need a wrapper we can put it here, or just let the caller do it.
          We will wrap the main content in a white card. */}

      {isAnalyze && !isWinByCompany && (
        <div className="absolute top-0 left-0 z-50 flex items-center gap-1.5 rounded-br-lg bg-blue-50/90 border-b border-r border-blue-200 px-2.5 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
            Аналізуємо
          </span>
        </div>
      )}
      {isWinByCompany && (
        <div className="absolute top-0 left-0 z-50 flex items-center gap-1.5 rounded-br-lg bg-emerald-50/90 border-b border-r border-emerald-200 px-2.5 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
            Ви виграли
          </span>
        </div>
      )}

      {/* Main Grid Card */}
      <div className="bg-white dark:bg-slate-900 mx-px mt-px rounded-t-xl overflow-hidden flex flex-col">
        {/* ROW 1: 11 Columns */}
        <div className="flex flex-col lg:flex-row w-full lg:h-[115px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80 dark:divide-white/10 overflow-hidden">
          {/* 1. № */}
          <div
            className="w-full lg:w-[60px] flex-shrink-0 flex items-center justify-center p-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all h-full border-r border-zinc-100 dark:border-white/5 group/number"
            onClick={onOpenDetails}
          >
            <span className="text-[16px] lg:text-[18px] font-black text-blue-600 dark:text-blue-400 leading-none group-hover/number:scale-110 transition-transform">
              {cargo.id}
            </span>
          </div>

          {/* 2. Завантаження */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2 h-full">
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
              <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {getTenderLoadDateString(cargo.date_load, cargo.date_load2)}
              </span>
            )}
          </div>

          {/* 3. Митне оформлення (Центр) */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2 text-center overflow-hidden h-full">
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
                          "text-[9px] uppercase font-black tracking-tight mb-0.5",
                          isCustomsUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isCustomsDown
                              ? "text-indigo-500 dark:text-indigo-400"
                              : "text-zinc-500",
                        )}
                      >
                        {isCustomsUp
                          ? "Замитнення"
                          : isCustomsDown
                            ? "Розмитнення"
                            : "Кордон"}
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1.5 font-bold text-zinc-800 dark:text-white text-[11px] w-full">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={14}
                          className="rounded-[1px] shadow-sm flex-shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {pt.ids_country !== "UA" &&
                        (ptAny.post_code || ptAny.zip_code) ? (
                          <span className="text-indigo-500 dark:text-indigo-400 mr-0.5">
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

          {/* 4. Розвантаження */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2 h-full">
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
              <span className="text-[12px] font-bold text-indigo-500 dark:text-indigo-400 mt-1">
                {formatTenderDate(cargo.date_unload)}
              </span>
            )}
          </div>

          {/* 5. Вантаж */}
          <div className="w-full lg:w-[150px] flex-shrink-0 flex items-center justify-center p-2 text-center overflow-hidden h-full">
            <span className="font-semibold text-zinc-800 dark:text-white text-[11px] break-words line-clamp-3 leading-tight">
              {cargo.cargo || "ТНП"}
            </span>
          </div>

          {/* 6. Тип транспорту */}
          <div className="w-full lg:w-[90px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center h-full">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
              <Truck size={13} className="text-zinc-500" />
              <span className="font-black text-zinc-800 dark:text-white text-[11px]">
                {cargo.car_count || 1}
              </span>
            </div>
            <span className="font-semibold text-zinc-800 dark:text-white text-[12px] leading-tight">
              {trailers.split(", ").map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  <br />
                </React.Fragment>
              ))}
            </span>
          </div>

          {/* 7. Вага/Об'єм */}
          <div className="lg:w-[50px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center h-full">
            <div className="flex lg:flex-col items-center gap-2 lg:gap-0">
              {cargo.volume && (
                <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                  {cargo.volume} м³
                </span>
              )}
              {cargo.weight && (
                <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                  {cargo.weight} т.
                </span>
              )}
              {!cargo.volume && !cargo.weight && (
                <span className="text-zinc-500">—</span>
              )}
            </div>
          </div>

          {/* 8. Нотатки */}
          <div className="flex-1 w-full lg:min-w-[120px] lg:max-w-[140px] flex items-start justify-start p-2 overflow-hidden relative h-full">
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
          <div className="w-full lg:w-[130px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-x border-zinc-100 dark:border-white/5 overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 h-full">
            {isAuction ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#eef7ec] dark:bg-emerald-900/20 p-2 leading-tight text-center">
                <span className="text-[11px] font-bold text-[#2c5f2d] dark:text-emerald-300">
                  Ваша поточна ставка
                </span>
                <span className="text-[13px] font-black text-[#2c5f2d] dark:text-emerald-400 mt-1">
                  {myPrice
                    ? `${myPrice}${currencySymbol}`
                    : "—"}
                </span>
              </div>
            ) : (
              <>
                {/* Level 1: Start Price */}
                <div className="h-[43px] flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none mb-0.5 whitespace-nowrap">
                    Стартова ціна
                  </span>
                  <span className="font-bold text-[13px] text-zinc-800 dark:text-white leading-none">
                    {cargo.price_start}
                    {currencySymbol}
                  </span>
                  {cargo.price_step && (
                    <span className="text-[8px] text-zinc-400 mt-0.5 leading-none">
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
          <div className="w-full lg:w-[110px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 h-full">
            <div className="flex-1 flex flex-col items-center justify-center p-1 min-h-[43px]">
              <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-bold uppercase mb-0.5">
                Залишилось
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
          <div className="w-full lg:w-[160px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 h-full">
            {/* Top Green: Your Current Bid */}
            {!isAuction && (
              <div className="h-[26px] flex items-center justify-center px-2 bg-[#eef7ec] dark:bg-emerald-900/40 text-center">
                <span className="text-[9px] text-[#2c5f2d] dark:text-emerald-300 font-bold uppercase mr-1.5 leading-none">
                  Ваша поточна ставка
                </span>
                <span className="text-[12px] font-black text-[#2c5f2d] dark:text-emerald-400 leading-none">
                  {myPrice
                    ? `${myPrice}${currencySymbol}`
                    : "—"}
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
                <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-bold uppercase mr-1.5 leading-none">
                  Краща ставка
                </span>
                <span className="text-[12px] font-black text-[#e03131] dark:text-red-400 leading-none">
                  {bestBidPrice ? `${bestBidPrice}${currencySymbol}` : "—"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FLATTENED FOOTER: Manager Info & Tender metadata */}
        <div className="h-[26px] px-3 flex items-center justify-between border-t border-zinc-200/80 dark:border-white/10 bg-white dark:bg-slate-800/30 text-[10px]">
          <div className="flex items-center gap-x-4">
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
            <span className="font-extrabold uppercase text-zinc-800 dark:text-white leading-none">
              {isAuction
                ? "АУКЦІОН"
                : isRedemption
                  ? "РЕДУКЦІОН З ВИКУПОМ"
                  : "РЕДУКЦІОН"}
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
