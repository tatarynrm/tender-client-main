"use client";

import React, { useState } from "react";
import { Filters } from "@/shared/hooks/useFilters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Filter,
  MapPin,
  Truck,
  Settings2,
  PackageSearch,
  UserCircle2,
  CircleDollarSign,
  Handshake,
  Check,
} from "lucide-react";
import NativeSelect from "@/shared/components/Select/NativeSelect";
import { cn } from "@/shared/utils";
import { Dropdowns } from "../../types/load.type";

interface TenderFiltersProps<T extends Filters> {
  filters: T;
  setFilters: (updater: (prev: T) => T) => void;
  apply: () => void;
  reset: () => void;
  dropdowns?: Dropdowns;
}
export const LoadFiltersSheet = <T extends Filters>({
  filters,
  setFilters,
  apply,
  reset,
  dropdowns,
}: TenderFiltersProps<T>) => {
  const [open, setOpen] = useState(false);

  const updateField = (field: keyof T, value: any) => {
    // Якщо значення порожнє, або дорівнює false (для чекбоксів/булевих кнопок)
    // ми встановлюємо undefined, щоб параметр зник з URL
    const finalValue = value === "" || value === false ? undefined : value;

    setFilters((prev) => ({ ...prev, [field]: finalValue }));
  };
  const handleApply = () => {
    apply();
    setOpen(false);
  };

  const handleReset = () => {
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-orange-400 hover:bg-orange-50 transition-colors text-xs"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
          Фільтри
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full sm:max-w-[380px] flex flex-col h-[100dvh] border-l shadow-2xl"
      >
        {/* ФІКСОВАНА ШАПКА: компактніша */}
        <SheetHeader className="p-4 border-b shrink-0 ">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-50">
            <Settings2 className="h-4 w-4 text-orange-500" />
            Параметри пошуку
          </SheetTitle>
        </SheetHeader>

        {/* ОСНОВНИЙ КОНТЕНТ: зменшені відступи */}
        <ScrollArea className="flex-1 w-full overflow-y-auto ">
          <div className="p-4 space-y-6">
            {/* НОВА СЕКЦІЯ: УЧАСТЬ */}
            <section className="space-y-3">
              {/* Компактний заголовок */}
              <div className="flex items-center gap-2 px-1">
                <Settings2 className="h-3 w-3 text-zinc-400" />
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Персональні
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "is_collective",
                    label: "Збірний",
                    icon: PackageSearch,
                    active: filters.is_collective,
                  },
                  {
                    id: "my",
                    label: "Мої вантажі",
                    icon: UserCircle2,
                    active: filters.my,
                  },
                  {
                    id: "is_price_request",
                    label: "Запит ціни",
                    icon: CircleDollarSign,
                    active: filters.is_price_request,
                  },
                  {
                    id: "participate",
                    label: "Участь(Коментарі)",
                    icon: Handshake,
                    active: filters.participate,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      updateField(item.id as keyof T, !item.active)
                    }
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all duration-200",
                      item.active
                        ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200",
                    )}
                  >
                    {/* Маленька іконка */}
                    <div
                      className={cn(
                        "shrink-0 transition-colors",
                        item.active
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-400",
                      )}
                    >
                      <item.icon size={14} strokeWidth={2.5} />
                    </div>

                    {/* Текст */}
                    <span
                      className={cn(
                        "text-[11px] font-semibold truncate flex-1 text-left",
                        item.active
                          ? "text-indigo-900 dark:text-indigo-100"
                          : "text-zinc-600 dark:text-zinc-400",
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Мінімалістичний індикатор */}
                    {item.active && (
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </section>
            {/* МАРШРУТ ЗВІДКИ */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-orange-100/50">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Звідки
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NativeSelect
                  isMulti
                  showSearch
                  label="Країна"
                  value={filters.country_from}
                  onChange={(v) => updateField("country_from", v)}
                  options={dropdowns?.country_dropdown?.map((c) => ({
                    ids: c.ids,
                    value: c.country_name || "",
                  }))}
                />
                {(!filters.country_from ||
                  String(filters.country_from).includes("UA")) && (
                  <NativeSelect
                    isMulti
                    showSearch
                    label="Область"
                    value={filters.region_from}
                    onChange={(v) => updateField("region_from", v)}
                    options={dropdowns?.region_dropdown?.map((r) => ({
                      ids: r.ids,
                      value: r.short_name || "",
                    }))}
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight ml-1">
                  Місто відправлення
                </label>
                <Input
                  className="h-9 text-sm border-zinc-200 focus-visible:ring-orange-500 rounded-xl"
                  placeholder="Назва міста..."
                  value={filters.city_from ? String(filters.city_from) : ""}
                  onChange={(e) => updateField("city_from", e.target.value)}
                />
              </div>
            </section>

            {/* МАРШРУТ КУДИ */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-orange-100/50">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Куди
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NativeSelect
                  isMulti
                  showSearch
                  label="Країна"
                  value={filters.country_to}
                  onChange={(v) => updateField("country_to", v)}
                  options={dropdowns?.country_dropdown?.map((c) => ({
                    ids: c.ids,
                    value: c.country_name || "",
                  }))}
                />
                {(!filters.country_to ||
                  String(filters.country_to).includes("UA")) && (
                  <NativeSelect
                    isMulti
                    showSearch
                    label="Область"
                    value={filters.region_to}
                    onChange={(v) => updateField("region_to", v)}
                    options={dropdowns?.region_dropdown?.map((r) => ({
                      ids: r.ids,
                      value: r.short_name || "",
                    }))}
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight ml-1">
                  Місто отримувач
                </label>
                <Input
                  className="h-9 text-sm border-zinc-200 focus-visible:ring-orange-500 rounded-xl"
                  placeholder="Назва міста..."
                  value={filters.city_to ? String(filters.city_to) : ""}
                  onChange={(e) => updateField("city_to", e.target.value)}
                />
              </div>
            </section>

            {/* ПАРАМЕТРИ ВАНТАЖУ ТА ЗАМОВЛЕННЯ */}
            <section className="space-y-3 pb-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-blue-100/50">
                <Truck className="h-3.5 w-3.5 text-blue-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Вантаж та логістика
                </h3>
              </div>
              <NativeSelect
                isMulti
                label="Тип причепу"
                value={filters.trailer_type}
                onChange={(v) => updateField("trailer_type", v)}
                options={dropdowns?.trailer_type_dropdown}
                placeholder="Всі типи"
              />
              <NativeSelect
                showSearch
                label="Транзит"
                value={filters.transit}
                onChange={(v) => updateField("transit", v)}
                options={dropdowns?.transit_dropdown}
                placeholder="Будь-який"
              />
            </section>

            {/* КОНТРАГЕНТИ ТА ВІДПОВІДАЛЬНІ */}
            <section className="space-y-3 pb-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100/50">
                <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Контрагенти
                </h3>
              </div>
              <NativeSelect
                isMulti
                showSearch
                label="Замовник"
                value={filters.company}
                onChange={(v) => updateField("company", v)}
                options={dropdowns?.company_dropdown}
                placeholder="Будь-яка компанія"
              />
              <NativeSelect
                isMulti
                showSearch
                label="Менеджер"
                value={filters.manager}
                onChange={(v) => updateField("manager", v)}
                options={dropdowns?.manager_dropdown}
                placeholder="Оберіть менеджера"
              />
            </section>
          </div>
        </ScrollArea>

        {/* ФІКСОВАНИЙ ФУТЕР: компактніші кнопки */}
        <SheetFooter className="p-3 border-t bg-white shrink-0">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 h-9 text-xs"
              onClick={handleReset}
            >
              Очистити
            </Button>
            <Button
              className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 text-xs shadow-md active:scale-[0.98] transition-all rounded-xl"
              onClick={handleApply}
            >
              Застосувати
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
