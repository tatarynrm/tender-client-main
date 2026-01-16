// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import Flag from "react-flagkit";
// import { format } from "date-fns";
// import {
//   Truck,
//   ClipboardList,
//   User,
//   Box,
//   Info,
//   Layers,
//   Clock,
//   CheckCircle2,
//   ChevronRight,
//   TrendingDown,
//   Zap,
//   MapPin,
//   ArrowRight,
// } from "lucide-react";

// import { Card, CardContent } from "@/shared/components/ui/card";
// import { Button } from "@/shared/components/ui";
// import { cn } from "@/shared/utils";
// import { ITender } from "@/features/log/types/tender.type";
// import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
// import { ManualPriceDialog } from "./ManualPriceDialog";
// import { useTenderActions } from "../hooks/useTenderActions";
// import { TenderTimer } from "./TenderTimer";

// export function TenderCardClients({
//   cargo,
//   onOpenDetails,
// }: {
//   cargo: ITender;
//   onOpenDetails: () => void;
// }) {
//   const {
//     activeModal,
//     setActiveModal,
//     closeModal,
//     onConfirmReduction,
//     onManualPrice,
//     onBuyout,
//   } = useTenderActions(cargo.id, cargo.price_next, cargo.price_redemption);

//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const { isNotStarted, isFinished, canBid } = useMemo(() => {
//     const start = cargo.time_start ? new Date(cargo.time_start).getTime() : 0;
//     const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
//     const currentTime = now.getTime();
//     return {
//       isNotStarted: start > currentTime,
//       isFinished: end > 0 && currentTime > end,
//       canBid: currentTime >= start && (end === 0 || currentTime <= end),
//     };
//   }, [now, cargo.time_start, cargo.time_end]);

//   // Групування точок маршруту для 3 колонок
//   const routeLayout = useMemo(
//     () => ({
//       load: cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM"),
//       transit: cargo.tender_route.filter((p) =>
//         ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point || "")
//       ),
//       unload: cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO"),
//     }),
//     [cargo.tender_route]
//   );

//   return (
//     <>
//       <Card
//         className={cn(
//           "relative w-full transition-all duration-300 border-none shadow-sm mb-4 overflow-hidden group",
//           "bg-white dark:bg-zinc-900/50 dark:backdrop-blur-md",
//           isFinished && "opacity-75 grayscale-[0.2]"
//         )}
//       >
//         {/* Декоративна смужка статусу зверху */}
//         <div
//           className={cn(
//             "h-1 w-full",
//             canBid
//               ? "bg-emerald-500"
//               : isNotStarted
//               ? "bg-amber-500"
//               : "bg-zinc-400"
//           )}
//         />

