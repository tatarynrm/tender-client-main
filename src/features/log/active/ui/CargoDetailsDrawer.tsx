"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/shared/components/ui/drawer";

import { CargoMap } from "./CargoMap";
import { LoadApiItem } from "../../types/load.type";
import {
  User,
  Building2,
  MapPin,
  Info,
  Calendar,
  Activity,
  Truck,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface CargoDetailsDrawerProps {
  cargo?: LoadApiItem;
  open: boolean;
  onClose: () => void;
}

export function CargoDetailsDrawer({
  cargo,
  open,
  onClose,
}: CargoDetailsDrawerProps) {
  if (!cargo) return null;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="w-full h-[96vh] lg:h-[85vh] flex flex-col bg-white dark:bg-zinc-950 border-none shadow-2xl">
        <div className="mx-auto w-12 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full mt-2" />

        <DrawerHeader className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-1 h-5 rounded-full" />
            <DrawerTitle className="text-xl font-black tabular-nums">
              #{cargo.id}
            </DrawerTitle>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase text-zinc-400 border-l pl-3 py-1">
              Деталі вантажу
            </span>
          </div>
          <DrawerClose className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full hover:rotate-90 transition-transform" />
        </DrawerHeader>

        {/* Головний контейнер без зайвих відступів */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* ЛІВА ЧАСТИНА: Вся інформація в один екран */}
          <div className="w-full lg:w-[400px] xl:w-[450px] p-4 space-y-4 overflow-y-auto border-r border-zinc-50 dark:border-zinc-900 shrink-0">
            {/* Ряд 1: Менеджер та Компанія (в один блок для економії місця) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">
                  Менеджер
                </p>
                <div className="flex items-center gap-2 text-sm font-bold truncate">
                  <User size={14} className="text-blue-500" /> {cargo.author}
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">
                  Компанія
                </p>
                <div className="flex items-center gap-2 text-sm font-bold truncate">
                  <Building2 size={14} className="text-blue-500" />{" "}
                  {cargo.company_name}
                </div>
              </div>
            </div>

            {/* Ряд 2: Маршрут (Компактний таймлайн) */}
            <div className="bg-white dark:bg-zinc-900/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-4 relative">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  <div className="w-0.5 h-4 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="truncate">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase leading-none">
                      Звідки:
                    </span>
                    <p className="text-xs font-black uppercase truncate">
                      {cargo.crm_load_route_from.map((f) => f.city).join(" • ")}
                    </p>
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase leading-none">
                      Куди:
                    </span>
                    <p className="text-xs font-black uppercase truncate">
                      {cargo.crm_load_route_to.map((t) => t.city).join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ряд 3: Статистика транспорту (Дуже компактна) */}
            <div className="bg-zinc-900 dark:bg-black p-1 rounded-xl shadow-inner">
              <div className="grid grid-cols-4 gap-0.5">
                {[
                  { v: cargo.car_count_add, l: "План", c: "text-zinc-400" },
                  { v: cargo.car_count_actual, l: "Факт", c: "text-blue-400" },
                  { v: cargo.car_count_closed, l: "Ок", c: "text-emerald-400" },
                  { v: cargo.car_count_canceled, l: "Відм", c: "text-red-400" },
                ].map((item, i) => (
                  <div key={i} className="text-center py-2">
                    <p className="text-[8px] font-black uppercase tracking-tighter opacity-60 text-white">
                      {item.l}
                    </p>
                    <p
                      className={cn(
                        "text-base font-black tabular-nums",
                        item.c,
                      )}
                    >
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ряд 4: Додаткова інфо та Дати */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase">
                    {cargo.created_at
                      ? new Date(cargo.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Activity size={12} />
                  <span className="text-[10px] font-bold uppercase">
                    Активний
                  </span>
                </div>
              </div>

              {cargo.load_info && (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                  <div className="flex gap-2">
                    <Info size={14} className="text-amber-600 shrink-0" />
                    <p className="text-[11px] leading-snug font-medium text-amber-900/80 dark:text-amber-200/80 line-clamp-3">
                      {cargo.load_info}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: Карта (на весь залишок місця) */}
          <div className="flex-1 h-[300px] lg:h-auto bg-zinc-100 dark:bg-zinc-900 relative">
            <CargoMap cargo={cargo} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
