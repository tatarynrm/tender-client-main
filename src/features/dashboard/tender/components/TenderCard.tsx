// "use client";

// import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
// import {
//   MapPin,
//   Truck,
//   ClipboardList,
//   GripVertical,
//   User,
//   Building2,
//   MessageCircle,
//   ArrowRight,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import Flag from "react-flagkit";
// import { format } from "date-fns";
// import { uk } from "date-fns/locale";
// import { cn } from "@/shared/utils";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/shared/components/ui/dropdown-menu";
// import { useRouter } from "next/navigation";
// import { ITender } from "@/features/log/types/tender.type";

// export function TenderCardManagers({
//   cargo,
//   onOpenDetails,
// }: {
//   cargo: ITender;
//   onOpenDetails: () => void;
// }) {
//   const router = useRouter();
//   const [windowWidth, setWindowWidth] = useState(
//     typeof window !== "undefined" ? window.innerWidth : 1024
//   );

//   useEffect(() => {
//     const onResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = windowWidth <= 768;

//   // const fromPoints = cargo.tender_route?.filter(
//   //   (r) => r.ids_point === "LOAD_FROM"
//   // ) || [];

//   // const toPoints = cargo.tender_route?.filter(
//   //   (r) => r.ids_point === "LOAD_TO"
//   // ) || [];

//   const trailerList =
//     cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "-";
//   const trailerLoadList =
//     cargo.tender_load?.map((t) => t.load_type_name).join(", ") || "-";
//   console.log(trailerLoadList, "LAOD LIST");

//   const carCount = cargo.car_count ?? 0;
//   const carCountActual = cargo.car_count_actual ?? 0;
//   const carCountClosed = cargo.car_count_closed ?? 0;
//   const carCountCanceled = cargo.car_count_canceled ?? 0;

//   const weight = cargo.weight ?? 0;
//   const volume = cargo.volume ?? 0;

//   const formattedStartDate = cargo.time_start
//     ? format(new Date(cargo.time_start), "dd.MM.yyyy", { locale: uk })
//     : "Без дати";

//   const formattedEndDate = cargo.time_end
//     ? format(new Date(cargo.time_end), "dd.MM.yyyy", { locale: uk })
//     : "Без дати";
//   const fromPoints = cargo.tender_route.filter(
//     (p) => p.ids_point === "LOAD_FROM"
//   );
//   const customUp = cargo.tender_route.filter(
//     (p) => p.ids_point === "CUSTOM_UP"
//   );
//   const customDown = cargo.tender_route.filter(
//     (p) => p.ids_point === "CUSTOM_DOWN"
//   );
//   const border = cargo.tender_route.filter((p) => p.ids_point === "BORDER");
//   const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");

//   console.log(fromPoints, "FROM POINTS");

//   return (
//     <Card
//       className={cn(
//         "w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800",
//         "hover:shadow-md transition-all duration-200 rounded-lg cursor-pointer overflow-hidden"
//       )}
//       onClick={onOpenDetails}
//     >
//       {/* HEADER */}
//       <CardHeader className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
//         <div className="flex items-center justify-between w-full gap-2">
//           <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
//             Тендер № {cargo.id ?? "-"} ({cargo.tender_type})
//           </span>

//           <span className="text-gray-400 text-sm">
//             {formattedStartDate} - {formattedEndDate}
//           </span>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <GripVertical className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
//             </DropdownMenuTrigger>