//         <CardContent className="p-0">
//           <div className="grid grid-cols-1 lg:grid-cols-12">
//             {/* ЛІВА ЧАСТИНА: МАРШРУТ (3 колонки) */}
//             <div className="lg:col-span-8 p-5 border-r border-zinc-100 dark:border-zinc-800">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
//                     № {cargo.id}
//                   </span>
//                   <div className="flex items-center gap-1.5 text-zinc-400">
//                     <Layers size={14} />
//                     <span className="text-xs font-medium">
//                       {cargo.tender_type}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   {canBid && (
//                     <TenderTimer
//                       targetDate={cargo.time_end || ""}
//                       label="До кінця:"
//                       variant="orange"
//                     />
//                   )}
//                   {isNotStarted && (
//                     <TenderTimer
//                       targetDate={cargo.time_start || ""}
//                       label="Початок через:"
//                       variant="blue"
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-6 relative">
//                 {/* 1. Завантаження */}
//                 <div className="space-y-3">
//                   <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
//                     Звідки
//                   </span>
//                   {routeLayout.load.map((p, idx) => (
//                     <div key={idx} className="flex flex-col">
//                       <div className="flex items-center gap-2 mb-1">
//                         <Flag
//                           country={p.ids_country || "UA"}
//                           size={16}
//                           className="rounded-sm shadow-sm"
//                         />
//                         <span className="text-base font-black dark:text-zinc-100">
//                           {p.city}
//                         </span>
//                       </div>
//                       <span className="text-[11px] text-zinc-500 font-medium">
//                         {/* {p.date_from ? format(new Date(p.date_from), "dd.MM HH:mm") : "Гнучка дата"} */}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* 2. Митниця / Кордон (Транзит) */}
//                 <div className="relative flex flex-col items-center">
//                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
//                     Оформлення
//                   </span>
//                   <div className="w-full flex items-center gap-2 justify-center px-2 py-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
//                     {routeLayout.transit.length > 0 ? (
//                       routeLayout.transit.map((p, idx) => (
//                         <div key={idx} className="flex items-center">
//                           <Flag
//                             country={p.ids_country || "UA"}
//                             size={14}
//                             className="opacity-70"
//                           />
//                           {idx < routeLayout.transit.length - 1 && (
//                             <ArrowRight
//                               size={10}
//                               className="mx-1 text-zinc-300"
//                             />
//                           )}
//                         </div>
//                       ))
//                     ) : (
//                       <span className="text-[10px] font-bold text-zinc-400 italic uppercase">
//                         Прямий рейс
//                       </span>
//                     )}
//                   </div>
//                   {/* Лінії з'єднання */}
//                   <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-zinc-100 dark:bg-zinc-800 -translate-x-full" />
//                   <div className="absolute top-1/2 right-0 w-4 h-[1px] bg-zinc-100 dark:bg-zinc-800 translate-x-full" />
//                 </div>

//                 {/* 3. Розвантаження */}
//                 <div className="space-y-3 text-right">
//                   <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
//                     Куди
//                   </span>
//                   {routeLayout.unload.map((p, idx) => (
//                     <div key={idx} className="flex flex-col items-end">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-base font-black dark:text-zinc-100">
//                           {p.city}
//                         </span>
//                         <Flag
//                           country={p.ids_country || "UA"}
//                           size={16}
//                           className="rounded-sm shadow-sm"
//                         />
//                       </div>
//                       <span className="text-[11px] text-zinc-500 font-medium text-right">
//                         {/* {p.date_to ? format(new Date(p.date_to), "dd.MM HH:mm") : "По прибуттю"} */}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Характеристики вантажу (Нижній ряд) */}
//               <div className="mt-8 flex items-center gap-6 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                     <Truck
//                       size={16}
//                       className="text-blue-600 dark:text-blue-400"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-[9px] font-bold text-zinc-400 uppercase">
//                       Транспорт
//                     </span>
//                     <span className="text-xs font-black dark:text-zinc-200">
//                       20т / Тент
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
//                     <Box
//                       size={16}
//                       className="text-amber-600 dark:text-amber-400"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-[9px] font-bold text-zinc-400 uppercase">
//                       Вантаж
//                     </span>
//                     <span className="text-xs font-black dark:text-zinc-200 truncate max-w-[150px]">
//                       {cargo.cargo || "33 палети"}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="ml-auto flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-help">
//                   <User size={14} />
//                   <span className="text-xs font-semibold">{cargo.author}</span>
//                 </div>
//               </div>
//             </div>

