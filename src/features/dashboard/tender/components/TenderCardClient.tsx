// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import Flag from "react-flagkit";
// import { format } from "date-fns";
// import {
//   Truck,
//   ClipboardList,
//   User,
//   MessageCircle,
//   ArrowBigDownDash,
//   Calendar,
//   Box,
//   Info,
//   Layers,
//   Settings2,
//   Clock,
//   CheckCircle2,
// } from "lucide-react";

// import { Card, CardContent } from "@/shared/components/ui/card";
// import { Button } from "@/shared/components/ui";
// import { cn } from "@/shared/utils";
// import { ITender } from "@/features/log/types/tender.type";
// import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
// import { ManualPriceDialog } from "./ManualPriceDialog";
// import { useTenderActions } from "../hooks/useTenderActions";
// import { TenderTimer } from "./TenderTimer";

// // --- Допоміжні компоненти ---

// const StatusBadge = ({
//   condition,
//   icon: Icon,
//   text,
//   variant = "neutral",
// }: any) => {
//   if (!condition) return null;
//   const variants: any = {
//     warning: "bg-amber-100 text-amber-700 animate-pulse",
//     success: "bg-emerald-100 text-emerald-700",
//     neutral: "bg-zinc-200/50 text-zinc-600",
//   };
//   return (
//     <span
//       className={cn(
//         "flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-black uppercase",
//         variants[variant]
//       )}
//     >
//       <Icon size={10} /> {text}
//     </span>
//   );
// };

// const SpecBadge = ({ children, icon: Icon, className }: any) => (
//   <div
//     className={cn(
//       "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border",
//       className
//     )}
//   >
//     {Icon && <Icon size={12} />}
//     {children}
//   </div>
// );
// // --- Новий компонент діагональної стрічки ---
// const Ribbon = ({ text, colorClass }: { text: string; colorClass: string }) => (
//   <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none z-10">
//     <div
//       className={cn(
//         "absolute top-6 -right-8 w-[160px] py-1 rotate-45 text-center text-[10px] font-black uppercase tracking-widest shadow-lg border-y border-white/20 text-white",
//         colorClass
//       )}
//     >
//       {text}
//     </div>
//   </div>
// );
// // --- Основний компонент ---

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

//   const route = useMemo(
//     () => ({
//       from: cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM"),
//       customUp: cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_UP"),
//       border: cargo.tender_route.filter((p) => p.ids_point === "BORDER"),
//       customDown: cargo.tender_route.filter(
//         (p) => p.ids_point === "CUSTOM_DOWN"
//       ),
//       to: cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO"),
//     }),
//     [cargo.tender_route]
//   );