//             <DropdownMenuContent align="end" className="w-44">
//               <DropdownMenuItem
//                 onClick={() => router.push(`/log/tender/edit/${cargo.id}`)}
//               >
//                 Редагувати
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => console.log("Видалити", cargo.id)}
//               >
//                 Видалити
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         {/* DESKTOP TABLE ROW */}
//         <div
//           className={cn(
//             "hidden md:grid grid-cols-10 text-sm divide-x divide-gray-200 dark:divide-slate-700",
//             "hover:bg-gray-50 dark:hover:bg-slate-900/20 transition"
//           )}
//         >
//           {/* FROM */}
//           <div className="p-3 flex items-center gap-2">
//             {fromPoints.length
//               ? fromPoints.map((p) => (
//                   <span
//                     key={p.id}
//                     className="flex items-center gap-1 font-medium"
//                   >
//                     <Flag country={p.ids_country ?? "UA"} size={16} />
//                     {p.city || "-"}
//                   </span>
//                 ))
//               : "-"}
//           </div>
//           {/* ZAMYTNENNYA */}
//           <div className="p-3 flex items-center gap-2">
//             {fromPoints.length
//               ? customUp.map((p) => (
//                   <span
//                     key={p.id}
//                     className="flex items-center gap-1 font-medium"
//                   >
//                     <Flag country={p.ids_country ?? "UA"} size={16} />
//                     {p.city || "-"}
//                   </span>
//                 ))
//               : "-"}
//           </div>
//           {/* BORDER */}
//           <div className="p-3 flex items-center gap-2">
//             {fromPoints.length
//               ? border.map((p) => (
//                   <span
//                     key={p.id}
//                     className="flex items-center gap-1 font-medium"
//                   >
//                     <Flag country={p.ids_country ?? "UA"} size={16} />
//                     {p.city || "-"}
//                   </span>
//                 ))
//               : "-"}
//           </div>
//           {/* CUSTOM DOWN - ROZMYTNENNYA */}
//           <div className="p-3 flex items-center gap-2">
//             {fromPoints.length
//               ? customDown.map((p) => (
//                   <span
//                     key={p.id}
//                     className="flex items-center gap-1 font-medium"
//                   >
//                     <Flag country={p.ids_country ?? "UA"} size={16} />
//                     {p.city || "-"}
//                   </span>
//                 ))
//               : "-"}
//           </div>
//           {/* TO */}
//           <div className="p-3 flex items-center gap-2">
//             {toPoints.length
//               ? toPoints.map((p) => (
//                   <span key={p.id} className="flex items-center gap-1">
//                     <Flag country={p.ids_country ?? "UA"} size={16} />
//                     {p.city || "-"}
//                   </span>
//                 ))
//               : "-"}
//           </div>

//           {/* AUTOS */}
//           <div className="p-3 flex flex-col gap-1 text-gray-700 dark:text-gray-300">
//             <div>
//               <Truck className="w-4 h-4 text-green-600 inline-block" />{" "}
//               {carCount} авт.
//             </div>
//             {carCount > 1 && (
//               <div>
//                 Фактично: {carCountActual} | Закрито: {carCountClosed} |
//                 Скасовано: {carCountCanceled}
//               </div>
//             )}
//           </div>

//           {/* WEIGHT / VOLUME */}
//           <div className="p-3 flex flex-col gap-1 text-gray-700 dark:text-gray-300">
//             <div>
//               <ClipboardList className="w-4 h-4 text-amber-600 inline-block" />{" "}
//               {weight} кг
//             </div>
//             <div>Об'єм: {volume} м³</div>
//           </div>

//           {/* TRAILERS */}
//           <div className="flex flex-col">
//             <div className="p-3 text-xs text-gray-700 dark:text-gray-300">
//               {trailerList}
//             </div>
//             <div className="p-3 text-xs text-gray-700 dark:text-gray-300">
//               {trailerLoadList}
//             </div>
//           </div>

//           {/* CARGO + NOTES */}
//           <div className="p-3 max-h-16 overflow-y-auto text-gray-800 dark:text-gray-200">
//             {cargo.cargo || "-"}
//             {cargo.notes && (
//               <span className="block text-xs opacity-70">{cargo.notes}</span>
//             )}
//           </div>

//           {/* AUTHOR */}
//           <div className="p-3 flex items-center gap-1 text-gray-700 dark:text-gray-300">
//             <User className="w-4 h-4 text-rose-600" />
//             <span className="truncate">{cargo.author || "-"}</span>
//           </div>

//           {/* COMPANY */}
//           <div className="p-3 flex items-center gap-1 text-gray-700 dark:text-gray-300">
//             <Building2 className="w-4 h-4" />
//             <span className="truncate">{cargo.company_name || "-"}</span>
//           </div>

//           {/* COST */}
//           <div className="p-3 text-gray-700 dark:text-gray-300">
//             {cargo.cost_start} {cargo.valut_name}{" "}
//             {cargo.without_vat ? "(без ПДВ)" : ""}
//           </div>

