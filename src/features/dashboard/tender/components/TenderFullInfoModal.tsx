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
  Route,
  Award,
  Trophy,
  CircleCheck,
  Paperclip,
  ChevronDown
} from "lucide-react";
import { ITender, ITenderRoute } from "@/features/log/types/tender.type";
import { tenderManagerService } from "@/features/log/services/tender.manager.service";
import { cn } from "@/shared/utils";
import { TenderMap } from "@/features/log/tender/components/TenderFullInfoMap";
import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useProfile } from "@/shared/hooks";
import Flag from "react-flagkit";
import { getCurrencySymbol } from "@/shared/utils/currency.utils";

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

export default function TenderFullInfoModal({
  tenderId,
}: {
  tenderId: number | null | undefined;
}) {
  const [tender, setTender] = useState<ITender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const { profile } = useProfile();
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

  const currencySymbol = getCurrencySymbol(tender?.valut_name);
  
  const myLastBid = useMemo(() => {
    if (!profile || !tender?.rate_company) return tender?.price_proposed || 0;
    const myLatest = [...tender.rate_company]
      .filter(r => r.id_author === profile.id)
      .sort((a, b) => b.id - a.id)[0];
    return myLatest ? myLatest.price_proposed : (tender.price_proposed || 0);
  }, [tender?.rate_company, profile, tender?.price_proposed]);

  const leaderBid = useMemo(() => {
    if (!tender?.rate_company || tender.rate_company.length === 0) return tender?.price_start || 0;
    const prices = tender.rate_company.map(r => r.price_proposed);
    return tender.ids_type === "AUCTION" ? Math.max(...prices) : Math.min(...prices);
  }, [tender?.rate_company, tender?.price_start, tender?.ids_type]);

  const sortedRoute = useMemo(() => 
    tender?.tender_route?.sort((a, b) => (a.order_num || 0) - (b.order_num || 0)) || [], 
    [tender?.tender_route]
  );

  const isWinner = (tender?.company_winner_car_count ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#09090b]">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Підготовка Даних</h2>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#f4f7fa] dark:bg-[#0c0c0e] relative overflow-hidden">
      
      {/* SCROLLABLE WRAPPER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-5 lg:p-10 pb-24 relative">
        
        {/* CLOSE BUTTON (Absolute inside relative scrollable container) */}
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 z-[60] p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
        >
          <X size={24} className="text-zinc-600 dark:text-zinc-400" />
        </button>

        {/* 🚀 HEADER: Status & Statistics */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-zinc-100 dark:border-white/5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                isWinner ? "bg-[#6366f1] shadow-indigo-100" : "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50"
              )}>
                <CircleCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="overflow-hidden">
                <h1 className={cn(
                  "text-2xl font-black uppercase tracking-tight leading-none truncate",
                  isWinner ? "text-[#4f46e5]" : "text-zinc-500"
                )}>
                  {isWinner ? "ВИ ПЕРЕМОГЛИ" : "ДЕТАЛІ ТЕНДЕРУ"}
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest truncate">
                  Ви подали найкращу ставку
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-5 py-2.5 bg-[#f8fafc] dark:bg-white/5 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-white/5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">час публікації тендера</span>
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 leading-none">{formatDate(tender.time_start)}</span>
              </div>
              {isWinner && (
                <button className="px-8 h-12 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 leading-none">
                  ПІДТВЕРДИТИ ВИКОНАННЯ ЗАМОВЛЕННЯ
                </button>
              )}
            </div>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-[#dbeafe] dark:border-indigo-900/30 shadow-sm flex items-center overflow-hidden h-[80px]">
               <div className="w-16 h-full flex items-center justify-center text-[#6366f1] shrink-0">
                 <Trophy className="w-7 h-7" />
               </div>
               <div className="w-[1px] h-10 bg-[#e2e8f0] dark:bg-white/10" />
               <div className="flex-1 px-5 py-3">
                 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5 block font-bold">ВИГРАШНА СТАВКА</span>
                 <div className="text-2xl font-black text-[#4f46e5] leading-none">
                   {leaderBid.toLocaleString()} {currencySymbol}
                 </div>
               </div>
            </div>
            <div className="bg-[#eff9f0] dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-500/10 shadow-sm flex items-center h-[80px]">
               <div className="w-3 text-emerald-100 shrink-0" />
               <div className="flex-1 px-5 py-4">
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5 block font-bold">МОЯ ОСТАННЯ СТАВКА</span>
                 <div className="text-2xl font-black text-emerald-600 leading-none">
                   {myLastBid.toLocaleString()} {currencySymbol}
                 </div>
               </div>
            </div>
            <div className="bg-[#f8fafc] dark:bg-white/5 rounded-[1.5rem] border border-zinc-100 dark:border-white/10 shadow-sm flex items-center overflow-hidden h-[80px]">
               <div className="flex-1 px-6 py-4 text-center">
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block font-bold">КРОК ПОНИЖЕННЯ</span>
                 <div className="text-2xl font-black text-zinc-700 dark:text-zinc-200 leading-none">
                   {tender.price_step || 0} {currencySymbol}
                 </div>
               </div>
            </div>
            <div className="bg-[#f8fafc] dark:bg-white/5 rounded-[1.5rem] border border-zinc-100 dark:border-white/10 shadow-sm flex items-center overflow-hidden h-[80px]">
               <div className="flex-1 px-6 py-4 text-center">
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block font-bold">СТАРТОВА ЦІНА</span>
                 <div className="text-2xl font-black text-zinc-700 dark:text-zinc-200 leading-none">
                   {tender.price_start?.toLocaleString()} {currencySymbol}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 🧩 MAIN CONTENT GRID */}
        <div className="grid grid-cols-12 gap-6 pb-20">
          
          {/* Left/Middle Column Group */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Tender Info */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-sm space-y-6 border border-zinc-50 dark:border-white/5">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Box size={20} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-300">ІНФОРМАЦІЯ ПРО ТЕНДЕР</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#f8fafc] dark:bg-white/5 p-4 px-6 rounded-2xl h-[52px] flex items-center">
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">№ {tender.id}</span>
                  </div>
                  <div className="bg-[#fff1f0] dark:bg-red-950/20 p-4 px-6 rounded-2xl flex items-center gap-3 border border-red-50 dark:border-red-900/10 h-[52px]">
                    <Calendar size={18} className="text-red-500" />
                    <span className="text-sm font-black text-red-600 uppercase">
                      {formatDate(tender.time_start)} — {formatDate(tender.time_end)}
                    </span>
                  </div>
                  <div className="bg-[#f8fafc] dark:bg-white/5 p-4 px-6 rounded-2xl h-[52px] flex items-center">
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 leading-none uppercase">
                      {tender.tender_type || "РЕДУКЦІОН З ВИКУПОМ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Contact Info */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-sm space-y-6 border border-zinc-50 dark:border-white/5">
                <div className="flex items-center gap-3 text-zinc-400">
                  <User size={20} className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-300">КОНТАКТНА ІНФОРМАЦІЯ</h3>
                </div>
                <div className="space-y-2">
                  <div className="bg-[#f8fafc] dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 h-[64px]">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                      <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-black text-zinc-900 dark:text-white leading-none capitalize truncate">{tender.author}</div>
                      <div className="text-[10px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">менеджер ICT</div>
                    </div>
                  </div>
                  <a href={`tel:${tender.usr_phone?.[0]?.phone}`} className="w-full bg-[#f8fafc] dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 text-sm font-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors h-[52px]">
                    <Phone size={18} className="text-[#6366f1] shrink-0" />
                    <span className="truncate">{tender.usr_phone?.[0]?.phone || "+38 0XX XXX XX XX"}</span>
                  </a>
                  <a href={`mailto:${tender.email}`} className="w-full bg-[#f8fafc] dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 text-sm font-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors h-[52px]">
                    <Mail size={18} className="text-[#6366f1] shrink-0" />
                    <span className="truncate">{tender.email || "ip@ict.lviv.ua"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Cargo Details */}
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-sm border border-zinc-50 dark:border-white/5">
               <div className="flex items-center gap-4 text-zinc-400 mb-8">
                 <Truck size={22} className="w-6 h-6 shrink-0" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-300 uppercase">ІНФОРМАЦІЯ ПРО ВАНТАЖ</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { icon: <Box size={16} />, label: "ВАНТАЖ", value: tender.cargo || "—" },
                   { icon: <Paperclip size={16} />, label: "ТРАНСПОРТНІ ДОКУМЕНТИ", value: <Paperclip size={18} className="text-zinc-400 rotate-45" /> },
                   { icon: <Truck size={16} />, label: "ТИП ТРАНСПОРТУ", value: <><span className="mr-auto truncate pr-2">{tender.tender_trailer?.map(t => t.trailer_type_name).join(", ") || "БУДЬ-ЯКИЙ"}</span> <ChevronDown size={14} className="shrink-0" /></>, isInteraction: true },
                   { icon: <Package size={16} />, label: "ТИП ЗАВАНТАЖЕННЯ", value: <><span className="mr-auto">ЗАДНЄ</span> <ChevronDown size={14} className="shrink-0" /></>, isInteraction: true },
                   { icon: <Truck size={16} />, label: "КІЛЬКІСТЬ АВТО", value: tender.car_count },
                   { icon: <Scale size={16} />, label: "КІЛЬКІСТЬ ПАЛЕТ", value: "33" },
                   { icon: <Box size={16} />, label: "ОБ'ЄМ", value: `${tender.volume} М³` },
                   { icon: <Scale size={16} />, label: "ВАГА", value: `${(tender.weight || 0)/1000} Т.` },
                 ].map((item, i) => (
                   <div key={i} className="bg-white dark:bg-white/5 border border-[#f1f5f9] dark:border-white/5 p-3 px-6 rounded-2xl flex items-center justify-between min-h-[52px]">
                     <div className="flex items-center gap-4 text-zinc-400 overflow-hidden shrink-0">
                       <span className="w-4 shrink-0 flex justify-center">{item.icon}</span>
                       <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pr-2 truncate">{item.label}</span>
                     </div>
                     <div className={cn("text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center leading-none text-right overflow-hidden", item.isInteraction && "flex-1 ml-4")}>
                       {item.value}
                     </div>
                   </div>
                 ))}

                 <div className="col-span-full border border-[#f1f5f9] dark:border-white/5 p-3 px-6 rounded-2xl flex items-center gap-4 mt-2 min-h-[52px]">
                   <span className="w-4 shrink-0 flex justify-center text-zinc-400"><Info size={16} /></span>
                   <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 shrink-0">ДОДАТКОВА ІНФОРМАЦІЯ</span>
                   <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 flex-1 truncate ml-4 italic uppercase">{tender.notes || "—"}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* --- Right Column: Route & Map --- */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-sm relative overflow-hidden border border-zinc-50 dark:border-white/5 min-h-fit">
              <div className="relative space-y-16">
                <div className="absolute left-[21px] top-10 bottom-10 w-[2px] border-l-2 border-dashed border-[#e2e8f0] dark:border-white/10 z-0" />
                
                {sortedRoute.map((point, idx) => (
                  <div key={point.id} className="relative z-10 flex gap-6">
                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                      point.ids_point === "LOAD_FROM" ? "bg-[#52c41a] text-white shadow-[#52c41a]/20" : 
                      "bg-[#6366f1] text-white shadow-[#6366f1]/20"
                    )}>
                      <MapPin size={24} />
                    </div>
                    
                    <div className="flex flex-col gap-1.5 pt-0.5 w-full">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full shrink-0",
                          point.ids_point === "LOAD_FROM" ? "bg-[#f6ffed] text-[#52c41a] border border-emerald-100" : 
                          "bg-[#f0f5ff] text-[#6366f1] border border-indigo-100"
                        )}>
                          {point.ids_point === "LOAD_FROM" ? "ЗАВАНТАЖЕННЯ" : "РОЗВАНТАЖЕННЯ"}
                        </span>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic leading-none shrink-0"># {idx + 1}</span>
                      </div>
                      <div className="mt-1">
                         <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight uppercase truncate">{point.city}</h4>
                         <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase tracking-widest truncate">{point.locality || point.address || "УКРАЇНА"}</p>
                      </div>

                      <div className="mt-5 bg-white dark:bg-white/5 border border-[#f1f5f9] dark:border-white/5 p-3 px-5 rounded-2xl flex items-center gap-4 w-full shadow-sm max-w-[200px]">
                        <Clock size={16} className="text-zinc-300 shrink-0" />
                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300 leading-none">{formatDateTime(point.date_point)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] shadow-sm border border-zinc-50 dark:border-white/5 overflow-hidden flex flex-col">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <MapPin className="text-[#6366f1]" size={20} />
                   <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-300 leading-none">МАРШРУТ НА КАРТІ</h3>
                 </div>
                 {distance && (
                    <div className="bg-[#f0f5ff] px-4 py-1.5 rounded-xl border border-indigo-100 text-[#4f46e5] font-black italic text-xs shrink-0">
                      {Math.round(distance)} КМ.
                    </div>
                 )}
              </div>
              <div className="flex-1 aspect-square md:aspect-video relative m-3 mt-0 rounded-[2.5rem] overflow-hidden min-h-[300px]">
                 <TenderMap points={sortedRoute} onReady={(d) => setDistance(d)} />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
