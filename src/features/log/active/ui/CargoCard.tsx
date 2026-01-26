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
// Імпортуємо хук
import { useFontSize } from "@/shared/providers/FontSizeProvider";

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
  regionsData?: any[];
}

function CarCounter({
  icon: Icon,
  label,
  value,
  variant,
  fontSizeClass,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  variant: "blue" | "emerald" | "red";
  fontSizeClass: string;
}) {
  const styles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-400/10 border-blue-100 dark:border-blue-400/20",
    emerald:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-100 dark:border-emerald-400/20",
    red: "text-red-500 bg-red-50 dark:bg-red-400/10 border-red-100 dark:border-red-400/20",
  };

  return (
    <div className="group/tooltip relative flex">
      {/* САМА ПІДКАЗКА */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50">
        {label}
        {/* Стрілочка підказки */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
      </div>

      {/* КНОПКА ЛІЧИЛЬНИКА */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg border cursor-help transition-all",
          styles[variant],
        )}
      >
        <Icon size={12} className="opacity-80" />
        <span className={cn("font-bold tabular-nums", fontSizeClass)}>
          {value}
        </span>
      </div>
    </div>
  );
}
function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="group/tooltip relative flex items-center justify-center">
      {/* Тіло підказки */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
        {text}
        {/* Стрілочка */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
      </div>
      {children}
    </div>
  );
}
export function CargoCard({ load, filters }: CargoCardProps) {
  const { config } = useFontSize(); // Отримуємо конфігурацію шрифтів
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
      
        className={cn(
          "group relative flex flex-col w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-blue-400 transition-all duration-200 shadow-sm",
          "min-h-[265px] h-auto", // Дозволяємо картці рости, якщо шрифт великий
          isJustCreated && "animate-in fade-in slide-in-from-bottom-2",
          getAnimationClass(),
        )}
      >
        <StatusIndicator updatedAt={load.updated_at} />

        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm shrink-0",
                config.label,
              )}
            >
              #{load.id}
            </span>
            <span
              className={cn(
                "font-black text-zinc-500 uppercase truncate",
                config.label,
              )}
            >
              {filters?.transit_dropdown?.find(
                (t) => t.ids === load.ids_transit_type,
              )?.value || "UA-UA"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip text="Деталі вантажу">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCargo(load);
                }}
                className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
              >
                <Info size={config.icon * 0.8} />
              </button>
            </Tooltip>

            <Tooltip text="Історія змін">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenHistory(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <History size={config.icon * 0.8} />
              </button>
            </Tooltip>

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
        <div className="flex flex-col flex-1 p-3 gap-3">
          {/* TIME */}
          <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
            <CalendarDays size={config.icon * 0.7} />
            <span className={cn("font-medium leading-none", config.label)}>
              {load.updated_at ? (
                <span className="truncate">
                  {formatDistanceToNow(new Date(load.updated_at), {
                    addSuffix: true,
                    locale: uk,
                  })}
                </span>
              ) : (
                "—"
              )}
            </span>
          </div>

          {/* ROUTE - Найважливіша частина для стабільності */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-h-[40px]">
            {[...load.crm_load_route_from, ...load.crm_load_route_to].map(
              (point, idx, allPoints) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/40 px-1.5 py-0.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                    <span
                      className={cn(
                        "font-bold truncate max-w-[120px]",
                        config.main,
                        idx < load.crm_load_route_from.length
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-900 dark:text-zinc-100",
                      )}
                    >
                      {point.city}
                    </span>
                    <Flag
                      country={point.country || "UA"}
                      size={config.icon * 0.6}
                      className="shrink-0"
                    />
                  </div>
                  {idx !== allPoints.length - 1 && (
                    <ChevronRight
                      size={14}
                      className="text-zinc-300 shrink-0"
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </div>

          {/* TRAILER & PRICE */}
          <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-50 dark:border-zinc-800/50">
            <div className="min-w-0">
              <p
                className={cn(
                  "font-bold text-zinc-400 uppercase tracking-wider mb-0.5",
                  config.label,
                )}
              >
                Транспорт
              </p>
              <p
                className={cn(
                  "font-semibold text-zinc-600 dark:text-zinc-300 truncate",
                  config.label,
                )}
              >
                {load.crm_load_trailer
                  ?.map((t) => t.trailer_type_name)
                  .join(", ") || "—"}
              </p>
            </div>
            <div className="text-right min-w-0">
              <p
                className={cn(
                  "font-bold text-zinc-400 uppercase tracking-wider mb-0.5",
                  config.label,
                )}
              >
                Оплата
              </p>
              <p
                className={cn(
                  "font-black text-blue-600 dark:text-blue-400 truncate",
                  config.main,
                )}
              >
                {load.price
                  ? `${load.price.toLocaleString()} ${load.valut_name}`
                  : "—"}
              </p>
            </div>
          </div>

          {/* COUNTERS & BADGES */}
          <div className="flex items-center justify-between gap-2 p-1 bg-zinc-50/50 dark:bg-white/5 rounded-xl mt-auto border border-zinc-100 dark:border-white/5">
            <div className="flex gap-1">
              <CarCounter
                icon={Truck}
                label="В пошуку"
                value={load.car_count_actual}
                variant="blue"
                fontSizeClass={config.label}
              />
              <CarCounter
                icon={CheckCircle2}
                label="Закриті"
                value={load.car_count_closed}
                variant="emerald"
                fontSizeClass={config.label}
              />
              <CarCounter
                icon={XCircle}
                label="Відмінені"
                value={load.car_count_canceled}
                variant="red"
                fontSizeClass={config.label}
              />
            </div>

            <div className="flex gap-1 items-center border-l border-zinc-200 dark:border-zinc-700 pl-2">
              {load.is_collective && (
                <Tooltip text="Збірний вантаж (LTL)">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-400/10 text-amber-600 border border-amber-100 dark:border-amber-400/20">
                    <Layers size={config.icon * 0.7} />
                  </div>
                </Tooltip>
              )}
              {load.is_price_request && (
                <Tooltip text="Запит ціни">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 border border-emerald-100 dark:border-emerald-400/20">
                    <DollarSign size={config.icon * 0.7} />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-3 py-2 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-black px-2 border border-white dark:border-zinc-600 shadow-sm shrink-0",
                config.label,
              )}
            >
              {load.author?.toUpperCase() || "UA"}
            </div>
            <span
              className={cn(
                "font-bold text-zinc-600 dark:text-zinc-300 truncate",
                config.label,
              )}
            >
              {load.company_name || "Без компанії"}
            </span>
          </div>

          <Tooltip text={`Повідомлення (${load.comment_count})`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setChatCargo(load);
              }}
              className="relative p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
            >
              <MessageCircle size={config.icon * 1.1} />
              {load.comment_count > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 px-0.5">
                  {load.comment_count}
                </span>
              )}
              {hasUnreadMessages && (
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
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
