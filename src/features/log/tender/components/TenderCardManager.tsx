// // "use client";

// // import React from "react";
// // import Flag from "react-flagkit";
// // import { format } from "date-fns";
// // import {
// //   Truck,
// //   User,
// //   Calendar,
// //   Layers,
// //   Info,
// //   ChevronUp,
// //   ChevronDown,
// //   Star,
// // } from "lucide-react";

// // import { Card, CardContent } from "@/shared/components/ui/card";
// // import { Button } from "@/shared/components/ui";
// // import { cn } from "@/shared/utils";
// // import { ITender, ITenderRate } from "@/features/log/types/tender.type";
// // import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
// // import { TenderRatesList } from "./TenderRate";
// // import { useFontSize } from "@/shared/providers/FontSizeProvider";

// // export function TenderCardManagers({
// //   cargo,
// //   onOpenDetails,
// // }: {
// //   cargo: ITender;
// //   onOpenDetails: () => void;
// // }) {
// //   const { config } = useFontSize();
// //   const { label, main, title, icon } = config;

// //   const [isRatesOpen, setIsRatesOpen] = React.useState(false);
// //   const displayPrice = cargo.price_proposed || cargo.price_start;

// //   // Розподіл точок для триколонкового маршруту
// //   const fromPoints = cargo.tender_route.filter(
// //     (p) => p.ids_point === "LOAD_FROM"
// //   );
// //   const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
// //   const transitPoints = cargo.tender_route.filter((p) =>
// //     ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point)
// //   );

// //   // Мапінг технічних назв на українські
// //   const getPointLabel = (type: string) => {
// //     switch (type) {
// //       case "CUSTOM_UP":
// //         return "Замитнення";
// //       case "BORDER":
// //         return "Кордон";
// //       case "CUSTOM_DOWN":
// //         return "Розмитнення";
// //       default:
// //         return "";
// //     }
// //   };

// //   const stars =
// //     Number(cargo.rating) === 2 ? 5 : Number(cargo.rating) === 1 ? 3 : 1;

// //   return (
// //     <Card className="w-full border-gray-200 dark:border-slate-700 bg-[#eff4fc] dark:bg-slate-800 hover:shadow-md transition-all rounded-xl overflow-hidden mb-1">
// //       {/* HEADER */}
// //       <div className="bg-zinc-50 dark:bg-slate-900/50 px-3 py-1 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
// //         <div className="flex items-center gap-4">
// //           <div className="flex items-baseline gap-2">
// //             <span
// //               className={cn(
// //                 "uppercase font-black tracking-widest text-zinc-400",
// //                 title
// //               )}
// //             >
// //               № {cargo.id}
// //             </span>
// //             <span
// //               className={cn(
// //                 "font-bold text-blue-600 dark:text-blue-400 uppercase",
// //                 main
// //               )}
// //             >
// //               {cargo.tender_type}
// //             </span>
// //           </div>
// //           <div className="flex items-center">
// //             {[...Array(5)].map((_, i) => (
// //               <Star
// //                 key={i}
// //                 className={cn(
// //                   "h-2.5 w-2.5",
// //                   i < stars
// //                     ? "fill-amber-400 text-amber-400"
// //                     : "fill-muted/20 text-muted"
// //                 )}
// //               />
// //             ))}
// //           </div>
// //         </div>

