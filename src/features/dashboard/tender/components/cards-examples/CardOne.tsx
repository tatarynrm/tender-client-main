"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import {
  Truck,
  User,
  Box,
  Layers,
  TrendingDown,
  Zap,
  Info,
  Calendar,
  MapPin
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";

import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { useTenderActions } from "../../hooks/useTenderActions";
import { TenderTimer } from "../TenderTimer";
import { ManualPriceDialog } from "../ManualPriceDialog";

export function TenderCardOne({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main, title, icon } = config;

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

  const { isNotStarted, isFinished, canBid } = useMemo(() => {
    const start = cargo.time_start ? new Date(cargo.time_start).getTime() : 0;
    const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
    const currentTime = now.getTime();
    return {
      isNotStarted: start > currentTime,
      isFinished: end > 0 && currentTime > end,
      canBid: currentTime >= start && (end === 0 || currentTime <= end),
    };
  }, [now, cargo.time_start, cargo.time_end]);

  const fromPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM");
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const customsPoints = cargo.tender_route.filter((p) => 
    ["CUSTOM_UP", "CUSTOM_DOWN"].includes(p.ids_point || "")
  );

  return (
    <>
      <Card className={cn(
        "w-full mb-3 overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm",
        isFinished && "opacity-60 grayscale"
      )}>
        <CardContent className="p-0">
          {/* Header row for Mobile or Small Screens could be added, but here is the Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-white/10">
            
            {/* 1. ЗАМОВЛЕННЯ (ID) */}
            <div className="lg:col-span-1 p-3 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-white/5">
              <span className={cn("text-zinc-400 font-medium uppercase text-[10px]", label)}>№ Зам.</span>
              <button onClick={onOpenDetails} className={cn("text-sky-600 font-bold hover:underline", main)}>
                {cargo.id}
              </button>
            </div>

            {/* 2. МАРШРУТ (Завантаження / Розвантаження) */}
            <div className="lg:col-span-3 p-3 space-y-3">
              <div>
                <span className={cn("text-sky-600 font-bold uppercase text-[9px] block mb-1", label)}>Завантаження</span>
                {fromPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Flag country={p.ids_country || "UA"} size={14} className="mt-1 shrink-0" />
                    <div className="leading-tight">
                      <p className={cn("font-bold text-zinc-800 dark:text-zinc-200", label)}>{p.city}</p>
                      <p className="text-[10px] text-zinc-500">02.11.2025 (09:00)</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
                <span className={cn("text-emerald-600 font-bold uppercase text-[9px] block mb-1", label)}>Розвантаження</span>
                {toPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Flag country={p.ids_country || "UA"} size={14} className="mt-1 shrink-0" />
                    <div className="leading-tight">
                      <p className={cn("font-bold text-zinc-800 dark:text-zinc-200", label)}>{p.city}</p>
                      <p className="text-[10px] text-zinc-500">07.11.2025 (15:30)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. МИТНЕ ОФОРМЛЕННЯ */}
            <div className="lg:col-span-2 p-3">
              <span className={cn("text-zinc-400 font-medium uppercase text-[10px] block mb-2", label)}>Митне оформлення</span>
              <div className="space-y-2">
                {customsPoints.map((p, i) => (
                  <div key={i} className="text-[11px] leading-tight text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-sky-500">
                      {p.ids_point === "CUSTOM_UP" ? "Замитнення: " : "Розмитнення: "}
                    </span>
                    {p.ids_country}-{p.city}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ТРАНСПОРТ ТА ВАНТАЖ */}
            <div className="lg:col-span-2 p-3 bg-zinc-50/30 dark:bg-transparent">
              <div className="mb-3">
                <span className={cn("text-zinc-400 font-medium uppercase text-[10px] block mb-1", label)}>Тип транспорту</span>
                <p className={cn("font-semibold text-zinc-700 dark:text-zinc-300", label)}>Тент, бокове завантаження</p>
              </div>
              <div>
                <span className={cn("text-zinc-400 font-medium uppercase text-[10px] block mb-1", label)}>Вантаж</span>
                <p className={cn("font-semibold text-zinc-700 dark:text-zinc-300", label)}>
                  {cargo.weight}т, {cargo.volume}м³, {cargo.cargo || "Продукти"}
                </p>
              </div>
            </div>

            {/* 5. ЦІНА ТА ТОРГИ (Основа таблиці) */}
            <div className="lg:col-span-4 grid grid-cols-3 divide-x divide-zinc-200 dark:divide-white/10">
              
              {/* Блок Ціна */}
              <div className="p-2 flex flex-col justify-center items-center text-center bg-zinc-100/50 dark:bg-white/5">
                <p className="text-[10px] text-zinc-500 mb-1">Стартова ціна</p>
                <p className={cn("font-bold text-zinc-900 dark:text-white", main)}>{cargo.price_start} {cargo.valut_name}</p>
                <div className="mt-2 pt-2 border-t border-zinc-200 w-full">
                   <p className="text-[9px] text-emerald-600 font-bold">Викупити рейс</p>
                   <p className="text-[11px] font-black text-emerald-700">{cargo.price_redemption} {cargo.valut_name}</p>
                </div>
              </div>

              {/* Блок Час */}
              <div className="p-2 flex flex-col justify-center items-center">
                <span className={cn("text-zinc-400 text-[9px] uppercase font-bold mb-1", label)}>до завершення</span>
                {canBid && cargo.time_end && <TenderTimer label="Вигляд 1" targetDate={cargo.time_end} variant="orange" />}
              </div>

              {/* Блок Ставка (Дія) */}
              <div className="p-2 flex flex-col gap-1 justify-center bg-white dark:bg-zinc-900">
                <div className="text-center mb-1">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Ваша ставка</p>
                  <p className="text-[11px] font-bold text-red-500">{cargo.price_next} {cargo.valut_name}</p>
                </div>
                
                <Button 
                  size="sm"
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className="h-8 w-full bg-zinc-900 dark:bg-zinc-100 dark:text-black font-black text-[10px] uppercase rounded-none border-b-2 border-zinc-600"
                >
                  Зробити ставку
                </Button>

                <div className="flex gap-1 mt-1">
                  <button 
                    onClick={() => setActiveModal("manual")}
                    className="flex-1 text-[8px] font-bold py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                  >
                    СВОЯ
                  </button>
                  <button 
                    onClick={() => setActiveModal("buyout")}
                    className="flex-1 text-[8px] font-bold py-1 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  >
                    ВИКУП
                  </button>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Модалки (без змін у логіці) */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити ставку?"
        description={`${cargo.price_next} ${cargo.valut_name}`}
        onConfirm={onConfirmReduction}
      />
      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_proposed || cargo.price_start}
        onConfirm={onManualPrice}
        currentValut={cargo.valut_name}
      />
      <ConfirmDialog
        open={activeModal === "buyout"}
        onOpenChange={closeModal}
        title="Викупити рейс?"
        description="Ви підтверджуєте миттєвий викуп за вказаною ціною?"
        onConfirm={onBuyout}
        confirmText="Так, викупити"
      />
    </>
  );
}