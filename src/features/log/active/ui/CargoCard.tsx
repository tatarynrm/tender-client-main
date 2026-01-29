"use client";

import React, { useEffect, useState } from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  MessageCircle,
  History,
  Info,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { Dropdowns, LoadApiItem } from "../../types/load.type";
import { CargoDetailsDrawer } from "./CargoDetailsDrawer";
import { AddCarsModal } from "./CargoCarAddModal";
import { useAddCars } from "../../hooks/useAddLoadCars";
import { CargoCarRemoveModal } from "./CargoCarRemoveModal";
import { useRemoveCars } from "../../hooks/useRemoveLoadCars";
import { CargoCloseByManagerModal } from "./CargoCloseByManagerModal";
import { useCloseCargoByManager } from "../../hooks/useCloseByManager";
import { CargoHistoryModal } from "./CargoHistoryModal";
import LoadChat from "./LoadChat";
import { useLoads } from "../../hooks/useLoads";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { CargoActions } from "./CargoActions";
import { useEventEffect } from "@/shared/hooks/useEventEffects";
import { StatusIndicator } from "./CargoCardUpdateColor";
import { useOnlineUsers } from "@/shared/hooks/useOnlineUsers";
import { RoutePoint } from "./RoutePointTooltip";

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
}

export function CargoCard({ load, filters }: CargoCardProps) {
  const { profile } = useAuth();
  const onlineUsers = useOnlineUsers();
  const [isJustCreated, setIsJustCreated] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [openAddCars, setOpenAddCars] = useState(false);
  const [openRemoveCars, setOpenRemoveCars] = useState(false);
  const [openCloseCargoByManager, setOpenCloseCargoByManager] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  // Стан для збереження часу останнього прочитання (локально)
  const [localReadTime, setLocalReadTime] = useState<string | null>(
    load.comment_read_time || null,
  );
  const { mutateAsync: addCarsMutate, isLoading: isLoadingAddCars } =
    useAddCars();
  const { removeCarsMutate, isLoadingRemove } = useRemoveCars();
  const { closeCargoMutate, isLoadingCloseCargo } = useCloseCargoByManager();
  const { refreshLoadTime } = useLoads();

  const { isActive: isShaking } = useEventEffect(load.id, [
    "cargo_shake",
    "update_comment",
    "update_load_date",
    "load_add_car",
  ]);

  useEffect(() => {
    if (!load.created_at) return;
    const diff = Date.now() - new Date(load.created_at).getTime();
    setIsJustCreated(diff / 1000 / 60 < 1);
  }, [load.created_at]);

  const allPoints = [...load.crm_load_route_from, ...load.crm_load_route_to];
  const firstPoint = allPoints[0];
  const lastPoint = allPoints[allPoints.length - 1];
  const middlePoints = allPoints.slice(1, -1);
  const canDelete = load.created_at
    ? Date.now() - new Date(load.created_at).getTime() < 3600000
    : false;

  // Логіка визначення, чи є нові повідомлення
  const hasUnreadMessages = React.useMemo(() => {
    const lastTime = load?.comment_last_time;
    // Пріоритет локальному стану, якщо ми щойно закрили чат
    const readTime = localReadTime || load?.comment_read_time;

    if (!lastTime || !load?.comment_count) return false;
    if (!readTime) return true;

    // Якщо час останнього коментаря більший за час прочитання (з невеликим зазором в 1 сек)
    return new Date(lastTime).getTime() > new Date(readTime).getTime() + 1000;
  }, [
    load.comment_last_time,
    load.comment_count,
    load.comment_read_time,
    localReadTime,
  ]);
  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
          isJustCreated && "animate-in fade-in slide-in-from-bottom-1",
          isShaking && "animate-shake border-blue-500",
        )}
      >
        <StatusIndicator updatedAt={load.updated_at} />

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 gap-y-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="flex items-center justify-center min-w-[24px] h-5 px-1 rounded bg-blue-600 text-white font-bold text-[10px] shrink-0">
              {load.id}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight truncate">
              <span className="text-zinc-500 truncate">
                {load.author || "Павлюк І."}
              </span>
              <span className="text-zinc-300">|</span>
              <span className="text-blue-600 dark:text-blue-400 truncate">
                {load.company_name || "ASTARTA TRADING"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-700">
              <History size={10} />
              <span className="tabular-nums">
                {load.updated_at
                  ? format(new Date(load.updated_at), "dd.MM.yy HH:mm")
                  : "—"}
              </span>
            </div>
            <div className="flex items-center scale-90">
              <CargoActions
                load={load}
                profile={profile}
                onAddCars={() => setOpenAddCars(true)}
                onRemoveCars={() => setOpenRemoveCars(true)}
                onCloseCargo={() => setOpenCloseCargoByManager(true)}
                onRefresh={refreshLoadTime}
                canDelete={canDelete}
              />
            </div>
          </div>
        </div>

        {/* DATES BAR */}
        <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold">
          <div className="bg-white dark:bg-slate-900 py-1.5 px-4 flex gap-2 items-center justify-center sm:justify-start">
            <span className="text-zinc-400 uppercase text-[9px]">
              Завантаження:
            </span>
            <span className="text-emerald-600 dark:text-emerald-500">
              {load.date_load
                ? format(new Date(load.date_load), "dd.MM HH:mm")
                : "—"}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 py-1.5 px-4 flex gap-2 items-center justify-center sm:justify-start">
            <span className="text-zinc-400 uppercase text-[9px]">
              Розвантаження:
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {load.date_unload
                ? format(new Date(load.date_unload), "dd.MM HH:mm")
                : "—"}
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
          <div className="flex-[1.5] flex flex-col gap-0.5 min-w-0">
            {/* LEFT COLUMN: ROUTE */}
            <div className="flex-[1.5] flex flex-col min-w-0">
              {/* First Point */}
              <RoutePoint point={firstPoint} isMain />

              {/* Middle Points Container */}
              <div
                className={cn(
                  "ml-[25px] border-l border-dashed flex flex-col gap-1.5 py-1",
                  firstPoint?.ids_route_type === "LOAD_FROM"
                    ? "border-emerald-300 dark:border-emerald-900/50"
                    : "border-blue-300 dark:border-blue-900/50",
                )}
              >
                {middlePoints.map((p, i) => (
                  <div key={i} className="pl-3">
                    <RoutePoint point={p} />
                  </div>
                ))}
              </div>

              {/* Last Point */}
              <RoutePoint point={lastPoint} isMain />
            </div>

            {/* Route Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <div className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 font-black text-[9px] uppercase tracking-wider">
                {load.crm_load_trailer && load.crm_load_trailer.length > 0
                  ? load.crm_load_trailer
                      .map((t) => t.trailer_type_name)
                      .join(", ")
                  : "ТЕНТ"}
              </div>
              <div className="px-2.5 py-0.5  text-white rounded font-black text-[10px]">
                {load.price ? (
                  <span className="bg-blue-500 p-1 rounded-xl text-[10px]">{`${load.price.toLocaleString()} ${load.valut_name}`}</span>
                ) : (
                  <span className="bg-red-500 p-1 rounded-xl text-[8px]">
                    Ціна не вказана
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Info Block */}
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest mb-1.5">
              Інформація
            </h3>
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-snug overflow-y-auto max-h-[100px] pr-1 custom-scrollbar break-words whitespace-pre-wrap">
              {load.load_info || "---"}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex gap-1.5">
            {[
              {
                icon: Truck,
                val: load.car_count_actual,
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: CheckCircle2,
                val: load.car_count_closed,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                icon: XCircle,
                val: load.car_count_canceled,
                color: "text-red-500 bg-red-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg border border-transparent dark:bg-zinc-800/50",
                  stat.color,
                )}
              >
                <stat.icon size={13} />
                <span className="font-bold text-xs">{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenHistory(true)}
              className="p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-400 hover:text-blue-500 transition-colors"
            >
              <History size={16} />
            </button>
            <button
              onClick={() => setSelectedCargo(load)}
              className="p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-400 hover:text-blue-500 transition-colors"
            >
              <Info size={16} />
            </button>
            <button
              onClick={() => setChatCargo(load)}
              className="relative p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <MessageCircle size={16} className="text-zinc-400" />
              {load.comment_count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {load.comment_count}
                </span>
              )}
              {/* НОВИЙ ПУЛЬСУЮЧИЙ ІНДИКАТОР */}
              {hasUnreadMessages && (
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS RENDER (Без змін) */}
      <CargoDetailsDrawer
        cargo={selectedCargo ?? undefined}
        open={!!selectedCargo}
        onClose={() => setSelectedCargo(null)}
      />
      {chatCargo && (
        <LoadChat
          cargoId={chatCargo.id}
          open={!!chatCargo}
         onClose={() => {
      setChatCargo(null);
      // Оновлюємо локальний час прочитання на поточний
      setLocalReadTime(new Date().toISOString());
    }}
        />
      )}
      <AddCarsModal
        loadId={load.id}
        open={openAddCars}
        onOpenChange={setOpenAddCars}
        onSubmit={addCarsMutate}
        isLoading={isLoadingAddCars}
      />
      <CargoCarRemoveModal
        load={load}
        open={openRemoveCars}
        onOpenChange={setOpenRemoveCars}
        onSubmit={removeCarsMutate}
        isLoading={isLoadingRemove}
        dropdowns={filters}
      />
      <CargoCloseByManagerModal
        dropdowns={filters}
        load={load}
        open={openCloseCargoByManager}
        onOpenChange={setOpenCloseCargoByManager}
        onSubmit={closeCargoMutate}
        isLoading={isLoadingCloseCargo}
      />
      <CargoHistoryModal
        open={openHistory}
        onOpenChange={setOpenHistory}
        loadId={load.id}
      />
    </>
  );
}
