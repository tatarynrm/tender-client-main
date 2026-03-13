"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  MapPin, 
  Truck, 
  Package, 
  Calendar, 
  Info, 
  ShieldCheck, 
  Clock, 
  Coins, 
  User, 
  Building2,
  ThermometerSnowflake,
  Scale,
  Box,
  ChevronRight,
  Navigation,
  CheckCircle2,
  Phone,
  Mail,
  X,
  ArrowRight,
  Route
} from "lucide-react";
import { ITender, ITenderRoute } from "@/features/log/types/tender.type";
import { tenderManagerService } from "@/features/log/services/tender.manager.service";
import { cn } from "@/shared/utils";
import { TenderMap } from "@/features/log/tender/components/TenderFullInfoMap";
import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "@/shared/stores/useModalStore";

// --- FORMATTERS ---
const formatDateTime = (dateString?: string | Date | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleString('uk-UA', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString('uk-UA', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

const getStatusConfig = (status?: string) => {
  switch (status) {
    case "ANALYZE": return { label: "Аналіз", color: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" };
    case "WAITING": return { label: "Очікування", color: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" };
    case "FINISHED": return { label: "Завершено", color: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" };
    default: return { label: status || "Чернетка", color: "bg-zinc-500", light: "bg-zinc-50 dark:bg-zinc-500/10", text: "text-zinc-600 dark:text-zinc-400" };
  }
};

export default function TenderFullInfoModal({
  tenderId,
}: {
  tenderId: number | null | undefined;
}) {
  const [tender, setTender] = useState<ITender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { closeModal } = useModalStore();

  useEffect(() => {
    if (!tenderId) return;

    const loadTender = async () => {
      setIsLoading(true);
      try {
        const data = await tenderManagerService.getOneTender(tenderId);
        setTender(data);
      } catch (err) {
        console.error("Error loading tender:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTender();
  }, [tenderId]);

  const status = useMemo(() => getStatusConfig(tender?.ids_status), [tender?.ids_status]);
  const sortedRoute = useMemo(() => 
    tender?.tender_route?.sort((a, b) => (a.order_num || 0) - (b.order_num || 0)) || [], 
    [tender?.tender_route]
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#09090b]">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Route className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Підготовка Даних</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Збираємо інформацію для вас</p>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] dark:bg-[#09090b] overflow-hidden">
      
      {/* 💎 PREMIUM FULL-WIDTH HEADER */}
      <header className="relative z-30 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-white/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Package className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
                   Тендер <span className="text-indigo-600">№{tender.id}</span>
                 </h1>
                 <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", status.light, status.text)}>
                   {status.label}
                 </div>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">
                Створено: {formatDate(tender.time_start)} • {tender.tender_type || "Стандарт"}
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-8 border-l border-zinc-200 dark:border-white/10 pl-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1.5">Відповідальний</span>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">{tender.author}</span>
              </div>
            </div>
            {tender.rating && (
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1.5">Рейтинг</span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-xs font-black uppercase tracking-tighter">{tender.rating} / 5.0</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 bg-zinc-50 dark:bg-white/[0.03] px-8 py-3 rounded-2xl border border-zinc-200/50 dark:border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Початкова ставка</span>
              <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 leading-none">
                {tender.price_start?.toLocaleString()} <small className="text-[10px] font-bold opacity-60 uppercase">{tender.valut_name}</small>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-zinc-200 dark:border-white/10" />
            <div className="flex flex-col items-start leading-none gap-1.5">
              <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{tender.without_vat ? "Без ПДВ" : "З ПДВ"}</span>
              <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                <ShieldCheck className="w-2.5 h-2.5" />
                Protected Bid
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🌪 CONTENT GRID LAYOUT */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden h-full">
        
        {/* --- COL 1: SIDEBAR (INFO & STATS) --- */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 bg-white dark:bg-zinc-950/50 border-r border-zinc-200 dark:border-white/5 overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-20">
          
          {/* STATS CARDS */}
          <div className="space-y-4">
            <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 group hover:border-indigo-500/30 transition-all shadow-sm">
              <Truck className="w-6 h-6 text-indigo-500 mb-3" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Кількість авто</h4>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">{tender.car_count} <span className="text-sm font-bold opacity-40">ОД.</span></div>
            </div>
            <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all shadow-sm">
              <Scale className="w-6 h-6 text-emerald-500 mb-3" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Вага вантажу</h4>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">{(tender.weight || 0) / 1000} <span className="text-sm font-bold opacity-40">ТОНН</span></div>
            </div>
          </div>

          {/* TRAILER & CARGO */}
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 pl-1">Тип Транспорту</h4>
              <div className="flex flex-wrap gap-2">
                {tender.tender_trailer?.map(t => (
                  <div key={t.id} className="px-3 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-white/5">
                    {t.trailer_type_name}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 pl-1">Вантаж</h4>
              <div className="p-4 bg-zinc-50 dark:bg-white/[0.02] rounded-2xl border border-zinc-100 dark:border-white/5">
                 <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase leading-relaxed">{tender.cargo || "ТНП / Не вказано"}</p>
                 {tender.volume && <p className="text-[10px] font-bold text-indigo-500 mt-2">ОБ'ЄМ: {tender.volume} м³</p>}
              </div>
            </div>
          </div>

          {/* MANAGER CONTACT */}
          <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 pl-1">Відповідальний</h4>
             <div className="bg-white dark:bg-transparent rounded-3xl border border-zinc-100 dark:border-white/10 p-4 space-y-4 shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                    <User className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-900 dark:text-white uppercase leading-none">{tender.author}</span>
                    <span className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-tighter">Менеджер тендерів</span>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex items-center gap-3 text-zinc-400 hover:text-indigo-500 transition-colors cursor-pointer">
                   <Phone className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold">Контактний телефон</span>
                 </div>
                 <div className="flex items-center gap-3 text-zinc-400 hover:text-indigo-500 transition-colors cursor-pointer">
                   <Mail className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold truncate">{tender.email || "Email відсутній"}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* SECURITY BADGE */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl space-y-2">
             <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
               <ShieldCheck className="w-4 h-4" strokeWidth={3} />
               <span className="text-[9px] font-black uppercase tracking-widest">Verified Tender</span>
             </div>
             <p className="text-[9px] font-medium text-emerald-600/60 dark:text-emerald-400/60 leading-tight">Цей тендер пройшов перевірку безпеки нашої платформи.</p>
          </div>
        </aside>

        {/* --- COL 2: MAIN AREA (TIMELINE & ROUTE) --- */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 bg-[#fcfdfe] dark:bg-zinc-900/10 overflow-y-auto custom-scrollbar p-8 space-y-10 relative z-10 shadow-[inner_0px_0px_40px_rgba(0,0,0,0.02)]">
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-3 leading-none">
              <Route className="w-5 h-5 text-indigo-500" />
              Логістичний ланцюг
            </h3>
            <div className="px-3 py-1 bg-zinc-200 dark:bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-500">
              {sortedRoute.length} Точки
            </div>
          </div>

          <div className="relative pl-12 pr-4 min-h-full">
            {/* TIMELINE VERTICAL PATH */}
            <div className="absolute left-[22px] top-6 bottom-4 w-[3px] bg-gradient-to-b from-emerald-500 via-indigo-500 to-rose-500 rounded-full opacity-20" />
            
            <div className="space-y-12">
              {sortedRoute.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id} 
                  className="relative group cursor-default"
                >
                  {/* ICON INDICATOR */}
                  <div className={cn(
                    "absolute -left-[48px] top-0 w-14 h-14 rounded-2xl flex items-center justify-center z-10 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                    item.ids_point === "LOAD_FROM" ? "bg-emerald-500 text-white shadow-emerald-500/40" : 
                    item.ids_point === "LOAD_TO" ? "bg-rose-500 text-white shadow-rose-500/40" : 
                    "bg-white dark:bg-slate-800 text-indigo-500 border-2 border-indigo-500/30"
                  )}>
                    {item.ids_point === "LOAD_FROM" ? <Navigation className="w-7 h-7" /> : 
                     item.ids_point === "LOAD_TO" ? <MapPin className="w-7 h-7" /> : 
                     <Clock className="w-6 h-6" />}
                  </div>

                  {/* CONTENT CARD */}
                  <div className="bg-white dark:bg-white/[0.03] p-6 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            item.ids_point === "LOAD_FROM" ? "bg-emerald-500/10 text-emerald-600" :
                            item.ids_point === "LOAD_TO" ? "bg-rose-500/10 text-rose-600" :
                            "bg-indigo-500/10 text-indigo-600"
                          )}>
                            {item.point_name || (item.ids_point === "LOAD_FROM" ? "Завантаження" : item.ids_point === "LOAD_TO" ? "Розвантаження" : "Точка")}
                          </span>
                          {item.customs && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase rounded border border-amber-500/20">Mитниця</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 tracking-tighter">POINT #{idx + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-zinc-900 dark:text-white leading-none tracking-tight">{item.city}</h4>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-6 line-clamp-2 italic">{item.address || item.locality || "Адреса узгоджується"}</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-50 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-500/5 rounded-xl">
                             <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Планова дата</span>
                             <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 leading-none">{formatDateTime(item.date_point)}</span>
                           </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* --- COL 3: THE MAP (IMMERSIVE AREA) --- */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-6 relative bg-zinc-100 dark:bg-black overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 z-0 scale-105 filter blur-[0.1px] group">
            <TenderMap points={sortedRoute} />
          </div>

          {/* FLOAT OVERLAYS */}
          <div className="absolute top-8 right-8 z-10 flex flex-col gap-4">
            
            {/* TIMER OVERLAY */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-600/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl shadow-rose-900/40 text-white min-w-[240px] border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">Завершення</span>
                </div>
                <div className="animate-pulse w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
              </div>
              <div className="text-3xl font-black italic tracking-tighter leading-none mb-1">
                {formatDateTime(tender.time_end)}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-rose-200 opacity-70">Дедлайн прийому ставок</p>
            </motion.div>

            {/* QUICK ACTIONS / INFO */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] max-w-[360px] space-y-6 relative z-20"
            >
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 border-b border-zinc-100 dark:border-white/5 pb-4">
                <Info className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] leading-none">Деталі перевезення</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 bg-zinc-50 dark:bg-white/[0.03] rounded-3xl border border-zinc-100 dark:border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <ThermometerSnowflake className="w-4 h-4 text-blue-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Температура</span>
                     </div>
                     <span className="text-sm font-black text-zinc-900 dark:text-white">{tender.ref_temperature_from ?? "—"}° / {tender.ref_temperature_to ?? "—"}°</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <Box className="w-4 h-4 text-indigo-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Упаковка</span>
                     </div>
                     <span className="text-sm font-black text-zinc-900 dark:text-white">Standart</span>
                   </div>
                </div>

                <div className="p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 block mb-3 leading-none underline underline-offset-4 decoration-indigo-500/30">Примітки менеджера</span>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                    {tender.notes || "Будь ласка, зверніть увагу на точність термінів доставки в точках завантаження та вивантаження."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM MAP BRANDS / INFO */}
          <div className="absolute bottom-10 left-10 right-10 z-10 hidden xl:flex items-center justify-between">
             <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">{i === 1 ? 'U' : i === 2 ? 'L' : '+'}</div>)}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">6 учасників вже беруть участь</span>
             </div>

             <div className="bg-white dark:bg-zinc-950 px-8 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-zinc-200 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Маршрут:</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                  {sortedRoute[0]?.city} <ChevronRight className="w-3 h-3 text-indigo-500" /> {sortedRoute[sortedRoute.length-1]?.city}
                </span>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