//   const renderRouteSection = (
//     points: any[],
//     label: string,
//     colorClass: string
//   ) => {
//     if (points.length === 0) return null;
//     return (
//       <div className="flex flex-col gap-0.5">
//         <span
//           className={cn(
//             "text-[9px] font-bold uppercase tracking-tighter opacity-70",
//             colorClass
//           )}
//         >
//           {label}
//         </span>
//         {points.map((p) => (
//           <div
//             key={p.id}
//             className="flex items-center gap-1.5 text-[13px] font-medium leading-none"
//           >
//             <Flag country={p.ids_country ?? "UA"} size={14} />
//             <span className="truncate">{p.city}</span>
//             <span className="text-[10px] text-zinc-400">({p.ids_country})</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <>
//       <Card
//         className={cn(
//           "w-full border-gray-200 transition-all rounded-xl overflow-hidden mb-4 shadow-sm",
//           isNotStarted && "bg-slate-50 opacity-60",
//           isFinished && "bg-zinc-100/80 grayscale-[0.5]",
//           canBid && "bg-white hover:shadow-md border-emerald-100"
//         )}
//       >
//         {isNotStarted && <Ribbon text="Очікується" colorClass="bg-amber-500" />}
//         {isFinished && <Ribbon text="Завершено" colorClass="bg-slate-500" />}
//         {canBid && <Ribbon text="Активні торги" colorClass="bg-emerald-500" />}
//         {/* HEADER */}
//         <div className="bg-zinc-50 dark:bg-slate-900/50 px-4 py-2.5 border-b border-gray-100 flex md:justify-between md:flex-row flex-col">
//           <div className="flex items-center gap-3">
//             <div className="flex flex-col">
//               <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 leading-none mb-1">
//                 Тендер
//               </span>
//               <span className="text-sm font-bold text-orange-600">
//                 № {cargo.id}
//               </span>
//             </div>
//             <div className="h-6 w-[1px] bg-zinc-200 mx-1" />
//             <div className="flex items-center gap-2">
//               <StatusBadge
//                 condition={true}
//                 icon={Layers}
//                 text={cargo.tender_type}
//               />
//               <StatusBadge
//                 condition={isNotStarted}
//                 icon={Clock}
//                 text="Очікує"
//                 variant="warning"
//               />
//               <StatusBadge
//                 condition={isFinished}
//                 icon={CheckCircle2}
//                 text="Завершено"
//                 variant="neutral"
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-2 pr-20">
//             {isNotStarted && cargo.time_start && (
//               <TenderTimer
//                 targetDate={cargo.time_start}
//                 label="До початку"
//                 variant="blue"
//               />
//             )}
//             {canBid && cargo.time_end && (
//               <TenderTimer
//                 targetDate={cargo.time_end}
//                 label="До кінця"
//                 variant="orange"
//               />
//             )}
//             {/* ВІДОБРАЖЕННЯ ЧАСУ ЗАВЕРШЕННЯ */}
//             {isFinished && cargo.time_end && (
//               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/50 border border-zinc-300 shadow-sm">
//                 <Clock size={12} className="text-zinc-500" />
//                 <div className="flex flex-col leading-none">
//                   <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider">
//                     Завершився
//                   </span>
//                   <span className="text-[11px] font-mono font-bold text-zinc-600">
//                     {format(new Date(cargo.time_end), "dd.MM HH:mm")}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <CardContent className="p-0">
//           <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">
//             {/* 1. МАРШРУТ */}
//             <div className="lg:col-span-4 p-4 space-y-3">
//               {renderRouteSection(
//                 route.from,
//                 "Завантаження",
//                 "text-emerald-600"
//               )}
//               {renderRouteSection(
//                 route.customUp,
//                 "Замитнення",
//                 "text-blue-500"
//               )}
//               {route.border.length > 0 && (
//                 <div className="bg-zinc-50 p-1.5 rounded border border-dashed border-zinc-200">
//                   {renderRouteSection(route.border, "Кордон", "text-amber-600")}
//                 </div>
//               )}
//               {renderRouteSection(
//                 route.customDown,
//                 "Розмитнення",
//                 "text-blue-500"
//               )}
//               {renderRouteSection(route.to, "Розвантаження", "text-rose-600")}
//             </div>

//             {/* 2. ІНФО */}
//             <div className="lg:col-span-5 p-4 flex flex-col justify-between">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-4 font-bold text-zinc-900">
//                   <div className="flex items-center gap-1.5">
//                     <Truck size={16} className="text-blue-500" />{" "}
//                     {cargo.car_count_actual || 1} авт.
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <ClipboardList size={16} className="text-amber-500" />{" "}
//                     {cargo.weight}т / {cargo.volume}м³
//                   </div>
//                 </div>

//                 <div className="flex flex-col gap-2">
//                   {/* Типи причепів */}
//                   {cargo.tender_trailer && cargo.tender_trailer.length > 0 && (
//                     <div className="flex items-start gap-2">
//                       <Truck
//                         size={14}
//                         className="text-slate-400 mt-0.5 shrink-0"
//                       />
//                       <div className="text-[11px] font-bold text-slate-700 leading-tight">
//                         {cargo.tender_trailer
//                           .map((t) => t.trailer_type_name)
//                           .join(", ")}
//                       </div>
//                     </div>
//                   )}

//                   {/* Типи завантажень */}
//                   {cargo.tender_load && cargo.tender_load.length > 0 && (
//                     <div className="flex items-start gap-2">
//                       <Layers
//                         size={14}
//                         className="text-blue-500 mt-0.5 shrink-0"
//                       />
//                       <div className="text-[11px] font-bold text-blue-700 leading-tight">
//                         {cargo.tender_load
//                           .map((l) => l.load_type_name)
//                           .join(", ")}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="text-[11px] bg-amber-50/50 p-2 rounded-lg border-l-2 border-amber-400">
//                   <p className="font-bold text-zinc-800 flex items-center gap-1">
//                     <Box size={12} /> {cargo.cargo}
//                   </p>
//                   <p className="italic text-zinc-600 line-clamp-2">
//                     {cargo.notes || "Без приміток"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-4 pt-2 border-t border-zinc-50">
//                 <User size={12} /> <span>{cargo.author}</span>
//               </div>
//             </div>

