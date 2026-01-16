"use client";

import { X, BrushCleaning } from "lucide-react"; // Додано BrushCleaning
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { is } from "date-fns/locale";

interface ActiveFiltersProps {
  currentParams: Record<string, any>;
  onRemove: (key: string, valueToRemove: string) => void;
  onClear: () => void;
  dropdowns?: any;
}

const labelMap: Record<string, string> = {
  country_from: "Звідки",
  country_to: "Куди",
  city_from: "Місто відправлення",
  city_to: "Місто отримувач",
  region_from: "Область звідки",
  region_to: "Область куди",
  trailer_type: "Тип причепу",
  load_type: "Завантаження",
  tender_type: "Тип тендеру",
  manager: "Менеджер",
  company: "Компанія",
  transit: "Транзит",
  is_price_request: "Запит ціни",
  is_collective: "Збірний вантаж",
};

export const LoadActiveFilters = ({
  currentParams,
  onRemove,
  onClear,
  dropdowns,
}: ActiveFiltersProps) => {
  const getDisplayValue = (key: string, value: string) => {
    if (!dropdowns) return value;
    if (value === "true") return "Так";
    switch (key) {
      case "country_from":
      case "country_to":
        return (
          dropdowns.country_dropdown?.find((c: any) => c.ids === value)
            ?.country_name || value
        );
      case "region_from":
      case "region_to":
        const region = dropdowns.region_dropdown?.find(
          (r: any) => r.ids === value
        );
        return region ? region.short_name : value;
      case "trailer_type":
        return (
          dropdowns.trailer_type_dropdown?.find((t: any) => t.ids === value)
            ?.value || value
        );
      case "load_type":
        return (
          dropdowns.load_type_dropdown?.find((l: any) => l.ids === value)
            ?.value || value
        );
      case "tender_type":
        return (
          dropdowns.tender_type_dropdown?.find((l: any) => l.ids === value)
            ?.value || value
        );
      case "company":
        return (
          dropdowns.company_dropdown?.find(
            (s: any) => String(s.ids) === String(value)
          )?.value || value
        );
      case "manager":
        return (
          dropdowns.manager_dropdown?.find(
            (s: any) => String(s.ids) === String(value)
          )?.value || value
        );
      case "transit":
        return (
          dropdowns.transit_dropdown?.find(
            (s: any) => String(s.ids) === String(value)
          )?.value || value
        );

      default:
        return value;
    }
  };

  const groupedFilters = Object.entries(currentParams).reduce(
    (acc, [key, value]) => {
      if (!value || key === "page" || key === "limit") return acc;

      const values = String(value).split(",").filter(Boolean);
      const items = values.map((val) => ({
        id: val,
        display: getDisplayValue(key, val),
      }));

      if (items.length > 0) {
        acc[key] = items;
      }
      return acc;
    },
    {} as Record<string, { id: string; display: string }[]>
  );

  const groupKeys = Object.keys(groupedFilters);
  if (groupKeys.length === 0) return null;

  return (
    <div className="space-y-3 mt-2 mb-4">
      {/* Шапка з кнопкою очищення */}
      <div className="flex items-center gap-10 border-b pb-1 border-zinc-100">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          Активні фільтри
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
          onClick={onClear}
        >
          Очистити все
        </Button>
      </div>

      {/* Рендер груп */}
      <div className="flex flex-col gap-3">
        {groupKeys.map((key) => (
          <div key={key} className="flex flex-row items-center gap-2">
            {/* Назва категорії */}
            <span className="text-xs font-medium text-zinc-500 min-w-[100px] shrink-0">
              {labelMap[key] || key}:
            </span>

            {/* Список бейджів + Мітла */}
            <div className="flex flex-wrap gap-2 items-center">
              {groupedFilters[key].map((item, index) => (
                <Badge
                  key={`${key}-${item.id}-${index}`}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 border-orange-100 bg-white text-orange-900 shadow-sm"
                >
                  <span className="font-semibold text-xs">{item.display}</span>
                  <button
                    onClick={() => onRemove(key, item.id)}
                    className="ml-1 hover:bg-orange-100 rounded-full p-0.5 transition-colors text-orange-400 hover:text-orange-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}

              {/* Кнопка швидкої очистки групи (мітла) */}
              {groupedFilters[key].length > 1 && (
                <button
                  onClick={() => onRemove(key, "all")}
                  title="Очистити категорію"
                  className="p-1 hover:bg-orange-100 rounded-md transition-colors text-orange-400"
                >
                  <BrushCleaning size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
