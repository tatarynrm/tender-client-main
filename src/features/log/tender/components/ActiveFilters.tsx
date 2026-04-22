"use client";

import { BrushCleaning, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

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
  company: "Замовник",
  status: "Статус",
  participate: "Моя участь",
  participate_company: "Компанія",
  winner_company: "Результат",
  not_winner_company: "Результат",
  not_participate_company: "Результат",
  ids_status: "Статус",
  not_happen: "Тендер",
  transit: "Транзит",
  export: "Експорт",
  import: "Імпорт",
  regional: "Локальні",
  international: "Міжнародні",
  my: "Мої тендери",
};

export const ActiveFilters = ({
  currentParams,
  onRemove,
  onClear,
  dropdowns,
}: ActiveFiltersProps) => {
  const getDisplayValue = (key: string, value: string) => {
    // 0. Специфічні значення результатів
    if (key === "winner_company" && value === "true") return "Ви виграли";
    if (key === "not_winner_company" && value === "true")
      return "Ви не перемогли";
    if (key === "participate" && value === "true") return "Так";
    if (key === "participate_company" && value === "true") return "Так";
    if (key === "not_participate_company" && value === "true")
      return "не приймали участі";

    if (key === "ids_status" && value === "ANALYZE") return "Аналізуємо";
    if (key === "not_happen" && value === "true") return "Не відбувся";

    if (key === "transit") {
      const transitLabels: Record<string, string> = {
        E: "Екс",
        I: "Імп",
        R: "Рег",
        T: "Транзит",
        M: "Міжн",
        true: "Так",
      };
      return transitLabels[value] || value;
    }

    // 1. Обробка загальних булевих значень
    if (value === "true") return "Так";

    // 2. Якщо дропдаунів немає, повертаємо значення з URL
    if (!dropdowns) return value;

    // 3. Пошук у відповідному списку дропдаунів
    switch (key) {
      case "country_from":
      case "country_to":
        return (
          dropdowns.country_dropdown?.find((c: any) => c.ids === value)
            ?.country_name || value
        );
      case "region_from":
      case "region_to":
        return (
          dropdowns.region_dropdown?.find((r: any) => r.ids === value)
            ?.short_name || value
        );
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
      case "status":
        return (
          dropdowns.tender_status_dropdown?.find(
            (s: any) => String(s.ids) === String(value),
          )?.value || value
        );
      case "manager":
        return (
          dropdowns.manager_dropdown?.find(
            (s: any) => String(s.ids) === String(value),
          )?.value || value
        );
      case "company":
        return (
          dropdowns.company_dropdown?.find(
            (s: any) => String(s.ids) === String(value),
          )?.value || value
        );
      default:
        return value;
    }
  };

  // Групування
  const groupedFilters = Object.entries(currentParams).reduce(
    (acc, [key, value]) => {
      // Ігноруємо технічні параметри та порожні значення
      if (!value || value === "false" || key === "page" || key === "limit")
        return acc;

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
    {} as Record<string, { id: string; display: string }[]>,
  );

  const groupKeys = Object.keys(groupedFilters);
  if (groupKeys.length === 0) return null;

  return (
    <div className="space-y-2 mt-2 mb-4  p-2 rounded-lg border border-dashed border-zinc-200">
      <div className="flex items-center  border-b pb-1.5 border-zinc-200">
        <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">
          Активні фільтри
        </span>
        <Button
          variant="ghost"
          className="h-5 px-1.5 text-[10px] text-red-500 hover:bg-red-50 font-bold"
          onClick={onClear}
        >
          Скинути все
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        {groupKeys.map((key) => (
          <div key={key} className="flex flex-row items-start gap-2">
            {/* Мітка категорії */}
            <span className="text-[11px] font-bold text-zinc-400 min-w-[90px] pt-1 tracking-tight">
              {labelMap[key] || key}:
            </span>

            {/* Бейджі */}
            <div className="flex flex-wrap gap-1 items-center flex-1">
              {groupedFilters[key].map((item, index) => (
                <Badge
                  key={`${key}-${item.id}-${index}`}
                  variant="secondary"
                  className="pl-2 pr-1 h-6 gap-1 border-orange-200 bg-white text-zinc-700 shadow-sm hover:bg-orange-50 transition-colors"
                >
                  <span className="text-[10px] font-medium">
                    {item.display}
                  </span>
                  <button
                    onClick={() => onRemove(key, item.id)}
                    className="hover:bg-orange-200 rounded-full p-0.5 transition-colors group"
                  >
                    <X className="h-3 w-3 text-zinc-400 group-hover:text-orange-600" />
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
                  <BrushCleaning size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
