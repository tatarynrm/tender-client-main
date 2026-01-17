// "use client";

// import React, { useState } from "react";

// import { ChevronDown, ChevronUp } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Flag from "react-flagkit";
// import { format } from "date-fns";
// import {
//   Truck,
//   MessageCircle,
//   GripVertical,
//   Clock,
//   CheckCircle2,
//   ChevronRight,
//   Info,
//   Type,
//   Boxes,
//   CircleHelp,
//   CircleDollarSign,
//   BadgeCheckIcon,
// } from "lucide-react";

// import { Card } from "@/shared/components/ui/card";
// import { Button } from "@/shared/components/ui/button";
// import { Badge } from "@/shared/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from "@/shared/components/ui/dropdown-menu";
// import { cn } from "@/shared/utils";

// import { LoadApiItem } from "../../types/load.type";
// import { CargoDetailsDrawer } from "./CargoDetailsDrawer";
// import CargoChat from "../../screen/components/CargoChat";
// import { useFontSize } from "@/shared/providers/FontSizeProvider";

// const transitMap: Record<string, string> = {
//   E: "Експорт",
//   I: "Імпорт",
//   R: "Регіон.",
//   T: "Транзит",
//   M: "Міжнар.",
// };

// interface CargoCardProps {
//   cargo: LoadApiItem;
//   regionsData?: any[];
// }

// export function CargoCard({ cargo, regionsData }: CargoCardProps) {
//   // Підключаємо наш глобальний хук
//   const [isExpanded, setIsExpanded] = useState(false);
//   const { config } = useFontSize();
//   const router = useRouter();

//   const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
//   const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);

//   const createdAt = cargo.created_at ? new Date(cargo.created_at) : null;
//   const canDelete = createdAt
//     ? Date.now() - createdAt.getTime() < 60 * 60 * 1000
//     : false;

//   return (
//     <>
//       <Card
//         onDoubleClick={() => setSelectedCargo(cargo)}
//         // ДОДАНО: h-full та flex flex-col для контролю висоти
//         className="group relative flex flex-col w-full h-full border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer ring-1 ring-zinc-200 dark:ring-zinc-800"
//       >
//         {/* Header - Фіксована висота */}
//         <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 px-2 py-0.5 rounded-md shadow-sm">
//               <span
//                 className={cn(
//                   "font-bold text-[10px] text-teal-600 dark:text-teal-400 mr-1 opacity-70",
//                   config.label
//                 )}
//               >
//                 ID
//               </span>
//               <span
//                 className={cn(
//                   "font-black text-teal-700 dark:text-teal-300 text-xs tabular-nums",
//                   config.label
//                 )}
//               >
//                 {cargo.id}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span
//                 className={cn(
//                   "text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider",
//                   config.label
//                 )}
//               >
//                 {transitMap[cargo.transit_type as keyof typeof transitMap] ||
//                   cargo.transit_type ||
//                   "—"}
//               </span>
//               <div className="flex items-center gap-1 ml-1">
//                 {cargo.is_collective && (
//                   <div
//                     className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
//                     title="Збірний вантаж"
//                   >
//                     <Boxes size={14} strokeWidth={2} />
//                   </div>
//                 )}
//                 {cargo.is_price_request && (
//                   <div
//                     className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
//                     title="Запит на ціну"
//                   >
//                     <CircleDollarSign size={14} strokeWidth={2} color="red" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
//               <Clock size={12} className="opacity-70" />
//               <span
//                 className={cn(
//                   "text-[11px] font-semibold tabular-nums",
//                   config.main
//                 )}
//               >
//                 {cargo.updated_at
//                   ? format(new Date(cargo.updated_at), "HH:mm")
//                   : "—"}
//               </span>
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-7 w-7 rounded-full"
//                 >
//                   <GripVertical size={14} className="text-zinc-400" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-40">
//                 <DropdownMenuItem
//                   onClick={() => router.push(`/log/cargo/edit/${cargo.id}`)}
//                 >
//                   Редагувати
//                 </DropdownMenuItem>

//                 {canDelete && (
//                   <DropdownMenuItem
//                     onClick={() => console.log("Видалити", cargo.id)}
//                   >
//                     Видалити
//                   </DropdownMenuItem>
//                 )}

