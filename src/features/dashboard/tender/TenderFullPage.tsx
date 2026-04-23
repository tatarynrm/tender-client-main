"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Truck, 
  Package, 
  Calendar, 
  Info, 
  Clock, 
  User, 
  Scale,
  Box,
  ChevronDown,
  CircleCheck,
  Paperclip,
  ArrowLeft,
  Trophy,
  Phone,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";

import { ITender } from "@/features/log/types/tender.type";
import { tenderManagerService } from "@/features/log/services/tender.manager.service";
import { cn } from "@/shared/utils";
import { TenderMap } from "@/features/log/tender/components/TenderFullInfoMap";
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

export default function TenderFullPage({
  tenderId,
}: {
  tenderId: number;
}) {
  const router = useRouter();
  const [tender, setTender] = useState<ITender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const { profile } = useProfile();

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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Завантаження тендеру...</h2>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col w-full relative mb-12"
    >
      
      {/* 🔙 BACK BUTTON & BREADCRUMBS */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-none">ТЕНДЕР #{tender.id}</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Повернення до списку</p>
        </div>
      </div>

      {/* 🚀 HEADER: Status & Statistics */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-white/40 dark:border-white/5 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
              isWinner ? "bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-indigo-200 dark:shadow-indigo-900/20" : "bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 shadow-sm border border-zinc-200/50 dark:border-white/5"
            )}>
              <CircleCheck className={cn("w-8 h-8", isWinner ? "text-white" : "text-zinc-400")} strokeWidth={2.5} />
            </div>
            <div className="overflow-hidden">
              <h1 className={cn(
                "text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none truncate drop-shadow-sm",
                isWinner ? "text-[#4f46e5]" : "text-zinc-800 dark:text-white"
              )}>
                {isWinner ? "ВИ ПЕРЕМОГЛИ" : "ДЕТАЛІ ТЕНДЕРУ"}
              </h1>
              <p className="text-[11px] font-bold text-zinc-400 mt-1.5 uppercase tracking-[0.2em] truncate">
                {isWinner ? "Ви подали найкращу ставку" : "Перегляд повної інформації"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-6 py-3 bg-white dark:bg-black/20 rounded-[1.25rem] flex flex-col items-center border border-zinc-100 dark:border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">час публікації тендера</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 leading-none">{formatDate(tender.time_start)}</span>
            </div>
            {isWinner && (
              <button className="px-8 h-14 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:opacity-90 text-white font-black uppercase tracking-[0.1em] text-xs rounded-[1.25rem] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-95 leading-none border border-white/20">
                ПІДТВЕРДИТИ ВИКОНАННЯ
              </button>
            )}
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900/50 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex items-center overflow-hidden h-[88px] group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
              <div className="w-20 h-full flex items-center justify-center text-[#6366f1] shrink-0 bg-indigo-50/50 dark:bg-indigo-900/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="flex-1 px-5 py-3">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">ВИГРАШНА СТАВКА</span>
                <div className="text-2xl font-black text-[#4f46e5] leading-none drop-shadow-sm">
                  {leaderBid.toLocaleString()} {currencySymbol}
                </div>
              </div>
          </div>
          <div className="bg-gradient-to-br from-[#eff9f0] to-[#e4f2e6] dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-[1.5rem] border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm flex items-center h-[88px]">
              <div className="w-3 text-emerald-100 shrink-0" />
              <div className="flex-1 px-5 py-4">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">МОЯ ОСТАННЯ СТАВКА</span>
                <div className="text-2xl font-black text-emerald-600 leading-none drop-shadow-sm">
                  {myLastBid.toLocaleString()} {currencySymbol}
                </div>
              </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-100 dark:border-white/10 shadow-sm flex items-center overflow-hidden h-[88px]">
              <div className="flex-1 px-6 py-4 text-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">КРОК ПОНИЖЕННЯ</span>
                <div className="text-2xl font-black text-zinc-800 dark:text-zinc-200 leading-none">
                  {tender.price_step || 0} {currencySymbol}
                </div>
              </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-100 dark:border-white/10 shadow-sm flex items-center overflow-hidden h-[88px]">
              <div className="flex-1 px-6 py-4 text-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">СТАРТОВА ЦІНА</span>
                <div className="text-2xl font-black text-zinc-800 dark:text-zinc-200 leading-none">
                  {tender.price_start?.toLocaleString()} {currencySymbol}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* 🧩 MAIN CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6 pb-8">
        
        {/* Left/Middle Column Group */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Tender Info */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm space-y-6 border border-white/40 dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-[100px] pointer-events-none" />
              <div className="flex items-center gap-3 text-zinc-400 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center border border-zinc-100 dark:border-white/5">
                  <Box size={20} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">ІНФОРМАЦІЯ ПРО ТЕНДЕР</h3>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="bg-zinc-50 dark:bg-white/5 p-4 px-6 rounded-2xl h-[56px] flex items-center justify-between border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Номер</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">№ {tender.id}</span>
                </div>
                <div className="bg-red-50/50 dark:bg-red-950/20 p-4 px-6 rounded-2xl flex items-center justify-between border border-red-100 dark:border-red-900/20 h-[56px]">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-red-500" />
                    <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Період</span>
                  </div>
                  <span className="text-sm font-black text-red-600 uppercase">
                    {formatDate(tender.time_start)} — {formatDate(tender.time_end)}
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-white/5 p-4 px-6 rounded-2xl h-[56px] flex items-center justify-between border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Тип</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 leading-none uppercase">
                    {tender.tender_type || "РЕДУКЦІОН З ВИКУПОМ"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Contact Info */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm space-y-6 border border-white/40 dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-[100px] pointer-events-none" />
              <div className="flex items-center gap-3 text-zinc-400 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center border border-zinc-100 dark:border-white/5">
                  <User size={20} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">КОНТАКТНА ІНФОРМАЦІЯ</h3>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="bg-zinc-50 dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 h-[64px] border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                    <User size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-black text-zinc-900 dark:text-white leading-none capitalize truncate">{tender.author}</div>
                    <div className="text-[10px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">менеджер ICT</div>
                  </div>
                </div>
                <a href={`tel:${tender.usr_phone?.[0]?.phone}`} className="group w-full bg-zinc-50 dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 text-sm font-black text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all h-[56px] border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={16} className="text-[#6366f1] shrink-0" />
                  </div>
                  <span className="truncate">{tender.usr_phone?.[0]?.phone || "+38 0XX XXX XX XX"}</span>
                </a>
                <a href={`mailto:${tender.email}`} className="group w-full bg-zinc-50 dark:bg-white/5 p-4 px-6 rounded-2xl flex items-center gap-4 text-sm font-black text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all h-[56px] border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail size={16} className="text-[#6366f1] shrink-0" />
                  </div>
                  <span className="truncate">{tender.email || "ip@ict.lviv.ua"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. Cargo Details */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-sm border border-white/40 dark:border-white/5">
              <div className="flex items-center gap-4 text-zinc-400 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                  <Truck size={24} className="text-indigo-500 shrink-0" />
                </div>
                <h3 className="text-base font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">ІНФОРМАЦІЯ ПРО ВАНТАЖ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Box size={18} />, label: "ВАНТАЖ", value: tender.cargo || "—" },
                  { icon: <Paperclip size={18} />, label: "ТРАНСПОРТНІ ДОКУМЕНТИ", value: <Paperclip size={18} className="text-zinc-400 rotate-45" /> },
                  { icon: <Truck size={18} />, label: "ТИП ТРАНСПОРТУ", value: <><span className="mr-auto truncate pr-2">{tender.tender_trailer?.map(t => t.trailer_type_name).join(", ") || "БУДЬ-ЯКИЙ"}</span> <ChevronDown size={14} className="shrink-0 text-zinc-400" /></>, isInteraction: true },
                  { icon: <Package size={18} />, label: "ТИП ЗАВАНТАЖЕННЯ", value: <><span className="mr-auto">ЗАДНЄ</span> <ChevronDown size={14} className="shrink-0 text-zinc-400" /></>, isInteraction: true },
                  { icon: <Truck size={18} />, label: "КІЛЬКІСТЬ АВТО", value: tender.car_count },
                  { icon: <Scale size={18} />, label: "КІЛЬКІСТЬ ПАЛЕТ", value: "33" },
                  { icon: <Box size={18} />, label: "ОБ'ЄМ", value: `${tender.volume} М³` },
                  { icon: <Scale size={18} />, label: "ВАГА", value: `${(tender.weight || 0)/1000} Т.` },
                ].map((item, i) => (
                  <div key={i} className="group bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-4 px-6 rounded-2xl flex items-center justify-between min-h-[64px] hover:shadow-md hover:border-zinc-200 dark:hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4 text-zinc-400 overflow-hidden shrink-0">
                      <span className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors shrink-0">{item.icon}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pr-2 truncate">{item.label}</span>
                    </div>
                    <div className={cn("text-sm font-black text-zinc-800 dark:text-zinc-200 flex items-center leading-none text-right overflow-hidden", item.isInteraction && "flex-1 ml-4")}>
                      {item.value}
                    </div>
                  </div>
                ))}

                <div className="col-span-full border border-zinc-200 border-dashed dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] p-5 px-6 rounded-2xl flex items-center gap-5 mt-2">
                  <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400"><Info size={20} /></span>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">ДОДАТКОВА ІНФОРМАЦІЯ</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 italic uppercase leading-snug">{tender.notes || "Відсутня"}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* --- Right Column: Route & Map --- */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-sm relative overflow-hidden border border-white/40 dark:border-white/5 min-h-fit">
            <div className="flex items-center gap-3 text-zinc-400 mb-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center border border-zinc-100 dark:border-white/5">
                  <MapPin size={20} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">МАРШРУТ ЗАВАНТАЖЕННЯ</h3>
            </div>
            
            <div className="relative space-y-12 pl-2">
              <div className="absolute left-[27px] top-6 bottom-6 w-[2px] border-l-2 border-dashed border-zinc-200 dark:border-white/10 z-0" />
              
              {sortedRoute.map((point, idx) => (
                <div key={point.id} className="relative z-10 flex gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white dark:border-zinc-900",
                    point.ids_point === "LOAD_FROM" ? "bg-gradient-to-br from-[#52c41a] to-[#389e0d] text-white shadow-[#52c41a]/30" : 
                    "bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[#6366f1]/30"
                  )}>
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-0.5 w-full">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full shrink-0",
                        point.ids_point === "LOAD_FROM" ? "bg-[#f6ffed] text-[#52c41a] border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50" : 
                        "bg-[#f0f5ff] text-[#6366f1] border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50"
                      )}>
                        {point.ids_point === "LOAD_FROM" ? "ЗАВАНТАЖЕННЯ" : "РОЗВАНТАЖЕННЯ"}
                      </span>
                      <span className="text-[11px] font-black text-zinc-300 uppercase tracking-widest italic leading-none shrink-0"># {idx + 1}</span>
                    </div>
                    <div className="mt-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {point.ids_country && <Flag country={point.ids_country} size={16} className="rounded-[2px]" />}
                          <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight uppercase truncate">{point.city}</h4>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest truncate">{point.locality || point.address || "УКРАЇНА"}</p>
                    </div>

                    <div className="mt-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-3 px-5 rounded-xl flex items-center gap-4 w-full max-w-[220px]">
                      <Clock size={16} className="text-zinc-400 shrink-0" />
                      <span className="text-[13px] font-black text-zinc-700 dark:text-zinc-300 leading-none">{formatDateTime(point.date_point)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[3rem] shadow-sm border border-white/40 dark:border-white/5 overflow-hidden flex flex-col p-3">
            <div className="p-6 pb-4 flex items-center justify-between px-7">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <MapPin className="text-[#6366f1]" size={16} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300 leading-none">КАРТА</h3>
                </div>
                {distance && (
                  <div className="bg-[#f0f5ff] dark:bg-indigo-900/20 px-4 py-1.5 rounded-[10px] border border-indigo-100 dark:border-indigo-500/20 text-[#4f46e5] dark:text-indigo-400 font-black italic text-xs shrink-0 shadow-sm">
                    {Math.round(distance)} КМ.
                  </div>
                )}
            </div>
            <div className="flex-1 aspect-square relative rounded-[2rem] overflow-hidden min-h-[300px] border border-zinc-100 dark:border-white/5">
                <TenderMap points={sortedRoute} onReady={(d) => setDistance(d)} />
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