//             {/* ПРАВА ЧАСТИНА: ПАНЕЛЬ СТАВОК */}
//             <div
//               className={cn(
//                 "lg:col-span-4 p-5 flex flex-col justify-between",
//                 canBid
//                   ? "bg-zinc-50/50 dark:bg-zinc-900/20"
//                   : "bg-zinc-100/30 dark:bg-transparent"
//               )}
//             >
//               <div className="space-y-4">
//                 <div className="flex justify-between items-end">
//                   <div className="space-y-1">
//                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
//                       Поточна ціна
//                     </span>
//                     <div className="flex items-baseline gap-1.5">
//                       <span className="text-3xl font-black tracking-tighter dark:text-white">
//                         {cargo.price_proposed || cargo.price_start}
//                       </span>
//                       <span className="text-sm font-bold text-zinc-400">
//                         {cargo.valut_name}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
//                       <TrendingDown size={14} />
//                       <span>
//                         {cargo.price_step || 500} {cargo.valut_name}
//                       </span>
//                     </div>
//                     <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">
//                       Крок зниження
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2">
//                   <Button
//                     disabled={!canBid}
//                     onClick={() => setActiveModal("confirm")}
//                     className={cn(
//                       "w-full h-14 relative group overflow-hidden transition-all",
//                       "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-black"
//                     )}
//                   >
//                     <div className="flex flex-col items-center">
//                       <span className="text-[10px] uppercase opacity-70 tracking-tighter">
//                         Зробити ставку
//                       </span>
//                       <span className="text-lg tracking-tight">
//                         {cargo.price_next} {cargo.valut_name}
//                       </span>
//                     </div>
//                     {canBid && (
//                       <Zap
//                         size={16}
//                         className="absolute right-4 opacity-20 group-hover:opacity-100 transition-opacity"
//                       />
//                     )}
//                   </Button>

//                   <div className="grid grid-cols-2 gap-2">
//                     <Button
//                       variant="outline"
//                       disabled={!canBid}
//                       onClick={() => setActiveModal("manual")}
//                       className="border-zinc-200 dark:border-zinc-700 h-10 text-[10px] font-black uppercase tracking-tight"
//                     >
//                       Своя ціна
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       onClick={onOpenDetails}
//                       className="h-10 text-[10px] font-black uppercase tracking-tight text-zinc-500"
//                     >
//                       Деталі <Info size={14} className="ml-1" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//               {cargo.price_redemption && (
//                 <button
//                   disabled={!canBid}
//                   onClick={() => setActiveModal("buyout")}
//                   className="mt-4 w-full py-2 px-3 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 flex items-center justify-between group hover:bg-orange-100 transition-colors"
//                 >
//                   <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
//                     <Zap size={14} fill="currentColor" />
//                     <span className="text-[10px] font-black uppercase tracking-wide">
//                       Миттєвий викуп
//                     </span>
//                   </div>
//                   <span className="text-xs font-black text-orange-700 dark:text-orange-300">
//                     {cargo.price_redemption} {cargo.valut_name}
//                   </span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Модальні вікна залишаються без змін */}
//       <ConfirmDialog
//         open={activeModal === "confirm"}
//         onOpenChange={closeModal}
//         title="Підтвердити ставку?"
//         description={`Ваша пропозиція буде: ${cargo.price_next} ${cargo.valut_name}`}
//         onConfirm={onConfirmReduction}
//       />
//       <ManualPriceDialog
//         open={activeModal === "manual"}
//         onOpenChange={closeModal}
//         currentPrice={cargo.price_proposed || cargo.price_start}
//         onConfirm={onManualPrice}
//         currentValut={cargo.valut_name}
//       />
//       <ConfirmDialog
//         open={activeModal === "buyout"}
//         onOpenChange={closeModal}
//         title="Миттєвий викуп"
//         description="Ви впевнені, що хочете забрати рейс негайно за ціною викупу?"
//         onConfirm={onBuyout}
//         confirmText="Так, викупити"
//       />
//     </>
//   );
// }
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  User,
  Box,
  Info,
  Layers,
  TrendingDown,
  Zap,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useTenderActions } from "../hooks/useTenderActions";
