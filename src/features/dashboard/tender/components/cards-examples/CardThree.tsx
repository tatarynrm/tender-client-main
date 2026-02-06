"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import { TrendingDown, Zap, MapPin, Package, Truck, Info } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { TenderTimer } from "../TenderTimer";
import { ManualPriceDialog } from "../ManualPriceDialog";
import { useTenderActions } from "../../hooks/useTenderActions";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

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

  return (
    <>
      <Card className="w-full mb-2 md:mb-1 overflow-hidden border border-zinc-300 dark:border-white/10 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-white dark:bg-zinc-950">
        <CardContent className="p-0">
          <div className="flex flex-col md:grid md:grid-cols-12 text-[11px] leading-tight">
            
            {/* 1. Замовлення № (Mobile: Header) */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10 p-2 flex items-center justify-between md:flex-col md:justify-center bg-zinc-50/50 dark:bg-transparent">
              <span className="md:hidden text-zinc-400 font-bold uppercase text-[9px]">Замовлення</span>
              <span className="text-sky-600 font-bold hover:underline cursor-pointer text-[13px] md:text-[11px]" onClick={onOpenDetails}>
                {cargo.id}
              </span>
            </div>

            {/* 2 & 3. Маршрут (Mobile: Side by Side) */}
            <div className="grid grid-cols-2 md:contents">
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center">
                <div className="font-bold flex flex-col items-center gap-0.5">
                  <Flag country="PL" size={14} />
                  <span className="truncate w-full max-w-[80px] md:max-w-none">PL-60001, Poznan</span>
                </div>
                <span className="text-[10px] text-sky-600 mt-1">02.11 (09:00)</span>
              </div>

              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center">
                <div className="font-bold flex flex-col items-center gap-0.5">
                  <Flag country="UA" size={14} />
                  <span className="truncate w-full max-w-[80px] md:max-w-none">UA-79000, Львів</span>
                </div>
                <span className="text-[10px] text-sky-600 mt-1">07.11 (15:30)</span>
              </div>
            </div>

            {/* 4. Митне оформлення (Mobile: Full Width) */}
            <div className="md:col-span-2 border-y md:border-y-0 md:border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col justify-center gap-1 bg-zinc-50/30 dark:bg-transparent">
              <div className="flex gap-1 md:block"><span className="text-sky-500 min-w-[70px]">Замитн.:</span> <span className="text-zinc-700 dark:text-zinc-300">PL-60001, Poznan</span></div>
              <div className="flex gap-1 md:block"><span className="text-sky-500 min-w-[70px]">Розмитн.:</span> <span className="text-zinc-700 dark:text-zinc-300">UA-80383, Малехів</span></div>
            </div>

            {/* 5, 6, 7. Характеристики (Mobile: Grid 3 cols) */}
            <div className="grid grid-cols-3 md:contents border-b md:border-b-0 border-zinc-200 dark:border-white/10">
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex items-center justify-center text-center">
                Тент, бокове
              </div>
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex flex-col items-center justify-center text-center font-semibold">
                <span>33 палети,</span>
                <span>21,6т</span>
              </div>
              <div className="md:col-span-1 border-r border-zinc-200 dark:border-white/10 p-2 flex items-center justify-center text-center text-sky-500">
                ремні 8 шт
              </div>
            </div>

            {/* 8. ТОРГИ (Mobile: Action Area) */}
            <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-3 bg-zinc-50 dark:bg-white/[0.02] md:bg-transparent h-full">
              
              {/* Ціни */}
              <div className="flex flex-col border-r border-zinc-200 dark:border-white/10">
                <div className="flex-1 bg-zinc-100 dark:bg-white/5 p-2 flex flex-col items-center justify-center text-center border-b border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-500 text-[9px] md:text-[10px]">Старт {cargo.price_start}</span>
                  <span className="text-[8px] italic text-zinc-400">крок {cargo.price_step}</span>
                </div>
                <button 
                  onClick={() => setActiveModal("buyout")}
                  className="p-1 text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <span className="block text-[8px] text-zinc-400 uppercase">Викуп</span>
                  <span className="text-emerald-600 font-bold">{cargo.price_redemption} ₴</span>
                </button>
              </div>

              {/* Таймер */}
              <div className="flex flex-col items-center justify-center p-1 border-r border-zinc-200 dark:border-white/10 text-center">
                <span className="text-[9px] text-zinc-400 mb-1">Залишилось</span>
                <span className="font-bold text-zinc-700 dark:text-zinc-200 text-[10px] md:text-[11px]">
                  {cargo.time_end && <TenderTimer label="Card 3" targetDate={cargo.time_end} />}
                </span>
              </div>

              {/* Ставка Action */}
              <div className="flex flex-col font-bold">
                <div className="hidden md:flex flex-col p-1 text-center border-b border-zinc-200 dark:border-white/10">
                  <span className="block text-[9px] text-zinc-400">Ваша ставка</span>
                  <span className="text-red-600 truncate">{cargo.price_proposed || '—'}</span>
                </div>
                
                <button 
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className={cn(
                    "flex-1 py-2 md:py-1 transition-all uppercase text-[10px] flex flex-col items-center justify-center",
                    canBid ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-200 text-zinc-400"
                  )}
                >
                  Ставка
                  <span className="text-[9px] font-normal">({cargo.price_next})</span>
                </button>

                <div className="p-1 text-center bg-white dark:bg-transparent md:bg-transparent">
                  <span className="md:hidden block text-[8px] text-zinc-400 uppercase">Краща</span>
                  <span className="text-emerald-600 text-[10px]">{cargo.price_next} ₴</span>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Модалки - без змін */}
      <ConfirmDialog open={activeModal === "confirm"} onOpenChange={closeModal} title="Ставка" description={`${cargo.price_next}`} onConfirm={onConfirmReduction} />
      <ManualPriceDialog open={activeModal === "manual"} onOpenChange={closeModal} currentPrice={cargo.price_start} onConfirm={onManualPrice} currentValut={cargo.valut_name} />
      <ConfirmDialog open={activeModal === "buyout"} onOpenChange={closeModal} title="Викуп" description="Викупити рейс?" onConfirm={onBuyout} />
    </>
  );
}