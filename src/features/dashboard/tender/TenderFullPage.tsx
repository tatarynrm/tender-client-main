"use client";

import { useEffect, useState } from "react";
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
  CircleCheck,
  ArrowLeft,
  Trophy,
  Phone,
  Mail,
  Layers,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";

import { ITender } from "@/features/log/types/tender.type";
import { tenderClientsService } from "@/features/dashboard/services/tender.clients.service";
import { cn } from "@/shared/utils";
import Flag from "react-flagkit";
import dynamic from "next/dynamic";
import { useProfile } from "@/shared/hooks";
import {
  formatTenderDateTime,
  formatTenderDate,
} from "@/shared/utils/date.utils";

const InfoField = ({ label, value, icon: Icon, className }: any) => (
  <div className={cn("relative flex flex-col w-full group", className)}>
    <div className="relative flex items-center h-9 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 px-3 transition-all group-hover:border-indigo-500/30">
      {Icon && (
        <div className="text-slate-400 mr-2.5 shrink-0">
          <Icon size={14} strokeWidth={2} />
        </div>
      )}
      <div className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate flex-1">
        {value || "—"}
      </div>
      <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-[#0c0c0e] text-[9px] font-bold uppercase tracking-wider text-indigo-500/80">
        {label}
      </label>
    </div>
  </div>
);

const InfoArea = ({ label, value, icon: Icon, className }: any) => (
  <div className={cn("relative flex flex-col w-full group", className)}>
    <div className="relative flex items-start min-h-[70px] py-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 px-3 transition-all group-hover:border-indigo-500/30">
      {Icon && (
        <div className="text-slate-400 mr-2.5 mt-0.5 shrink-0">
          <Icon size={14} strokeWidth={2} />
        </div>
      )}
      <div className="text-[12px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
        {value || "Відсутня"}
      </div>
      <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-[#0c0c0e] text-[9px] font-bold uppercase tracking-wider text-indigo-500/80">
        {label}
      </label>
    </div>
  </div>
);

const TenderMap = dynamic(
  () =>
    import("@/features/log/tender/components/TenderFullInfoMap").then(
      (mod) => mod.TenderMap,
    ),
  { ssr: false },
);

const getCurrencySymbol = (valut?: string) => {
  switch (valut) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    default:
      return "₴";
  }
};

export default function TenderFullPage({ tenderId }: { tenderId: number }) {
  const router = useRouter();
  const [tender, setTender] = useState<ITender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (!tenderId) return;
    const loadTender = async () => {
      setIsLoading(true);
      try {
        const data = await tenderClientsService.getOneTender(tenderId);
        if (!data) setError("Тендер не знайдено");
        else setTender(data);
      } catch (err) {
        setError("Не вдалося завантажити дані тендеру");
      } finally {
        setIsLoading(false);
      }
    };
    loadTender();
  }, [tenderId]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          Завантаження...
        </h2>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Info size={40} className="text-slate-300" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {error || "Помилка"}
        </h2>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          Повернутися
        </button>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(tender?.valut_name);
  const myLastBid =
    !profile || !tender?.rate_company
      ? tender?.price_proposed || 0
      : [...tender.rate_company]
          .filter((r) => r.id_author === profile.id)
          .sort((a, b) => b.id - a.id)[0]?.price_proposed ||
        tender.price_proposed ||
        0;
  const leaderBid =
    !tender?.rate_company || tender.rate_company.length === 0
      ? tender?.price_start || 0
      : tender.ids_type === "AUCTION"
        ? Math.max(...tender.rate_company.map((r) => r.price_proposed || 0))
        : Math.min(
            ...tender.rate_company.map((r) => r.price_proposed || Infinity),
          );
  const sortedRoute =
    tender?.tender_route?.sort(
      (a, b) => (a.order_num || 0) - (b.order_num || 0),
    ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full w-full flex-col gap-3 lg:overflow-hidden p-0 custom-scrollbar"
    >
      {/* 🚀 HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard/tender/active");
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900 transition-all"
          >
            <ArrowLeft
              size={14}
              className="text-slate-600 dark:text-slate-400"
            />
          </button>
        </div>

        <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
            Опубліковано: {formatTenderDateTime(tender.time_start)}
          </p>
        </div>
      </div>

      {/* 📊 STATS */}

      {/* 📊 MAIN GRID AREA */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 lg:overflow-hidden">
        {/* LEFT COLUMN (9 cols) - Content that can scroll if needed */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 lg:overflow-y-auto pr-1 custom-scrollbar pb-4">
          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center h-20 rounded-[1.5rem] border-2 border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-900/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-200 bg-white dark:bg-slate-800 text-indigo-500 shadow-sm shrink-0">
                <Trophy size={24} />
              </div>
              <div className="flex flex-col flex-1 items-center justify-center">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">
                  Виграшна ставка
                </span>
                <div className="text-[22px] font-black text-indigo-600 leading-none mt-1">
                  {leaderBid.toLocaleString()} {currencySymbol}
                </div>
              </div>
            </div>

            <div className="flex items-center h-20 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-900/10 p-4">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                  Кількість ставок
                </span>
                <div className="text-[22px] font-black text-emerald-600 leading-none mt-1">
                  5
                </div>
              </div>
            </div>

            <div className="flex items-center h-20 rounded-[1.5rem] border border-slate-200 bg-white dark:bg-slate-900 p-4">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Крок пониження
                </span>
                <div className="text-[22px] font-black text-slate-600 dark:text-slate-200 leading-none mt-1">
                  {tender.price_step || 0} {currencySymbol}
                </div>
              </div>
            </div>

            <div className="flex items-center h-20 rounded-[1.5rem] border border-slate-200 bg-white dark:bg-slate-900 p-4">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Стартова ціна
                </span>
                <div className="text-[22px] font-black text-slate-600 dark:text-slate-200 leading-none mt-1">
                  {tender.price_start?.toLocaleString()} {currencySymbol}
                </div>
              </div>
            </div>
          </div>

          {/* INFO & CONTACTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[2rem] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Box size={18} className="text-slate-400" />
                <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-200">
                  Інформація про тендер
                </h3>
              </div>
              <div className="space-y-4">
                <InfoField label="№ Тендеру" value={tender.id} />
                <InfoField
                  label="Вид тендеру"
                  value={tender.tender_type || "Редукціон з викупом"}
                />
              </div>
            </div>

            <div className="p-5 rounded-[2rem] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-200">
                  Контактна інформація
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 px-4">
                  <User size={16} className="text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">
                      {tender.author}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                      менеджер ICT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 px-4">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {tender.usr_phone?.[0]?.phone || "+380..."}
                  </span>
                </div>
                <div className="flex items-center gap-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 px-4">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {tender.email || "manager@ict.lviv.ua"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARGO INFO */}
          <div className="p-6 rounded-[2rem] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-slate-400" />
              <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-200">
                Інформація про вантаж
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <InfoField label="Вантаж" value={tender.cargo} />
                <InfoField
                  label="Тип транспорту"
                  value={
                    tender.tender_trailer?.[0]?.trailer_type_name || "Будь-який"
                  }
                />
                <InfoField label="Кількість авто" value={tender.car_count} />
                <InfoField label="Об'єм" value={`${tender.volume || 0} м³`} />
              </div>
              <div className="space-y-4">
                <InfoField label="Транспортні документи" value="—" />
                <InfoField
                  label="Тип завантаження"
                  value={tender.tender_load?.[0]?.load_type_name || "Заднє"}
                />
                <InfoField label="Кількість палет" value="—" />
                <InfoField label="Вага" value={`${tender.weight || 0} т`} />
              </div>
              <div className="col-span-full pt-2">
                <InfoArea label="Додаткова інформація" value={tender.notes} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols) - Sidebar exactly as in photo */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:overflow-hidden h-full">
          {/* Route Block */}
          <div className="flex flex-col  bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="relative pl-8 space-y-8 pb-4">
                <div className="absolute left-[13px] top-6 bottom-4 w-[2px] border-l-2 border-dashed border-indigo-200 dark:border-indigo-900/50" />
                {sortedRoute.map((point, idx) => (
                  <div key={point.id} className="relative">
                    <div className="absolute -left-[32px] top-0 flex flex-col items-center gap-2">
                      <div className="h-4 w-6 rounded-sm overflow-hidden border border-slate-100 shadow-sm shrink-0">
                        {point.ids_country ? (
                          <Flag country={point.ids_country} size={24} />
                        ) : (
                          <div className="w-full h-full bg-slate-100" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border",
                            point.ids_point === "LOAD_FROM"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-indigo-50 text-indigo-600 border-indigo-200",
                          )}
                        >
                          {point.ids_point === "LOAD_FROM"
                            ? "Завантаження"
                            : "Розвантаження"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-300 italic">
                          # {idx + 1}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-none">
                          {point.city}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {point.city}, {point.locality || "УКРАЇНА"}
                        </p>
                      </div>
                      {point.date_point && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-white dark:bg-slate-800/30 dark:border-white/5 shadow-sm">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">
                            {formatTenderDateTime(point.date_point)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Block */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-4 shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Маршрут на карті
                </h3>
              </div>
              {distance && (
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-black text-slate-500">
                  {Math.round(distance)} км.
                </div>
              )}
            </div>
            <div className="h-66 rounded-[1.1rem] overflow-hidden border border-slate-100 dark:border-white/5 relative">
              <TenderMap points={sortedRoute} onReady={setDistance} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
