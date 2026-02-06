"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import { 
  TrendingDown, 
  Zap, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  Package,
  Truck
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

export function TenderCardFour({
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

  const { canBid, isFinished } = useMemo(() => {
    const start = cargo.time_start ? new Date(cargo.time_start).getTime() : 0;
    const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
    const currentTime = now.getTime();
    return {
      canBid: currentTime >= start && (end === 0 || currentTime <= end),
      isFinished: end > 0 && currentTime > end,
    };
  }, [now, cargo.time_start, cargo.time_end]);

  return (
    <>
      <Card className={cn(
        "group relative w-full mb-3 overflow-hidden transition-all duration-300",
        "border border-zinc-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md",
        isFinished ? "opacity-75 grayscale" : "bg-white dark:bg-zinc-900/50 backdrop-blur-sm"
      )}>
        {/* Акцентна смуга зверху */}
        <div className={cn(
          "h-1 w-full absolute top-0 left-0",
          canBid ? "bg-gradient-to-r from-sky-500 to-indigo-500" : "bg-zinc-300"
        )} />

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            
            {/* БЛОК 1: МАРШРУТ (Головний акцент) */}
            <div className="flex-[2] p-5 border-r border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">
                  #{cargo.id}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock size={12} />
                  <span className="text-[11px] font-medium">Створено: 12:40</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flag country="PL" size={18} className="rounded-sm shadow-sm" />
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Poznan (PL)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium ml-7">02.11 • 09:00</p>
                </div>

                <div className="flex flex-col items-center flex-1 px-4">
                  <div className="w-full h-[1px] bg-zinc-100 dark:bg-white/10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-2">
                      <ArrowRight size={14} className="text-sky-500" />
                    </div>
                  </div>
                  <span className="text-[9px] text-sky-500 font-bold uppercase mt-2 tracking-tighter cursor-pointer hover:underline" onClick={onOpenDetails}>
                    Деталі рейсу
                  </span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Lviv (UA)</span>
                    <Flag country="UA" size={18} className="rounded-sm shadow-sm" />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium mr-7">07.11 • 15:30</p>
                </div>
              </div>
            </div>

            {/* БЛОК 2: ВАНТАЖ ТА МИТНИЦЯ */}
            <div className="flex-1 p-5 border-r border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-white/[0.01]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 shadow-sm">
                    <Package size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 leading-none mb-1">Вантаж</p>
                    <p className="text-[11px] font-bold">21.6т • 33 палети</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 shadow-sm">
                    <Truck size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 leading-none mb-1">Транспорт</p>
                    <p className="text-[11px] font-bold">Тент, Бок, Ремені 8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* БЛОК 3: ТОРГИ (Інтерактивна зона) */}
            <div className="flex-[1.5] p-5 flex flex-col justify-between bg-zinc-50/50 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Поточна ціна</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">
                      {cargo.price_next}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">UAH</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                     <Clock size={12} className="animate-pulse" />
                     <span className="text-[10px] font-black uppercase">
                        {cargo.time_end && <TenderTimer label="Card 4" targetDate={cargo.time_end}  />}
                     </span>
                   </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className="flex-[2] h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
                >
                  Зробити ставку
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={!canBid}
                  onClick={() => setActiveModal("buyout")}
                  className="flex-1 h-10 border-orange-200 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-900/20 text-orange-600 transition-all"
                >
                  <Zap size={16} fill="currentColor" />
                </Button>
              </div>
            </div>

          </div>
        </CardContent>

        {/* Футер-індикатор */}
        <div className="px-5 py-2 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-transparent">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-400 font-medium italic">
              Крок: <span className="text-emerald-500 font-bold">{cargo.price_step} грн</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium italic">
              Старт: <span className="text-zinc-600 dark:text-zinc-400 font-bold">{cargo.price_start} грн</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase tracking-widest group-hover:gap-2 transition-all cursor-pointer" onClick={onOpenDetails}>
            Детальніше <ChevronRight size={12} />
          </div>
        </div>
      </Card>

      {/* Модалки */}
      <ConfirmDialog open={activeModal === "confirm"} onOpenChange={closeModal} title="Підтвердження" description={`Ваша ставка: ${cargo.price_next} грн`} onConfirm={onConfirmReduction} />
      <ManualPriceDialog open={activeModal === "manual"} onOpenChange={closeModal} currentPrice={cargo.price_start} onConfirm={onManualPrice} currentValut={cargo.valut_name} />
      <ConfirmDialog open={activeModal === "buyout"} onOpenChange={closeModal} title="Швидкий викуп" description={`Ви впевнені, що хочете викупити рейс за ${cargo.price_redemption} грн?`} onConfirm={onBuyout} />
    </>
  );
}