// //         <div className="flex items-center gap-3">
// //           {cargo.time_start && (
// //             <TenderTimer
// //               targetDate={cargo.time_start}
// //               label="Старт"
// //               variant="blue"
// //             />
// //           )}
// //           <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-zinc-200 shadow-sm">
// //             <Calendar size={icon} className="text-emerald-500" />
// //             <span
// //               className={cn(
// //                 "font-mono font-bold text-zinc-700 dark:text-zinc-200",
// //                 main
// //               )}
// //             >
// //               {cargo.time_start
// //                 ? format(new Date(cargo.time_start), "dd.MM HH:mm")
// //                 : "—"}
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       <CardContent className="p-0">
// //         <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-slate-700">
// //           {/* 1. МАРШРУТ (3 КОЛОНКИ) */}
// //           <div className="lg:col-span-6 p-3">
// //             <div className="grid grid-cols-3 gap-3">
// //               {/* Колонка: ВІД */}
// //               <div className="space-y-1 min-w-0">
// //                 <span
// //                   className={cn(
// //                     "font-black uppercase text-emerald-600 tracking-tighter block mb-1",
// //                     label
// //                   )}
// //                 >
// //                   Відправлення
// //                 </span>
// //                 {fromPoints.map((p) => (
// //                   <div
// //                     key={p.id}
// //                     className={cn(
// //                       "flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 min-w-0",
// //                       main
// //                     )}
// //                   >
// //                     <Flag country={p.ids_country ?? "UA"} size={icon} />
// //                     <span className="truncate leading-tight">{p.city}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               {/* Колонка: ТРАНЗИТ / МИТНИЦЯ */}
// //               <div className="space-y-1.5 border-x border-dashed border-slate-200 dark:border-slate-700 px-2 min-w-0">
// //                 <span
// //                   className={cn(
// //                     "font-black uppercase text-amber-500 tracking-tighter block mb-1",
// //                     label
// //                   )}
// //                 >
// //                   Транзит / Мито
// //                 </span>
// //                 {transitPoints.length > 0 ? (
// //                   transitPoints.map((p) => (
// //                     <div key={p.id} className="flex flex-col leading-none">
// //                       <div
// //                         className={cn(
// //                           "flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300",
// //                           label
// //                         )}
// //                       >
// //                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
// //                         <span className="truncate uppercase">
// //                           {getPointLabel(p.ids_point)}
// //                         </span>
// //                       </div>
// //                       <span
// //                         className={cn(
// //                           "pl-2.5 truncate text-slate-400 dark:text-slate-500 font-semibold",
// //                           label
// //                         )}
// //                       >
// //                         {p.city}
// //                       </span>
// //                     </div>
// //                   ))
// //                 ) : (
// //                   <div className={cn("text-slate-300 italic py-1", label)}>
// //                     Прямий рейс
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Колонка: ДО */}
// //               <div className="space-y-1 min-w-0">
// //                 <span
// //                   className={cn(
// //                     "font-black uppercase text-rose-600 tracking-tighter block mb-1",
// //                     label
// //                   )}
// //                 >
// //                   Прибуття
// //                 </span>
// //                 {toPoints.map((p) => (
// //                   <div
// //                     key={p.id}
// //                     className={cn(
// //                       "flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 min-w-0",
// //                       main
// //                     )}
// //                   >
// //                     <Flag country={p.ids_country ?? "UA"} size={icon} />
// //                     <span className="truncate leading-tight">{p.city}</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>

// //           {/* 2. ТЕХНІЧНІ ДАНІ */}
// //           <div className="lg:col-span-3 p-3 flex flex-col justify-between gap-3">
// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-slate-100">
// //                   <Truck size={icon + 2} className="text-blue-500" />
// //                   <span className={main}>
// //                     {cargo.car_count_actual || 1}{" "}
// //                     <small className="opacity-50">АВТ</small>
// //                   </span>
// //                 </div>
// //                 <div
// //                   className={cn(
// //                     "font-black text-slate-800 dark:text-slate-200",
// //                     main
// //                   )}
// //                 >
// //                   {cargo.weight}т / {cargo.volume}м³
// //                 </div>
// //               </div>

// //               <div className="flex flex-wrap gap-1">
// //                 {cargo.tender_trailer?.map((t, i) => (
// //                   <span
// //                     key={i}
// //                     className={cn(
// //                       "px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-700 rounded font-bold uppercase",
// //                       label
// //                     )}
// //                   >
// //                     {t.trailer_type_name}
// //                   </span>
// //                 ))}
// //               </div>

// //               <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded border-l-2 border-amber-400">
// //                 <p
// //                   className={cn(
// //                     "font-black text-slate-800 dark:text-slate-200 uppercase leading-none mb-0.5",
// //                     label
// //                   )}
// //                 >
// //                   {cargo.cargo || "Вантаж"}
// //                 </p>
// //                 <p
// //                   className={cn(
// //                     "italic text-slate-500 text-[11px] line-clamp-1 leading-tight",
// //                     label
// //                   )}
// //                 >
// //                   {cargo.notes || "Без приміток"}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
// //               <User size={icon} className="text-slate-400" />
// //               <span
// //                 className={cn(
// //                   "font-bold text-slate-500 uppercase truncate",
// //                   label
// //                 )}
// //               >
// //                 {cargo.author}
// //               </span>
// //             </div>
// //           </div>

