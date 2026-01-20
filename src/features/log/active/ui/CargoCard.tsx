"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  MessageCircle,
  GripVertical,
  Clock,
  CheckCircle2,
  Info,
  Boxes,
  CircleDollarSign,
  Sparkles,
  ChevronRight,
  GalleryVerticalEnd,
} from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";

import { Dropdowns, LoadApiItem } from "../../types/load.type";
import { CargoDetailsDrawer } from "./CargoDetailsDrawer";

import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { StatusIndicator } from "../CargoCardUpdateColor";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { AddCarsModal } from "./CargoCarAddModal";
import { useAddCars } from "../../hooks/useAddLoadCars";
import { CargoCarRemoveModal } from "./CargoCarRemoveModal";
import { useRemoveCars } from "../../hooks/useRemoveLoadCars";
import { set } from "nprogress";
import { CargoCloseByManagerModal } from "./CargoCloseByManagerModal";
import { useCloseCargoByManager } from "../../hooks/useCloseByManager";
import { CargoHistoryModal } from "./CargoHistoryModal";
import LoadChat from "./LoadChat";
import { useLoads } from "../../hooks/useLoads";

const transitMap: Record<string, string> = {
  E: "Експорт",
  I: "Імпорт",
  R: "Регіон.",
  T: "Транзит",
  M: "Міжнар.",
};

interface CargoCardProps {
  load: LoadApiItem;
  filters?: Dropdowns;
  regionsData?: any[];
}