//             {/* 3. ЦІНА */}
//             <div
//               className={cn(
//                 "lg:col-span-3 p-4 flex flex-col justify-center gap-3 text-center transition-colors",
//                 !canBid ? "bg-zinc-100/50" : "bg-emerald-50/30"
//               )}
//             >
//               <div>
//                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
//                   {isFinished
//                     ? "Фінальна ціна"
//                     : isNotStarted
//                     ? "Стартова ціна"
//                     : "Поточна ставка"}
//                 </span>
//                 <div
//                   className={cn(
//                     "text-2xl font-black",
//                     !canBid ? "text-zinc-500" : "text-zinc-900"
//                   )}
//                 >
//                   {cargo.price_proposed || cargo.price_start}
//                   <span className="text-sm font-normal ml-1">
//                     {cargo.valut_name?.toUpperCase()}
//                   </span>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 {cargo.ids_type === "GENERAL" && (
//                   <Button
//                     disabled={!canBid}
//                     onClick={() => setActiveModal("confirm")}
//                     className="w-full bg-teal-600 hover:bg-teal-700 h-9 text-xs font-bold"
//                   >
//                     {isNotStarted
//                       ? "Очікує"
//                       : isFinished
//                       ? "Завершено"
//                       : `КРОК ${cargo.price_next}`}
//                     {canBid && <ArrowBigDownDash className="ml-2 h-4 w-4" />}
//                   </Button>
//                 )}
//                 {cargo.ids_type === "PRICE_REQUEST" && (
//                   <Button
//                     disabled={!canBid}
//                     onClick={() => setActiveModal("manual")}
//                     variant="outline"
//                     className="w-full border-amber-500 text-amber-600 h-9 text-xs font-bold"
//                   >
//                     СВОЯ ЦІНА <MessageCircle className="ml-2 h-4 w-4" />
//                   </Button>
//                 )}
//                 {cargo.ids_type === "REDEMPTION" && !isFinished && (
//                   <Button
//                     disabled={!canBid}
//                     onClick={() => setActiveModal("buyout")}
//                     className="w-full bg-rose-600 hover:bg-rose-700 h-9 text-xs font-bold"
//                   >
//                     ВИКУПИТИ
//                   </Button>
//                 )}
//                 <Button
//                   variant="ghost"
//                   onClick={onOpenDetails}
//                   className="w-full h-8 text-[10px] text-zinc-400 uppercase font-bold"
//                 >
//                   Детальніше <Info size={14} className="ml-1" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* MODALS */}
//       <ConfirmDialog
//         open={activeModal === "confirm"}
//         onOpenChange={closeModal}
//         title="Підтвердити зниження?"
//         description={`Ваша ставка складе ${cargo.price_next} ${cargo.valut_name}`}
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
//         description="Прийняти умови тендеру негайно?"
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
  ClipboardList,
  User,
  MessageCircle,
  ArrowBigDownDash,
  Box,
  Info,
  Layers,
  Settings2,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender } from "@/features/log/types/tender.type";
import { ConfirmDialog } from "@/shared/components/confirm-dialog/ConfirmDialog";
import { ManualPriceDialog } from "./ManualPriceDialog";
import { useTenderActions } from "../hooks/useTenderActions";
import { TenderTimer } from "./TenderTimer";

// --- Допоміжні компоненти ---

const StatusBadge = ({
  condition,
  icon: Icon,
  text,
  variant = "neutral",
}: any) => {
  if (!condition) return null;
  const variants: any = {
    warning:
      "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse",
    success:
      "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    neutral: "bg-zinc-200/50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight border border-transparent",
        variants[variant]
      )}
    >
      <Icon size={10} /> {text}
    </span>
  );
};

