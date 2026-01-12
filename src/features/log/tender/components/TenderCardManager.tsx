"use client";

import React from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  User,
  MessageCircle,
  ArrowBigDownDash,
  Calendar,
  Layers,
  Info,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useTenderActions } from "../hooks/useTenderActions";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";


export function TenderCardManagers({
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

  // Розподіл точок маршруту
  const fromPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM");
  const customUp = cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_UP");
  const border = cargo.tender_route.filter((p) => p.ids_point === "BORDER");
  const customDown = cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_DOWN");
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");

  return (
    <>
      <Card className="w-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all rounded-xl overflow-hidden mb-4">
        {/* HEADER - Ідентичний до клієнтського з новою логікою таймера */}
        <div className="bg-zinc-50 dark:bg-slate-900/50 px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 leading-none mb-1">
                Менеджер / № {cargo.id}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-none uppercase">
                {cargo.tender_type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Динамічний таймер */}
            {(() => {
              const now = new Date();
              const startTime = cargo.time_start ? new Date(cargo.time_start) : null;
              const endTime = cargo.time_end ? new Date(cargo.time_end) : null;

              if (startTime && now < startTime) {
                return <TenderTimer targetDate={cargo.time_start!} label="До початку" variant="blue" />;
              }
              if (endTime && now < endTime) {
                return <TenderTimer targetDate={cargo.time_end!} label="До кінця" variant="orange" />;
              }
              return null;
            })()}

            {/* Статична дата старту */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm">
              <Calendar size={12} className="text-emerald-500" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] uppercase font-bold text-emerald-600 tracking-wider">Старт</span>
                <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-200">
                  {cargo.time_start ? format(new Date(cargo.time_start), "dd.MM HH:mm") : "—"}
                </span>
              </div>
            </div>

            {/* Дата кінця */}
            {cargo.time_end && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] uppercase font-bold text-rose-500 tracking-wider">Кінець</span>
                  <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-200">
                    {format(new Date(cargo.time_end), "dd.MM HH:mm")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-slate-700">
            
            {/* 1. ВЕРТИКАЛЬНИЙ МАРШРУТ (СТЕППЕР) */}
            <div className="lg:col-span-4 p-5">
              <div className="relative space-y-5">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                {[
                  { points: fromPoints, label: "Завантаження", color: "bg-emerald-500", text: "text-emerald-600" },
                  { points: customUp, label: "Замитнення", color: "bg-blue-500", text: "text-blue-500" },
                  { points: border, label: "Кордон", color: "bg-amber-500", text: "text-amber-500" },
                  { points: customDown, label: "Розмитнення", color: "bg-blue-500", text: "text-blue-500" },
                  { points: toPoints, label: "Розвантаження", color: "bg-rose-500", text: "text-rose-600" },
                ].map((step, idx) => step.points.length > 0 && (
                  <div key={idx} className="relative flex gap-4 pl-0.5">
                    <div className={cn("z-10 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm shrink-0 mt-0.5", step.color)} />
                    <div className="flex flex-col min-w-0">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-1", step.text)}>
                        {step.label}
                      </span>
                      {step.points.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5 text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                          <Flag country={p.ids_country ?? "UA"} size={14} />
                          <span className="truncate">{p.city}</span>
                          <span className="text-[10px] font-normal opacity-50 uppercase">({p.ids_country})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. ТЕХНІЧНІ ДАНІ */}
            <div className="lg:col-span-5 p-5 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <Truck size={18} className="text-blue-500" />
                    <span className="text-lg">{cargo.car_count_actual || 1} <small className="text-[10px] uppercase opacity-50 font-black">авт.</small></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Параметри</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {cargo.weight} т / {cargo.volume} м³
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cargo.tender_trailer?.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded text-[10px] font-black uppercase border border-slate-200 dark:border-slate-600">
                      {t.trailer_type_name}
                    </span>
                  ))}
                  {cargo.tender_load?.map((l, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800/50">
                      {l.load_type_name}
                    </span>
                  ))}
                </div>

                <div className="text-xs bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border-l-4 border-amber-400">
                  <p className="font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-tighter">
                    {cargo.cargo || "Вантаж"}
                  </p>
                  <p className="italic text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {cargo.notes || "Без приміток"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <User size={14} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{cargo.author}</span>
              </div>
            </div>

            {/* 3. ЦІНА ТА ДІЇ */}
            <div className="lg:col-span-3 p-5 bg-zinc-50/50 dark:bg-slate-900/20 flex flex-col justify-center gap-4 text-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Поточна ставка</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {cargo.price_proposed || cargo.price_start}
                  <span className="text-sm font-medium ml-1 text-slate-500 uppercase">{cargo.valut_name}</span>
                </div>
                {cargo.without_vat && <div className="text-[10px] font-bold text-rose-500 uppercase">Без ПДВ</div>}
              </div>

              <div className="space-y-2">
                {cargo.ids_type === "GENERAL" && (
                  <Button onClick={() => setActiveModal("confirm")} className="w-full bg-teal-600 hover:bg-teal-700 h-10 font-black text-[11px] uppercase shadow-sm">
                    Крок {cargo.price_next} <ArrowBigDownDash className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {cargo.ids_type === "PRICE_REQUEST" && (
                  <Button onClick={() => setActiveModal("manual")} variant="outline" className="w-full border-amber-500 text-amber-600 h-10 font-black text-[11px] uppercase">
                    Своя ціна <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {cargo.ids_type === "REDEMPTION" && (
                  <Button onClick={() => setActiveModal("buyout")} className="w-full bg-rose-600 hover:bg-rose-700 h-10 font-black text-[11px] uppercase">
                    Викупити
                  </Button>
                )}
                <Button variant="ghost" onClick={onOpenDetails} className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">
                  Специфікація <Info size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODALS */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити зниження?"
        description={`Ваша ставка складе ${cargo.price_next} ${cargo.valut_name}`}
        onConfirm={onConfirmReduction}
      />
      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_proposed || cargo.price_start}
        onConfirm={onManualPrice}
      />
      <ConfirmDialog
        open={activeModal === "buyout"}
        onOpenChange={closeModal}
        title="Миттєвий викуп"
        description="Прийняти умови тендеру негайно?"
        onConfirm={onBuyout}
        confirmText="Так, викупити"
      />
    </>
  );
}