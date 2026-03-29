"use client";

import React from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  User as UserIcon,
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
  Paperclip,
  CheckCircle2,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Building2,
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
import { useTenderDelWinner } from "../../hooks/useTenderDelWinner";
import { FilesPreviewModal } from "@/shared/ict_components/FilesPreviewModal/FilesPreviewModal";
import { getRegionName } from "@/shared/utils/region.utils";
import {
  formatTenderDate,
  getTenderLoadDateString,
} from "@/shared/utils/date.utils";
import { getCurrencySymbol } from "@/shared/utils/currency.utils";
import { FaMoneyBill } from "react-icons/fa";

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
  const { mutateAsync: delWinner, isPending: isDelWinner } =
    useTenderDelWinner();
  const [isRatesOpen, setIsRatesOpen] = React.useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = React.useState(false);
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
      await delWinner({
        id_tender_rate: rate.id,
        car_count: 0, // Передаємо 0, щоб скасувати
      });
    } catch (e) {
      // Помилка вже оброблена в хуку
    }
  };
  const currencySymbol = getCurrencySymbol(cargo.valut_name);
  const trailers =
    cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "—";
  const loadTypes =
    cargo.tender_load?.map((l) => l.load_type_name).join(", ") || "";
  const isPlan = cargo.ids_status === "PLAN";

  // Generating all bids sorted by lowest price
  const topBids = React.useMemo(() => {
    if (!cargo.rate_company || cargo.rate_company.length === 0) return [];
    return [...cargo.rate_company].sort(
      (a, b) => a.price_proposed - b.price_proposed,
    );
  }, [cargo.rate_company]);

  const bestBid = topBids[0] || null;

  // Check if we have an active winner
  const winningBid = cargo.rate_company?.find((r) => r.car_count_winner! > 0);

  return (
    <div className="w-full relative mb-5 overflow-hidden border border-zinc-200 dark:border-white/10 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all bg-[#f4f5f8] dark:bg-slate-900/60 font-sans text-xs flex flex-col group/card">
      {/* Tender Actions Menu */}
      <div className="absolute top-2 right-2 z-50 opacity-100 lg:opacity-50 lg:group-hover/card:opacity-100 transition-opacity">
        <TenderActions tender={cargo} />
      </div>

      {isRef && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <Snowflake className="absolute -top-1 -right-1 text-blue-400/10 w-12 h-12 rotate-12" />
          <Snowflake className="absolute top-4 -right-3 text-blue-500/5 w-8 h-8 -rotate-12" />
          <Snowflake className="absolute -bottom-2 right-10 text-blue-300/10 w-10 h-10 rotate-45" />
        </div>
      )}

      {/* Main Grid Card */}
      <div className="bg-white dark:bg-slate-900 mx-px mt-px rounded-t-xl overflow-hidden flex flex-col border-b border-zinc-200/80">
        <div className="flex flex-col lg:flex-row w-full min-h-[90px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80 dark:divide-white/10">
          {/* 1. № */}
          <div
            className="w-full lg:w-[60px] flex-shrink-0 flex items-center justify-center p-2 cursor-pointer hover:bg-sky-50 transition-colors"
            onClick={onOpenDetails}
          >
            <span
              className={cn(
                "text-[16px] lg:text-[18px] font-bold text-zinc-800 dark:text-white leading-none",
                title,
              )}
            >
              {cargo.id}
            </span>
          </div>

          {/* 2. Завантаження */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center p-2">
            {fromPoints.length === 0 && (
              <span className="text-zinc-400 font-medium">—</span>
            )}
            {fromPoints.map((pt, i) => (
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
                    {(pt as any).zip_code ? `${(pt as any).zip_code}, ` : ""}
                    {pt.city}
                  </span>
                </div>
                {(pt as any).ids_region && (
                  <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                    {getRegionName((pt as any).ids_region)}
                  </span>
                )}
              </div>
            ))}
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
                  {(pt as any).zip_code ? `${(pt as any).zip_code}, ` : ""}
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
            {toPoints.length === 0 && (
              <span className="text-zinc-400 font-medium">—</span>
            )}
            {toPoints.map((pt, i) => (
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
                    {(pt as any).zip_code ? `${(pt as any).zip_code}, ` : ""}
                    {pt.city}
                  </span>
                </div>
                {(pt as any).ids_region && (
                  <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                    {getRegionName((pt as any).ids_region)}
                  </span>
                )}
              </div>
            ))}
            {formatTenderDate(cargo.date_unload) && (
              <span className="text-[12px] font-bold text-indigo-500 dark:text-indigo-400 mt-1">
                {formatTenderDate(cargo.date_unload)}
              </span>
            )}
          </div>

          {/* 5. Вантаж */}
          <div className="w-full lg:w-[70px] flex-shrink-0 flex items-center justify-center p-2 text-center">
            <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
              {cargo.cargo || "ТНП"}
            </span>
          </div>

          {/* 6. Тип транспорту */}
          <div className="w-full lg:w-[90px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center leading-tight gap-1">
            <span className="font-semibold text-zinc-800 dark:text-white text-[12px] leading-tight">
              {trailers.split(", ").map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  <br />
                </React.Fragment>
              ))}
            </span>
            {loadTypes && (
              <span className="text-[11px] text-zinc-500">
                {loadTypes.split(", ")[0]}
              </span>
            )}
          </div>

          {/* 7. Вага/Об'єм */}
          <div className="w-full lg:w-[80px] flex-shrink-0 flex flex-col items-center justify-center p-2 text-center">
            {cargo.volume ? (
              <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                {cargo.volume} м³
              </span>
            ) : null}
            {cargo.weight ? (
              <span className="font-semibold text-zinc-800 dark:text-white text-[12px] mt-0.5">
                {cargo.weight} т.
              </span>
            ) : null}
            {!cargo.volume && !cargo.weight && (
              <span className="text-zinc-500">—</span>
            )}
          </div>

          {/* 8. Нотатки */}
          <div className="flex-1 min-w-[120px] max-w-[140px] flex items-center justify-center p-2 text-center overflow-hidden">
            <div className="max-h-[80px] overflow-y-auto custom-scrollbar w-full">
              <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium leading-tight">
                {cargo.notes || "—"}
              </span>
            </div>
          </div>

          {/* 9. Ціни */}
          <div className="w-full lg:w-[130px] flex-shrink-0 flex flex-col bg-white overflow-hidden">
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
            <div className="h-[45px] flex flex-col items-center justify-center bg-[#eef7ec] dark:bg-emerald-900/20 border-t border-zinc-200/80">
              <span className="text-[10px] text-[#2c5f2d] dark:text-emerald-300 font-medium mb-0.5">
                Ціна замовника
              </span>
              <span className="text-[14px] font-black text-[#2c5f2d] dark:text-emerald-400 leading-none">
                {cargo.cost_start || 0}
                <span className="text-[11px] ml-[1px]">{currencySymbol}</span>
              </span>
            </div>
          </div>

          {/* 10. Залишилось */}
          <div className="w-full lg:w-[110px] flex-shrink-0 flex flex-col bg-white">
            <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-[45px]">
              <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium tracking-normal mb-1">
                Залишилось
              </span>
              <span className="font-bold text-[#e03131] dark:text-red-400 text-[14px] tracking-tight leading-none">
                <TenderTimer
                  label=""
                  targetDate={isPlan ? cargo.time_start : cargo.time_end}
                />
              </span>
            </div>
            {cargo.price_redemption ? (
              <div className="h-[45px] w-full flex flex-col items-center justify-center border-t border-zinc-200/80">
                <span className="text-[10px] text-zinc-500 font-medium mb-0.5">
                  Викуп
                </span>
                <span className="text-[14px] font-black text-zinc-800 leading-none">
                  {cargo.price_redemption}
                  <span className="text-[11px] ml-[1px]">{currencySymbol}</span>
                </span>
              </div>
            ) : null}
          </div>

          {/* 11. Краща Ставка */}
          <div
            className="w-full lg:w-[150px] flex-shrink-0 flex flex-col bg-[#eef7ec] dark:bg-emerald-900/30 border-l lg:border-l-0 border-[#eef7ec] relative items-center justify-center p-3 hover:bg-[#e4f2df] transition-colors cursor-pointer"
            onClick={() => setIsRatesOpen(!isRatesOpen)}
          >
            <div className="flex flex-col items-center justify-center w-full">
              <span className="text-[11px] font-bold text-[#2c5f2d] dark:text-emerald-300 uppercase mb-1">
                Краща ставка
              </span>
              <span className="text-[16px] font-black text-[#2c5f2d] dark:text-emerald-400 leading-none mb-1">
                {bestBid ? bestBid.price_proposed : cargo.price_start}
                <span className="text-[12px] ml-[1px]">{currencySymbol}</span>
              </span>
              <span className="text-[10px] text-[#2c5f2d]/70 font-medium truncate max-w-full">
                {bestBid ? bestBid.company_name : "Очікується"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROPOSAL / TOP BIDS HIGHLIGHT */}
      {isRatesOpen && topBids.length > 0 && (
        <div className="mx-2 mt-2 mb-2 flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
          {topBids.map((bid, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;
            const isWinner = winningBid?.id === bid.id;

            // Створення динамічних пропсів для стилів
            const cardBg = isTop1
              ? "border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-500/10 dark:border-emerald-500/20"
              : isTop2
                ? "border-amber-400/50 bg-amber-50/40 dark:bg-amber-500/10 dark:border-amber-500/20"
                : isTop3
                  ? "border-red-400/50 bg-red-50/40 dark:bg-red-500/10 dark:border-red-500/20"
                  : "border-slate-100 bg-white dark:bg-slate-800/40 dark:border-white/5";

            const badgeBg = isTop1
              ? "bg-emerald-500 shadow-emerald-500/20"
              : isTop2
                ? "bg-amber-500 shadow-amber-500/20"
                : isTop3
                  ? "bg-red-500 shadow-red-500/20"
                  : "bg-slate-400 shadow-slate-400/20";

            const badgeLabel = isTop1
              ? "BEST PRICE"
              : isTop2
                ? "TOP 2"
                : isTop3
                  ? "TOP 3"
                  : `TOP ${index + 1}`;

            const iconColor = isTop1
              ? "text-emerald-700"
              : isTop2
                ? "text-amber-700"
                : isTop3
                  ? "text-red-700"
                  : "text-slate-500";

            const dividerColor = isTop1
              ? "bg-emerald-200"
              : isTop2
                ? "bg-amber-200"
                : isTop3
                  ? "bg-red-200"
                  : "bg-slate-200";

            const emailBtnColor = isTop1
              ? "border-emerald-200 text-emerald-600"
              : isTop2
                ? "border-amber-200 text-amber-600"
                : isTop3
                  ? "border-red-200 text-red-600"
                  : "border-slate-200 text-slate-500";

            const labelTitleColor = isTop1
              ? "text-emerald-600"
              : isTop2
                ? "text-amber-600"
                : isTop3
                  ? "text-red-500"
                  : "text-slate-400";

            const priceColor = isTop1
              ? "text-[#0eb48c]"
              : isTop2
                ? "text-amber-600"
                : isTop3
                  ? "text-red-500"
                  : "text-slate-700";

            const actionBtnColor = isTop1
              ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
              : isTop2
                ? "border-amber-400 text-amber-600 hover:bg-amber-50"
                : isTop3
                  ? "border-red-400 text-red-600 hover:bg-red-50"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50";

            return (
              <div
                key={bid.id}
                className={cn(
                  "relative border rounded-3xl p-4 flex flex-col lg:flex-row shadow-sm gap-4 items-center transition-all",
                  cardBg,
                )}
              >
                <div
                  className={cn(
                    "absolute -top-[9px] left-4 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-sm",
                    badgeBg,
                  )}
                >
                  {badgeLabel}
                </div>

                {/* Left Info Box */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6 pl-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className={iconColor} />
                      <span className="font-bold text-zinc-800 text-sm whitespace-nowrap">
                        {bid.company_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-zinc-400" />
                      <span className="font-medium text-zinc-600 text-[11px] whitespace-nowrap">
                        {bid.author}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn("hidden sm:block w-px h-10", dividerColor)}
                  />

                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      className={cn(
                        "rounded-full bg-white h-8 px-4 text-[11px] font-medium opacity-80 pointer-events-none",
                        emailBtnColor,
                      )}
                    >
                      <MailIcon size={12} className="mr-2 opacity-50" />{" "}
                      {bid.email || "email не вказано"}
                    </Button>
                  </div>
                </div>

                {/* Right Price Action */}
                <div className="flex flex-col items-center sm:items-end justify-center pr-2 gap-1.5 w-full sm:w-auto">
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      labelTitleColor,
                    )}
                  >
                    ПРОПОЗИЦІЯ
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-black leading-none mb-1",
                      priceColor,
                    )}
                  >
                    {bid.price_proposed} {currencySymbol}
                  </span>
                  {isWinner ? (
                    <Button
                      disabled={isDelWinner}
                      onClick={() => handleRemoveWinner(bid)}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-full h-8 px-6 text-[10px] font-black uppercase tracking-widest shadow-md shadow-amber-500/20"
                    >
                      Скасувати вибір
                    </Button>
                  ) : (
                    <Button
                      disabled={isPending || winningBid !== undefined}
                      onClick={() => handleSetWinner(bid, 1)}
                      className={cn(
                        "w-full sm:w-auto bg-white border rounded-full h-8 px-6 text-[10px] font-black uppercase tracking-widest",
                        actionBtnColor,
                      )}
                    >
                      ЗАПРОПОНОВАНА ЦІНА
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <div className="h-[34px] px-3 flex items-center justify-between bg-zinc-100/50 dark:bg-slate-800/30 text-[11px] mt-auto">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-white">
            <UserIcon size={14} className="text-zinc-500" />
            <span>{cargo.author}</span>
          </div>
          {cargo?.price_client && (
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-white">
              <FaMoneyBill size={14} className="text-zinc-500" />
              <span>{cargo?.price_client}</span>
            </div>
          )}

          {(cargo as any).email && (
            <div className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline cursor-pointer">
              <MailIcon size={14} className="text-blue-400" />
              <span>{(cargo as any).email}</span>
            </div>
          )}
          {(cargo as any).usr_phone && (
            <div className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline cursor-pointer">
              <PhoneIcon size={14} className="text-blue-400" />
              <span>{(cargo as any).usr_phone}</span>
            </div>
          )}
        </div>

        {cargo.files && cargo.files.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all hover:rotate-12 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsFilesModalOpen(true);
            }}
          >
            <Paperclip size={16} />
          </Button>
        )}
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
