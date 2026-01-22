"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import {
  Truck,
  User,
  Box,
  Info,
  Layers,
  TrendingDown,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useTenderActions } from "../hooks/useTenderActions";
import { TenderTimer } from "./TenderTimer";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function TenderCardClients({
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

  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM",
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter((p) =>
    ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point || ""),
  );

  const getPointLabel = (type: string) => {
    switch (type) {
      case "CUSTOM_UP":
        return "Замитн.";
      case "BORDER":
        return "Кордон";
      case "CUSTOM_DOWN":
        return "Розмитн.";
      default:
        return "Транзит";
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative w-full transition-all duration-300 mb-2 overflow-hidden rounded-lg shadow-sm border-zinc-200/50 dark:border-white/5",
          "bg-white/90 dark:bg-zinc-900/40 backdrop-blur-md",
          isFinished && "opacity-60 grayscale",
        )}
      >
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ІНФОРМАЦІЯ (9/12) */}
            <div className="lg:col-span-9 p-2.5 border-r border-zinc-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sky-600 dark:text-sky-400 font-bold tracking-tighter",
                      label,
                    )}
                  >
                    #{cargo.id}
                  </span>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Layers size={icon - 4} />
                    <span
                      className={cn(
                        "font-medium uppercase tracking-tight opacity-70",
                        label,
                      )}
                    >
                      {cargo.tender_type}
                    </span>
                  </div>
                </div>
                <div className="scale-75 origin-right shrink-0">
                  {canBid && cargo.time_end && (
                    <TenderTimer
                      targetDate={cargo.time_end}
                      label="LIVE"
                      variant="orange"
                    />
                  )}
                  {isNotStarted && cargo.time_start && (
                    <TenderTimer
                      targetDate={cargo.time_start}
                      label="WAIT"
                      variant="blue"
                    />
                  )}
                </div>
              </div>

              {/* МАРШРУТ */}
              <div className="grid grid-cols-3 gap-2 items-start mb-2">
                {/* ВІДПРАВЛЕННЯ */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sky-500 font-bold uppercase text-[8px] mb-1 opacity-80",
                      label,
                    )}
                  >
                    Звідки
                  </p>
                  {fromPoints.map((p, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200 leading-none py-0.5",
                        main,
                      )}
                    >
                      <Flag
                        country={p.ids_country || "UA"}
                        size={icon}
                        className="rounded-xs shrink-0"
                      />
                      <span className="truncate">{p.city}</span>
                    </div>
                  ))}
                </div>

                {/* ТРАНЗИТ (УСІ ПУНКТИ) */}
                <div className="min-w-0 border-x border-zinc-100 dark:border-white/5 px-2">
                  <p
                    className={cn(
                      "text-amber-500 font-bold uppercase text-[8px] mb-1 opacity-80",
                      label,
                    )}
                  >
                    Маршрут
                  </p>
                  <div className="space-y-1">
                    {transitPoints.length > 0 ? (
                      transitPoints.map((p, idx) => (
                        <div key={idx} className="flex flex-col leading-none">
                          <span
                            className={cn(
                              "text-amber-600/80 dark:text-amber-400/80 font-bold text-[7px] uppercase tracking-tighter",
                              label,
                            )}
                          >
                            {getPointLabel(p.ids_point || "")}
                          </span>
                          <span
                            className={cn(
                              "text-zinc-600 dark:text-zinc-400 truncate font-semibold",
                              label,
                            )}
                          >
                            {p.city}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span
                        className={cn(
                          "text-zinc-300 dark:text-zinc-600 text-[9px] font-medium",
                          label,
                        )}
                      >
                        Прямий рейс
                      </span>
                    )}
                  </div>
                </div>

                {/* ПРИБУТТЯ */}
                <div className="min-w-0 text-right">
                  <p
                    className={cn(
                      "text-emerald-500 font-bold uppercase text-[8px] mb-1 opacity-80",
                      label,
                    )}
                  >
                    Куди
                  </p>
                  {toPoints.map((p, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-1.5 justify-end font-bold text-zinc-800 dark:text-zinc-200 leading-none py-0.5",
                        main,
                      )}
                    >
                      <span className="truncate">{p.city}</span>
                      <Flag
                        country={p.ids_country || "UA"}
                        size={icon}
                        className="rounded-xs shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ХАРАКТЕРИСТИКИ */}
              <div className="flex items-center gap-4 pt-2 border-t border-zinc-50 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <Truck size={icon - 2} className="text-zinc-400 shrink-0" />
                  <span
                    className={cn(
                      "font-bold text-zinc-700 dark:text-zinc-300",
                      label,
                    )}
                  >
                    {cargo.weight}т / {cargo.volume}м³
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Box size={icon - 2} className="text-zinc-400 shrink-0" />
                  <span
                    className={cn(
                      "font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]",
                      label,
                    )}
                  >
                    {cargo.cargo || "Вантаж"}
                  </span>
                </div>
                <div className="ml-auto opacity-40 flex items-center gap-1 shrink-0">
                  <User size={icon - 4} />
                  <span className={cn("font-medium tracking-tight", label)}>
                    {cargo.author}
                  </span>
                </div>
              </div>
            </div>

            {/* ДІЇ (3/12) */}
            <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-white/[0.02] p-2 flex flex-col justify-center gap-1.5">
              <div className="flex lg:flex-row items-center justify-between mb-1">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "font-black tracking-tighter text-zinc-900 dark:text-white leading-none",
                      main,
                    )}
                  >
                    {cargo.price_proposed || cargo.price_start}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-zinc-400 text-[9px] uppercase",
                      label,
                    )}
                  >
                    {cargo.valut_name}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-emerald-600 font-bold text-[9px]",
                    label,
                  )}
                >
                  <TrendingDown size={icon - 5} strokeWidth={3} />
                  <span>{cargo.price_step}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className={cn(
                    "w-full h-8 rounded bg-zinc-900 dark:bg-white dark:text-black font-bold border-none transition-all active:scale-95",
                    label,
                  )}
                >
                  Ставка: {cargo.price_next}
                </Button>

                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    disabled={!canBid}
                    onClick={() => setActiveModal("manual")}
                    className={cn(
                      "h-6 text-[9px] font-bold border-zinc-200 dark:border-white/10",
                      label,
                    )}
                  >
                    Своя
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onOpenDetails}
                    className={cn(
                      "h-6 text-[9px] font-bold text-zinc-500 hover:text-sky-500",
                      label,
                    )}
                  >
                    Деталі
                  </Button>
                </div>

                {cargo.price_redemption && (
                  <button
                    disabled={!canBid}
                    onClick={() => setActiveModal("buyout")}
                    className="w-full h-7 rounded bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center gap-1 hover:brightness-105 active:scale-95 transition-all shadow-sm"
                  >
                    <Zap size={icon - 5} fill="white" />
                    <span
                      className={cn(
                        "font-bold text-[9px] uppercase tracking-tight",
                        label,
                      )}
                    >
                      Викуп: {cargo.price_redemption}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs remain unchanged */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити?"
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
        title="Викуп?"
        description="Забрати рейс зараз?"
        onConfirm={onBuyout}
        confirmText="Так"
      />
    </>
  );
}