export function CargoCard({ load, filters }: CargoCardProps) {
  const { config } = useFontSize();
  const router = useRouter();

  const [isNew, setIsNew] = useState(false);
  const [isJustCreated, setIsJustCreated] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
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
  const { refreshLoadTime, isRefreshing } = useLoads();
  useEffect(() => {
    if (!load.created_at) return;
    const checkStatus = () => {
      const diff = Date.now() - new Date(load.created_at).getTime();
      const minutes = diff / 1000 / 60;
      setIsJustCreated(minutes < 1);
      setIsNew(minutes < 3);
    };
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, [load.created_at]);

  const createdAt = load.created_at ? new Date(load.created_at) : null;
  const canDelete = createdAt
    ? Date.now() - createdAt.getTime() < 60 * 60 * 1000
    : false;

  // Використовуємо useMemo для визначення статусу повідомлень
  const hasUnreadMessages = React.useMemo(() => {
    const lastTime = load?.comment_last_time;
    // Пріоритет локальному стану, якщо він щойно змінився (після закриття чату)
    const readTime = localReadTime || load?.comment_read_time;

    if (!lastTime || load.comment_count === 0) return false;

    // Якщо ми ніколи не читали (readTime порожній), але є повідомлення — вони не прочитані
    if (!readTime) return true;

    try {
      const lastDate = new Date(lastTime).getTime();
      const readDate = new Date(readTime).getTime();

      // Додаємо невеликий офсет (наприклад, 1 сек), щоб уникнути проблем
      // з точністю мілісекунд при збереженні в БД
      return lastDate > readDate + 1000;
    } catch (e) {
      return false;
    }
  }, [
    load.comment_last_time,
    load.comment_count,
    localReadTime,
    load.comment_read_time,
  ]);

  // 2. Очищення Shake ефектів (у вас два однакових useEffect, можна об'єднати)
  useEffect(() => {
    const handleEvent = (event: any) => {
      if (event.detail === load.id) {
        setIsShaking(true);
        setShowBadge(true);
        setTimeout(() => setIsShaking(false), 6000);
        setTimeout(() => setShowBadge(false), 30000);
      }
    };

    window.addEventListener("cargo_shake", handleEvent);
    window.addEventListener("cargo_shake_car_count", handleEvent);
    return () => {
      window.removeEventListener("cargo_shake", handleEvent);
      window.removeEventListener("cargo_shake_car_count", handleEvent);
    };
  }, [load.id]);

  const transitTypeInfo = filters?.transit_dropdown?.find(
    (item: any) => item.id === load.transit_type,
  );
  return (
    <>
      <Card
        onDoubleClick={() => {
          if (window.innerWidth > 768) {
            setSelectedCargo(load);
          }
        }}
        className={cn(
          "group relative flex flex-col w-full bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300",
          isJustCreated &&
            "animate-in fade-in zoom-in duration-700 slide-in-from-left-4",
          isShaking &&
            "animate-shake border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        )}
      >
        {isNew && (
          <div className="absolute top-10 bg-amber-500 text-white text-[8px] font-black px-8 py-0.5 z-50 shadow-sm animate-pulse">
            NEW
          </div>
        )}
        {showBadge && (
          <div className="absolute top-10 right-0 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-bl-xl shadow-lg border-b border-l border-white/20 animate-in fade-in zoom-in duration-300 z-50">
            <Sparkles size={10} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Відредаговано
            </span>
          </div>
        )}

        <StatusIndicator updatedAt={load.updated_at} />

        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-0 bg-zinc-100/50 dark:bg-white/5 border-b border-zinc-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
              <span
                className={cn(
                  "font-black text-blue-600 dark:text-blue-400 text-[10px] tabular-nums",
                  config.label,
                )}
              >
                #{load.id}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] font-black text-zinc-500 uppercase tracking-tight",
                config.label,
              )}
            >
              {/* 2. Відображаємо назву з сервера, або технічний ID, або прочерк */}
              {transitTypeInfo
                ? transitTypeInfo.value
                : load.transit_type || "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Дата/час створення */}
            <div className="flex items-center gap-1 text-zinc-400 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md border border-zinc-200/50 dark:border-white/5">
              <span className="text-[7px] font-black uppercase text-zinc-500/70">
                Створено:
              </span>
              <span
                className={cn(
                  "text-[8px] font-bold tabular-nums text-zinc-600 dark:text-zinc-400",
                  config.label,
                )}
              >
                {load.created_at
                  ? format(new Date(load.created_at), "dd.MM HH:mm")
                  : "—"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <GripVertical size={12} className="text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="rounded-xl backdrop-blur-lg"
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/log/load/edit/${load.id}`)}
                >
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => refreshLoadTime(load.id)}>
                  Оновити
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setOpenAddCars(true)}>
                  Додати к-сть авто
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenRemoveCars(true)}>
                  Відняти к-сть авто
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenCloseCargoByManager(true)}
                >
                  Закрита нами
                </DropdownMenuItem>

                {canDelete && (
                  <DropdownMenuItem className="text-red-500">
                    Видалити
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 3-Part Main Content */}
        <div className="px-2 flex gap-0 flex-1 overflow-hidden items-stretch">
          {/* Column 1: Route (Звідки/Куди) */}
          <div className="flex-[1.4] flex flex-col gap-3 min-w-0 pr-2">
            <div className="flex flex-col">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[7px] leading-none mb-1",
                  config.label,
                )}
              >
                Звідки
              </span>
              <div className="flex flex-wrap gap-x-1 gap-y-2.5 mt-1.5">
                {load.crm_load_route_from.map((from, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center gap-1 bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10"
                  >
                    {from.region && (
                      <span className="absolute -top-2.5 left-0 text-[7px] uppercase font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {from.region}
                      </span>
                    )}
                    <Flag
                      country={from.country?.toUpperCase() || "UN"}
                      size={10}
                    />
                    <span
                      className={cn(
                        "font-bold text-zinc-800 dark:text-zinc-200 text-[10px] ",
                        config.title,
                      )}
                    >
                      {from.city}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[7px] leading-none mb-1",
                  config.label,
                )}
              >
                Куди
              </span>
              <div className="flex flex-wrap gap-x-1 gap-y-2.5 mt-1.5">
                {load.crm_load_route_to.map((to, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center gap-1 bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10"
                  >
                    {to.region && (
                      <span className="absolute -top-2.5 left-0 text-[7px] uppercase font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {to.region}
                      </span>
                    )}
                    <Flag
                      country={to.country?.toUpperCase() || "UN"}
                      size={10}
                    />
                    <span
                      className={cn(
                        "font-bold text-zinc-800 dark:text-zinc-200 text-[10px] ",
                        config.title,
                      )}
                    >
                      {to.city}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Transport (Транспорт) */}
          <div className="flex-1 flex flex-col gap-1.5 border-l border-zinc-200/50 dark:border-white/5 px-2 min-w-[100px]">
            <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[7px]">
              <Truck size={10} className="text-blue-500" />
              <span className={config.label}>Транспорт</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-col pl-1 border-l border-zinc-200 dark:border-zinc-700 mt-0.5">
                {load.crm_load_trailer && load.crm_load_trailer.length > 0 ? (
                  load.crm_load_trailer.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-medium leading-tight text-zinc-500 dark:text-zinc-400 py-0.5"
                    >
                      • {t.trailer_type_name?.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-medium text-zinc-400">
                    • Тент
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Status & Price (Статус/Ціна) */}
          <div className="flex-1 flex flex-col gap-2 border-l border-zinc-200/50 dark:border-white/5 pl-2 min-w-[90px]">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[7px] mb-1">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span className={config.label}>Статус</span>
              </div>
              <div className="flex flex-col leading-none gap-2">
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                  {load.car_count_actual} - Потрібно
                </span>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                  {load.car_count_canceled} - Відмінено
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {load.car_count_closed} - Закрито нами
                </span>
              </div>
              <div
                className="mt-2 flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenHistory(true);
                }}
              >
                <GalleryVerticalEnd
                  size={12}
                  className="text-zinc-400 group-hover:text-blue-500"
                />
                <span
                  className={cn(
                    "text-[7px] font-black uppercase text-zinc-500 tracking-tight group-hover:text-blue-500",
                    config.label,
                  )}
                >
                  Історія
                </span>
              </div>
            </div>

            {load.price ? (
              <div className="mt-auto">
                <Badge
                  variant="secondary"
                  className="w-full justify-center px-1 py-1 font-black text-[10px] rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-none shadow-none"
                >
                  {load.price} {load.valut_name}
                </Badge>
              </div>
            ) : (
              <Badge
                variant="secondary"
                className="w-full justify-center px-1 py-1 font-black text-[10px] rounded-md bg-red-100 text-red-700 dark:bg-blue-500/20 dark:text-blue-300 border-none shadow-none"
              >
                Ціна не вказана
              </Badge>
            )}
          </div>
        </div>

        {/* Load Info */}
        {load.load_info && (
          <div className="px-2 pb-1.5 flex items-start gap-1.5 shrink-0 opacity-80 border-t border-transparent">
            <Info size={10} className="mt-0.5 text-blue-500 shrink-0" />
            <p
              className={cn(
                "italic text-[9px] leading-tight text-zinc-600 dark:text-zinc-400 line-clamp-1",
                config.label,
              )}
            >
              {load.load_info}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-2 py-1 flex items-center justify-between bg-zinc-100/50 dark:bg-white/5 border-t border-zinc-200/50 dark:border-white/10">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[7px] font-black border border-blue-500/20 uppercase">
              {load.author?.substring(0, 2)}
            </div>
            <span
              className={cn(
                "font-bold text-zinc-500 text-[9px] truncate uppercase tracking-tighter",
                config.main,
              )}
            >
              {load.company_name || "—"}
            </span>
          </div>
          {/* Дата/час оновлення */}
          <div className="flex items-center gap-1 text-zinc-400 bg-blue-500/1 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-500/20">
            <MyTooltip
              icon={<Clock size={10} className="text-blue-500" />}
              text="Час оновлення заявки"
            ></MyTooltip>
            <span
              className={cn(
                "text-[7px] font-bold tabular-nums text-blue-700 dark:text-blue-400",
                config.label,
              )}
            >
              {load.updated_at
                ? format(new Date(load.updated_at), "HH:mm")
                : "—"}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation(); // Щоб не спрацьовували події на Card
              setSelectedCargo(load);
            }}
            className={cn(
              "group relative overflow-hidden",
              "hidden",
              "xs:flex",
              "sm:flex",
              "flex",
              "md:hidden", // Кнопка видима лише на мобільних та планшетах
              "h-8 px-3 xs:flex items-center",
              "md:h-9 md:px-4 md:rounded-xl",
              "bg-white dark:bg-zinc-900",
              "border-zinc-200 dark:border-zinc-800",
              "hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
              "active:scale-95 transition-all duration-300 rounded-lg shadow-sm",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">
                Деталі
              </span>
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-600 transition-colors duration-300">
                <ChevronRight
                  size={12}
                  className="text-zinc-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
          <div className="flex items-center gap-1.5">
            {load.is_collective && (
              <MyTooltip
                icon={<Boxes size={18} className="text-zinc-400" />}
                text="Збірний вантаж!"
              />
            )}
            {load.is_price_request && (
              <MyTooltip
                icon={<CircleDollarSign size={18} className="text-amber-500" />}
                text="Запит ціни!"
              />
            )}
            <Button
              size="sm"
              className={cn(
                "h-5 rounded px-1.5 gap-1 transition-all text-[9px] font-black shadow-none relative", // Додали relative
                load.comment_count > 0
                  ? "bg-blue-600 text-white"
                  : "bg-white/50 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/50 dark:border-white/5",
              )}
              onClick={(e) => {
                e.stopPropagation();
                setChatCargo(load);
              }}
            >
              {/* Пульсуючий індикатор */}
              {hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-900"></span>
                </span>
              )}

              <MessageCircle
                size={10}
                className={load.comment_count > 0 ? "fill-white/20" : ""}
              />
              {load.comment_count ?? 0}
            </Button>
          </div>
        </div>
      </Card>

      {/* Drawers & Modals */}
      <CargoDetailsDrawer
        cargo={selectedCargo ?? undefined}
        open={!!selectedCargo}
        onClose={() => setSelectedCargo(null)}
      />
      {/* ... всередині JSX ... */}
      {chatCargo && (
        <LoadChat
          cargoId={chatCargo.id}
          open={!!chatCargo}
          onClose={() => {
            setChatCargo(null);
            // Оновлюємо локальний час прочитання на поточний при закритті чату
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
          20% {
            transform: translateX(-2px) rotate(-0.5deg);
          }
          40% {
            transform: translateX(2px) rotate(0.5deg);
          }
          60% {
            transform: translateX(-1.5px) rotate(-0.2deg);
          }
          80% {
            transform: translateX(1.5px) rotate(0.2deg);
          }
        }
        .animate-shake {
          animation: shake-card-smooth 0.4s ease-in-out infinite;
          z-index: 50;
          position: relative;
        }
      `}</style>
    </>
  );
}