// //           {/* 3. ЦІНА ТА СТАВКИ */}
// //           <div className="lg:col-span-3 p-3 bg-zinc-50/50 dark:bg-slate-900/20 flex flex-col justify-center gap-2">
// //             <div className="text-center">
// //               <span
// //                 className={cn(
// //                   "font-bold text-slate-400 uppercase tracking-tighter block",
// //                   label
// //                 )}
// //               >
// //                 {displayPrice ? "Ціна" : "Тендер"}
// //               </span>
// //               <div
// //                 className={cn(
// //                   "font-black leading-none truncate",
// //                   displayPrice
// //                     ? "text-xl text-slate-900 dark:text-white"
// //                     : cn("text-blue-600", main)
// //                 )}
// //               >
// //                 {displayPrice
// //                   ? `${displayPrice} ${cargo.valut_name}`
// //                   : "Запит ціни"}
// //               </div>
// //               {cargo.without_vat && displayPrice && (
// //                 <div
// //                   className={cn(
// //                     "font-bold text-rose-500 uppercase mt-0.5",
// //                     label
// //                   )}
// //                 >
// //                   Без ПДВ
// //                 </div>
// //               )}
// //             </div>

// //             <Button
// //               variant="outline"
// //               onClick={onOpenDetails}
// //               className={cn("w-full h-8 font-bold border-zinc-300", label)}
// //             >
// //               ДЕТАЛІ <Info size={icon} className="ml-1.5" />
// //             </Button>

// //             <button
// //               onClick={() => setIsRatesOpen(!isRatesOpen)}
// //               disabled={!cargo.rate_company?.length}
// //               className={cn(
// //                 "flex items-center justify-between w-full p-1.5 rounded border transition-all",
// //                 isRatesOpen
// //                   ? "bg-white border-blue-200"
// //                   : "bg-transparent border-transparent hover:bg-white/50",
// //                 !cargo.rate_company?.length && "opacity-40 cursor-not-allowed"
// //               )}
// //             >
// //               <div className="flex items-center gap-2">
// //                 <Layers
// //                   size={icon}
// //                   className={isRatesOpen ? "text-blue-500" : "text-slate-400"}
// //                 />
// //                 <span
// //                   className={cn("font-black uppercase text-slate-500", label)}
// //                 >
// //                   Ставки ({cargo.rate_company?.length || 0})
// //                 </span>
// //               </div>
// //               {isRatesOpen ? (
// //                 <ChevronUp size={icon} />
// //               ) : (
// //                 <ChevronDown size={icon} />
// //               )}
// //             </button>
// //           </div>
// //         </div>

// //         {/* ПАНЕЛЬ СТАВОК */}
// //         {isRatesOpen && (
// //           <div className="border-t border-zinc-100 dark:border-slate-700 p-2 bg-white/50 dark:bg-slate-900/50">
// //             <TenderRatesList
// //               rates={cargo.rate_company as unknown as ITenderRate[]}
// //               currency={cargo.valut_name ?? "грн"}
// //             />
// //           </div>
// //         )}
// //       </CardContent>
// //     </Card>
// //   );
// // }

// "use client";

// import React from "react";
// import Flag from "react-flagkit";
// import { format } from "date-fns";
// import {
//   Truck,
//   User,
//   Calendar,
//   Layers,
//   Info,
//   ChevronUp,
//   ChevronDown,
//   Star,
//   MapPin,
// } from "lucide-react";

// import { Card, CardContent } from "@/shared/components/ui/card";
// import { Button } from "@/shared/components/ui";
// import { cn } from "@/shared/utils";
// import { ITender, ITenderRate } from "@/features/log/types/tender.type";
// import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
// import { TenderRatesList } from "./TenderRate";
// import { useFontSize } from "@/shared/providers/FontSizeProvider";

// export function TenderCardManagers({
//   cargo,
//   onOpenDetails,
// }: {
//   cargo: ITender;
//   onOpenDetails: () => void;
// }) {
//   const { config } = useFontSize();
//   const { label, main, title, icon } = config;

