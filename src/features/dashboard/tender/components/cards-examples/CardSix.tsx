"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import { 
  TrendingDown, Zap, MapPin, Package, Truck, Info, 
  Navigation, Gauge, Users, ArrowRightLeft 
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
import { Badge } from "@/shared/components/ui/badge"; // Припустимо, що є такий компонент

export function TenderCardSix({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const [now, setNow] = useState(new Date());

  const {
    activeModal,
    setActiveModal,
    closeModal,
    onConfirmReduction,
    onManualPrice,
    onBuyout,
  } = useTenderActions(cargo.id, cargo.price_next, cargo.price_redemption);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Розрахунок прогресу часу для візуальної полоски
  const timeProgress = useMemo(() => {
    const start = new Date(cargo.time_start || "").getTime();
    const end = new Date(cargo.time_end || "").getTime();
    const total = end - start;
    const current = end - now.getTime();
    return Math.max(0, Math.min(100, (current / total) * 100));
  }, [now, cargo.time_start, cargo.time_end]);

  return (
    <>
      <Card className="group relative w-full mb-3 overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900/90 backdrop-blur-sm">
        {/* Декоративний акцент зверху (таймер-бар) */}
        <div className="absolute top-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              timeProgress > 50 ? "bg-emerald-500" : timeProgress > 20 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${timeProgress}%` }}
          />
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            
            {/* ЛІВА ЧАСТИНА: Маршрут та Іфо */}
            <div className="flex-1 p-4 md:p-5 border-r border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 dark:bg-sky-500/10 rounded-lg">
                    <Truck size={18} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">№{cargo.id}</span>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-tighter py-0">Тент 22т</Badge>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Міжнародне перевезення</p>
                  </div>
                </div>
                
                {/* Нове поле: Дистанція */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <Navigation size={12} />
                    <span>~1,140 км</span>
                  </div>
                </div>
              </div>

              {/* Візуалізація маршруту */}
              <div className="relative flex items-center justify-between gap-4 py-2">
                <div className="flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                    <Flag country="PL" size={16} />
                  </div>
                  <span className="font-bold mt-1 text-[12px]">Poznan</span>
                  <span className="text-[10px] text-emerald-600 font-medium">02.11 • 09:00</span>
                </div>

                <div className="flex-1 flex flex-col items-center relative">
                   <div className="w-full border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 absolute top-4" />
                   <ArrowRightLeft size={14} className="text-zinc-300 relative bg-white dark:bg-zinc-900 px-1" />
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-sky-500 flex items-center justify-center shadow-sm">
                    <Flag country="UA" size={16} />
                  </div>
                  <span className="font-bold mt-1 text-[12px]">Львів</span>
                  <span className="text-[10px] text-sky-600 font-medium">07.11 • 15:30</span>
                </div>
              </div>
            </div>

            {/* ЦЕНТРАЛЬНА ЧАСТИНА: Деталі (Митниця / Параметри) */}
            <div className="flex-1 p-4 md:p-5 flex flex-col justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-800/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Параметри</span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <Package size={14} className="text-zinc-400" />
                    <span>33 пал. / 21.6т</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Конкуренція</span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                    <Users size={14} />
                    <span>12 ставок</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between text-[10px] mb-1">
                   <span className="text-zinc-500">Замитнення:</span>
                   <span className="font-bold">PL, Poznan</span>
                </div>
                <div className="flex justify-between text-[10px]">
                   <span className="text-zinc-500">Розмитнення:</span>
                   <span className="font-bold">UA, Малехів</span>
                </div>
              </div>
            </div>

            {/* ПРАВА ЧАСТИНА: Action Area (Finance) */}
            <div className="w-full md:w-64 p-4 md:p-5 flex flex-col justify-between gap-4 bg-zinc-900 dark:bg-black text-white">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 uppercase">Поточна ціна</span>
                  <span className="text-2xl font-black tracking-tighter text-emerald-400">
                    {cargo.price_next} <span className="text-xs">₴</span>
                  </span>
                </div>
                <div className="text-right">
                   <TenderTimer targetDate={cargo.time_end || ""}  label="Card 6"/>
                   <div className="text-[8px] text-zinc-500 uppercase mt-1">до завершення</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => setActiveModal("confirm")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border-none h-10 flex flex-col items-center justify-center leading-none"
                >
                  <span className="text-[10px] uppercase font-bold">Зробити крок</span>
                  <span className="text-[9px] opacity-80 mt-0.5">-{cargo.price_step} ₴</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setActiveModal("buyout")}
                  className="border-zinc-700 hover:bg-zinc-800 text-white h-10 flex flex-col items-center justify-center leading-none"
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400">Викуп</span>
                  <span className="text-[9px] mt-0.5">{cargo.price_redemption} ₴</span>
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500">Ваша остання:</span>
                  <span className="text-[10px] font-bold text-red-400">{cargo.price_proposed || '—'}</span>
                </div>
                <button 
                  onClick={onOpenDetails}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <Info size={16} className="text-zinc-400" />
                </button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Модалки */}
      <ConfirmDialog open={activeModal === "confirm"} onOpenChange={closeModal} title="Підтвердження ставки" description={`Ваша нова ставка складе ${cargo.price_next} ₴. Бажаєте продовжити?`} onConfirm={onConfirmReduction} />
      <ManualPriceDialog open={activeModal === "manual"} onOpenChange={closeModal} currentPrice={cargo.price_start} onConfirm={onManualPrice} currentValut={cargo.valut_name} />
      <ConfirmDialog open={activeModal === "buyout"} onOpenChange={closeModal} title="Миттєвий викуп" description="Ви підтверджуєте викуп рейсу за фіксованою ціною?" onConfirm={onBuyout} />
    </>
  );
}