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
import { ILoadAddData } from "@/shared/api/api.type";

interface TenderFiltersProps<T extends Filters> {
  filters: T;
  setFilters: (updater: (prev: T) => T) => void;
  apply: () => void;
  reset: () => void;
  dropdowns?: Dropdowns;
  add_data?: ILoadAddData;
}
export const LoadFiltersSheet = <T extends Filters>({
  filters,
  setFilters,
  apply,
  reset,
  dropdowns,
  add_data,
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

      {/* Збільшена ширина до 600px */}
      <SheetContent
        side="left"
        className="w-full sm:max-w-[600px] flex flex-col h-[100dvh] border-r shadow-2xl p-0"
      >
        <SheetHeader className="p-4 border-b shrink-0 bg-white dark:bg-zinc-950 z-10">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-50">
            <Settings2 className="h-4 w-4 text-orange-500" />
            Параметри пошуку
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {/* Грід: 1 колонка на мобільних, 2 колонки на екранах від 640px */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {/* --- ЛІВА КОЛОНКА --- */}
            <div className="space-y-6">
              {/* ПЕРСОНАЛЬНІ (на всю ширину своєї колонки) */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <UserCircle2 className="h-3 w-3 text-zinc-400" />
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
                      label: "Участь",
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
                        "flex items-center gap-2 px-2 py-2 rounded-xl border transition-all text-left",
                        item.active
                          ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10"
                          : "bg-white dark:bg-zinc-900 border-zinc-100",
                      )}
                    >
                      <item.icon
                        size={13}
                        className={
                          item.active ? "text-indigo-600" : "text-zinc-400"
                        }
                      />
                      <span
                        className={cn(
                          "text-[10px] font-semibold truncate",
                          item.active ? "text-indigo-900" : "text-zinc-600",
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* МАРШРУТ ЗВІДКИ */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-orange-100/50">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Звідки
                  </h3>
                </div>
                <div className="space-y-3">
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
                  <Input
                    className="h-9 text-sm rounded-xl"
                    placeholder="Місто відправлення"
                    value={filters.city_from ? String(filters.city_from) : ""}
                    onChange={(e) => updateField("city_from", e.target.value)}
                  />
                </div>
              </section>

              {/* МАРШРУТ КУДИ */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-orange-100/50">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Куди
                  </h3>
                </div>
                <div className="space-y-3">
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
                  <Input
                    className="h-9 text-sm rounded-xl"
                    placeholder="Місто отримувач"
                    value={filters.city_to ? String(filters.city_to) : ""}
                    onChange={(e) => updateField("city_to", e.target.value)}
                  />
                </div>
              </section>
            </div>

            {/* --- ПРАВА КОЛОНКА --- */}
            <div className="space-y-6">
              {/* ТРАНСПОРТ */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-blue-100/50">
                  <Truck className="h-3.5 w-3.5 text-blue-500" />
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Транспорт
                  </h3>
                </div>
                <NativeSelect
                  isMulti
                  label="Тип причепу"
                  value={filters.trailer_type}
                  onChange={(v) => updateField("trailer_type", v)}
                  options={dropdowns?.trailer_type_dropdown}
                />
                <NativeSelect
                  isMulti
                  showSearch
                  label="Вид перевезень"
                  value={filters.transit}
                  onChange={(v) => updateField("transit", v)}
                  options={dropdowns?.transit_dropdown}
                />
              </section>

              {/* КОНТРАГЕНТИ */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-100/50">
                  <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Відповідальні
                  </h3>
                </div>
                <div className="space-y-4">
                  <NativeSelect
                    isMulti
                    showSearch
                    label="Замовник"
                    value={filters.company}
                    onChange={(v) => updateField("company", v)}
                    options={dropdowns?.company_dropdown}
                  />
                  <NativeSelect
                    isMulti
                    showSearch
                    label="Менеджер"
                    value={filters.manager}
                    onChange={(v) => updateField("manager", v)}
                    options={dropdowns?.manager_dropdown}
                  />
                  <NativeSelect
                    isMulti
                    showSearch
                    label="Відділ"
                    value={filters.department}
                    onChange={(v) => updateField("department", v)}
                    options={dropdowns?.department_dropdown}
                  />
                </div>
              </section>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-gray-50 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="ghost"
              className="flex-1 h-10 text-xs"
              onClick={handleReset}
            >
              Очистити все
            </Button>
            <Button
              className="flex-[2] bg-orange-500 hover:bg-orange-600 h-10 text-xs font-bold rounded-xl"
              onClick={handleApply}
            >
              Застосувати фільтри
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