//   const [isRatesOpen, setIsRatesOpen] = React.useState(false);
//   const displayPrice = cargo.price_proposed || cargo.price_start;

//   const fromPoints = cargo.tender_route.filter(
//     (p) => p.ids_point === "LOAD_FROM"
//   );
//   const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
//   const transitPoints = cargo.tender_route.filter((p) =>
//     ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point)
//   );

//   const getPointLabel = (type: string) => {
//     switch (type) {
//       case "CUSTOM_UP":
//         return "Замитнення";
//       case "BORDER":
//         return "Кордон";
//       case "CUSTOM_DOWN":
//         return "Розмитнення";
//       default:
//         return "";
//     }
//   };

//   const stars =
//     Number(cargo.rating) === 2 ? 5 : Number(cargo.rating) === 1 ? 3 : 1;

//   return (
//     <Card className="w-full border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 rounded-2xl overflow-hidden mb-3">
//       {/* HEADER */}
//       <div className="bg-slate-50/50 dark:bg-white/5 px-4 py-2 border-b border-slate-200/60 dark:border-white/5 flex justify-between items-center relative">
//         {/* Декоративна лінія зверху */}
//         <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/20 via-transparent to-transparent" />

//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-3">
//             <span
//               className={cn(
//                 "uppercase font-black tracking-widest text-slate-400 dark:text-slate-500",
//                 title
//               )}
//             >
//               № {cargo.id}
//             </span>
//             <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
//             <span
//               className={cn(
//                 "font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight",
//                 main
//               )}
//             >
//               {cargo.tender_type}
//             </span>
//           </div>
//           <div className="flex items-center bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/5">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={cn(
//                   "h-2.5 w-2.5 transition-colors",
//                   i < stars
//                     ? "fill-amber-400 text-amber-400"
//                     : "fill-slate-200 dark:fill-slate-800 text-transparent"
//                 )}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           {cargo.time_start && (
//             <TenderTimer
//               targetDate={cargo.time_start}
//               label="До старту"
//               variant="blue"
//             />
//           )}
//           <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm">
//             <Calendar size={icon} className="text-blue-500" />
//             <span
//               className={cn(
//                 "font-mono font-bold text-slate-700 dark:text-slate-200",
//                 main
//               )}
//             >
//               {cargo.time_start
//                 ? format(new Date(cargo.time_start), "dd.MM HH:mm")
//                 : "—"}
//             </span>
//           </div>
//         </div>
//       </div>

//       <CardContent className="p-0">
//         <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-200/60 dark:divide-white/5">
//           {/* 1. МАРШРУТ */}
//           <div className="lg:col-span-6 p-4">
//             <div className="grid grid-cols-3 gap-4">
//               {/* Колонка: ВІД */}
//               <div className="space-y-2">
//                 <p
//                   className={cn(
//                     "font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-wider flex items-center gap-1",
//                     label
//                   )}
//                 >
//                   <MapPin size={10} /> Відправлення
//                 </p>
//                 {fromPoints.map((p) => (
//                   <div
//                     key={p.id}
//                     className={cn(
//                       "flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100",
//                       main
//                     )}
//                   >
//                     <div className="shrink-0 p-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">
//                       <Flag country={p.ids_country ?? "UA"} size={icon} />
//                     </div>
//                     <span className="truncate leading-tight">{p.city}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Колонка: ТРАНЗИТ */}
//               <div className="space-y-2 border-x border-dashed border-slate-200 dark:border-white/10 px-3">
//                 <p
//                   className={cn(
//                     "font-black uppercase text-amber-500 tracking-wider",
//                     label
//                   )}
//                 >
//                   Транзит
//                 </p>
//                 {transitPoints.length > 0 ? (
//                   transitPoints.map((p) => (
//                     <div key={p.id} className="flex flex-col gap-0.5">
//                       <div
//                         className={cn(
//                           "flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400",
//                           label
//                         )}
//                       >
//                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
//                         <span className="truncate uppercase">
//                           {getPointLabel(p.ids_point)}
//                         </span>
//                       </div>
//                       <span
//                         className={cn(
//                           "pl-3 truncate text-slate-400 dark:text-slate-500 font-medium",
//                           label
//                         )}
//                       >
//                         {p.city}
//                       </span>
//                     </div>
//                   ))
//                 ) : (
//                   <div
//                     className={cn(
//                       "text-slate-300 dark:text-slate-600 italic py-1 flex items-center gap-1",
//                       label
//                     )}
//                   >
//                     <div className="w-4 h-[1px] bg-current" /> Прямий рейс
//                   </div>
//                 )}
//               </div>