const Ribbon = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none z-20">
    <div
      className={cn(
        // Додано: drop-shadow для об'єму, виразніший градієнт, вища щільність шрифту
        "absolute top-7 -right-11 w-[160px] py-1 rotate-45 text-center shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
        "text-[10px] font-black uppercase tracking-[0.1em] text-white",
        "border-y border-white/30 backdrop-blur-[1px]",
        "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent",
        colorClass
      )}
    >
      {text}
    </div>
  </div>
);

export function TenderCardClients({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
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

  const route = useMemo(
    () => ({
      from: cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM"),
      customUp: cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_UP"),
      border: cargo.tender_route.filter((p) => p.ids_point === "BORDER"),
      customDown: cargo.tender_route.filter(
        (p) => p.ids_point === "CUSTOM_DOWN"
      ),
      to: cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO"),
    }),
    [cargo.tender_route]
  );

  const renderRouteSection = (
    points: any[],
    label: string,
    colorClass: string,
    isLast = false
  ) => {
    if (points.length === 0) return null;

    // Визначаємо колір фону для точки степпера на основі кольору тексту
    const dotColor = colorClass.replace("text-", "bg-");

    return (
      <div className="relative flex gap-3 group">
        {/* Лінія степпера між точками */}
        {!isLast && (
          <div className="absolute left-[5px] top-[14px] bottom-[-10px] w-[1px] bg-zinc-200 dark:bg-zinc-800" />
        )}

        {/* Точка (Step Indicator) */}
        <div className="relative z-10 pt-1">
          <div
            className={cn(
              "w-[11px] h-[11px] rounded-full border-2 border-white dark:border-zinc-900 shadow-sm",
              dotColor
            )}
          />
        </div>

        <div className="flex flex-col pb-2">
          <span
            className={cn(
              "text-[8px] font-black uppercase tracking-tighter opacity-60 leading-none mb-1",
              colorClass
            )}
          >
            {label}
          </span>
          {points.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 text-[12px] font-bold leading-none dark:text-zinc-100"
            >
              <Flag
                country={p.ids_country ?? "UA"}
                size={12}
                className="rounded-sm shadow-xs"
              />
              <span className="truncate max-w-[140px] tracking-tight">
                {p.city}
              </span>
              <span className="text-[9px] text-zinc-400 font-medium">
                ({p.ids_country})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card
        className={cn(
          "w-full transition-all rounded-xl overflow-hidden mb-3 shadow-sm border",
          "dark:border-zinc-800",
          isNotStarted && "bg-slate-50 dark:bg-zinc-900/40 opacity-70",
          isFinished && "bg-zinc-100/80 dark:bg-zinc-900/60 grayscale-[0.4]",
          canBid &&
            "bg-white hover:shadow-md border-zinc-200 dark:border-zinc-800"
        )}
      >
        {isNotStarted && <Ribbon text="Очікується" colorClass="bg-amber-500" />}
        {isFinished && <Ribbon text="Завершено" colorClass="bg-zinc-500" />}
        {canBid && <Ribbon text="Активні торги" colorClass="bg-emerald-600" />}

        {/* HEADER */}
        <div className="bg-zinc-50/80 dark:bg-slate-800 px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-black tracking-widest text-zinc-400 leading-none">
                Тендер
              </span>
              <span className="text-xs font-black text-orange-600 dark:text-orange-500">
                № {cargo.id}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1" />
            <div className="flex items-center gap-1">
              <StatusBadge
                condition={true}
                icon={Layers}
                text={cargo.tender_type}
              />
              <StatusBadge
                condition={isNotStarted}
                icon={Clock}
                text="Очікує"
                variant="warning"
              />
              <StatusBadge
                condition={isFinished}
                icon={CheckCircle2}
                text="Done"
                variant="neutral"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pr-12 lg:pr-16 scale-90">
            {isNotStarted && cargo.time_start && (
              <TenderTimer
                targetDate={cargo.time_start}
                label="До початку"
                variant="blue"
              />
            )}
            {canBid && cargo.time_end && (
              <TenderTimer
                targetDate={cargo.time_end}
                label="До кінця"
                variant="orange"
              />
            )}
            {isFinished && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                <Clock size={10} className="text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400">
                  {format(new Date(cargo.time_end ?? ""), "dd.MM HH:mm")}
                </span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
            {/* 1. МАРШРУТ ЗІ СТЕППЕРОМ */}
            <div className="lg:col-span-4 p-3 pr-1">
              <div className="flex flex-col">
                {renderRouteSection(
                  route.from,
                  "Завантаження",
                  "text-emerald-600"
                )}

                {renderRouteSection(
                  route.customUp,
                  "Замитнення",
                  "text-blue-500"
                )}

                {route.border.length > 0 && (
                  <div className="my-1 ml-6 mr-2 bg-zinc-50 dark:bg-zinc-800/40 p-1.5 rounded-md border border-dashed border-zinc-200 dark:border-zinc-700 relative">
                    {/* Маленька стрілочка для вказівки на блок кордону */}
                    <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-3 h-[1px] bg-zinc-200 dark:bg-zinc-700" />
                    {renderRouteSection(
                      route.border,
                      "Кордон",
                      "text-amber-600",
                      true
                    )}
                  </div>
                )}

                {renderRouteSection(
                  route.customDown,
                  "Розмитнення",
                  "text-blue-500"
                )}

                {renderRouteSection(
                  route.to,
                  "Розвантаження",
                  "text-rose-600",
                  true
                )}
              </div>
            </div>

            {/* 2. ІНФО */}
            <div className="lg:col-span-5 p-3 flex flex-col justify-between bg-zinc-50/30 dark:bg-transparent">
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-black text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-tighter">
                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">
                    <Truck size={12} className="text-blue-500" />{" "}
                    {cargo.car_count_actual || 1} авт.
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">
                    <ClipboardList size={12} className="text-amber-500" />{" "}
                    {cargo.weight}т / {cargo.volume}м³
                  </div>
                </div>

                <div className="space-y-1">
                  {cargo.tender_trailer?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight">
                      <Settings2 size={12} className="shrink-0 opacity-70" />
                      <span className="truncate">
                        {cargo.tender_trailer
                          .map((t) => t.trailer_type_name)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="text-[11px] bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded border-l-2 border-amber-400">
                    <p className="font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-1 leading-none mb-1">
                      <Box size={10} /> {cargo.cargo}
                    </p>
                    <p className="text-[10px] italic text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-tight">
                      {cargo.notes || "Без приміток"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold mt-2">
                <User size={10} />{" "}
                <span className="truncate">{cargo.author}</span>
              </div>
            </div>

            {/* 3. ЦІНА */}
            <div
              className={cn(
                "lg:col-span-3 p-3 flex flex-col justify-center gap-2 text-center",
                !canBid
                  ? "bg-zinc-100/50 dark:bg-zinc-800/30"
                  : "bg-emerald-50/30 dark:bg-emerald-900/10"
              )}
            >
              <div>
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                  {isFinished ? "Фінал" : isNotStarted ? "Старт" : "Поточна"}
                </span>
                <div
                  className={cn(
                    "text-xl font-black tracking-tighter leading-none",
                    !canBid
                      ? "text-zinc-500"
                      : "text-zinc-900 dark:text-zinc-100"
                  )}
                >
                  {cargo.price_proposed || cargo.price_start}
                  <span className="text-[10px] font-medium ml-0.5 uppercase opacity-60">
                    {cargo.valut_name}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {cargo.ids_type === "GENERAL" && (
                  <Button
                    disabled={!canBid}
                    onClick={() => setActiveModal("confirm")}
                    className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 h-8 text-[10px] font-black uppercase tracking-tight shadow-sm"
                  >
                    КРОК {cargo.price_next}{" "}
                    {canBid && <ArrowBigDownDash className="ml-1 h-3 w-3" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onOpenDetails}
                  className="w-full h-7 text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-black hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Деталі <Info size={12} className="ml-1 opacity-70" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODALS (залишені без змін для функціоналу) */}
      <ConfirmDialog
        open={activeModal === "confirm"}
        onOpenChange={closeModal}
        title="Підтвердити зниження?"
        description={`Ваша ставка складе ${cargo.price_next} ${cargo.valut_name}`}
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
        description="Прийняти умови тендеру негайно?"
        onConfirm={onBuyout}
        confirmText="Так, викупити"
      />
    </>
  );
}
