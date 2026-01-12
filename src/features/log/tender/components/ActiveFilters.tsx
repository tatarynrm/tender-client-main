// "use client";

// import { BrushCleaning, X } from "lucide-react";
// import { Badge } from "@/shared/components/ui/badge";
// import { Button } from "@/shared/components/ui/button";

// interface ActiveFiltersProps {
//   currentParams: Record<string, any>;
//   onRemove: (key: string, valueToRemove: string) => void;
//   onClear: () => void;
//   dropdowns?: any;
// }

// const labelMap: Record<string, string> = {
//   country_from: "Звідки",
//   country_to: "Куди",
//   city_from: "Місто відправлення",
//   city_to: "Місто отримувач",
//   region_from: "Область звідки",
//   region_to: "Область куди",
//   trailer_type: "Тип причепу",
//   load_type: "Завантаження",
//   tender_type: "Тип тендеру",
//   manager: "Менеджер",
//   company: "Замовник",
//   status: "Статус тендеру",
// };

// export const ActiveFilters = ({
//   currentParams,
//   onRemove,
//   onClear,
//   dropdowns,
// }: ActiveFiltersProps) => {
//   const getDisplayValue = (key: string, value: string) => {
//     if (!dropdowns) return value;
//     switch (key) {
//       case "country_from":
//       case "country_to":
//         return (
//           dropdowns.country_dropdown?.find((c: any) => c.ids === value)
//             ?.country_name || value
//         );
//       case "region_from":
//       case "region_to":
//         const region = dropdowns.region_dropdown?.find(
//           (r: any) => r.ids === value
//         );
//         return region ? region.short_name : value;
//       case "trailer_type":
//         return (
//           dropdowns.trailer_type_dropdown?.find((t: any) => t.ids === value)
//             ?.value || value
//         );
//       case "load_type":
//         return (
//           dropdowns.load_type_dropdown?.find((l: any) => l.ids === value)
//             ?.value || value
//         );
//       case "tender_type":
//         return (
//           dropdowns.tender_type_dropdown?.find((l: any) => l.ids === value)
//             ?.value || value
//         );
//       case "manager":
//         const manager = dropdowns.manager_dropdown?.find(
//           (l: any) => String(l.ids) === String(value) // Приводимо до рядка обидва значення
//         );
//         return manager ? manager.value : value;
//       case "company":
//         const company = dropdowns.company_dropdown?.find(
//           (l: any) => String(l.ids) === String(value) // Приводимо до рядка обидва значення
//         );
//         return company ? company.value : value;
//       case "status":
//         const status = dropdowns.tender_status_dropdown?.find(
//           (l: any) => String(l.ids) === String(value) // Приводимо до рядка обидва значення
//         );
//         return status ? status.value : value;

//       default:
//         return value;
//     }
//   };

//   // 1. Групуємо фільтри за ключем (напр. "country_from" => [масив бейджів])
//   const groupedFilters = Object.entries(currentParams).reduce(
//     (acc, [key, value]) => {
//       if (!value || key === "page" || key === "limit") return acc;

//       const values = String(value).split(",").filter(Boolean);
//       const items = values.map((val) => ({
//         id: val,
//         display: getDisplayValue(key, val),
//       }));

//       if (items.length > 0) {
//         acc[key] = items;
//       }
//       return acc;
//     },
//     {} as Record<string, { id: string; display: string }[]>
//   );

//   const groupKeys = Object.keys(groupedFilters);
//   if (groupKeys.length === 0) return null;

//   return (
//     <div className="space-y-3 mt-2 mb-4">
//       {/* Шапка з кнопкою очищення */}
//       <div className="flex items-center gap-10 border-b pb-1 border-zinc-100">
//         <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
//           Активні фільтри
//         </span>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
//           onClick={onClear}
//         >
//           Очистити все
//         </Button>
//       </div>

//       {/* Рендер груп */}
//       <div className="flex flex-col gap-3">
//         {groupKeys.map((key) => (
//           <div key={key} className="flex flex-row items-center gap-2">
//             {/* Назва категорії */}
//             <span className="text-xs font-medium text-zinc-500 min-w-[100px] shrink-0">
//               {labelMap[key] || key}:
//             </span>

//             {/* Список бейджів у рядок */}
//             <div className="flex flex-wrap gap-2 justify-center items-center">
//               {groupedFilters[key].map((item, index) => (
//                 <Badge
//                   key={`${key}-${item.id}-${index}`}
//                   variant="secondary"
//                   className="pl-2 pr-1 py-1 gap-1 border-orange-100 bg-white text-orange-900 shadow-sm"
//                 >
//                   <span className="font-semibold text-xs">{item.display}</span>
//                   <button
//                     onClick={() => onRemove(key, item.id)}
//                     className="ml-1 hover:bg-orange-100 rounded-full p-0.5 transition-colors text-orange-400 hover:text-orange-600"
//                   >
//                     <X className="h-3.5 w-3.5" />
//                   </button>
//                 </Badge>
//               ))}
//               <BrushCleaning
//                 onClick={() => onRemove(key, "all")}
//                 className="text-orange-400 text-xs cursor-pointer"
//                 size={20}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

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
  participate_company: "Участь компанії",
};

export const ActiveFilters = ({
  currentParams,
  onRemove,
  onClear,
  dropdowns,
}: ActiveFiltersProps) => {
  const getDisplayValue = (key: string, value: string) => {
    // 1. Обробка булевих значень (is_my, is_my_company)
    if (value === "true") return "Так";

    // 2. Якщо дропдаунів немає, повертаємо значення з URL (наприклад, назву міста)
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
            (s: any) => String(s.ids) === String(value)
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
    {} as Record<string, { id: string; display: string }[]>
  );

  const groupKeys = Object.keys(groupedFilters);
  if (groupKeys.length === 0) return null;

  return (
    <div className="space-y-2 mt-2 mb-4 bg-zinc-50/50 p-2 rounded-lg border border-dashed border-zinc-200">
      <div className="flex items-center justify-between border-b pb-1.5 border-zinc-200">
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