//           {/* STATUS */}
//           <div className="p-3 text-gray-700 dark:text-gray-300">
//             {cargo.tender_status || "-"}
//           </div>
//         </div>

//         {/* MOBILE CARD */}
//         <div className="md:hidden p-3 space-y-3 text-sm">
//           <div className="flex items-center gap-2 flex-wrap">
//             <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
//             {fromPoints.map((p) => (
//               <span key={p.id} className="flex items-center gap-1 font-medium">
//                 <Flag country={p.ids_country || "UN"} size={14} />{" "}
//                 {p.city || "-"}
//               </span>
//             ))}
//             <ArrowRight className="w-4 h-4 text-gray-500" />
//             {toPoints.map((p) => (
//               <span key={p.id} className="flex items-center gap-1">
//                 <Flag country={p.ids_country || "UN"} size={14} />{" "}
//                 {p.city || "-"}
//               </span>
//             ))}
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="flex flex-col text-gray-700 dark:text-gray-300">
//               <div>
//                 <Truck className="w-4 h-4 text-green-600 inline-block" />{" "}
//                 {carCount} авт.
//               </div>
//               <div>
//                 Фактично: {carCountActual} | Закрито: {carCountClosed} |
//                 Скасовано: {carCountCanceled}
//               </div>
//             </div>
//             <div className="flex flex-col text-gray-700 dark:text-gray-300">
//               <div>
//                 <ClipboardList className="w-4 h-4 text-amber-600 inline-block" />{" "}
//                 {weight} кг
//               </div>
//               <div>Об'єм: {volume} м³</div>
//             </div>
//           </div>

//           <div className="text-xs text-gray-600 dark:text-gray-400">
//             <span className="font-semibold">{trailerList}</span>
//           </div>

//           <div className="max-h-24 overflow-y-auto p-1 scrollbar-thin">
//             <p className="text-gray-700 dark:text-gray-300">
//               {cargo.cargo || "-"}
//               {cargo.notes && (
//                 <span className="block text-xs mt-1 opacity-80">
//                   {cargo.notes}
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
//             <div className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
//               <div>
//                 <User className="w-4 h-4 text-rose-600" /> {cargo.author || "-"}
//               </div>
//               <div>
//                 {cargo.cost_start} {cargo.valut_name}{" "}
//                 {cargo.without_vat ? "(без ПДВ)" : ""}
//               </div>
//               <div>{cargo.tender_status}</div>
//             </div>
//             <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-400">
//               <div>
//                 <Building2 className="w-4 h-4" /> {cargo.company_name || "-"}
//               </div>
//               <div>Тип: {cargo.tender_type}</div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import Flag from "react-flagkit";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Truck,
  ClipboardList,
  GripVertical,
  User,
  Building2,
  ArrowRight,
  Calendar,
  Package,
} from "lucide-react";

import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { ITender } from "@/features/log/types/tender.type";