import { TenderTimer } from "./TenderTimer";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function TenderCardClients({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  // 1. ПІДКЛЮЧЕННЯ ШРИФТІВ
  const { config } = useFontSize();
  const { label, main, title, icon } = config;

  const {
    activeModal,
    setActiveModal,
    closeModal,
    onConfirmReduction,
    onManualPrice,
    onBuyout,
  } = useTenderActions(cargo.id, cargo.price_next, cargo.price_redemption);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { isNotStarted, isFinished, canBid } = useMemo(() => {
    const start = cargo.time_start ? new Date(cargo.time_start).getTime() : 0;
    const end = cargo.time_end ? new Date(cargo.time_end).getTime() : 0;
    const currentTime = now.getTime();
    return {
      isNotStarted: start > currentTime,
      isFinished: end > 0 && currentTime > end,
      canBid: currentTime >= start && (end === 0 || currentTime <= end),
    };
  }, [now, cargo.time_start, cargo.time_end]);

  // 2. РОЗПОДІЛ ТОЧОК МАРШРУТУ (3 КОЛОНКИ)
  const fromPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM");
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter((p) =>
    ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point || "")
  );

  const getPointLabel = (type: string) => {
    switch (type) {
      case "CUSTOM_UP": return "Замитнення";
      case "BORDER": return "Кордон";
      case "CUSTOM_DOWN": return "Розмитнення";
      default: return "";
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative w-full transition-all duration-300 border-zinc-200 dark:border-zinc-800 shadow-sm mb-2 overflow-hidden group",
          "bg-white dark:bg-zinc-900/50",
          isFinished && "opacity-75 grayscale-[0.2]"
        )}
      >
        <div
          className={cn(
            "h-1 w-full",
            canBid ? "bg-emerald-500" : isNotStarted ? "bg-amber-500" : "bg-zinc-400"
          )}
        />

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* ЛІВА ЧАСТИНА: МАРШРУТ (3 колонки) */}
            <div className="lg:col-span-8 p-4 border-r border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={cn("bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-black tracking-widest uppercase", label)}>
                    № {cargo.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Layers size={icon} />
                    <span className={cn("font-bold uppercase", label)}>
                      {cargo.tender_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {canBid && cargo.time_end && (
                    <TenderTimer targetDate={cargo.time_end} label="До кінця:" variant="orange" />
                  )}
                  {isNotStarted && cargo.time_start && (
                    <TenderTimer targetDate={cargo.time_start} label="Початок:" variant="blue" />
                  )}
                </div>
              </div>

              {/* МАРШРУТ У 3 КОЛОНКИ */}
              <div className="grid grid-cols-3 gap-4">
                {/* 1. Завантаження */}
                <div className="space-y-1.5">
                  <span className={cn("font-black text-emerald-600 uppercase tracking-tighter block", label)}>
                    Відправлення
                  </span>
                  {fromPoints.map((p, idx) => (
                    <div key={idx} className={cn("flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-100", main)}>
                      <Flag country={p.ids_country || "UA"} size={icon} className="shrink-0" />
                      <span className="truncate">{p.city}</span>
                    </div>
                  ))}
                </div>

                {/* 2. Транзит (Замитнення/Кордон/Розмитнення) */}
                <div className="space-y-2 border-x border-dashed border-zinc-200 dark:border-zinc-800 px-3">
                  <span className={cn("font-black text-amber-500 uppercase tracking-tighter block", label)}>
                    Транзит / Мито
                  </span>
                  {transitPoints.length > 0 ? (
                    transitPoints.map((p, idx) => (
                      <div key={idx} className="flex flex-col leading-none">
                        <div className={cn("flex items-center gap-1 font-bold text-zinc-500 dark:text-zinc-400", label)}>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="uppercase text-[10px]">{getPointLabel(p.ids_point || "")}</span>
                        </div>
                        <span className={cn("pl-2.5 truncate font-bold text-zinc-700 dark:text-zinc-300", label)}>
                           {p.city}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={cn("text-zinc-300 italic py-1 uppercase font-bold", label)}>Прямий рейс</div>
                  )}
                </div>

                {/* 3. Розвантаження */}
                <div className="space-y-1.5 text-right">
                  <span className={cn("font-black text-rose-600 uppercase tracking-tighter block", label)}>
                    Прибуття
                  </span>
                  {toPoints.map((p, idx) => (
                    <div key={idx} className={cn("flex items-center gap-2 justify-end font-bold text-zinc-800 dark:text-zinc-100", main)}>
                      <span className="truncate">{p.city}</span>
                      <Flag country={p.ids_country || "UA"} size={icon} className="shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ХАРАКТЕРИСТИКИ */}
              <div className="mt-6 flex items-center gap-6 pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Truck size={icon + 2} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className={cn("font-bold text-zinc-400 uppercase leading-none", label)}>Транспорт</span>
                    <span className={cn("font-black dark:text-zinc-200 uppercase", label)}>
                      {cargo.weight}т / {cargo.volume}м³ / {cargo.tender_trailer?.[0]?.trailer_type_name || "Тент"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Box size={icon + 2} className="text-amber-500" />
                  <div className="flex flex-col">
                    <span className={cn("font-bold text-zinc-400 uppercase leading-none", label)}>Вантаж</span>
                    <span className={cn("font-black dark:text-zinc-200 uppercase truncate max-w-[120px]", label)}>
                      {cargo.cargo || "Товар"}
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-zinc-400">
                  <User size={icon} />
                  <span className={cn("font-bold uppercase", label)}>{cargo.author}</span>
                </div>
              </div>
            </div>

            {/* ПРАВА ЧАСТИНА: ПАНЕЛЬ СТАВОК */}
            <div className={cn("lg:col-span-4 p-4 flex flex-col justify-center gap-4", canBid ? "bg-zinc-50/50 dark:bg-zinc-900/20" : "bg-zinc-100/30")}>
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className={cn("font-black text-zinc-400 uppercase tracking-tighter block", label)}>Поточна ціна</span>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("font-black tracking-tighter dark:text-white", title)}>
                      {cargo.price_proposed || cargo.price_start}
                    </span>
                    <span className={cn("font-bold text-zinc-400", label)}>{cargo.valut_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("flex items-center gap-1 text-emerald-500 font-black", label)}>
                    <TrendingDown size={icon} />
                    <span>-{cargo.price_step || 500}</span>
                  </div>
                  <span className={cn("text-zinc-400 font-bold uppercase", label)}>Крок</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  disabled={!canBid}
                  onClick={() => setActiveModal("confirm")}
                  className={cn("w-full h-12 flex flex-col bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-black")}
                >
                  <span className={cn("uppercase opacity-70 leading-none mb-0.5", label)}>Зробити ставку</span>
                  <span className={main}>{cargo.price_next} {cargo.valut_name}</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" disabled={!canBid} onClick={() => setActiveModal("manual")} className={cn("h-9 font-black uppercase border-zinc-300", label)}>
                    Своя ціна
                  </Button>
                  <Button variant="ghost" onClick={onOpenDetails} className={cn("h-9 font-black uppercase text-zinc-500", label)}>
                    Деталі <Info size={icon} className="ml-1" />
                  </Button>
                </div>
              </div>

              {cargo.price_redemption && (
                <button
                  disabled={!canBid}
                  onClick={() => setActiveModal("buyout")}
                  className="w-full py-2 px-3 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 flex items-center justify-between group hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Zap size={icon} fill="currentColor" />
                    <span className={cn("font-black uppercase", label)}>Викуп</span>
                  </div>
                  <span className={cn("font-black text-orange-700 dark:text-orange-300", main)}>
                    {cargo.price_redemption} {cargo.valut_name}
                  </span>
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODALS */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити ставку?"
        description={`Ваша пропозиція: ${cargo.price_next} ${cargo.valut_name}`}
        onConfirm={onConfirmReduction}
      />
      <ManualPriceDialog
        open={activeModal === "manual"}
        onOpenChange={closeModal}
        currentPrice={cargo.price_proposed || cargo.price_start}
        onConfirm={onManualPrice}
        currentValut={cargo.valut_name}
      />
      <ConfirmDialog
        open={activeModal === "buyout"}
        onOpenChange={closeModal}
        title="Миттєвий викуп"
        description="Ви впевнені, що хочете забрати рейс негайно?"
        onConfirm={onBuyout}
        confirmText="Так, викупити"
      />
    </>
  );
}