//                 <DropdownMenuItem
//                   onClick={() => console.log("Закрита нами", cargo.id)}
//                 >
//                   Закрита нами
//                 </DropdownMenuItem>

//                 <DropdownMenuItem
//                   onClick={() => console.log("Закрита замовником", cargo.id)}
//                 >
//                   Закрита замовником
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Content Section - Цей блок тепер розтягується */}
//         <div className="p-2 flex gap-3 flex-1 overflow-hidden">
//           <div className="relative flex flex-col gap-2 flex-grow min-w-0">
//             <div className="absolute left-[4.5px] top-2 bottom-2 w-[1.5px] bg-zinc-100 dark:bg-zinc-800" />

//             {/* Departure */}
//             <div className="flex flex-col min-w-0">
//               <span
//                 className={cn(
//                   "uppercase font-bold text-zinc-400 leading-none mb-1",
//                   config.label
//                 )}
//               >
//                 Звідки
//               </span>
//               <div className="flex flex-wrap items-center gap-1">
//                 {cargo.crm_load_route_from.map((from, idx) => (
//                   <div
//                     key={idx}
//                     className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/40 pr-1.5 rounded ring-1 ring-zinc-100 dark:ring-zinc-800"
//                   >
//                     <Flag
//                       country={from.country?.toUpperCase() || "UN"}
//                       size={12}
//                       className="shrink-0"
//                     />
//                     <span
//                       className={cn(
//                         "font-bold text-zinc-800 dark:text-zinc-100 truncate",
//                         config.title
//                       )}
//                     >
//                       {from.city}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Destination */}
//             <div className="flex flex-col min-w-0">
//               <span
//                 className={cn(
//                   "uppercase font-bold text-zinc-400 leading-none mb-1",
//                   config.label
//                 )}
//               >
//                 Куди
//               </span>
//               <div className="flex flex-wrap items-center gap-1">
//                 {cargo.crm_load_route_to.map((to, idx) => (
//                   <div
//                     key={idx}
//                     className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/40 pr-1.5 rounded ring-1 ring-zinc-100 dark:ring-zinc-800"
//                   >
//                     <Flag
//                       country={to.country?.toUpperCase() || "UN"}
//                       size={12}
//                       className="shrink-0"
//                     />
//                     <span
//                       className={cn(
//                         "font-bold text-zinc-800 dark:text-zinc-100 truncate",
//                         config.title
//                       )}
//                     >
//                       {to.city}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Side: Logistics */}
//           <div className="flex flex-col gap-2 min-w-[105px] justify-start border-l border-zinc-100 dark:border-zinc-800 pl-2 shrink-0">
//             <div className="flex flex-col">
//               <div className="flex items-center gap-1 text-zinc-400">
//                 <Truck size={config.icon} />
//                 <span
//                   className={cn(
//                     "uppercase font-bold tracking-tighter",
//                     config.label
//                   )}
//                 >
//                   Транспорт
//                 </span>
//               </div>
//               <span
//                 className={cn(
//                   "font-bold text-zinc-700 dark:text-zinc-200 text-xs",
//                   config.main
//                 )}
//               >
//                 {cargo.car_count_add} ×{" "}
//                 {cargo.crm_load_trailer?.[0]?.trailer_type_name || "Тент"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <div className="flex items-center gap-1 text-zinc-400">
//                 <CheckCircle2 size={config.icon} className="text-emerald-500" />
//                 <span
//                   className={cn(
//                     "uppercase font-bold tracking-tighter",
//                     config.label
//                   )}
//                 >
//                   Статус
//                 </span>
//               </div>
//               <span
//                 className={cn(
//                   "font-bold text-zinc-700 dark:text-zinc-200 text-xs",
//                   config.main
//                 )}
//               >
//                 {cargo.car_count_actual} / {cargo.car_count_closed} /{" "}
//                 {cargo.car_count_canceled}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Info Line - Фіксована область */}
//         {cargo.load_info && (
//           <div className="px-3 pb-2 flex items-start gap-2 text-zinc-500 shrink-0">
//             <Info
//               size={14}
//               className="mt-1 shrink-0 opacity-70 text-teal-600"
//             />
//             <div className="flex-1 min-w-0">
//               <div
//                 className={cn(
//                   "max-h-[40px] overflow-y-auto scrollbar-none",
//                   config.label
//                 )}
//               >
//                 <p className="italic text-[12px] leading-tight text-zinc-600 dark:text-zinc-400">
//                   {cargo.load_info}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Footer - ТЕПЕР ЗАВЖДИ ПРИТИСНУТИЙ ДО НИЗУ */}
//         <div className="mt-auto px-2 py-1.5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold shrink-0">
//               {cargo.author?.substring(0, 2).toUpperCase()}
//             </div>
//             <span
//               className={cn(
//                 "font-bold text-zinc-700 dark:text-zinc-200 truncate text-[11px]",
//                 config.main
//               )}
//             >
//               {cargo.author}
//             </span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Badge
//               variant="secondary"
//               className="h-6 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-1.5 gap-1 shadow-none border-none"
//             >
//               <BadgeCheckIcon size={12} />
//               <span className="">
//                 {cargo.company_name || "—"}
//               </span>
//             </Badge>
//             <Button
//               size="sm"
//               className={cn(
//                 "h-7 rounded-lg px-2 gap-1.5 transition-all shadow-none",
//                 cargo.messages > 0
//                   ? "bg-orange-500 hover:bg-orange-600 text-white"
//                   : "bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"
//               )}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setChatCargo(cargo);
//               }}
//             >
//               <MessageCircle
//                 size={config.icon}
//                 className={cargo.messages > 0 ? "fill-white/20" : ""}
//               />
//               <span className={cn("font-bold", config.main)}>
//                 {cargo.messages ?? 0}
//               </span>
//             </Button>
//           </div>
//         </div>
//       </Card>

