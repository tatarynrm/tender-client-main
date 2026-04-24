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
  Zap,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { IRateCompany, ITender } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useTenderActions } from "@/features/dashboard/tender/hooks/useTenderActions";
import { ManualPriceDialog } from "@/features/dashboard/tender/components/ManualPriceDialog";
import TenderActions from "./TenderActions/TenderActions";
import { useTenderSetWinner } from "../../hooks/useTenderSetWinner";
import { useTenderDelWinner } from "../../hooks/useTenderDelWinner";
import { FilesPreviewModal } from "@/shared/ict_components/FilesPreviewModal/FilesPreviewModal";
import { getRegionName } from "@/shared/utils/region.utils";
import { useProfile } from "@/shared/hooks";
import {
  formatTenderDate,
  formatTenderDateTime,
  getTenderLoadDateString,
} from "@/shared/utils/date.utils";
import { getCurrencySymbol } from "@/shared/utils/currency.utils";
import { FaMoneyBill } from "react-icons/fa";

import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";

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
  const { openModal, confirm } = useModalStore();
  const { profile } = useProfile();

  const isAuthor = React.useMemo(() => {
    if (!profile || !cargo) return false;

    const pEmail = profile.email || (profile as any).usr_email || "";
    const cEmail = cargo.email || (cargo as any).usr_email || "";
    if (pEmail && cEmail && pEmail.toLowerCase() === cEmail.toLowerCase())
      return true;

    const cIdAuthor = (cargo as any).id_usr || (cargo as any).id_author;
    if (cIdAuthor && profile.id === cIdAuthor) return true;

    const pName =
      `${profile.person.name || ""} ${profile.person.surname || ""}`.trim();
    const cName = cargo.author?.trim();
    if (pName && cName && pName.toLowerCase() === cName.toLowerCase())
      return true;

    return false;
  }, [profile, cargo]);

  const [myPrice, setMyPrice] = React.useState(0);
  React.useEffect(() => {
    // 1. Пріоритет на персональне поле від бекенду
    if (cargo.person_price_proposed) {
      setMyPrice(cargo.person_price_proposed);
      return;
    }

    // 2. Фоллбек на ручний пошук
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

  const currencySymbol = getCurrencySymbol(cargo.valut_name);
  const isActive = cargo.ids_status === "ACTIVE";
  const isPlan = cargo.ids_status === "PLAN";

  const topBids = React.useMemo(() => {
    if (!cargo.rate_company || cargo.rate_company.length === 0) return [];
    return [...cargo.rate_company].sort((a, b) => {
      const priceA = a?.price_proposed ?? Infinity;
      const priceB = b?.price_proposed ?? Infinity;
      return priceA - priceB;
    });
  }, [cargo.rate_company]);

  const bestBid = topBids[0] || null;
  const bestBidValue = React.useMemo(() => {
    if (!cargo.rate_company || cargo.rate_company.length === 0) return null;
    return Math.min(...cargo.rate_company.map((r) => r.price_proposed));
  }, [cargo.rate_company]);

  const nextBidValue =
    bestBidValue !== null && !isNaN(Number(bestBidValue))
      ? Number(bestBidValue) - (Number(cargo.price_step) || 0)
      : cargo.price_next && !isNaN(Number(cargo.price_next))
        ? Number(cargo.price_next)
        : Number(cargo.price_start) || 0;

  const { onConfirmReduction, onManualPrice, onBuyout } = useTenderActions(
    cargo.id,
    nextBidValue,
    cargo.price_redemption,
  );

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

  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM",
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter(
    (p) =>
      ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point) ||
      p.customs === true,
  );

  const isRef = cargo?.tender_trailer?.some(
    (t) => t.ids_trailer_type === "REF",
  );

  const handleSetWinner = async (rate: IRateCompany, carCount: number) => {
    if (!rate.id) return;
    try {
      await setWinner({ id_tender_rate: rate.id, car_count: carCount });
    } catch (e) {}
  };

  const handleRemoveWinner = async (rate: IRateCompany) => {
    if (!rate.id) return;
    try {
      await delWinner({ id_tender_rate: rate.id, car_count: 0 });
    } catch (e) {}
  };

  const trailers =
    cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "—";
  const winningBid = cargo.rate_company?.find((r) => r.car_count_winner! > 0);

  return (
    <div className="w-full relative overflow-hidden border border-zinc-200 dark:border-white/10 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all bg-[#f4f5f8] dark:bg-slate-900/60 font-sans text-xs flex flex-col group/card">
      {isRef && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <Snowflake className="absolute -top-1 -right-1 text-blue-400/10 w-12 h-12 rotate-12" />
          <Snowflake className="absolute top-4 -right-3 text-blue-500/5 w-8 h-8 -rotate-12" />
          <Snowflake className="absolute -bottom-2 right-10 text-blue-300/10 w-10 h-10 rotate-45" />
        </div>
      )}

      {/* Main Grid Card - Adjusted for better responsiveness */}
      <div className="bg-white dark:bg-slate-900 mx-px mt-px rounded-t-xl overflow-hidden flex flex-col border-b border-zinc-200/80">
        <div className="flex flex-col xl:flex-row w-full xl:h-[115px] divide-y xl:divide-y-0 xl:divide-x divide-zinc-200/80 dark:divide-white/10 overflow-hidden">
          {/* 1. № */}
          <div
            className="w-full xl:w-[60px] flex-shrink-0 flex items-center justify-center p-3 xl:p-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border-r border-zinc-100 dark:border-white/5 group/number relative"
            onClick={onOpenDetails}
          >
            <MyTooltip 
              text="Унікальний номер тендеру. Натисніть для перегляду деталей" 
              className="absolute top-1 right-1" 
              size={10}
            />
            <span
              className={cn(
                "text-[18px] xl:text-[18px] font-black text-blue-600 dark:text-blue-400 leading-none group-hover/number:scale-110 transition-transform",
                title,
              )}
            >
              {cargo.id}
            </span>
          </div>

          {/* 2. Завантаження */}
          <div className="flex-1 md:min-w-[130px] flex flex-col items-center justify-center p-3 xl:p-2 xl:h-full overflow-hidden">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {fromPoints.length === 0 && (
                <span className="text-zinc-400 font-medium">—</span>
              )}
              {fromPoints.map((pt, i) => {
                const ptAny = pt as any;
                const zip = ptAny.post_code || ptAny.zip_code;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center leading-tight mb-1 last:mb-0 w-full min-w-0 px-2"
                  >
                    <div className="flex items-center justify-center gap-2 font-bold text-zinc-800 dark:text-white text-[12px] w-full min-w-0">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={16}
                          className="rounded-[2px] shadow-sm shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {zip && pt.ids_country !== "UA" && (
                          <span className="text-indigo-600 dark:text-indigo-400 mr-0.5">
                            {zip}
                          </span>
                        )}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate w-full">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {getTenderLoadDateString(cargo.date_load, cargo.date_load2) && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 w-full text-center px-1 truncate">
                    {getTenderLoadDateString(cargo.date_load, cargo.date_load2)}
                </span>
                <MyTooltip text="Дата або період завантаження" size={10} />
              </div>
            )}
          </div>

          {/* 3. Розвантаження */}
          <div className="flex-1 md:min-w-[130px] flex flex-col items-center justify-center p-3 xl:p-2 xl:h-full overflow-hidden">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {toPoints.map((pt, i) => {
                const ptAny = pt as any;
                const zip = ptAny.post_code || ptAny.zip_code;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center leading-tight mb-1 last:mb-0 w-full min-w-0 px-2"
                  >
                    <div className="flex items-center justify-center gap-2 font-bold text-zinc-800 dark:text-white text-[12px] w-full min-w-0">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={16}
                          className="rounded-[2px] shadow-sm shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {zip && pt.ids_country !== "UA" && (
                          <span className="text-indigo-600 dark:text-indigo-400 mr-0.5">
                            {zip}
                          </span>
                        )}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate w-full">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {formatTenderDateTime(cargo.date_unload) && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 w-full text-center px-1 truncate">
                    {formatTenderDateTime(cargo.date_unload)}
                </span>
                <MyTooltip text="Дата розвантаження" size={10} />
              </div>
            )}
          </div>

          {/* 4. Митне оформлення (Зменшений шрифт) */}
          <div className="flex-1 md:min-w-[130px] flex flex-col justify-center p-3 relative items-center xl:h-full bg-zinc-50/30 dark:bg-white/[0.02] overflow-hidden">
            <div className="max-h-[70px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full flex flex-col items-center">
              {transitPoints.map((pt, i) => {
                const ptAny = pt as any;
                const zip = ptAny.post_code || ptAny.zip_code;
                const isLoadFrom =
                  pt.ids_point === "LOAD_FROM" || pt.ids_point === "CUSTOM_UP";
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center mb-2 last:mb-0 leading-tight w-full min-w-0 px-2"
                  >
                    <span
                      className={cn(
                        "text-[8px] uppercase font-bold tracking-tight mb-1 flex items-center justify-center gap-1",
                        isLoadFrom ||
                          (pt.customs && pt.ids_point === "LOAD_FROM")
                          ? "text-emerald-600/70 dark:text-emerald-400/70"
                          : "text-indigo-500/70 dark:text-indigo-400/70",
                      )}
                    >
                      {isLoadFrom ||
                      (pt.customs && pt.ids_point === "LOAD_FROM")
                        ? "Замитнення"
                        : "Розмитнення"}
                      <MyTooltip text="Місце митного оформлення або перетину кордону" size={8} />
                    </span>
                    <div className="flex items-center justify-center gap-1.5 font-bold text-[10px] text-zinc-600 dark:text-zinc-400 w-full min-w-0">
                      {pt.ids_country && (
                        <Flag
                          country={pt.ids_country}
                          size={12}
                          className="rounded-[1px] opacity-70 shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {pt.ids_country ? `${pt.ids_country}-` : ""}
                        {zip && pt.ids_country !== "UA" && (
                          <span className="text-indigo-500/70 mr-0.5">
                            {zip}
                          </span>
                        )}
                        {pt.city}
                      </span>
                    </div>
                    {ptAny.ids_region && (
                      <span className="text-[9px] text-zinc-400 font-medium mt-0.5 truncate w-full">
                        {getRegionName(ptAny.ids_region)}
                      </span>
                    )}
                  </div>
                );
              })}
              {transitPoints.length === 0 && (
                <span className="text-zinc-400 font-medium text-center">—</span>
              )}
            </div>
          </div>

          {/* 5. Вантаж */}
          <div className="w-full xl:w-[150px] flex-shrink-0 flex items-center justify-center p-3 xl:p-2 text-center text-[11px] font-semibold xl:border-b-0 border-b border-zinc-100 dark:border-white/5 xl:h-full">
            {cargo.cargo || "—"}
          </div>

          {/* 6. Транспорт */}
          <div className="w-full xl:w-[90px] flex-shrink-0 flex flex-col items-center justify-center p-3 xl:p-2 text-center leading-tight gap-1 xl:border-b-0 border-b border-zinc-100 dark:border-white/5 xl:h-full">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
              <Truck size={13} className="text-zinc-500" />
              <span className="font-black text-zinc-800 dark:text-white text-[11px]">
                {cargo.car_count || 1}
              </span>
              <MyTooltip text="Кількість необхідних автомобілів" size={10} />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-white text-[11px]">
              {trailers}
            </span>
            <span className="font-semibold text-zinc-800 dark:text-white text-[11px]">
              {}
            </span>
          </div>

          {/* 7. Вага/Об'єм */}
          <div className="w-full xl:w-[50px] flex-shrink-0 flex flex-col items-center justify-center p-3 xl:p-2 text-center xl:border-b-0 border-b border-zinc-100 dark:border-white/5 xl:h-full">
            {cargo.volume && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                    {cargo.volume} м³
                </span>
                <MyTooltip text="Об’єм вантажу" size={10} />
              </div>
            )}
            {cargo.weight && (
               <div className="flex items-center gap-1">
                    <span className="font-semibold text-zinc-800 dark:text-white text-[12px]">
                        {cargo.weight} т.
                    </span>
                    <MyTooltip text="Вага вантажу" size={10} />
                </div>
            )}
          </div>

          {/* 8. Нотатки */}
          <div className="flex-1 w-full xl:min-w-[120px] xl:max-w-[140px] flex items-center justify-center p-3 xl:p-2 text-center relative xl:border-b-0 border-b border-zinc-100 dark:border-white/5 xl:h-full overflow-hidden">
            <div className="max-h-[80px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
              <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium leading-tight break-words whitespace-pre-wrap block">
                {cargo.notes || "—"}
              </span>
            </div>
            {cargo.files && cargo.files.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilesModalOpen(true);
                }}
                className="absolute bottom-1 right-1 text-[#6366f1] hover:scale-110 transition-transform"
              >
                <Paperclip size={14} className="rotate-45" />
              </button>
            )}
          </div>

          {/* 9. Ціни - Optimized widths and wrapping */}
          <div className="w-full xl:w-[130px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-x border-zinc-100 dark:border-white/5 overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 xl:h-full">
            {cargo.ids_type !== "AUCTION" && (
              <div className="h-[38px] flex flex-col items-center justify-center p-1 text-center">
                <span className="text-[8px] text-zinc-400 font-bold uppercase leading-none mb-0.5 flex items-center gap-1">
                  Стартова ціна
                  <MyTooltip text="Ціна, з якої розпочинаються торги" size={8} />
                </span>
                <span className="font-bold text-[12px] text-zinc-800 dark:text-white leading-none">
                  {cargo.price_start}
                  {currencySymbol}
                </span>
                <span className="text-[7.5px] text-zinc-500 mt-0.5 flex items-center gap-1">
                  Крок: {cargo.price_step}
                  <MyTooltip text="Сума, на яку змінюється ставка за один крок" size={7} />
                </span>
              </div>
            )}
            <div className="h-[38px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-white/5 p-1 text-center border-y border-zinc-100 dark:border-white/10">
              <span className="text-[8px] text-zinc-400 font-bold uppercase leading-none mb-0.5">
                Ціна замовника
              </span>
              <span className="font-bold text-[12px] text-zinc-800 dark:text-white leading-none">
                {cargo.price_client || "—"}
                {currencySymbol}
              </span>
            </div>
            <div
              className={cn(
                "h-[38px] flex flex-col items-center justify-center p-1 text-center transition-colors",
                myPrice > 0
                  ? "bg-emerald-50/50 dark:bg-emerald-500/10"
                  : "bg-white dark:bg-slate-900",
              )}
            >
              <span className="text-[8px] text-zinc-400 font-bold uppercase leading-none mb-0.5">
                Ваша поточна ставка
              </span>
              <span
                className={cn(
                  "text-[13px] font-black leading-none",
                  myPrice > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-300 dark:text-zinc-700",
                )}
              >
                {myPrice > 0 ? `${myPrice}${currencySymbol}` : "—"}
              </span>
            </div>
          </div>

          {/* 10. Залишилось */}
          <div className="w-full xl:w-[110px] flex-shrink-0 flex flex-col items-center justify-center p-3 xl:p-2 bg-white dark:bg-slate-900 xl:border-b-0 border-b border-zinc-100 dark:border-white/5 xl:h-full">
            <span className="text-[10px] text-zinc-500 font-medium mb-1 flex items-center gap-1">
              Залишилось
              <MyTooltip text="Час до завершення прийому ставок" size={8} />
            </span>
            <span
              className={cn(
                "font-bold text-[16px] tracking-tight leading-none text-center flex items-center justify-center",
                cargo.time_end ? "text-[#e03131]" : "text-emerald-500",
              )}
            >
              {cargo.time_end ? (
                <TenderTimer
                  label={isPlan ? "до старту тендеру" : ""}
                  targetDate={isPlan ? cargo.time_start : cargo.time_end}
                  variant={isPlan ? "blue" : "orange"}
                />
              ) : (
                "—"
              )}
            </span>

            {cargo.ids_type !== "AUCTION" && cargo.price_redemption ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyoutConfirm();
                }}
                disabled={!isActive}
                className="mt-2 w-full cursor-pointer  py-1 bg-[#fef2f2] hover:bg-red-300  text-rose-600 font-bold border border-rose-100 rounded-lg transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <span className="text-[8px] uppercase">Викуп</span>
                <span className="text-[11px]">
                  {cargo.price_redemption}
                  {currencySymbol}
                </span>
              </button>
            ) : null}
          </div>

          {/* 11. Дії */}
          <div className="w-full xl:w-[155px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-l border-zinc-100 dark:border-white/5 relative overflow-hidden p-3 xl:p-0">
            <div
              className="h-[43px] flex flex-col items-center justify-center p-1 bg-[#f0f9f1] dark:bg-emerald-900/40 cursor-pointer overflow-hidden relative group/rates transition-colors hover:bg-[#e6f4e7] dark:hover:bg-emerald-800/50"
              onClick={() => setIsRatesOpen(!isRatesOpen)}
            >
              <div className="flex items-center gap-1.5 leading-none mb-0.5">
                <span className="text-[9px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-tight flex items-center gap-1">
                  Краща ставка
                  <MyTooltip text="Найнижча ціна запропонована на даний момент іншим учасником" size={8} />
                </span>
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg">
                  {cargo.rate_company?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[13px] font-black text-emerald-900 dark:text-emerald-200">
                  {bestBid ? `${bestBid.price_proposed}${currencySymbol}` : "—"}
                </span>
                <ChevronDown
                  size={11}
                  className={cn(
                    "text-emerald-600 transition-transform duration-300",
                    isRatesOpen && "rotate-180",
                  )}
                />
              </div>
            </div>
            {cargo.ids_type !== "AUCTION" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmBid();
                }}
                disabled={!isActive}
                className="h-[43px] w-full cursor-pointer mb-1 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-zinc-400 text-white font-black text-[11px] uppercase tracking-wider transition-colors"
              >
                Зробити ставку
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleManualPrice();
              }}
              disabled={!isActive}
              className="h-[43px] w-full cursor-pointer rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-zinc-400 text-white font-black text-[11px] uppercase tracking-wider transition-colors"
            >
              Ваша ціна
            </button>
          </div>

          {/* 12. Меню */}
          <div className="w-full xl:w-[36px] flex-shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-white/5 border-l border-zinc-200 dark:border-white/10 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 py-3 xl:py-0">
            <TenderActions tender={cargo} disabled={!isAuthor} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="min-h-[36px] px-3 py-3 xl:py-0 flex flex-col xl:flex-row items-center justify-between bg-zinc-50 dark:bg-slate-800/40 text-[11px] border-t border-zinc-100 dark:border-white/5 gap-3 xl:gap-0">
        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-white">
            <UserIcon size={14} className="text-zinc-400" />
            <span className="truncate max-w-[120px]">{cargo.author}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {(cargo as any).email && (
              <a
                href={`mailto:${(cargo as any).email}`}
                className="flex items-center gap-1.5 text-blue-500 hover:underline"
              >
                <MailIcon size={14} className="opacity-70" />
                <span className="truncate max-w-[140px]">
                  {(cargo as any).email}
                </span>
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center">
          {cargo.company_name && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                Замовник:
              </span>
              <span className="text-[12px] font-black text-zinc-800 dark:text-white uppercase truncate max-w-[200px]">
                {cargo.company_name}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          {cargo.ids_members && (
            <span
              className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1",
                cargo.ids_members === "ALL"
                  ? "bg-emerald-100 text-emerald-600"
                  : cargo.ids_members === "MANAGER"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-sky-100 text-sky-600",
              )}
            >
              {cargo.ids_members === "ALL"
                ? "Всі"
                : cargo.ids_members === "MANAGER"
                  ? "Лише менеджери"
                  : "Лише перевізники"}
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1",
              cargo.ids_type === "AUCTION"
                ? "bg-amber-100 text-amber-600"
                : cargo.ids_type === "REDUCTION_WITH_REDEMPTION"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-indigo-100 text-indigo-600",
            )}
          >
            {cargo.ids_type === "AUCTION"
              ? "АУКЦІОН"
              : cargo.ids_type === "REDUCTION_WITH_REDEMPTION"
                ? "РЕДУКЦІОН З ВИКУПОМ"
                : "РЕДУКЦІОН"}
            <MyTooltip 
                text={
                    cargo.ids_type === "AUCTION" 
                    ? "Торги на підвищення: перемагає найвища ставка" 
                    : "Торги на пониження: перемагає найнижча ставка"
                } 
                size={9} 
            />
          </span>
          <span className="text-zinc-400 font-medium">
            публікація {formatTenderDate(cargo.time_start)}
          </span>
        </div>
      </div>

      {/* Rates list */}
      {isRatesOpen && topBids.length > 0 && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-zinc-100 dark:border-white/5">
          <TenderRatesList
            cargo={cargo}
            onSetWinner={handleSetWinner}
            onRemoveWinner={handleRemoveWinner}
          />
        </div>
      )}

      <FilesPreviewModal
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        files={cargo.files || []}
      />
    </div>
  );
}
