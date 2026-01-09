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
        className="w-full sm:max-w-[450px] p-0 flex flex-col h-[100dvh] border-l shadow-2xl"
      >
        {/* ФІКСОВАНА ШАПКА: shrink-0 не дає їй стискатися */}
        <SheetHeader className="p-5 border-b shrink-0  z-10">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Settings2 className="h-5 w-5 text-orange-500" />
            Параметри пошуку
          </SheetTitle>
        </SheetHeader>

        {/* ОСНОВНИЙ КОНТЕНТ: flex-1 змушує його зайняти весь вільний простір */}
        <ScrollArea className="flex-1 w-full h-full overflow-y-auto">
          <div className="p-6 space-y-10">
            {/* МАРШРУТ ЗВІДКИ */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
                <MapPin className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Маршрут звідки
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Місто відправлення
                </label>
                <Input
                  className="h-10 border-gray-200 focus-visible:ring-orange-500 transition-all rounded-lg"
                  placeholder="Введіть назву міста..."
                  value={filters.city_from ? String(filters.city_from) : ""}
                  onChange={(e) => updateField("city_from", e.target.value)}
                />
              </div>
            </section>

            {/* МАРШРУТ КУДИ */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
                <MapPin className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Маршрут куди
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Місто отримувач
                </label>
                <Input
                  className="h-10 border-gray-200 focus-visible:ring-orange-500 transition-all rounded-lg"
                  placeholder="Введіть назву міста..."
                  value={filters.city_to ? String(filters.city_to) : ""}
                  onChange={(e) => updateField("city_to", e.target.value)}
                />
              </div>
            </section>

            {/* ПАРАМЕТРИ ВАНТАЖУ */}
            <section className="space-y-5 pb-6">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                <Truck className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Вантаж та причіп
                </h3>
              </div>
              <NativeSelect
                isMulti
                label="Тип причепу / кузова"
                value={filters.trailer_type}
                onChange={(v) => updateField("trailer_type", v)}
                options={dropdowns?.trailer_type_dropdown}
                placeholder="Всі типи"
              />
              <div className="grid grid-cols-2 gap-4">
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
                  label="Тип тендеру"
                  value={filters.tender_type}
                  onChange={(v) => updateField("tender_type", v)}
                  options={dropdowns?.tender_type_dropdown}
                  placeholder="Будь-який"
                />
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* ФІКСОВАНИЙ ФУТЕР: shrink-0 гарантує, що він не зникне */}
        <SheetFooter className="p-4 border-t bg-gray-50/80 backdrop-blur-sm shrink-0 mt-auto">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 h-11"
              onClick={handleReset}
            >
              Очистити
            </Button>
            <Button
              className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
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
