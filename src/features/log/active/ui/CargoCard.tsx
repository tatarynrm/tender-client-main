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
  BadgeCheckIcon,
  Sparkles,
  Edit3,
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

import { LoadApiItem } from "../../types/load.type";
import { CargoDetailsDrawer } from "./CargoDetailsDrawer";
import CargoChat from "../../screen/components/CargoChat";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

const transitMap: Record<string, string> = {
  E: "Експорт",
  I: "Імпорт",
  R: "Регіон.",
  T: "Транзит",
  M: "Міжнар.",
};

interface CargoCardProps {
  cargo: LoadApiItem;
  regionsData?: any[];
}

export function CargoCard({ cargo }: CargoCardProps) {
  const { config } = useFontSize();
  const router = useRouter();
  // --- Логіка "Нового" тендера ---
  const [isNew, setIsNew] = useState(false);
  const [isJustCreated, setIsJustCreated] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  useEffect(() => {
    if (!cargo.created_at) return;

    const checkStatus = () => {
      const diff = Date.now() - new Date(cargo.created_at).getTime();
      const minutes = diff / 1000 / 60;

      // Якщо менше 1 хвилини — додаємо спец. анімацію появи
      setIsJustCreated(minutes < 1);
      // Якщо менше 3 хвилин — показуємо значок NEW
      setIsNew(minutes < 3);
    };

    checkStatus();
    const timer = setInterval(checkStatus, 30000); // перевірка кожні 30 сек
    return () => clearInterval(timer);
  }, [cargo.created_at]);

  // --- Логіка видалення (годину) ---
  const createdAt = cargo.created_at ? new Date(cargo.created_at) : null;
  const canDelete = createdAt
    ? Date.now() - createdAt.getTime() < 60 * 60 * 1000
    : false;

  useEffect(() => {
    const handleShake = (event: any) => {
      if (event.detail === cargo.id) {
        // Активуємо обидва стани
        setIsShaking(true);
        setShowBadge(true);

        // 1. Зупиняємо ТРЯСКУ рівно через 6 секунд
        const shakeTimer = setTimeout(() => {
          setIsShaking(false);
        }, 6000);

        // 2. Прибираємо НАПИС (badge) через 30 секунд
        const badgeTimer = setTimeout(() => {
          setShowBadge(false);
        }, 30000);

        return () => {
          clearTimeout(shakeTimer);
          clearTimeout(badgeTimer);
        };
      }
    };

    window.addEventListener("cargo_shake", handleShake);
    return () => window.removeEventListener("cargo_shake", handleShake);
  }, [cargo.id]);
  return (
    <>
      <Card
        onDoubleClick={() => setSelectedCargo(cargo)}
        className={cn(
          "group relative flex flex-col w-full bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300",
          // Анімація появи, якщо картка щойно створена
          isJustCreated &&
            "animate-in fade-in zoom-in duration-700 slide-in-from-left-4",
          // Тряска триватиме 6 секунд, поки активний isShaking
          isShaking &&
            "animate-shake border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        )}
      >
        {/* Значок NEW (плаваючий) */}
        {isNew && (
          <div className="absolute top-10   bg-amber-500 text-white text-[8px] font-black px-8 py-0.5 z-50 shadow-sm animate-pulse">
            NEW
          </div>
        )}
        {/* Напис "Відредаговано", який зникне через 30 секунд */}
        {showBadge && (
          <div className="absolute top-10 right-0    flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-bl-xl shadow-lg border-b border-l border-white/20 animate-in fade-in zoom-in duration-300">
            <Sparkles size={10} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Відредаговано
            </span>
          </div>
        )}
        {/* Header - Compact Glass */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-zinc-100/50 dark:bg-white/5 border-b border-zinc-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
              <span
                className={cn(
                  "font-black text-blue-600 dark:text-blue-400 text-[10px] tabular-nums",
                  config.label,
                )}
              >
                #{cargo.id}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] font-black text-zinc-500 uppercase tracking-tight",
                config.label,
              )}
            >
              {transitMap[cargo.transit_type as keyof typeof transitMap] ||
                cargo.transit_type ||
                "—"}
            </span>
          </div>
          {cargo.price ? (
            <Badge
              variant="secondary"
              className="px-2 py-1 font-semibold text-sm rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            >
              <span className="mr-1">{cargo.price}</span>
              <span>{cargo.valut_name}</span>
            </Badge>
          ) : null}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-zinc-400 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md border border-zinc-200/50 dark:border-white/5">
              <Clock size={10} className="text-blue-500" />
              <span
                className={cn(
                  "text-[10px] font-bold tabular-nums",
                  config.main,
                )}
              >
                {cargo.updated_at
                  ? format(new Date(cargo.updated_at), "HH:mm")
                  : "—"}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-blue-500/10 rounded-md"
                >
                  <GripVertical size={12} className="text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl backdrop-blur-lg"
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/log/cargo/edit/${cargo.id}`)}
                >
                  Редагувати
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

        {/* Main Content - Compressed */}
        <div className="p-2 flex gap-3 flex-1 overflow-hidden">
          <div className="relative flex flex-col gap-1 flex-grow min-w-0">
            {/* Маршрут тепер без зайвих відступів */}
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[8px] leading-none mb-0.5",
                  config.label,
                )}
              >
                Звідки
              </span>
              <div className="flex flex-wrap gap-1">
                {cargo.crm_load_route_from.map((from, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center gap-1 bg-white/40 dark:bg-white/5 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-white/5 mt-2" // додав mt-2 для відступу під регіон
                  >
                    {/* Позначка регіону */}
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

            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[8px] leading-none mb-0.5",
                  config.label,
                )}
              >
                Куди
              </span>
              <div className="flex flex-wrap gap-1">
                {cargo.crm_load_route_to.map((to, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center gap-1 bg-white/40 dark:bg-white/5 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-white/5 mt-2"
                  >
                    {/* Регіон абсолютно зверху */}
                    {to.region && (
                      <span className="absolute -top-2.5 left-0 text-[7px] uppercase font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap leading-none opacity-80">
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

          {/* Logistics - Vertical Sidebar Style */}
          <div className="flex flex-col gap-1.5 min-w-[95px] border-l border-zinc-200/50 dark:border-white/5 pl-2 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[8px]">
                <Truck size={10} className="text-blue-500" />
                <span className={config.label}>Транспорт</span>
              </div>
              <span
                className={cn(
                  "font-bold text-zinc-700 dark:text-zinc-200 text-[10px] leading-tight",
                  config.main,
                )}
              >
                {cargo.car_count_add}×
                {cargo.crm_load_trailer?.[0]?.trailer_type_name?.substring(
                  0,
                  5,
                ) || "Тент"}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[8px]">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span className={config.label}>Статус</span>
              </div>
              <span
                className={cn(
                  "font-bold text-zinc-700 dark:text-zinc-200 text-[10px] leading-tight",
                  config.main,
                )}
              >
                {cargo.car_count_actual}/{cargo.car_count_closed}
              </span>
            </div>
          </div>
        </div>

        {/* Load Info - Compact Scrollable */}
        {cargo.load_info && (
          <div className="px-2 pb-1.5 flex items-start gap-1.5 shrink-0 opacity-80">
            <Info size={10} className="mt-0.5 text-blue-500 shrink-0" />
            <p
              className={cn(
                "italic text-[9px] leading-tight text-zinc-600 dark:text-zinc-400 line-clamp-1",
                config.label,
              )}
            >
              {cargo.load_info}
            </p>
          </div>
        )}

        {/* Footer - Ultra Slim */}
        <div className="mt-auto px-2 py-1 flex items-center justify-between bg-zinc-100/50 dark:bg-white/5 border-t border-zinc-200/50 dark:border-white/10">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[7px] font-black border border-blue-500/20 uppercase">
              {cargo.author?.substring(0, 2)}
            </div>
            <span
              className={cn(
                "font-bold text-zinc-500 text-[9px] truncate uppercase tracking-tighter",
                config.main,
              )}
            >
              {cargo.company_name || "—"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {cargo.is_collective && (
              <Boxes size={11} className="text-zinc-400" />
            )}
            {cargo.is_price_request && (
              <CircleDollarSign size={11} className="text-amber-500" />
            )}

            <Button
              size="sm"
              className={cn(
                "h-5 rounded px-1.5 gap-1 transition-all text-[9px] font-black shadow-none",
                cargo.messages > 0
                  ? "bg-blue-600 text-white"
                  : "bg-white/50 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/50 dark:border-white/5",
              )}
              onClick={(e) => {
                e.stopPropagation();
                setChatCargo(cargo);
              }}
            >
              <MessageCircle
                size={10}
                className={cargo.messages > 0 ? "fill-white/20" : ""}
              />
              {cargo.messages ?? 0}
            </Button>
          </div>
        </div>
      </Card>

      <CargoDetailsDrawer
        cargo={selectedCargo ?? undefined}
        open={!!selectedCargo}
        onClose={() => setSelectedCargo(null)}
      />
      <CargoChat
        cargoId={chatCargo?.id ?? 0}
        open={!!chatCargo}
        onClose={() => setChatCargo(null)}
      />

      {/* Анімація трусіння */}
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
          /* 0.4s — золота середина між швидким і плавним */
          animation: shake-card-smooth 0.4s ease-in-out infinite;
          z-index: 50;
          position: relative;
        }
      `}</style>
    </>
  );
}
