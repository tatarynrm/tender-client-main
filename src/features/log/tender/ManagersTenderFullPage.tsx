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
  ArrowLeft,
  Trophy,
  Phone,
  Mail,
  FileStack,
  Paperclip,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

import { ITender, ITenderRoute } from "../types/tender.type";
import { cn } from "@/shared/utils";
import Flag from "react-flagkit";
import { tenderManagerService } from "@/features/log/services/tender.manager.service";
import dynamic from "next/dynamic";

const TenderMap = dynamic(
  () => import("@/features/log/tender/components/TenderFullInfoMap").then(mod => mod.TenderMap),
  { ssr: false }
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

const formatDateTime = (dateString?: string | Date | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ManagersTenderFullPage({
  tenderId,
}: {
  tenderId: number;
}) {
  const router = useRouter();
  const [tender, setTender] = useState<ITender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const fetchTender = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await tenderManagerService.getOneTender(tenderId);
        const finalData = Array.isArray(data) ? data[0] : data;
        if (!finalData) {
          setError("Тендер не знайдено");
        } else {
          setTender(finalData);
        }
      } catch (err) {
        console.error("Failed to fetch tender", err);
        setError("Не вдалося завантажити дані тендеру");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTender();
  }, [tenderId]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
            Завантаження тендеру...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Info size={48} className="text-zinc-400" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
          {error}
        </h2>
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-indigo-500 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-600"
        >
          Повернутися назад
        </button>
      </div>
    );
  }

  if (!tender) return null;

  const currencySymbol = getCurrencySymbol(tender?.valut_name);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full flex-col gap-3 overflow-hidden"
    >
      {/* 🚀 TOP HEADER */}
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <ArrowLeft
                size={16}
                className="text-zinc-600 dark:text-zinc-400"
              />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
                Тендер # {tender.id}
              </h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Детальна інформація
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-4 py-1.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
              час публікації тендера
            </span>
            <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">
              {formatDateTime(tender.time_start)}
            </span>
          </div>
        </div>

        {/* 📊 STATS ROW */}
        <div className="grid grid-cols-1 gap-2 px-1 md:grid-cols-4 lg:gap-3">
          <div className="group flex h-[64px] items-center rounded-[1.5rem] border-2 border-indigo-500/20 bg-white p-1 pr-3 shadow-sm transition-all hover:border-indigo-500/40 dark:bg-zinc-900/50 dark:hover:border-indigo-500/60">
            <div className="flex h-full w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1 px-3">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-indigo-400">
                ВИГРАШНА СТАВКА
              </span>
              <div className="text-lg font-black leading-none tracking-tight text-indigo-600 dark:text-indigo-400">
                {leaderBid.toLocaleString()} {currencySymbol}
              </div>
            </div>
          </div>

          <div className="group flex h-[64px] items-center rounded-[1.5rem] border-2 border-emerald-500/20 bg-white p-1 pr-3 shadow-sm transition-all hover:border-emerald-500/40 dark:bg-zinc-900/50 dark:hover:border-emerald-500/60">
            <div className="flex h-full w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30">
              <Layers className="h-6 w-6" />
            </div>
            <div className="flex-1 px-3">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-emerald-500">
                КІЛЬКІСТЬ СТАВОК
              </span>
              <div className="text-lg font-black leading-none tracking-tight text-emerald-600 dark:text-emerald-400">
                {tender.rate_company?.length || 0}
              </div>
            </div>
          </div>

          <div className="group flex h-[64px] items-center rounded-[1.5rem] border-2 border-zinc-200 bg-white p-1 shadow-sm transition-all hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-white/20">
            <div className="flex-1 px-4 text-center">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-zinc-400">
                КРОК ПОНИЖЕННЯ
              </span>
              <div className="text-lg font-black leading-none text-zinc-800 dark:text-zinc-200">
                {tender.price_step || 0} {currencySymbol}
              </div>
            </div>
          </div>
          <div className="group flex h-[64px] items-center rounded-[1.5rem] border-2 border-zinc-200 bg-white p-1 shadow-sm transition-all hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-white/20">
            <div className="flex-1 px-4 text-center">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-zinc-400">
                СТАРТОВА ЦІНА
              </span>
              <div className="text-lg font-black leading-none text-zinc-800 dark:text-zinc-200">
                {tender.price_start?.toLocaleString()} {currencySymbol}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 MAIN CONTENT */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3 overflow-hidden lg:gap-4">
        {/* LEFT COLUMN: Info + Cargo */}
        <div className="custom-scrollbar col-span-12 flex flex-col gap-3 overflow-y-auto pr-1 lg:col-span-8 lg:gap-4">
          <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
            {/* 1. Tender Info */}
            <div className="relative h-fit space-y-4 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-zinc-900/60 lg:p-6">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                  <Box size={16} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">
                  ІНФОРМАЦІЯ ПРО ТЕНДЕР
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 px-5 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    № ТЕНДЕРУ
                  </span>
                  <span className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    {tender.id}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-rose-100 bg-rose-50/50 p-3 px-5 dark:border-rose-900/20 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-rose-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">
                      ЧАС ТЕНДЕРУ
                    </span>
                  </div>
                  <span className="text-sm font-black italic text-rose-600 dark:text-rose-400">
                    {formatDate(tender.time_start)} —{" "}
                    {formatDate(tender.time_end)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 px-5 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    ВИД ТЕНДЕРУ
                  </span>
                  <span className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    {tender.tender_type || "РЕДУКЦІОН З ВИКУПОМ"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Contact Info */}
            <div className="h-fit space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-zinc-900/60 lg:p-6">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                  <User size={16} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">
                  КОНТАКТНА ІНФОРМАЦІЯ
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 px-5 dark:border-white/5 dark:bg-white/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-500 dark:bg-white/10">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="truncate capitalize text-[13px] font-black leading-none text-zinc-900 dark:text-white">
                      {tender.author}
                    </div>
                    <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                      менеджер ICT
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${tender.usr_phone?.[0]?.phone}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 px-5 transition-all hover:border-indigo-500/30 dark:border-white/5 dark:bg-white/5"
                >
                  <Phone size={16} className="text-indigo-500" />
                  <span className="text-[13px] font-black text-zinc-700 dark:text-zinc-300">
                    {tender.usr_phone?.[0]?.phone || "+38 095 689 15 76"}
                  </span>
                </a>
                <a
                  href={`mailto:${tender.email}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 px-5 transition-all hover:border-indigo-500/30 dark:border-white/5 dark:bg-white/5"
                >
                  <Mail size={16} className="text-indigo-500" />
                  <span className="truncate text-[13px] font-black text-zinc-700 dark:text-zinc-300">
                    {tender.email || "ip@ict.lviv.ua"}
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. Cargo Details */}
          <div className="flex shrink-0 flex-col rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-zinc-900/60 lg:p-6">
            <div className="mb-4 flex items-center gap-3 text-zinc-400 lg:mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                <Truck size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">
                ІНФОРМАЦІЯ ПРО ВАНТАЖ
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
              {[
                {
                  icon: <Box size={14} />,
                  label: "ВАНТАЖ",
                  value: tender.cargo || "—",
                },
                {
                  icon: <FileStack size={14} />,
                  label: "ТРАНСПОРТНІ ДОКУМЕНТИ",
                  value: <Paperclip size={14} className="rotate-45" />,
                },
                {
                  icon: <Truck size={14} />,
                  label: "ТИП ТРАНСПОРТУ",
                  value:
                    tender.tender_trailer?.[0]?.trailer_type_name ||
                    "БУДЬ-ЯКИЙ",
                },
                {
                  icon: <Truck size={14} />,
                  label: "ТИП ЗАВАНТАЖЕННЯ",
                  value: tender.tender_load?.[0]?.load_type_name || "ЗАДНЄ",
                },
                {
                  icon: <Truck size={14} />,
                  label: "КІЛЬКІСТЬ АВТО",
                  value: tender.car_count,
                },
                {
                  icon: <Box size={14} />,
                  label: "КІЛЬКІСТЬ ПАЛЕТ",
                  value: "33",
                },
                {
                  icon: <Box size={14} />,
                  label: "ОБ'ЄМ",
                  value: `${tender.volume} М³`,
                },
                {
                  icon: <Scale size={14} />,
                  label: "ВАГА",
                  value: `${tender.weight || 0} Т.`,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-2 px-4 transition-all dark:border-white/5 dark:bg-white/5"
                >
                  <div className="flex shrink-0 items-center gap-2 text-zinc-400">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-100 bg-white text-zinc-400 dark:border-white/10 dark:bg-zinc-900">
                      {item.icon}
                    </span>
                    <span className="truncate text-[8px] font-black uppercase tracking-widest text-zinc-400">
                      {item.label}
                    </span>
                  </div>
                  <div className="ml-2 flex flex-1 justify-end truncate text-right text-[12px] font-black leading-none text-zinc-800 dark:text-zinc-200">
                    {item.value}
                  </div>
                </div>
              ))}

              <div className="col-span-full mt-1 flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-3 px-5 dark:border-white/10 dark:bg-white/[0.02]">
                <Info size={16} className="shrink-0 text-amber-500" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    ДОДАТКОВА ІНФОРМАЦІЯ
                  </span>
                  <span className="truncate italic uppercase text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    {tender.notes || "Відсутня"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Route + Map */}
        <div className="col-span-12 flex min-h-0 flex-col gap-3 overflow-hidden pr-1 lg:col-span-4 lg:gap-4">
          {/* Route Timeline */}
          <div className="relative flex min-h-[200px] flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-zinc-900/60 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                  <MapPin size={18} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-300">
                  МАРШРУТ
                </h3>
              </div>
            </div>

            <div className="custom-scrollbar-thin flex-1 overflow-y-auto pr-2">
              <div className="relative pb-6 pl-1 space-y-6">
                <div className="absolute bottom-2 left-[19px] top-4 z-0 w-[2px] border-l-2 border-dashed border-zinc-200 dark:border-white/10" />

                {sortedRoute.map((point, idx) => (
                  <div key={point.id} className="relative z-10 flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {point.ids_country ? (
                          <div className="flex items-center justify-center rounded-sm overflow-hidden shadow-sm">
                            <Flag country={point.ids_country} size={16} />
                          </div>
                        ) : (
                          <MapPin size={14} className="text-zinc-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.05em]",
                            point.ids_point === "LOAD_FROM"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-900/20"
                              : "border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-900/20",
                          )}
                        >
                          {point.ids_point === "LOAD_FROM"
                            ? "ЗАВАНТАЖЕННЯ"
                            : "РОЗВАНТАЖЕННЯ"}
                        </span>
                        <span className="text-[9px] font-black italic text-zinc-300">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h4 className="truncate text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
                          {point.city}
                        </h4>
                        <p className="truncate text-[8px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
                          {point.locality || "УКРАЇНА"}
                        </p>
                      </div>

                      <div className="flex w-fit items-center gap-2 rounded-lg border border-zinc-100 bg-white p-1.5 px-3 dark:border-white/5 dark:bg-zinc-800/40">
                        <Clock size={10} className="text-zinc-400" />
                        <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">
                          {formatDateTime(point.date_point)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/5 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between p-2 px-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-indigo-500" size={12} />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  МАРШРУТ НА КАРТІ
                </h3>
              </div>
              {distance && (
                <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[9px] font-black italic text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  {Math.round(distance)} КМ.
                </span>
              )}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-[1.5rem] border border-zinc-100 dark:border-white/5">
              <TenderMap points={sortedRoute} onReady={(d) => setDistance(d)} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
