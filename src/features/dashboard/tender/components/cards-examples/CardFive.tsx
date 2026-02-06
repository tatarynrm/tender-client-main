"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import { TrendingDown, Zap, Clock, Info, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { TenderTimer } from "../TenderTimer";
import { ManualPriceDialog } from "../ManualPriceDialog";
import { useTenderActions } from "../../hooks/useTenderActions";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function TenderCardFive({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main } = config;

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

  const { canBid, isHot } = useMemo(() => {
    const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
    const timeLeft = end - now.getTime();
    return {
      canBid: timeLeft > 0,
      isHot: timeLeft > 0 && timeLeft < 300000, // Менше 5 хвилин - стає "гарячим"
    };
  }, [now, cargo.time_end]);

  return (
    <>
      <Card className={cn(
        "w-full mb-1 overflow-hidden transition-all duration-300 border rounded-none shadow-none group",
        canBid ? "border-zinc-300 dark:border-white/10" : "opacity-70 grayscale",
        isHot && "border-orange-400 dark:border-orange-500/50 shadow-[0_0_10px_rgba(251,146,60,0.1)]"
      )}>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 text-[11px] leading-[1.3]">
            
            {/* 1. ID з ефектом фону */}
            <div className="col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-white/[0.02]">
              <span className="text-[9px] text-zinc-400 uppercase font-bold mb-1 tracking-tighter">№ Зам</span>
              <span 
                className="text-sky-600 font-black hover:text-sky-400 cursor-pointer transition-colors underline decoration-sky-600/30 underline-offset-4" 
                onClick={onOpenDetails}
              >
                {cargo.id}
              </span>
            </div>

            {/* 2. Маршрут: Звідки / Куди (Об'єднав для динаміки) */}
            <div className="col-span-2 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2 group/point">
                <Flag country="PL" size={14} className="rounded-xs shadow-sm" />
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">PL, Poznan</span>
                  <span className="text-[9px] text-sky-600 font-medium">02.11 • 09:00</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flag country="UA" size={14} className="rounded-xs shadow-sm" />
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">UA, Львів</span>
                  <span className="text-[9px] text-emerald-600 font-medium">07.11 • 15:30</span>
                </div>
              </div>
            </div>

            {/* 3. Митниця (Більш читабельно) */}
            <div className="col-span-2 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col justify-center space-y-1 bg-sky-50/20 dark:bg-transparent">
               <div className="flex items-start gap-1">
                  <ShieldCheck size={12} className="text-sky-500 mt-0.5" />
                  <div>
                    <span className="text-sky-600 font-bold text-[9px] uppercase block">Замитнення</span>
                    <span className="text-zinc-600 dark:text-zinc-400">PL-60001, Poznan</span>
                  </div>
               </div>
               <div className="flex items-start gap-1">
                  <div className="w-[12px]" /> {/* Spacer */}
                  <div>
                    <span className="text-sky-600 font-bold text-[9px] uppercase block">Розмитнення</span>
                    <span className="text-zinc-600 dark:text-zinc-400">UA-80383, Малехів</span>
                  </div>
               </div>
            </div>

            {/* 4. Транспорт & Вантаж (Компактно) */}
            <div className="col-span-2 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col justify-center gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="w-1 h-4 bg-amber-400 rounded-full" />
                Тент, Бок. завант.
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                21.6т / 33 пал / Прод.
              </div>
            </div>

            {/* 5. Дод. Інфо */}
            <div className="col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex items-center justify-center text-center text-[10px] text-sky-500 font-medium">
              ремні 8 шт
            </div>

            {/* 6. БЛОК ТОРГІВ (Найактивніша частина) */}
            <div className="col-span-4 grid grid-cols-10 h-full">
              
              {/* Сектор Ціни */}
              <div className="col-span-4 flex flex-col border-r border-zinc-200 dark:border-white/10">
                <div className="flex-1 bg-zinc-100 dark:bg-white/5 p-2 flex flex-col items-center justify-center text-center border-b border-zinc-200 dark:border-white/10 group-hover:bg-zinc-200/50 dark:group-hover:bg-white/10 transition-colors">
                  <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-tighter">Старт</span>
                  <span className="text-zinc-900 dark:text-white font-black">{cargo.price_start} ₴</span>
                  <span className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingDown size={8} /> {cargo.price_step}
                  </span>
                </div>
                <div 
                  className="p-1 text-center cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                  onClick={() => setActiveModal("buyout")}
                >
                  <span className="text-orange-600 dark:text-orange-400 font-black flex items-center justify-center gap-1">
                    <Zap size={10} fill="currentColor" /> {cargo.price_redemption} ₴
                  </span>
                </div>
              </div>

              {/* Сектор Таймера */}
              <div className={cn(
                "col-span-3 flex flex-col items-center justify-center p-1 border-r border-zinc-200 dark:border-white/10 text-center transition-colors",
                isHot ? "bg-orange-500/5" : "bg-white dark:bg-zinc-900"
              )}>
                <Clock size={12} className={cn("mb-1", isHot ? "text-orange-500 animate-pulse" : "text-zinc-400")} />
                <span className={cn("font-bold tabular-nums text-[10px]", isHot ? "text-orange-600" : "text-zinc-600")}>
                  {cargo.time_end && <TenderTimer targetDate={cargo.time_end}  label="Card 5" />}
                </span>
              </div>

              {/* Сектор Ставки (Action) */}
              <div className="col-span-3 flex flex-col font-bold">
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-white/[0.02] py-1">
                  <span className="text-[8px] text-zinc-400 uppercase">Ваша</span>
                  <span className={cn(
                    "text-[12px] transition-colors",
                    cargo.price_proposed ? "text-red-500" : "text-zinc-300"
                  )}>
                    {cargo.price_proposed || '---'}
                  </span>
                </div>
                
                <button 
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className={cn(
                    "h-10 transition-all flex flex-col items-center justify-center gap-0 relative overflow-hidden",
                    canBid 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-[0.97]" 
                      : "bg-zinc-200 text-zinc-400"
                  )}
                >
                  <span className="text-[9px] font-black uppercase tracking-tight leading-none">Ставка</span>
                  <span className="text-[11px] leading-none">{cargo.price_next} ₴</span>
                  {isHot && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />}
                </button>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Модалки (Ваша існуюча логіка) */}
      <ConfirmDialog open={activeModal === "confirm"} onOpenChange={closeModal} title="Підтвердіть ставку" description={`${cargo.price_next} ₴`} onConfirm={onConfirmReduction} />
      <ManualPriceDialog open={activeModal === "manual"} onOpenChange={closeModal} currentPrice={cargo.price_start} onConfirm={onManualPrice} currentValut={cargo.valut_name} />
      <ConfirmDialog open={activeModal === "buyout"} onOpenChange={closeModal} title="Миттєвий викуп" description={`Викупити за ${cargo.price_redemption} ₴?`} onConfirm={onBuyout} />
    </>
  );
}