//       <CargoDetailsDrawer
//         cargo={selectedCargo ?? undefined}
//         open={!!selectedCargo}
//         onClose={() => setSelectedCargo(null)}
//       />
//       <CargoChat
//         cargoId={chatCargo?.id ?? 0}
//         open={!!chatCargo}
//         onClose={() => setChatCargo(null)}
//       />
//     </>
//   );
// }
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  MessageCircle,
  GripVertical,
  Clock,
  CheckCircle2,
  Info,
  Boxes,
  CircleDollarSign,
  BadgeCheckIcon,
} from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";

import { LoadApiItem } from "../../types/load.type";
import { CargoDetailsDrawer } from "./CargoDetailsDrawer";
import CargoChat from "../../screen/components/CargoChat";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

const transitMap: Record<string, string> = {
  E: "Експорт",
  I: "Імпорт",
  R: "Регіон.",
  T: "Транзит",
  M: "Міжнар.",
};

interface CargoCardProps {
  cargo: LoadApiItem;
  regionsData?: any[];
}

export function CargoCard({ cargo }: CargoCardProps) {
  const { config } = useFontSize();
  const router = useRouter();

  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);

  const createdAt = cargo.created_at ? new Date(cargo.created_at) : null;
  const canDelete = createdAt
    ? Date.now() - createdAt.getTime() < 60 * 60 * 1000
    : false;

  return (
    <>
      <Card
        onDoubleClick={() => setSelectedCargo(cargo)}
        className="group relative flex flex-col w-full bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
      >
        {/* Header - Compact Glass */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-zinc-100/50 dark:bg-white/5 border-b border-zinc-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
              <span
                className={cn(
                  "font-black text-blue-600 dark:text-blue-400 text-[10px] tabular-nums",
                  config.label
                )}
              >
                #{cargo.id}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] font-black text-zinc-500 uppercase tracking-tight",
                config.label
              )}
            >
              {transitMap[cargo.transit_type as keyof typeof transitMap] ||
                cargo.transit_type ||
                "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-zinc-400 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md border border-zinc-200/50 dark:border-white/5">
              <Clock size={10} className="text-blue-500" />
              <span
                className={cn(
                  "text-[10px] font-bold tabular-nums",
                  config.main
                )}
              >
                {cargo.updated_at
                  ? format(new Date(cargo.updated_at), "HH:mm")
                  : "—"}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-blue-500/10 rounded-md"
                >
                  <GripVertical size={12} className="text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl backdrop-blur-lg"
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/log/cargo/edit/${cargo.id}`)}
                >
                  Редагувати
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem className="text-red-500">
                    Видалити
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content - Compressed */}
        <div className="p-2 flex gap-3 flex-1 overflow-hidden">
          <div className="relative flex flex-col gap-1 flex-grow min-w-0">
            {/* Маршрут тепер без зайвих відступів */}
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[8px] leading-none mb-0.5",
                  config.label
                )}
              >
                Звідки
              </span>
              <div className="flex flex-wrap gap-1">
                {cargo.crm_load_route_from.map((from, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-white/40 dark:bg-white/5 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-white/5"
                  >
                    <Flag
                      country={from.country?.toUpperCase() || "UN"}
                      size={10}
                    />
                    <span
                      className={cn(
                        "font-bold text-zinc-800 dark:text-zinc-200 text-[10px] truncate max-w-[80px]",
                        config.title
                      )}
                    >
                      {from.city}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "uppercase font-black text-zinc-400 text-[8px] leading-none mb-0.5",
                  config.label
                )}
              >
                Куди
              </span>
              <div className="flex flex-wrap gap-1">
                {cargo.crm_load_route_to.map((to, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-white/40 dark:bg-white/5 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-white/5"
                  >
                    <Flag
                      country={to.country?.toUpperCase() || "UN"}
                      size={10}
                    />
                    <span
                      className={cn(
                        "font-bold text-zinc-800 dark:text-zinc-200 text-[10px] truncate max-w-[80px]",
                        config.title
                      )}
                    >
                      {to.city}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logistics - Vertical Sidebar Style */}
          <div className="flex flex-col gap-1.5 min-w-[95px] border-l border-zinc-200/50 dark:border-white/5 pl-2 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[8px]">
                <Truck size={10} className="text-blue-500" />
                <span className={config.label}>Транспорт</span>
              </div>
              <span
                className={cn(
                  "font-bold text-zinc-700 dark:text-zinc-200 text-[10px] leading-tight",
                  config.main
                )}
              >
                {cargo.car_count_add}×
                {cargo.crm_load_trailer?.[0]?.trailer_type_name?.substring(
                  0,
                  5
                ) || "Тент"}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-zinc-400 uppercase font-black text-[8px]">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span className={config.label}>Статус</span>
              </div>
              <span
                className={cn(
                  "font-bold text-zinc-700 dark:text-zinc-200 text-[10px] leading-tight",
                  config.main
                )}
              >
                {cargo.car_count_actual}/{cargo.car_count_closed}
              </span>
            </div>
          </div>
        </div>

        {/* Load Info - Compact Scrollable */}
        {cargo.load_info && (
          <div className="px-2 pb-1.5 flex items-start gap-1.5 shrink-0 opacity-80">
            <Info size={10} className="mt-0.5 text-blue-500 shrink-0" />
            <p
              className={cn(
                "italic text-[9px] leading-tight text-zinc-600 dark:text-zinc-400 line-clamp-1",
                config.label
              )}
            >
              {cargo.load_info}
            </p>
          </div>
        )}

        {/* Footer - Ultra Slim */}
        <div className="mt-auto px-2 py-1 flex items-center justify-between bg-zinc-100/50 dark:bg-white/5 border-t border-zinc-200/50 dark:border-white/10">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[7px] font-black border border-blue-500/20 uppercase">
              {cargo.author?.substring(0, 2)}
            </div>
            <span
              className={cn(
                "font-bold text-zinc-500 text-[9px] truncate uppercase tracking-tighter",
                config.main
              )}
            >
              {cargo.company_name || "—"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {cargo.is_collective && (
              <Boxes size={11} className="text-zinc-400" />
            )}
            {cargo.is_price_request && (
              <CircleDollarSign size={11} className="text-amber-500" />
            )}

            <Button
              size="sm"
              className={cn(
                "h-5 rounded px-1.5 gap-1 transition-all text-[9px] font-black shadow-none",
                cargo.messages > 0
                  ? "bg-blue-600 text-white"
                  : "bg-white/50 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/50 dark:border-white/5"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setChatCargo(cargo);
              }}
            >
              <MessageCircle
                size={10}
                className={cargo.messages > 0 ? "fill-white/20" : ""}
              />
              {cargo.messages ?? 0}
            </Button>
          </div>
        </div>
      </Card>

      <CargoDetailsDrawer
        cargo={selectedCargo ?? undefined}
        open={!!selectedCargo}
        onClose={() => setSelectedCargo(null)}
      />
      <CargoChat
        cargoId={chatCargo?.id ?? 0}
        open={!!chatCargo}
        onClose={() => setChatCargo(null)}
      />
    </>
  );
}
