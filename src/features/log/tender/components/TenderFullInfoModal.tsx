"use client";

import React, { useEffect, useState } from "react";
import { ITender } from "../../types/tender.type";
import {
  X,
  MapPin,
  Truck,
  Box,
  FileText,
  ArrowLeft,
  Calendar,
  Weight,
  Ruler,
  ShieldCheck,
  Info,
  Download,
  Building2,
  User2,
  Timer,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  ListFilter,
} from "lucide-react";
import { tenderManagerService } from "../../services/tender.manager.service";
import { cn } from "@/shared/utils";
import { TenderMap } from "./TenderFullInfoMap"; // Переконайся, що шлях правильний
import { pdf } from "@react-pdf/renderer";
import { toPng } from "html-to-image";
import { TenderFullInfoPDF } from "@/shared/components/PDF/Tender PDF/TenderFullInfoPDF";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { getRegionName } from "@/shared/utils/region.utils";
import { formatTenderDate, getTenderLoadDateString } from "@/shared/utils/date.utils";
import { getCurrencySymbol } from "@/shared/utils/currency.utils";

export default function TenderFullInfoModal({
  tenderId,
  onClose,
}: {
  tenderId: number | null | undefined;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const [tender, setTender] = useState<ITender | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  // Стан для перемикання табів на мобільному (деталі або карта)
  const [activeMobileTab, setActiveMobileTab] = useState<"details" | "map">(
    "details",
  );

  useEffect(() => {
    if (!tenderId) return;
    const loadTender = async () => {
      try {
        const data = await tenderManagerService.getOneTender(tenderId);
        setTender(data);
      } catch (err) {
        console.error("Помилка завантаження:", err);
      }
    };
    loadTender();
  }, [tenderId]);

  const formatTenderDate = (d1: string | Date | null | undefined, d2?: string | Date | null | undefined) => {
    if (!d1 && !d2) return null;
    
    const formatDate = (d: string | Date) => {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return "";
      
      const hasTime = dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;
      const datePart = dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      if (hasTime) {
        const timePart = dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
        return `${datePart} ${timePart}`;
      }
      return datePart;
    };

    const parts = [];
    if (d1) parts.push(formatDate(d1));
    if (d2) parts.push(formatDate(d2));
    
    return parts.join(" / ");
  };

  const isManager = profile?.role?.is_manager || profile?.role?.is_admin;

  const handleDownloadPDF = async () => {
    if (!tender) return;
    setIsExporting(true);
    try {
      const mapElement = document.getElementById("map-capture-area");
      if (!mapElement) throw new Error("Map not found");

      const mapImageData = await toPng(mapElement, {
        cacheBust: true,
        pixelRatio: 1.5,
        filter: (node) =>
          !["leaflet-control-container"].some((cls) =>
            node?.classList?.contains(cls),
          ),
      });

      const blob = await pdf(
        <TenderFullInfoPDF tender={tender} mapImage={mapImageData} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tender_Details_${tender.id}.pdf`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!tenderId) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10 transition-opacity duration-300",
        tender ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="relative w-full max-w-[1240px] bg-white dark:bg-zinc-950 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] rounded-[32px] flex flex-col overflow-hidden h-full max-h-[90vh]">
        
        {/* Modern Header */}
        <header className="h-[70px] shrink-0 border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 flex items-center justify-between px-8 z-20 relative">
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-500/20">
               <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                 № {tender?.id}
               </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-widest leading-none">
                  ТЕНДЕРНА ПРОПОЗИЦІЯ
                </h1>
                <span className="bg-sky-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {tender?.ids_status || "Активний"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? "Експорт..." : "Експорт PDF"}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>
        </header>

      {!tender ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950 rounded-[32px]">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Завантаження даних...
            </span>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* --- DATA PANEL (Справа на десктопі) --- */}
          <div className="w-full lg:w-[420px] bg-white dark:bg-zinc-950 flex flex-col shrink-0 lg:border-r border-zinc-100 dark:border-zinc-900 overflow-hidden order-2 lg:order-1">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">
              
              {/* ДОДАТКОВА ІНФОРМАЦІЯ (Amber Card) */}
              <div className="bg-amber-50/80 dark:bg-amber-500/5 p-5 rounded-[2rem] border border-amber-100/50 dark:border-amber-500/10 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-amber-500 rounded-lg p-1.5 shrink-0 shadow-sm shadow-amber-500/20">
                    <Info size={14} className="text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest leading-none">
                    Додаткова інформація
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed font-bold text-amber-900/80 dark:text-amber-200/80 whitespace-pre-wrap">
                  ТЕНДЕР до 18:00. {tender?.notes || "Будь ласка, зверніть увагу на терміни доставки."}
                </p>
              </div>

              {/* INFO BLOCKS */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-[1.5rem] border border-zinc-100/50 dark:border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shadow-sm">
                    <User2 size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 leading-none">Менеджер</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white uppercase leading-tight">{tender?.author || "—"}</span>
                  </div>
                </div>

                  {isManager && (
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-[1.5rem] border border-zinc-100/50 dark:border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shadow-sm">
                        <Building2 size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 leading-none">Компанія</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white uppercase leading-tight truncate">{tender?.company_name || "—"}</span>
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-[1.5rem] border border-emerald-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-emerald-500 shadow-sm">
                    <Box size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-0.5 leading-none">Початкова Ціна</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                      {tender?.price_start?.toLocaleString()} {getCurrencySymbol(tender?.valut_name)}
                    </span>
                  </div>
                </div>
              </div>

              {/* МАРШРУТ */}
              <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Маршрут</h4>
                <div className="relative pl-10 space-y-10">
                  <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-indigo-100 dark:bg-indigo-900/30" />
                  {tender?.tender_route?.map((r, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === (tender?.tender_route?.length || 0) - 1;
                    const pointDate = getTenderLoadDateString(r.date_point, r.date_point2);
                    return (
                      <div key={r.id} className="relative">
                        <div className={cn(
                          "absolute -left-[33px] top-0 w-8 h-8 rounded-xl flex items-center justify-center z-10 border-2 border-white dark:border-zinc-900",
                          isFirst ? "bg-emerald-500" : isLast ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-800"
                        )}>
                          <div className={cn("w-2.5 h-2.5 rounded-full", isFirst || isLast ? "bg-white" : "bg-zinc-400")} />
                        </div>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest mb-1 leading-none",
                            isFirst ? "text-emerald-600" : isLast ? "text-blue-600" : "text-zinc-400"
                          )}>
                            {isFirst ? "Завантаження" : isLast ? "Розвантаження" : `Точка ${idx}`}
                          </span>
                          <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
                            {r.city} {getRegionName(r.ids_region) && <span className="text-zinc-400 font-bold ml-1">({getRegionName(r.ids_region)})</span>} <span className="text-zinc-400 font-bold ml-1">{r.ids_country}</span>
                          </h4>
                          <div className="flex flex-col gap-1 mt-1.5">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase italic line-clamp-2">{r.address || "Адреса узгоджується"}</p>
                            {pointDate && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Calendar size={10} className="text-indigo-500" />
                                <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-tighter shrink-0">{pointDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


            {/* Stats Block (Tender Specific) */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 pt-5 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-4 gap-2">
               {[
                 { v: tender?.car_count || 0, l: "Авто", c: "text-indigo-600 bg-indigo-50" },
                 { v: (tender?.weight || 0) / 1000, l: "Тонн", c: "text-zinc-500 bg-zinc-100" },
                 { v: tender?.volume || 0, l: "м³", c: "text-emerald-600 bg-emerald-50" },
                 { v: 0, l: "Ставок", c: "text-amber-600 bg-amber-50" },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center">
                   <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.l}</span>
                   <div className={cn("w-full py-1.5 rounded-lg text-center font-black text-sm tabular-nums", item.c + " dark:bg-white/5 dark:text-zinc-400")}>
                     {item.v}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* --- MAP AREA (Зліва на десктопі) --- */}
          <div
            id="map-capture-area"
            className="flex-1 relative bg-zinc-100 dark:bg-zinc-900 h-full overflow-hidden order-1 lg:order-2"
          >
            <TenderMap
              points={tender?.tender_route || []}
              captureId="map-capture-area"
            />
            {/* Timer Overlay on Map */}
            <div className="absolute top-8 right-8 z-[400] bg-rose-600 text-white p-6 rounded-[2.5rem] shadow-2xl min-w-[200px] border border-white/20">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                 <Timer size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Кінцевий термін</span>
              </div>
              <div className="text-2xl font-black italic tracking-tighter leading-none">
                {tender?.time_end ? new Date(tender?.time_end).toLocaleDateString() : "--.--"}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
    </div>
  );
}
