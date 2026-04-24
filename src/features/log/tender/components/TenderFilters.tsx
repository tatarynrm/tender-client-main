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

interface Dropdowns {
  region_dropdown?: { ids: string; short_name: string; region_name: string }[];
  country_dropdown?: { ids: string; country_name: string }[];
  load_type_dropdown?: { ids: string; value: string }[];
  tender_type_dropdown?: { ids: string; value: string }[];
  trailer_type_dropdown?: { ids: string; value: string }[];
  tender_status_dropdown?: { ids: string; value: string }[];
  load_permission_dropdown?: { ids: string; value: string }[];
  manager_dropdown?: { ids: string | number; value: string }[];
  company_dropdown?: { ids: string | number; value: string }[];
  tender_members?: { ids: string; value: string; order_num?: number }[];
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
    const finalValue = value === "" ? undefined : value;
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
          className="border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <Filter className="mr-2 h-4 w-4 text-orange-500" />
          Фільтри
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full sm:max-w-[600px]  flex flex-col h-[100dvh] border-l shadow-2xl"
      >
        {/* ФІКСОВАНА ШАПКА: shrink-0 не дає їй стискатися */}
        <SheetHeader className="p-5 border-b shrink-0  ">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Settings2 className="h-5 w-5 text-orange-500" />
            Параметри пошуку
          </SheetTitle>
        </SheetHeader>

        {/* ОСНОВНИЙ КОНТЕНТ: flex-1 розтягується, ScrollArea всередині скролить */}
        <ScrollArea
          className="
            flex-1
            overflow-y-auto
            max-h-[calc(100vh-120px)]
            sm:max-h-[calc(100vh-140px)]
          "
        >
          <div className="p-4 space-y-5">
            {/* 📍 СЕКЦІЯ: МАРШРУТ (Звідки та Куди) */}
            <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-orange-100/50">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <h3 className="text-[12px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                    Маршрут перевезення
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ЗВІДКИ */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest pl-1">Звідки:</span>
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
                            {(!filters.country_from || filters.country_from === "UA") && (
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
                            placeholder="Місто відправлення..."
                            value={filters.city_from ? String(filters.city_from) : ""}
                            onChange={(e) => updateField("city_from", e.target.value)}
                        />
                    </div>

                    {/* КУДИ */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pl-1">Куди:</span>
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
                            {(!filters.country_to || filters.country_to === "UA") && (
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
                            placeholder="Місто отримувач..."
                            value={filters.city_to ? String(filters.city_to) : ""}
                            onChange={(e) => updateField("city_to", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* 📦 СЕКЦІЯ: ТРАНСПОРТ ТА ВАНТАЖ */}
            <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-blue-100/50">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[12px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                    Параметри вантажу
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NativeSelect
                        isMulti
                        showSearch
                        label="Тип причепу"
                        value={filters.trailer_type}
                        onChange={(v) => updateField("trailer_type", v)}
                        options={dropdowns?.trailer_type_dropdown}
                        placeholder="Всі типи"
                    />
                    <NativeSelect
                        showSearch
                        isMulti
                        label="Завантаження"
                        value={filters.load_type}
                        onChange={(v) => updateField("load_type", v)}
                        options={dropdowns?.load_type_dropdown}
                    />
                    <div className="sm:col-span-2">
                        <NativeSelect
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

            {/* 👥 СЕКЦІЯ: СТУТАС ТА ПЕРСОНАЛ */}
            <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-4 pb-2">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-200/50">
                  <Settings2 className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-[12px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                    Статус та відповідальні
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NativeSelect
                        isMulti
                        showSearch
                        label="Менеджер"
                        value={filters.manager}
                        onChange={(v) => updateField("manager", v)}
                        options={dropdowns?.manager_dropdown}
                        placeholder="Будь-який"
                    />
                    <NativeSelect
                        isMulti
                        showSearch
                        label="Замовник"
                        value={filters.company}
                        onChange={(v) => updateField("company", v)}
                        options={dropdowns?.company_dropdown}
                        placeholder="Будь-який"
                    />
                    <div className="sm:col-span-2">
                        <NativeSelect
                            isMulti
                            showSearch
                            label="Статус тендеру"
                            value={filters.status}
                            onChange={(v) => updateField("status", v)}
                            options={dropdowns?.tender_status_dropdown}
                            placeholder="Будь-який"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <NativeSelect
                            isMulti
                            label="Хто бачить"
                            value={filters.members}
                            onChange={(v) => updateField("members", v)}
                            options={dropdowns?.tender_members?.filter(m => m.ids !== 'ALL')}
                            placeholder="Будь-який"
                        />
                    </div>
                </div>
            </section>
          </div>
        </ScrollArea>

        {/* ФІКСОВАНИЙ ФУТЕР: shrink-0 гарантує, що він не зникне */}
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
