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
import { Filter, MapPin, Truck, Settings2, ChevronDown } from "lucide-react";
import NativeSelect from "@/shared/components/Select/NativeSelect";
import { cn } from "@/shared/utils";

interface Dropdowns {
  region_dropdown?: { ids: string; short_name: string; region_name: string }[];
  country_dropdown?: { ids: string; country_name: string }[];
  load_type_dropdown?: { ids: string; value: string }[];
  tender_type_dropdown?: { ids: string; value: string }[];
  trailer_type_dropdown?: { ids: string; value: string }[];
  tender_status_dropdown?: { ids: string; value: string }[];
  load_permission_dropdown?: { ids: string; value: string }[];
}

interface TenderFiltersProps<T extends Filters> {
  filters: T;
  setFilters: (updater: (prev: T) => T) => void;
  apply: () => void;
  reset: () => void;
  dropdowns?: Dropdowns;
}
export const TenderFiltersSheet = <T extends Filters>({
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
  const finalValue = (value === "" || value === false) ? undefined : value;
  
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
        className="w-full sm:max-w-[600px] flex flex-col h-[100dvh] border-l shadow-2xl p-0"
      >
        {/* ФІКСОВАНА ШАПКА: компактніша */}
        <SheetHeader className="p-4 border-b bg-white dark:bg-zinc-950 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-50">
            <Settings2 className="h-4 w-4 text-orange-500" />
            Параметри пошуку
          </SheetTitle>
        </SheetHeader>

        {/* ОСНОВНИЙ КОНТЕНТ: зменшені відступи та 2 колонки */}
        <ScrollArea
          className="
            flex-1
            overflow-y-auto
            max-h-[calc(100vh-120px)]
            sm:max-h-[calc(100vh-140px)]
          "
        >
          <div className="p-4 space-y-5">
            {/* 👤 СЕКЦІЯ: Я ТА МОЯ КОМПАНІЯ */}
            <section className="bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl p-4 border border-indigo-100/50 dark:border-indigo-500/10">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-indigo-100/50">
                  <Settings2 className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-[12px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-tight">
                    Персональні фільтри
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateField("participate", !filters.participate)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200",
                      filters.participate
                        ? "bg-white border-orange-500 shadow-sm"
                        : "bg-white/50 border-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    <div className="flex flex-col text-left">
                      <span className={cn("text-[10px] font-bold", filters.participate ? "text-orange-600" : "text-zinc-600")}>
                        Я беру участь
                      </span>
                      <span className="text-[9px] text-zinc-400">Тендери зі ставками</span>
                    </div>
                    {filters.participate && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                  </button>

                  <button
                    onClick={() => updateField("participate_company", !filters.participate_company)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200",
                      filters.participate_company
                        ? "bg-white border-emerald-500 shadow-sm"
                        : "bg-white/50 border-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    <div className="flex flex-col text-left">
                      <span className={cn("text-[10px] font-bold", filters.participate_company ? "text-emerald-600" : "text-zinc-600")}>
                        Компанія бере участь
                      </span>
                      <span className="text-[9px] text-zinc-400">Всі ставки компанії</span>
                    </div>
                    {filters.participate_company && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </button>
                </div>
            </section>

            {/* 📍 СЕКЦІЯ: МАРШРУТ */}
            <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-orange-100/50">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <h3 className="text-[12px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                    Географія
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ЗВІДКИ */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em] pl-1">Звідки</span>
                        <div className="grid grid-cols-2 gap-2">
                           <NativeSelect
                                isMulti
                                showSearch
                                label="Країна"
                                value={filters.country_from}
                                onChange={(v) => updateField("country_from", v)}
                                options={dropdowns?.country_dropdown?.map((c) => ({
                                    ids: c.ids,
                                    value: c.country_name,
                                }))}
                            />
                            {(!filters.country_from || String(filters.country_from).includes("UA")) && (
                                <NativeSelect
                                    isMulti
                                    showSearch
                                    label="Область"
                                    value={filters.region_from}
                                    onChange={(v) => updateField("region_from", v)}
                                    options={dropdowns?.region_dropdown?.map((r) => ({
                                        ids: r.ids,
                                        value: r.short_name,
                                    }))}
                                />
                            )}
                        </div>
                        <Input
                            className="h-9 text-xs border-zinc-200 focus-visible:ring-orange-500 rounded-xl bg-white"
                            placeholder="Місто..."
                            value={filters.city_from ? String(filters.city_from) : ""}
                            onChange={(e) => updateField("city_from", e.target.value)}
                        />
                    </div>

                    {/* КУДИ */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] pl-1">Куди</span>
                        <div className="grid grid-cols-2 gap-2">
                            <NativeSelect
                                isMulti
                                showSearch
                                label="Країна"
                                value={filters.country_to}
                                onChange={(v) => updateField("country_to", v)}
                                options={dropdowns?.country_dropdown?.map((c) => ({
                                    ids: c.ids,
                                    value: c.country_name,
                                }))}
                            />
                            {(!filters.country_to || String(filters.country_to).includes("UA")) && (
                                <NativeSelect
                                    isMulti
                                    showSearch
                                    label="Область"
                                    value={filters.region_to}
                                    onChange={(v) => updateField("region_to", v)}
                                    options={dropdowns?.region_dropdown?.map((r) => ({
                                        ids: r.ids,
                                        value: r.short_name,
                                    }))}
                                />
                            )}
                        </div>
                        <Input
                            className="h-9 text-xs border-zinc-200 focus-visible:ring-orange-500 rounded-xl bg-white"
                            placeholder="Місто..."
                            value={filters.city_to ? String(filters.city_to) : ""}
                            onChange={(e) => updateField("city_to", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* 📦 СЕКЦІЯ: ТИП ТРАНСПОРТУ */}
            <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-blue-100/50">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[12px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                    Транспорт та Тенти
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NativeSelect
                        isMulti
                        label="Тип причепу"
                        value={filters.trailer_type}
                        onChange={(v) => updateField("trailer_type", v)}
                        options={dropdowns?.trailer_type_dropdown}
                        placeholder="Всі типи"
                    />
                    <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                        <NativeSelect
                          showSearch
                          isMulti
                          label="Завантаження"
                          value={filters.load_type}
                          onChange={(v) => updateField("load_type", v)}
                          options={dropdowns?.load_type_dropdown}
                        />
                        <NativeSelect
                          showSearch
                          isMulti
                          label="Тип тендеру"
                          value={filters.tender_type}
                          onChange={(v) => updateField("tender_type", v)}
                          options={dropdowns?.tender_type_dropdown}
                          placeholder="Будь-який"
                        />
                    </div>
                </div>
            </section>
          </div>
        </ScrollArea>

        {/* ФІКСОВАНИЙ ФУТЕР: компактніші кнопки */}
        <SheetFooter className="sticky bottom-0 z-20 p-4 border-t bg-gray-50 dark:bg-zinc-900">
          <div className="flex flex-row items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 h-10 text-xs"
              onClick={handleReset}
            >
              Очистити
            </Button>
            <Button
              className="flex-[2] bg-orange-500 hover:bg-orange-600 h-10 text-xs font-bold rounded-xl"
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
