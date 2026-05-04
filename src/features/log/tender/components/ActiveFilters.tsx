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
  country_from: "Країна завантаження",
  country_to: "Країна розвантаження",
  city_from: "Місто завантаження",
  city_to: "Місто розвантаження",
  region_from: "Область завантаження",
  region_to: "Область розвантаження",
  trailer_type: "Тип транспорту",
  load_type: "Вид завантаження",
  tender_type: "Тип тендеру",
  manager: "Відповідальний менеджер",
  company: "Замовник",
  status: "Статус",
  members: "Учасники",
  participate: "Моя участь",
  participate_company: "Участь компанії",
  winner_company: "Мій статус",
  not_winner_company: "Статус перемоги",
  not_participate_company: "Статус участі",
  ids_status: "Поточний статус",
  not_happen: "Результат тендеру",
  transit: "Транзит",
  export: "Напрямок",
  import: "Напрямок",
  regional: "Напрямок",
  international: "Напрямок",
  my: "Мої тендери",
  sortBy: "Сортування",
};

export const ActiveFilters = ({
  currentParams,
  onRemove,
  onClear,
  dropdowns,
}: ActiveFiltersProps) => {
  const getDisplayValue = (key: string, value: string) => {
    // Sorting labels
    if (key === "sortBy") {
      if (value === "time_start") {
        const order = currentParams.sortOrder === "ASC" ? " (старі спочатку)" : " (нові спочатку)";
        return `За часом публікації${order}`;
      }
      if (value === "time_end") {
        const order = currentParams.sortOrder === "ASC" ? " (закінчуються швидше)" : " (закінчуються пізніше)";
        return `За часом закінчення${order}`;
      }
    }

    // 0. Специфічні значення результатів
    if (key === "winner_company" && value === "true") return "Перемога";
    if (key === "not_winner_company" && value === "true") return "Без перемоги";
    if (key === "participate" && value === "true") return "Приймаю участь";
    if (key === "participate_company" && value === "true") return "Компанія бере участь";
    if (key === "not_participate_company" && value === "true") return "Без участі";

    if (key === "ids_status" && value === "ANALYZE") return "На аналізі";
    if (key === "not_happen" && value === "true") return "Не відбувся";
    
    if (key === "my" && value === "true") return "Лише мої";

    if (key === "transit" || key === "export" || key === "import" || key === "regional" || key === "international") {
      if (value === "true") {
        const dirLabels: Record<string, string> = {
          transit: "Транзит",
          export: "Експорт",
          import: "Імпорт",
          regional: "Локальні",
          international: "Міжнародні",
        };
        return dirLabels[key] || "Так";
      }
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
      case "members":
        return (
          dropdowns.tender_members?.find(
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
      if (!value || value === "false" || key === "page" || key === "limit" || key === "sortOrder")
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
    <div className="space-y-3 mt-4 mb-6 p-4 rounded-[1.5rem] border border-zinc-200/60 dark:border-white/10 bg-zinc-50/30 dark:bg-white/[0.02] backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-500">
      <div className="flex items-center justify-between border-b pb-2.5 border-zinc-200/60 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.1em]">
            Активні фільтри
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-3 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-black uppercase tracking-widest transition-all rounded-xl"
          onClick={onClear}
        >
          <BrushCleaning className="w-3.5 h-3.5 mr-1.5" />
          Скинути все
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 pt-1.5">
        {groupKeys.map((key) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* Категорія */}
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest min-w-[120px]">
              {labelMap[key] || key}:
            </span>

            {/* Бейджі */}
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {groupedFilters[key].map((item, index) => (
                <Badge
                  key={`${key}-${item.id}-${index}`}
                  variant="secondary"
                  className="pl-3 pr-1.5 h-7 gap-2 border-zinc-200/60 dark:border-white/5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm hover:border-orange-200 dark:hover:border-orange-500/40 transition-all rounded-xl group"
                >
                  <span className="text-[10px] font-bold tracking-tight">
                    {item.display}
                  </span>
                  <button
                    onClick={() => onRemove(key, item.id)}
                    className="hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg p-0.5 transition-colors group/btn"
                  >
                    <X className="h-3 w-3 text-zinc-400 group-hover/btn:text-red-500" />
                  </button>
                </Badge>
              ))}

              {/* Очистка групи */}
              {groupedFilters[key].length > 1 && (
                <button
                  onClick={() => onRemove(key, "all")}
                  title="Очистити групу"
                  className="p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-orange-500"
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
