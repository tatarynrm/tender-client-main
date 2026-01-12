"use client";

import React from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  ClipboardList,
  User,
  MessageCircle,
  ArrowBigDownDash,
  Calendar,
  Box,
  Info,
  Layers,
  Settings2,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useTenderActions } from "../hooks/useTenderActions";
import { TenderTimer } from "./TenderTimer";

// Допоміжний компонент для бейджів
const SpecBadge = ({ children, icon: Icon, className }: any) => (
  <div
    className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border",
      className
    )}
  >
    {Icon && <Icon size={12} />}
    {children}
  </div>
);

export function TenderCardClients({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const {
    activeModal,
    setActiveModal,
    closeModal,
    onConfirmReduction,
    onManualPrice,
    onBuyout,
  } = useTenderActions(cargo.id, cargo.price_next, cargo.price_redemption);

  const fromPoints = cargo.tender_route.filter(
    (p) => p.ids_point === "LOAD_FROM"
  );
  const customUp = cargo.tender_route.filter(
    (p) => p.ids_point === "CUSTOM_UP"
  );
  const border = cargo.tender_route.filter((p) => p.ids_point === "BORDER");
  const customDown = cargo.tender_route.filter(
    (p) => p.ids_point === "CUSTOM_DOWN"
  );
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");

  const renderPoint = (points: any[], label: string, colorClass: string) => {
    if (points.length === 0) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-tighter opacity-70",
            colorClass
          )}
        >
          {label}
        </span>
        {points.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1.5 text-[13px] font-medium leading-none"
          >
            <Flag country={p.ids_country ?? "UA"} size={14} />
            <span className="truncate">{p.city}</span>
            <span className="text-[10px] text-zinc-400">({p.ids_country})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="w-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all rounded-xl overflow-hidden mb-4">
        {/* HEADER */}
        <div className="bg-zinc-50 dark:bg-slate-900/50 px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          {/* Ліва частина: ID та Тип */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 leading-none mb-1">
                Тендер
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 leading-none">
                № {cargo.id}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-slate-700 mx-1" />
            <span className="text-[10px] bg-zinc-200/50 dark:bg-slate-700 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-tighter">
              {cargo.tender_type}
            </span>
          </div>

          {/* Права частина: Таймлайн */}
          <div className="flex items-center gap-2">
            {(() => {
              const now = new Date();
              const startTime = cargo.time_start
                ? new Date(cargo.time_start)
                : null;
              const endTime = cargo.time_end ? new Date(cargo.time_end) : null;

              // 1. Якщо тендер ще не почався (Старт у майбутньому)
              if (startTime && now < startTime) {
                return (
                  <TenderTimer
                    targetDate={cargo.time_start!}
                    label="До початку"
                    variant="blue"
                  />
                );
              }

              // 2. Якщо тендер триває і є дата завершення
              if (endTime && now < endTime) {
                return (
                  <TenderTimer
                    targetDate={cargo.time_end!}
                    label="До кінця"
                    variant="orange"
                  />
                );
              }

              return null;
            })()}

            {/* Дата початку */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm">
              <Calendar size={12} className="text-emerald-500" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] uppercase font-bold text-emerald-600 dark:text-emerald-500 tracking-wider">
                  Старт
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-200">
                  {cargo.time_start
                    ? format(new Date(cargo.time_start), "dd.MM HH:mm")
                    : "—"}
                </span>
              </div>
            </div>

            {/* Стрілка та Дата кінця */}
            {cargo.time_end && (
              <>
                <div className="hidden sm:block text-zinc-300 dark:text-zinc-600 px-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[8px] uppercase font-bold text-rose-500 tracking-wider">
                      Кінець
                    </span>
                    <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-200">
                      {format(new Date(cargo.time_end), "dd.MM HH:mm")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-slate-700">
            {/* 1. МАРШРУТ */}
            <div className="lg:col-span-4 p-4 space-y-3">
              <div className="space-y-3">
                {renderPoint(fromPoints, "Завантаження", "text-emerald-600")}
                {renderPoint(customUp, "Замитнення", "text-blue-500")}
                {border.length > 0 && (
                  <div className="bg-zinc-50 dark:bg-slate-900/30 p-1.5 rounded border border-dashed border-zinc-200 dark:border-slate-700">
                    {renderPoint(border, "Кордон", "text-amber-600")}
                  </div>
                )}
                {renderPoint(customDown, "Розмитнення", "text-blue-500")}
                {renderPoint(toPoints, "Розвантаження", "text-rose-600")}
              </div>
            </div>

            {/* 2. ТЕХНІЧНІ ХАРАКТЕРИСТИКИ (Бейджі тут) */}
            <div className="lg:col-span-5 p-4 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                {/* Основні цифри */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <Truck size={16} className="text-blue-500" />
                    <span>{cargo.car_count_actual || 1} авт.</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <ClipboardList size={16} className="text-amber-500" />
                    <span>
                      {cargo.weight} т / {cargo.volume} м³
                    </span>
                  </div>
                </div>

                {/* Типи авто та завантаження */}
                <div className="flex flex-wrap gap-1.5">
                  {/* Тип причепа */}
                  {cargo.tender_trailer?.map((t, idx) => (
                    <SpecBadge
                      key={idx}
                      icon={Settings2}
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                    >
                      {t.trailer_type_name}
                    </SpecBadge>
                  ))}

                  {/* Тип завантаження */}
                  {cargo.tender_load?.map((l, idx) => (
                    <SpecBadge
                      key={idx}
                      icon={Layers}
                      className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    >
                      {l.load_type_name}
                    </SpecBadge>
                  ))}
                </div>

                <div className="text-[11px] bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded-lg border-l-2 border-amber-400 text-zinc-600 dark:text-zinc-400">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5 flex items-center gap-1">
                    <Box size={12} /> {cargo.cargo || "Вантаж"}
                  </p>
                  <p className="italic line-clamp-2">
                    {cargo.notes || "Без додаткових приміток"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <User size={12} />
                  <span>{cargo.author}</span>
                </div>
              </div>
            </div>

            {/* 3. ЦІНА ТА ДІЇ */}
            <div className="lg:col-span-3 p-4 bg-zinc-50/50 dark:bg-slate-900/20 flex flex-col justify-center gap-3 text-center">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Поточна ставка
                </span>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {cargo.price_proposed || cargo.price_start}
                  <span className="text-sm font-normal ml-1">
                    {cargo.valut_name?.toUpperCase()}
                  </span>
                </div>
                {cargo.without_vat && (
                  <div className="text-[9px] text-zinc-400">без ПДВ</div>
                )}
              </div>

              <div className="space-y-2">
                {cargo.ids_type === "GENERAL" && (
                  <Button
                    onClick={() => setActiveModal("confirm")}
                    className="w-full bg-teal-600 hover:bg-teal-700 h-9 text-xs font-bold"
                  >
                    КРОК {cargo.price_next}{" "}
                    <ArrowBigDownDash className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {cargo.ids_type === "PRICE_REQUEST" && (
                  <Button
                    onClick={() => setActiveModal("manual")}
                    variant="outline"
                    className="w-full border-amber-500 text-amber-600 h-9 text-xs font-bold"
                  >
                    СВОЯ ЦІНА <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {cargo.ids_type === "REDEMPTION" && (
                  <Button
                    onClick={() => setActiveModal("buyout")}
                    className="w-full bg-rose-600 hover:bg-rose-700 h-9 text-xs font-bold"
                  >
                    ВИКУПИТИ
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onOpenDetails}
                  className="w-full h-8 text-[10px] text-zinc-400 hover:text-zinc-600 uppercase font-bold"
                >
                  Детальніше <Info size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* МОДАЛКИ (Без змін) */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити зниження?"
        description={`Підтвердити ціну ${cargo.price_next} ${cargo.valut_name}?`}
        onConfirm={onConfirmReduction}
      />
      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_next}
        onConfirm={onManualPrice}
      />
      <ConfirmDialog
        open={activeModal === "buyout"}
        onOpenChange={closeModal}
        title="Миттєвий викуп"
        description="Ви впевнені, що хочете викупити тендер за ціною викупу?"
        onConfirm={onBuyout}
        confirmText="Так, викупити"
      />
    </>
  );
}