//               {/* Колонка: ДО */}
//               <div className="space-y-2">
//                 <p
//                   className={cn(
//                     "font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1",
//                     label
//                   )}
//                 >
//                   <MapPin size={10} /> Прибуття
//                 </p>
//                 {toPoints.map((p) => (
//                   <div
//                     key={p.id}
//                     className={cn(
//                       "flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100",
//                       main
//                     )}
//                   >
//                     <div className="shrink-0 p-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">
//                       <Flag country={p.ids_country ?? "UA"} size={icon} />
//                     </div>
//                     <span className="truncate leading-tight">{p.city}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* 2. ТЕХНІЧНІ ДАНІ */}
//           <div className="lg:col-span-3 p-4 flex flex-col justify-between bg-slate-50/30 dark:bg-white/[0.02]">
//             <div className="space-y-3">
//               <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/50 dark:border-white/5">
//                 <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
//                   <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
//                     <Truck size={icon + 2} className="text-blue-500" />
//                   </div>
//                   <span className={main}>
//                     {cargo.car_count_actual || 1}{" "}
//                     <span className="text-[10px] text-slate-400 uppercase">
//                       авт
//                     </span>
//                   </span>
//                 </div>
//                 <div
//                   className={cn(
//                     "font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg",
//                     label
//                   )}
//                 >
//                   {cargo.weight}т / {cargo.volume}м³
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-1">
//                 {cargo.tender_trailer?.map((t, i) => (
//                   <span
//                     key={i}
//                     className={cn(
//                       "px-2 py-0.5 bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-lg font-bold uppercase border border-blue-100 dark:border-blue-500/10",
//                       label
//                     )}
//                   >
//                     {t.trailer_type_name}
//                   </span>
//                 ))}
//               </div>

//               <div className="bg-white/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm">
//                 <p
//                   className={cn(
//                     "font-black text-slate-800 dark:text-slate-200 uppercase leading-none mb-1.5",
//                     label
//                   )}
//                 >
//                   {cargo.cargo || "Вантаж"}
//                 </p>
//                 <p
//                   className={cn(
//                     "text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-snug italic",
//                     label
//                   )}
//                 >
//                   {cargo.notes || "Без спеціальних приміток до замовлення"}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200/50 dark:border-white/5">
//               <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
//                 <User
//                   size={icon - 2}
//                   className="text-slate-500 dark:text-slate-400"
//                 />
//               </div>
//               <span
//                 className={cn(
//                   "font-bold text-slate-400 uppercase truncate tracking-tight",
//                   label
//                 )}
//               >
//                 {cargo.author}
//               </span>
//             </div>
//           </div>

//           {/* 3. ЦІНА ТА ДІЇ */}
//           <div className="lg:col-span-3 p-4 flex flex-col justify-center gap-3 bg-blue-50/20 dark:bg-blue-500/[0.02]">
//             <div className="text-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 shadow-sm">
//               <span
//                 className={cn(
//                   "font-bold text-slate-400 uppercase tracking-widest block mb-1",
//                   label
//                 )}
//               >
//                 {displayPrice ? "Ставка замовника" : "Тендерний запит"}
//               </span>
//               <div
//                 className={cn(
//                   "font-black tracking-tighter truncate",
//                   displayPrice
//                     ? "text-2xl text-slate-900 dark:text-white"
//                     : "text-blue-600 dark:text-blue-400"
//                 )}
//               >
//                 {displayPrice ? (
//                   <>
//                     {displayPrice}{" "}
//                     <span className="text-sm font-bold text-slate-400">
//                       {cargo.valut_name}
//                     </span>
//                   </>
//                 ) : (
//                   "Відкрита ціна"
//                 )}
//               </div>
//               {cargo.without_vat && displayPrice && (
//                 <div
//                   className={cn(
//                     "inline-block px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full font-bold uppercase mt-2 border border-rose-100 dark:border-rose-500/20",
//                     label
//                   )}
//                 >
//                   Без ПДВ
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 gap-2">
//               <Button
//                 variant="outline"
//                 onClick={onOpenDetails}
//                 className={cn(
//                   "w-full h-10 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all",
//                   label
//                 )}
//               >
//                 ДЕТАЛІ <Info size={icon} className="ml-2 text-blue-500" />
//               </Button>

