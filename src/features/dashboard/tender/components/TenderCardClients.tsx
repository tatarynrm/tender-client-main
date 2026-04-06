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
    });
  };

  const handleManualPrice = () => {
    openModal(
      <ManualPriceDialog
        currentPrice={cargo.price_proposed || cargo.price_start}
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
      return cargo.price_start;
    }
    // For transport, mostly it's lowest price wins (Reduction)
    // If it's an auction (bidding up), we take the max.
    if (cargo.ids_type === "AUCTION") {
      return Math.max(...cargo.rate_company.map((r) => r.price_proposed));
    }
    return Math.min(...cargo.rate_company.map((r) => r.price_proposed));
  }, [cargo.rate_company, cargo.price_start, cargo.ids_type]);

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
      {/* Tender Actions Menu */}
      <div className="absolute top-2 right-2 z-50 opacity-100 lg:opacity-50 lg:group-hover/card:opacity-100 transition-opacity">
        <TenderActions tender={cargo} />
      </div>
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
        <div className="flex flex-col lg:flex-row w-full min-h-[90px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80 dark:divide-white/10">
          {/* 1. № */}
          <div
            className="w-full lg:w-[60px] flex-shrink-0 flex items-center justify-center p-2 cursor-pointer hover:bg-sky-50 transition-colors"
            onClick={onOpenDetails}
          >
            <span className="text-[16px] lg:text-[18px] font-bold text-zinc-800 dark:text-white leading-none">
              {cargo.id}
            </span>
          </div>

          {/* 2. Завантаження */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2">
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
            {getTenderLoadDateString(cargo.date_load, cargo.date_load2) && (
              <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {getTenderLoadDateString(cargo.date_load, cargo.date_load2)}
              </span>
            )}
          </div>

          {/* 3. Митне оформлення */}
          <div className="flex-1 min-w-[150px] flex flex-col justify-center p-3 relative">
            {transitPoints.map((pt, i) => (
              <div
                key={i}
                className="flex flex-col text-left mb-1.5 last:mb-0 leading-tight"
              >
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-tight mb-0.5",
                    pt.ids_point === "CUSTOM_UP"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : pt.ids_point === "CUSTOM_DOWN"
                        ? "text-indigo-500 dark:text-indigo-400"
                        : "text-zinc-500",
                  )}
                >
                  {pt.ids_point === "CUSTOM_UP"
                    ? "Замитнення"
                    : pt.ids_point === "CUSTOM_DOWN"
                      ? "Розмитнення"
                      : "Кордон"}
                </span>
                <span className="font-bold text-[12px] text-zinc-800 dark:text-white mt-0.5">
                  {pt.ids_country ? `${pt.ids_country}-` : ""}
                  {pt.ids_country !== "UA" &&
                    ((pt as any).post_code || (pt as any).zip_code) && (
                      <span className="text-indigo-600 dark:text-indigo-400 mr-1">
                        {(pt as any).post_code || (pt as any).zip_code}
                      </span>
                    )}
                  {pt.city}
                </span>
                {(pt as any).ids_region && (
                  <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                    {getRegionName((pt as any).ids_region)}
                  </span>
                )}
              </div>
            ))}
            {transitPoints.length === 0 && (
              <span className="text-zinc-400 font-medium text-center">—</span>
            )}
          </div>

          {/* 4. Розвантаження */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2">
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
            {formatTenderDate(cargo.date_unload) && (
              <span className="text-[12px] font-bold text-indigo-500 dark:text-indigo-400 mt-1">
                {formatTenderDate(cargo.date_unload)}
              </span>
            )}
          </div>

          {/* 5. Вантаж */}
          <div className="w-full lg:w-[70px] flex-shrink-0 flex items-center justify-center p-2 text-center overflow-hidden">
            <span className="font-semibold text-zinc-800 dark:text-white text-[11px] break-words line-clamp-3 leading-tight">
              {cargo.cargo || "ТНП"}
            </span>
          </div>

          {/* 6. Тип транспорту */}
          <div className="w-full lg:w-[90px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center">
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
          <div className="w-full lg:w-[80px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center">
            {cargo.volume && (
              <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                {cargo.volume} м³
              </span>
            )}
            {cargo.weight && (
              <span className="font-semibold text-zinc-800 dark:text-white text-[12px] mt-0.5">
                {cargo.weight} т.
              </span>
            )}
            {!cargo.volume && !cargo.weight && (
              <span className="text-zinc-500">—</span>
            )}
          </div>

          {/* 8. Нотатки */}
          <div className="flex-1 min-w-[120px] max-w-[140px] flex items-center justify-center p-2 text-center overflow-hidden">
            <div className="max-h-[80px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
              <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium leading-tight break-words whitespace-pre-wrap block">
                {cargo.notes || "—"}
              </span>
            </div>
          </div>

          {/* 9. Ціни */}
          <div className="w-full lg:w-[130px] flex-shrink-0 flex flex-col bg-white overflow-hidden">
            {isAuction ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#eef7ec] dark:bg-emerald-900/20 p-2 border-l border-[#eef7ec] leading-tight">
                <span className="text-[11px] font-bold text-[#2c5f2d] dark:text-emerald-300 text-center">
                  Ваша поточна ставка
                </span>
                <span className="text-[18px] font-black text-[#2c5f2d] dark:text-emerald-400 mt-1">
                  {cargo.price_proposed || "—"}
                  {cargo.price_proposed ? (
                    <span className="text-[12px] ml-[1px]">
                      {currencySymbol}
                    </span>
                  ) : null}
                </span>
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-[45px]">
                  <div className="flex items-center gap-[1px] font-black text-[15px] text-zinc-800 dark:text-white leading-none">
                    {cargo.price_start}
                    <span>{currencySymbol}</span>
                  </div>
                  {cargo.price_step && (
                    <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-medium mt-1">
                      крок {cargo.price_step}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center bg-[#eef7ec] dark:bg-emerald-900/20 border-t border-zinc-200/80 p-2">
                  <span className="text-[10px] text-[#2c5f2d] dark:text-emerald-300 font-medium mb-0.5">
                    Ваша ціна
                  </span>
                  <span className="text-[14px] font-black text-[#2c5f2d] dark:text-emerald-400 leading-none mb-1.5">
                    {cargo.price_proposed || null}
                    <span className="text-[11px] ml-[1px]">
                      {currencySymbol}
                    </span>
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualPrice();
                    }}
                    disabled={!canBid || !isActive}
                    variant="outline"
                    className="w-full h-6 border-[#2c5f2d]/30 text-[#2c5f2d] hover:bg-emerald-100/50 font-bold text-[9px] uppercase rounded-[4px] transition-all"
                  >
                    Ваша ціна
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="w-full lg:w-[110px] flex-shrink-0 flex flex-col bg-white">
            <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-[45px]">
              {isAuction && (
                <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-bold uppercase mb-1">
                  Час тендеру
                </span>
              )}
              <div className="flex flex-col items-center leading-none">
                <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium tracking-normal mb-1">
                  Залишилось
                </span>
                <span className="font-bold text-[#e03131] dark:text-red-400 text-[16px] tracking-tight">
                  <TenderTimer
                    label=""
                    targetDate={isPlan ? cargo.time_start : cargo.time_end}
                  />
                </span>
              </div>
            </div>
            {!isAuction && isRedemption && cargo.price_redemption && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyoutConfirm();
                }}
                disabled={!isActive}
                className="h-[45px] w-full flex flex-col items-center justify-center bg-[#fce8e8] hover:bg-[#fad1d1] transition-colors border-t border-zinc-200/80 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-[10px] text-[#a61e1e] font-medium mb-0.5">
                  Викуп
                </span>
                <span className="text-[14px] font-black text-[#a61e1e] leading-none group-hover:scale-105 transition-transform">
                  {cargo.price_redemption}
                  <span className="text-[11px] ml-[1px]">{currencySymbol}</span>
                </span>
              </button>
            )}
          </div>

          {/* 11. Ставки / Action */}
          <div className="w-full lg:w-[150px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-l lg:border-l-0 border-zinc-200/80 relative">
            {isAuction ? (
              <div className="flex-1 flex items-center justify-center px-1.5 py-1.5 overflow-hidden">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualPrice();
                  }}
                  disabled={!canBid || !isActive}
                  className="px-3 h-9 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-[10px] uppercase rounded-[4px] shadow-sm transition-all"
                >
                  Ваша ціна
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full border-l lg:border-l-0 border-zinc-200/80 z-10 w-full">
                <div className="h-[26px] flex items-center justify-between px-2 bg-[#eef7ec] dark:bg-emerald-900/40">
                  <span className="text-[9px] text-[#2c5f2d] dark:text-slate-400 font-medium">
                    Ваша ставка
                  </span>
                  <span className="text-[11px] font-black text-[#2c5f2d] dark:text-emerald-400">
                    {cargo.price_proposed
                      ? `${cargo.price_proposed}${currencySymbol}`
                      : ""}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-1.5 py-2 bg-white dark:bg-transparent overflow-hidden">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmBid();
                    }}
                    disabled={!canBid || !isActive}
                    className="px-3 h-9 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-[10px] uppercase rounded-[4px] transition-all shadow-sm"
                  >
                    Зробити ставку
                  </Button>
                </div>
                <div className="h-[26px] flex items-center justify-between px-2 bg-white dark:bg-slate-900 border-t border-zinc-200/80 dark:border-white/5">
                  <span className="text-[9px] text-zinc-500 dark:text-slate-400 font-medium">
                    Краща ставка
                  </span>
                  <span className="text-[11px] font-black text-[#e03131] dark:text-red-400">
                    {bestBidPrice ? `${bestBidPrice}${currencySymbol}` : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-[34px] px-3 flex items-center justify-between border-t border-zinc-200/80 dark:border-white/10 bg-white dark:bg-slate-800/30 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-white">
              <UserIcon
                size={14}
                className="text-zinc-500 dark:text-slate-400"
              />
              <span>{cargo?.author || "Менеджер"}</span>
            </div>
            {cargo?.email && (
              <a
                href={`mailto:${cargo?.email}`}
                className="flex items-center gap-1.5 text-[#6366f1] dark:text-indigo-400 hover:underline transition-colors"
              >
                <MailIcon
                  size={14}
                  className="text-indigo-400 dark:text-indigo-500"
                />
                <span>{cargo?.email}</span>
              </a>
            )}
            {cargo?.usr_phone && cargo.usr_phone.length > 0 && (
              <a
                href={`tel:${cargo.usr_phone[0]?.phone || "380987546702"}`}
                className="flex items-center gap-1.5 text-[#6366f1] dark:text-indigo-400 hover:underline transition-colors"
              >
                <PhoneIcon
                  size={14}
                  className="text-indigo-400 dark:text-indigo-500"
                />
                <span>{cargo.usr_phone[0]?.phone || "380987546702"}</span>
              </a>
            )}
          </div>
          <div className="flex items-center">
            {cargo?.files && cargo.files.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilesModalOpen(true);
                }}
                className="p-1 rounded text-[#6366f1] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                title={`Документи (${cargo.files.length})`}
              >
                <PaperclipIcon
                  size={15}
                  className="-rotate-45"
                  strokeWidth={2.5}
                />
              </button>
            )}
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