export function TenderCardManagers({
  cargo,
  onOpenDetails,
}: {
  cargo: ITender;
  onOpenDetails: () => void;
}) {
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const trailerList = cargo.tender_trailer?.map((t) => t.trailer_type_name).join(", ") || "-";
  const trailerLoadList = cargo.tender_load?.map((t) => t.load_type_name).join(", ") || "-";

  const carCount = cargo.car_count ?? 0;
  const weight = cargo.weight ?? 0;
  const volume = cargo.volume ?? 0;

  const formattedStartDate = cargo.time_start
    ? format(new Date(cargo.time_start), "dd.MM.yyyy", { locale: uk })
    : "Без дати";

  const formattedEndDate = cargo.time_end
    ? format(new Date(cargo.time_end), "dd.MM.yyyy", { locale: uk })
    : "Без дати";

  const fromPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_FROM");
  const customUp = cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_UP");
  const customDown = cargo.tender_route.filter((p) => p.ids_point === "CUSTOM_DOWN");
  const border = cargo.tender_route.filter((p) => p.ids_point === "BORDER");
  const toPoints = cargo.tender_route.filter((p) => p.ids_point === "LOAD_TO");

  return (
    <Card
      className={cn(
        "w-full border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md",
        "hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 rounded-xl cursor-pointer overflow-hidden mb-2"
      )}
      onClick={onOpenDetails}
    >
      {/* HEADER */}
      <CardHeader className="flex justify-between items-center p-3 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">
              Тендер № {cargo.id ?? "-"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase border border-blue-100 dark:border-blue-500/20">
              {cargo.tender_type}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-medium">
              <Calendar size={14} className="text-blue-500/70" />
              <span>{formattedStartDate} — {formattedEndDate}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors">
                  <GripVertical size={18} className="text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => router.push(`/log/tender/edit/${cargo.id}`)}>
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem className="text-rose-500" onClick={() => console.log("Видалити", cargo.id)}>
                  Видалити
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* DESKTOP VIEW */}
        <div className="hidden md:grid grid-cols-10 text-[13px] divide-x divide-slate-200/60 dark:divide-white/5">
          
          {/* POINTS COLUMNS */}
          {[
            { label: "ВІД", data: fromPoints, color: "text-emerald-500" },
            { label: "ЗАМИТ", data: customUp, color: "text-amber-500" },
            { label: "КОРДОН", data: border, color: "text-blue-500" },
            { label: "РОЗМИТ", data: customDown, color: "text-amber-500" },
            { label: "ДО", data: toPoints, color: "text-rose-500" },
          ].map((col, idx) => (
            <div key={idx} className="p-3 flex flex-col gap-1.5 min-w-0 bg-white/50 dark:bg-transparent">
               <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-50", col.color)}>{col.label}</span>
               <div className="flex flex-col gap-1">
                {col.data.length ? col.data.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 truncate">
                    <Flag country={p.ids_country ?? "UA"} size={14} />
                    <span className="truncate">{p.city}</span>
                  </div>
                )) : <span className="text-slate-300 dark:text-slate-700">—</span>}
               </div>
            </div>
          ))}

          {/* PARAMS */}
          <div className="p-3 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Truck size={14} className="text-emerald-500" />
              <span>{carCount} <small className="text-[10px] opacity-50">АВТ</small></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <span>{cargo.car_count_actual}/{carCount}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-emerald-600">+{cargo.car_count_closed}</span>
            </div>
          </div>

          <div className="p-3 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <ClipboardList size={14} className="text-amber-500" />
              <span>{weight} кг</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">{volume} м³</div>
          </div>

          {/* DETAILS */}
          <div className="p-3 flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{trailerList}</span>
            <span className="text-[10px] text-slate-400 leading-tight line-clamp-1 italic">{cargo.cargo || "Вантаж"}</span>
          </div>

          {/* AUTH/COMPANY */}
          <div className="p-3 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
              <User size={14} className="text-rose-500/70" />
              <span className="truncate tracking-tighter">{cargo.author?.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
              <Building2 size={12} />
              <span className="truncate">{cargo.company_name}</span>
            </div>
          </div>

          {/* COST & STATUS */}
          <div className="p-3 flex flex-col justify-center gap-1 bg-blue-50/30 dark:bg-white/[0.02]">
            <div className="font-black text-slate-900 dark:text-white leading-none">
              {cargo.cost_start} <small className="text-[10px] font-bold opacity-60 uppercase">{cargo.valut_name}</small>
            </div>
            <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">
              {cargo.tender_status || "Новий"}
            </span>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold dark:text-slate-100">
              <Flag country={fromPoints[0]?.ids_country || "UA"} size={16} />
              <span>{fromPoints[0]?.city}</span>
              <ArrowRight size={14} className="text-slate-400" />
              <Flag country={toPoints[0]?.ids_country || "UA"} size={16} />
              <span>{toPoints[0]?.city}</span>
            </div>
            <div className="font-black text-blue-600">{cargo.cost_start} {cargo.valut_name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <Truck size={14} /> ТРАНСПОРТ
               </div>
               <div className="text-sm font-black dark:text-white">{carCount} авт. <span className="font-medium text-slate-400 text-xs">({cargo.car_count_actual} факт)</span></div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <Package size={14} /> ПАРАМЕТРИ
               </div>
               <div className="text-sm font-black dark:text-white">{weight}кг / {volume}м³</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 font-bold text-slate-400">
              <User size={12} /> {cargo.author}
            </div>
            <div className="font-black uppercase text-blue-500 tracking-widest">{cargo.tender_status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}