//               <button
//                 onClick={() => setIsRatesOpen(!isRatesOpen)}
//                 disabled={!cargo.rate_company?.length}
//                 className={cn(
//                   "flex items-center justify-between w-full h-10 px-4 rounded-xl border transition-all duration-300",
//                   isRatesOpen
//                     ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
//                     : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400",
//                   !cargo.rate_company?.length &&
//                     "opacity-40 cursor-not-allowed grayscale"
//                 )}
//               >
//                 <div className="flex items-center gap-2">
//                   <Layers size={icon} />
//                   <span className={cn("font-black uppercase", label)}>
//                     Ставки{" "}
//                     <span
//                       className={cn(
//                         "ml-1 px-1.5 py-0.5 rounded-md",
//                         isRatesOpen
//                           ? "bg-white/20"
//                           : "bg-slate-100 dark:bg-white/10"
//                       )}
//                     >
//                       {cargo.rate_company?.length || 0}
//                     </span>
//                   </span>
//                 </div>
//                 {isRatesOpen ? (
//                   <ChevronUp size={icon} />
//                 ) : (
//                   <ChevronDown size={icon} />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ПАНЕЛЬ СТАВОК */}
//         {isRatesOpen && (
//           <div className="border-t border-slate-200/60 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
//             <TenderRatesList
//               rates={cargo.rate_company as unknown as ITenderRate[]}
//               currency={cargo.valut_name ?? "грн"}
//             />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import React from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import {
  Truck,
  User,
  Calendar,
  Layers,
  Info,
  ChevronUp,
  ChevronDown,
  Star,
  MapPin,
  Weight,
  Box,
} from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITender, ITenderRate } from "@/features/log/types/tender.type";
import { TenderTimer } from "@/features/dashboard/tender/components/TenderTimer";
import { TenderRatesList } from "./TenderRate";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function TenderCardManagers({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const { config } = useFontSize();
  const { label, main, title, icon } = config;

  const [isRatesOpen, setIsRatesOpen] = React.useState(false);
  const displayPrice = cargo.price_proposed || cargo.price_start;

  const fromPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM");
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");
  const transitPoints = cargo.tender_route.filter((p) =>
    ["CUSTOM_UP", "BORDER", "CUSTOM_DOWN"].includes(p.ids_point)
  );

  const getPointLabel = (type: string) => {
    switch (type) {
      case "CUSTOM_UP": return "Зам.";
      case "BORDER": return "Корд.";
      case "CUSTOM_DOWN": return "Розм.";
      default: return "";
    }
  };

  const stars = Number(cargo.rating) === 2 ? 5 : Number(cargo.rating) === 1 ? 3 : 1;

  return (
    <Card className="w-full border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden mb-2">
      {/* HEADER - Більш вузький */}
      <div className="bg-slate-50 dark:bg-white/[0.03] px-3 py-1.5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={cn("font-black text-slate-400 dark:text-slate-500 tracking-tighter", title)}>
            #{cargo.id}
          </span>
          <span className={cn("font-bold text-blue-600 dark:text-blue-400 uppercase", label)}>
            {cargo.tender_type}
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn("h-2.5 w-2.5", i < stars ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700")}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cargo.time_start && (
            <TenderTimer targetDate={cargo.time_start} label="" variant="blue" />
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10">
            <Calendar size={icon - 2} className="text-slate-400" />
            <span className={cn("font-mono font-bold text-slate-600 dark:text-slate-300", label)}>
              {cargo.time_start ? format(new Date(cargo.time_start), "dd.MM HH:mm") : "—"}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5">
          
          {/* 1. МАРШРУТ - Компактні колонки */}
          <div className="lg:col-span-5 p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <p className={cn("text-[10px] font-black uppercase text-emerald-600 mb-1", label)}>Відправка</p>
                {fromPoints.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 mb-1 last:mb-0">
                    <Flag country={p.ids_country ?? "UA"} size={12} className="shrink-0" />
                    <span className={cn("truncate font-bold text-slate-800 dark:text-slate-200", label)}>{p.city}</span>
                  </div>
                ))}
              </div>

              <div className="border-x border-dashed border-slate-200 dark:border-white/10 px-2 min-w-0">
                <p className={cn("text-[10px] font-black uppercase text-amber-500 mb-1", label)}>Транзит</p>
                {transitPoints.length > 0 ? (
                  transitPoints.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex flex-col mb-1 last:mb-0 leading-tight">
                      <span className={cn("text-[9px] font-bold text-slate-400 uppercase", label)}>
                        {getPointLabel(p.ids_point)}
                      </span>
                      <span className={cn("truncate font-medium text-slate-500", label)}>{p.city}</span>
                    </div>
                  ))
                ) : (
                  <span className={cn("text-slate-300 italic", label)}>Прямий</span>
                )}
              </div>

              <div className="min-w-0">
                <p className={cn("text-[10px] font-black uppercase text-rose-600 mb-1", label)}>Прибуття</p>
                {toPoints.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 mb-1 last:mb-0">
                    <Flag country={p.ids_country ?? "UA"} size={12} className="shrink-0" />
                    <span className={cn("truncate font-bold text-slate-800 dark:text-slate-200", label)}>{p.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ТЕХНІЧНІ ДАНІ - В один ряд для економії місця */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-center bg-slate-50/30 dark:bg-transparent gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Truck size={icon} className="text-blue-500" />
                <span className={cn("font-black text-slate-700 dark:text-slate-200", main)}>
                  {cargo.car_count_actual || 1}<span className="text-[10px] ml-0.5 opacity-50">АВТ</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-slate-500">
                    <Weight size={12} />
                    <span className={cn("font-bold", label)}>{cargo.weight}т</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-500">
                    <Box size={12} />
                    <span className={cn("font-bold", label)}>{cargo.volume}м³</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {cargo.tender_trailer?.slice(0, 2).map((t, i) => (
                <span key={i} className={cn("px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase border border-slate-200 dark:border-white/5", label)}>
                  {t.trailer_type_name}
                </span>
              ))}
              <span className={cn("ml-auto font-bold text-blue-600/70 dark:text-blue-400/70 truncate max-w-[100px]", label)}>
                {cargo.cargo}
              </span>
            </div>
          </div>

          {/* 3. ЦІНА ТА ДІЇ - Компактний блок */}
          <div className="lg:col-span-3 p-2 flex flex-col justify-center gap-1.5 bg-blue-50/10 dark:bg-blue-500/[0.02]">
            <div className="text-right px-1">
              <div className={cn("font-black tracking-tighter text-lg leading-none", displayPrice ? "text-slate-900 dark:text-white" : "text-blue-500")}>
                {displayPrice ? (
                  <>{displayPrice} <span className="text-[10px] text-slate-400">{cargo.valut_name}</span></>
                ) : "Запит ціни"}
              </div>
              {cargo.without_vat && (
                <span className="text-[9px] font-black text-rose-500 uppercase">Без ПДВ</span>
              )}
            </div>

            <div className="flex gap-1">
              <Button 
                variant="outline" 
                onClick={onOpenDetails} 
                className="flex-1 h-7 px-2 text-[10px] font-bold border-slate-200 dark:border-white/10"
              >
                ДЕТАЛІ
              </Button>
              <button
                onClick={() => setIsRatesOpen(!isRatesOpen)}
                disabled={!cargo.rate_company?.length}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2 h-7 rounded-md border transition-all min-w-[70px]",
                  isRatesOpen 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-white/10",
                  !cargo.rate_company?.length && "opacity-30 grayscale"
                )}
              >
                <Layers size={12} />
                <span className="text-[10px] font-black">{cargo.rate_company?.length || 0}</span>
                {isRatesOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>
          </div>
        </div>

        {/* ПАНЕЛЬ СТАВОК */}
        {isRatesOpen && (
          <div className="border-t border-slate-100 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-black/20">
            <TenderRatesList
              rates={cargo.rate_company as unknown as ITenderRate[]}
              currency={cargo.valut_name ?? "грн"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}