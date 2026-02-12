"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MessageCircle,
  History,
  Info,
  Truck,
  CheckCircle2,
  XCircle,
  Copy,
  Map,
  Boxes,
  DollarSign,
  CircleDollarSign,
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
import { toast } from "sonner";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { eventBus } from "@/shared/lib/event-bus";

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
}
const EVENT_LABELS: Record<string, string> = {
  cargo_shake: "Оновлено",
  update_comment: "Новий коментар",
  update_load_date: "Заявку оновлено",
  load_add_car: "Додано авто",
  load_remove_car: "Видалено авто",
};

export function CargoCard({ load, filters }: CargoCardProps) {
  const { config, size } = useFontSize(); // Отримуємо динамічний конфіг
  const { profile } = useAuth();
  const onlineUsers = useOnlineUsers();
  const [isJustCreated, setIsJustCreated] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [openAddCars, setOpenAddCars] = useState(false);
  const [openRemoveCars, setOpenRemoveCars] = useState(false);
  const [openCloseCargoByManager, setOpenCloseCargoByManager] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  // const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const isOnline = onlineUsers.has(String(load.id_author));
  const [localReadTime, setLocalReadTime] = useState<string | null>(
    load.comment_read_time || null,
  );

  const { mutateAsync: addCarsMutate, isLoading: isLoadingAddCars } =
    useAddCars();
  const { removeCarsMutate, isLoadingRemove } = useRemoveCars();
  const { closeCargoMutate, isLoadingCloseCargo } = useCloseCargoByManager();

  // const { isActive: isShaking } = useEventEffect(load.id, [
  //   "cargo_shake",
  //   "update_comment",
  //   "update_load_date",
  //   "load_add_car",
  // ]);

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

  const hasUnreadMessages = React.useMemo(() => {
    const lastTime = load?.comment_last_time;
    const readTime = localReadTime || load?.comment_read_time;
    if (!lastTime || !load?.comment_count) return false;
    if (!readTime) return true;
    return new Date(lastTime).getTime() > new Date(readTime).getTime() + 1000;
  }, [
    load.comment_last_time,
    load.comment_count,
    load.comment_read_time,
    localReadTime,
  ]);

  const handleCopyLoad = () => {
    const getFlag = (code?: string) =>
      code === "UA" ? "🇺🇦" : code === "DE" ? "🇩🇪" : code === "PL" ? "🇵🇱" : "🏳️";

    // Форматування точок маршруту
    const formatRoute = (points: any[]) =>
      points
        .map(
          (p) =>
            `${getFlag(p.ids_country)} ${p.city}${p.region ? ` (${p.region})` : ""}`,
        )
        .join(" — ");

    const fromPoints = formatRoute(load.crm_load_route_from);
    const toPoints = formatRoute(load.crm_load_route_to);

    // Типи причепів
    const trailers =
      load.crm_load_trailer?.map((t: any) => t.trailer_type_name).join(", ") ||
      "Не вказано";
    // Логіка відображення ціни
    const getPriceDisplay = () => {
      if (load.is_price_request) return "Запит ціни";

      // Якщо ціна 0, null або undefined
      if (!load.price || load.price === 0) return "—";

      return `${load.price.toLocaleString()} ${load.valut_name}${load.is_collective ? " (Збірний)" : ""}`;
    };
    const priceDisplay = getPriceDisplay();
    // Форматування ціни

    // Дати (завантаження — розвантаження)
    const dateInfo = `📅 ${load.date_load}${load.date_unload ? ` — ${load.date_unload}` : ""}`;

    // Текст для копіювання
    const textToCopy = [
      `📎 ЗАЯВКА #${load.id}`,
      `--------------------------`,
      `📍 ЗВІДКИ: ${fromPoints}`,
      `🏁 КУДИ: ${toPoints}`,
      `🗓️ ДАТА: ${dateInfo}`,
      `🚛 ТИП: ${trailers} (${load.transit_type})`,
      `🔢 К-СТЬ АВТО: ${load.car_count_actual}`,
      `💰 СТАВКА: ${priceDisplay}`,
      `--------------------------`,
      `👤 Менеджер: ${load.author}`,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Деталі заявки скопійовано", {
        icon: <Copy className="w-4 h-4 text-blue-500" />,
      });
    });
  };
  const handleOpenGoogleMaps = () => {
    if (allPoints.length < 2) {
      toast.error("Недостатньо точок для маршруту");
      return;
    }

    // Початкова точка
    const origin = encodeURIComponent(
      `${firstPoint.city}, ${firstPoint.ids_country}`,
    );

    // Кінцева точка
    const destination = encodeURIComponent(
      `${lastPoint.city}, ${lastPoint.ids_country}`,
    );

    // Проміжні точки (waypoints) через символ "|"
    const waypoints = allPoints
      .slice(1, -1)
      .map((p) => encodeURIComponent(`${p.city}, ${p.ids_country}`))
      .join("|");

    // Формуємо фінальне посилання
    // api=1 & origin=... & destination=... & waypoints=...
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const url = `${baseUrl}&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }&travelmode=driving`;

    window.open(url, "_blank");
  };
  useEffect(() => {
    const events = [
      "cargo_shake",
      "update_comment",
      "update_load_date",
      "load_add_car",
      "load_remove_car",
    ];

    const handler = (e: any) => {
      // e.type - це назва події
      setLastEvent(e.type);

      // Очищуємо бейдж через 3 секунди
      setTimeout(() => setLastEvent(null), 3000);
    };

    events.forEach((event) =>
      eventBus.on(event as any, (e) => {
        // Перевіряємо, чи подія стосується саме цієї картки
        if (e.detail === load.id) handler(e);
      }),
    );

    return () => {
      events.forEach((event) => eventBus.off(event as any, handler as any));
    };
  }, [load.id]);

  const isShaking = !!lastEvent;

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
        {/* ЕФЕКТНИЙ БЕЙДЖ ПОДІЇ */}
        <div
          className={cn(
            "absolute top-2 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-500",
            lastEvent
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4",
          )}
        >
          <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-400/50 uppercase tracking-widest whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            {EVENT_LABELS[lastEvent || ""] || "Оновлення"}
          </div>
        </div>
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 gap-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 min-w-0 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={cn(
                "flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md bg-blue-600 text-white font-bold tracking-wider shrink-0",
                config.label, // ДИНАМІЧНИЙ РОЗМІР
              )}
            >
              {load.id}
            </span>

            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full shrink-0">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isOnline
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-zinc-300 dark:bg-zinc-600",
                  )}
                />
                <span
                  className={cn(
                    "font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter",
                    config.label,
                  )}
                >
                  {load.author}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden group/marquee">
                <span className="text-zinc-300 dark:text-zinc-700 shrink-0">
                  |
                </span>
                <div className="relative overflow-hidden w-full h-5 flex items-center cursor-help">
                  <div
                    className="flex whitespace-nowrap transition-transform duration-[2000ms] ease-in-out w-max"
                    onMouseEnter={(e) => {
                      const t = e.currentTarget;
                      const p = t.parentElement;
                      if (p && t.scrollWidth > p.offsetWidth) {
                        t.style.transform = `translateX(-${t.scrollWidth - p.offsetWidth + 10}px)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span
                      className={cn(
                        "font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide",
                        config.main,
                      )}
                    >
                      {load.company_name || "-----"}
                    </span>
                  </div>
                  {/* <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent pointer-events-none" /> */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* <div className="hidden md:flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              <History size={config.icon - 4} strokeWidth={2.5} />
              <span className={cn("font-medium tabular-nums", config.label)}>
                {load.created_at
                  ? format(new Date(load.created_at), "dd.MM HH:mm")
                  : "—"}
              </span>
            </div> */}
            <div className="flex items-center border-l border-zinc-100 dark:border-zinc-800 pl-2">
              <CargoActions
                load={load}
                profile={profile}
                onAddCars={() => setOpenAddCars(true)}
                onRemoveCars={() => setOpenRemoveCars(true)}
                onCloseCargo={() => setOpenCloseCargoByManager(true)}
                canDelete={canDelete}
              />
            </div>
          </div>
        </div>

        {/* DATES BAR */}
        <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 font-bold">
          <div className="bg-white dark:bg-slate-900 py-1.5 px-4 flex gap-2 items-center justify-center sm:justify-start">
            <span className={cn("text-zinc-400 uppercase", config.label)}>
              Завантаження:
            </span>
            <span
              className={cn(
                "text-emerald-600 dark:text-emerald-500",
                config.main,
              )}
            >
              {load.date_load ? format(new Date(load.date_load), "dd.MM") : "—"}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 py-1.5 px-4 flex gap-2 items-center justify-center sm:justify-start">
            <span className={cn("text-zinc-400 uppercase", config.label)}>
              Розвантаження:
            </span>
            <span
              className={cn("text-blue-600 dark:text-blue-400", config.main)}
            >
              {load.date_unload
                ? format(new Date(load.date_unload), "dd.MM HH:mm")
                : "—"}
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
          <div className="flex-[1.5] flex flex-col gap-0.5 min-w-0">
            <div className="flex-[1.5] flex flex-col min-w-0 ">
              <RoutePoint point={firstPoint} isMain />
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
              <RoutePoint point={lastPoint} isMain />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <div
                className={cn(
                  "px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 font-black uppercase tracking-wider",
                  config.label,
                )}
              >
                {load.crm_load_trailer?.length > 0
                  ? load.crm_load_trailer
                      .map((t) => t.trailer_type_name)
                      .join(", ")
                  : "ТЕНТ"}
              </div>
              <div
                className={cn(
                  "px-2.5 py-0.5 text-white rounded font-black",
                  config.label,
                )}
              >
                {load.price ? (
                  <span className="bg-blue-500 p-1 rounded-xl">{`${load.price.toLocaleString()} ${load.valut_name}`}</span>
                ) : (
                  <span className="bg-red-500 p-1 rounded-xl">
                    Ціна не вказана
                  </span>
                )}
              </div>

              <div className="flex items-center text-center">
                {load.is_collective && (
                  <span title="Збірний вантаж">
                    <Boxes className="text-blue-500 ml-1" />
                  </span>
                )}
                {load.is_price_request && (
                  <span title="Запит ціни">
                    {" "}
                    <CircleDollarSign className="text-green-500 ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px bg-zinc-100 dark:border-zinc-800" />

          <div className="flex-1 flex flex-col min-w-0">
            <h3
              className={cn(
                "text-zinc-400 font-bold uppercase tracking-widest mb-1.5",
                config.label,
              )}
            >
              Інформація
            </h3>
            <div
              className={cn(
                "text-zinc-500 dark:text-zinc-400 leading-snug overflow-y-auto max-h-[160px] pr-1 scrollbar-thin  break-words whitespace-pre-wrap",
                config.main,
              )}
            >
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
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg dark:bg-zinc-800/50",
                  stat.color,
                )}
              >
                <stat.icon size={config.icon - 4} />
                <span className={cn("font-bold", config.main)}>{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[
              {
                icon: Map,
                onClick: handleOpenGoogleMaps,
                title: "Переглянути на GoogleMaps",
                hover: "hover:text-emerald-500",
              },
              {
                icon: Copy,
                onClick: handleCopyLoad,
                title: "Копіювати",
                hover: "hover:text-emerald-500",
              },
              {
                icon: History,
                onClick: () => setOpenHistory(true),
                title: "Історія",
                hover: "hover:text-blue-500",
              },
              {
                icon: Info,
                onClick: () => setSelectedCargo(load),
                title: "Інфо",
                hover: "hover:text-blue-500",
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                className={cn(
                  "p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-400 transition-colors",
                  btn.hover,
                )}
              >
                <btn.icon size={config.icon - 2} />
              </button>
            ))}
            <button
              onClick={() => setChatCargo(load)}
              className="relative p-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <MessageCircle size={config.icon - 2} className="text-zinc-400" />
              {load.comment_count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900",
                    size === "xs"
                      ? "w-4 h-4 text-[9px]"
                      : "w-5 h-5 text-[10px]",
                  )}
                >
                  {load.comment_count}
                </span>
              )}
              {hasUnreadMessages && (
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS (Без змін) */}
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
    </>
  );
}
