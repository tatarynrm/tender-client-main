"use client";

import React, { useEffect, useState } from "react";
import Flag from "react-flagkit";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
  MessageCircle,
  Layers,
  CalendarDays,
  DollarSign,
  ChevronRight,
  History,
  Info,
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

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
  regionsData?: any[];
}

function CarCounter({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "blue" | "emerald" | "red";
}) {
  const styles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    red: "text-red-500 bg-red-50 dark:bg-red-900/20",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-transparent",
        styles[variant],
      )}
    >
      <span className="opacity-70">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export function CargoCard({ load, filters }: CargoCardProps) {
  const { profile } = useAuth();
  const [isJustCreated, setIsJustCreated] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [openAddCars, setOpenAddCars] = useState(false);
  const [openRemoveCars, setOpenRemoveCars] = useState(false);
  const [openCloseCargoByManager, setOpenCloseCargoByManager] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [localReadTime, setLocalReadTime] = useState<string | null>(
    load.comment_read_time || null,
  );
  const [showInfo, setShowInfo] = useState(false);
  const { mutateAsync: addCarsMutate, isLoading: isLoadingAddCars } =
    useAddCars();
  const { removeCarsMutate, isLoadingRemove } = useRemoveCars();
  const { closeCargoMutate, isLoadingCloseCargo } = useCloseCargoByManager();
  const { refreshLoadTime } = useLoads();

  const {
    isActive: isShaking,
    isPending: showBadge,
    lastEvent,
  } = useEventEffect(load.id, [
    "cargo_shake",
    "cargo_shake_car_count",
    "update_comment",
    "update_load_date",
    "load_add_car",
    "load_remove_car",
  ]);

  useEffect(() => {
    if (!load.created_at) return;
    const checkStatus = () => {
      const diff = Date.now() - new Date(load.created_at).getTime();
      setIsJustCreated(diff / 1000 / 60 < 1);
    };
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, [load.created_at]);

  const createdAt = load.created_at ? new Date(load.created_at) : null;
  const canDelete = createdAt
    ? Date.now() - createdAt.getTime() < 3600000
    : false;

  const hasUnreadMessages = React.useMemo(() => {
    if (lastEvent === "update_comment" && showBadge) return true;
    const lastTime = load?.comment_last_time;
    const readTime = localReadTime || load?.comment_read_time;
    if (!lastTime || !load?.comment_count) return false;
    if (!readTime) return true;
    return new Date(lastTime).getTime() > new Date(readTime).getTime() + 1000;
  }, [load, lastEvent, showBadge, localReadTime]);

  const getAnimationClass = () => {
    if (!isShaking) return "";
    switch (lastEvent) {
      case "update_comment":
        return "animate-comment-glow border-amber-500 shadow-lg shadow-amber-500/10";
      case "update_load_date":
      case "load_add_car":
        return "animate-shake border-blue-500";
      default:
        return "animate-shake border-emerald-500";
    }
  };

  const badgeConfig: Record<string, { label: string; color: string }> = {
    cargo_shake: { label: "Змінено", color: "bg-emerald-500" },
    cargo_shake_car_count: { label: "Авто ±", color: "bg-blue-500" },
    update_comment: { label: "Повідомлення", color: "bg-amber-500" },
    update_load_date: { label: "Час оновлено", color: "bg-indigo-500" },
    load_add_car: { label: "+ Авто", color: "bg-blue-600" },
    load_remove_car: { label: "- Авто", color: "bg-red-600" },
  };

  const currentBadge = lastEvent
    ? badgeConfig[lastEvent]
    : badgeConfig.cargo_shake;

  return (
    <>
      <div
        onDoubleClick={() => setSelectedCargo(load)}
        className={cn(
          "group relative flex flex-col w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-blue-400 transition-all duration-200 shadow-sm",
          "h-[265px] min-h-[265px]",
          isJustCreated && "animate-in fade-in slide-in-from-bottom-2",
          getAnimationClass(),
        )}
      >
        <StatusIndicator updatedAt={load.updated_at} />

        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm">
              #{load.id}
            </span>
            <span className="text-[9px] font-black text-zinc-500 uppercase truncate">
              {filters?.transit_dropdown?.find(
                (t) => t.ids === load.ids_transit_type,
              )?.value || "UA-UA"}
            </span>
          </div>
          <div className="flex items-center  gap-4">
            {/* INFO BUTTON -> OPENS DRAWER */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCargo(load); // Відкриваємо той самий Drawer, що і по дабл-кліку
              }}
              className="p-1 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-all"
              title="Показати деталі"
            >
              <Info size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenHistory(true);
              }}
                 title="Показати історію"
              className="p-1 text-zinc-400 hover:text-blue-500 transition-colors"
            >
              <History size={14} />
            </button>
            <CargoActions
              load={load}
              profile={profile}
              canDelete={canDelete}
              onAddCars={() => setOpenAddCars(true)}
              onRemoveCars={() => setOpenRemoveCars(true)}
              onCloseCargo={() => setOpenCloseCargoByManager(true)}
              onRefresh={refreshLoadTime}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 p-3 min-w-0 gap-2">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <CalendarDays size={10} />
            <span className="text-[9px] font-medium leading-none">
              {load.updated_at ? (
                <>
                  Оновлено{" "}
                  {formatDistanceToNow(new Date(load.updated_at), {
                    addSuffix: true,
                    locale: uk,
                  })}
                  <span className="opacity-60 ml-1">
                    ({format(new Date(load.updated_at), "dd.MM HH:mm")})
                  </span>
                </>
              ) : (
                "—"
              )}
            </span>
          </div>

          {/* ROUTE */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 h-[34px] overflow-hidden content-start">
            {[...load.crm_load_route_from, ...load.crm_load_route_to].map(
              (point, idx, allPoints) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-0.5 max-w-[95px]">
                    <span
                      className={cn(
                        "text-[11px] font-bold truncate",
                        idx >= load.crm_load_route_from.length
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {point.city}
                    </span>
                    <Flag
                      country={point.country || "UA"}
                      size={8}
                      className="shrink-0 grayscale-[0.2]"
                    />
                  </div>
                  {idx !== allPoints.length - 1 && (
                    <ChevronRight
                      size={10}
                      className="text-zinc-300 shrink-0"
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </div>

          {/* TRAILER & PRICE */}
          <div className="grid grid-cols-2 gap-2 py-1 border-t border-zinc-50 dark:border-zinc-800/50 mt-1">
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                Транспорт
              </p>
              <p className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 truncate">
                {load.crm_load_trailer
                  ?.map((t) => t.trailer_type_name)
                  .join(", ") || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                Оплата
              </p>
              <p className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 truncate">
                {load.price
                  ? `${load.price.toLocaleString()} ${load.valut_name}`
                  : <span className="font-thin text-red-400">Не вказано</span> }
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 p-1 bg-zinc-50/50 dark:bg-white/5 rounded-lg mt-auto">
            <div className="flex gap-1">
              <CarCounter
                label="П"
                value={load.car_count_actual}
                variant="blue"
              />
              <CarCounter
                label="З"
                value={load.car_count_closed}
                variant="emerald"
              />
              <CarCounter
                label="В"
                value={load.car_count_canceled}
                variant="red"
              />
            </div>
            <div className="flex gap-1.5 pr-1 text-zinc-400">
              {load.is_collective && (
                <Layers size={12} className="text-amber-500" />
              )}
              {load.is_price_request && (
                <DollarSign size={12} className="text-emerald-500" />
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-3 py-2 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-black shrink-0 border border-white dark:border-zinc-600">
              {load.author?.substring(0, 2).toUpperCase() || "UA"}
            </div>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 truncate">
              {load.company_name || "Без компанії"}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatCargo(load);
            }}
            className="relative p-1.5 text-zinc-500 hover:text-blue-500 transition-all"
          >
            <MessageCircle size={16} />
            {load.comment_count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {load.comment_count}
              </span>
            )}
            {hasUnreadMessages && (
              <span className="absolute top-1 left-1 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
            )}
          </button>
        </div>

        {showBadge && currentBadge && (
          <div
            className={cn(
              "absolute top-10 right-2 px-2 py-0.5 rounded shadow-sm text-white text-[8px] font-black uppercase z-30 animate-pulse",
              currentBadge.color,
            )}
          >
            {currentBadge.label}
          </div>
        )}
      </div>

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

      <style jsx global>{`
        @keyframes shake-card-smooth {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake-card-smooth 0.3s ease-in-out 2;
        }
        .animate-comment-glow {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </>
  );
}
