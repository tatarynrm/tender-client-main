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
        "fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col overflow-hidden transition-opacity duration-300",
        tender ? "opacity-100" : "opacity-0",
      )}
    >
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="h-16 shrink-0 border-b border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-20 relative">
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-sky-500/20">
                Активний
              </span>
              <h1 className="text-sm lg:text-base font-black dark:text-zinc-100 leading-none">
                ЗАМОВЛЕННЯ #{tender?.id}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1 text-zinc-500 text-[9px] font-semibold uppercase tracking-wider">
              {profile?.role.is_ict && (
                <span className="flex items-center gap-1">
                  <Building2 size={10} /> {tender?.company_name || "Компанія"}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="items-center gap-1 hidden sm:flex">
                <User2 size={10} /> {tender?.author || "Менеджер"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting || !tender}
            className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-2 rounded-lg font-bold text-[10px] uppercase text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            {isExporting ? "Експорт..." : "PDF"}
          </button>
        </div>
      </header>

      {!tender ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Завантаження...
            </span>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* --- MOBILE TABS NAVIGATION --- */}
          <div className="lg:hidden flex border-b border-zinc-200/80 dark:border-white/5 bg-white dark:bg-zinc-950 shrink-0">
            <button
              onClick={() => setActiveMobileTab("details")}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors",
                activeMobileTab === "details"
                  ? "border-sky-500 text-sky-600 dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
              )}
            >
              <ListFilter size={14} /> Деталі
            </button>
            <button
              onClick={() => setActiveMobileTab("map")}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors",
                activeMobileTab === "map"
                  ? "border-sky-500 text-sky-600 dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
              )}
            >
              <MapIcon size={14} /> Карта
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* --- MAP AREA (Зліва на десктопі, як таб на мобайлі) --- */}
            <div
              id="map-capture-area"
              className={cn(
                "flex-1 relative bg-zinc-100 dark:bg-zinc-900 lg:border-r border-zinc-200/80 dark:border-white/5 h-full",
                // На мобільному ховаємо карту, якщо активний таб 'details'
                activeMobileTab === "details" ? "hidden lg:block" : "block",
              )}
            >
              <TenderMap
                points={tender.tender_route || []}
                captureId="map-capture-area"
              />

              {/* Компактний скляний оверлей на карті */}
              <div className="absolute bottom-6 left-6 z-[400] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-3 rounded-xl border border-zinc-200/50 dark:border-white/10 shadow-lg min-w-[200px] pointer-events-none hidden sm:block">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-sky-500" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                    Дистанція
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <p className="text-xs font-black dark:text-zinc-100 uppercase truncate max-w-[80px]">
                      {tender.tender_route[0]?.city}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">
                      {tender.tender_route[0]?.ids_country}
                    </p>
                  </div>
                  <ArrowLeft
                    size={14}
                    className="rotate-180 text-zinc-300 dark:text-zinc-600"
                  />
                  <div className="flex flex-col text-right">
                    <p className="text-xs font-black dark:text-zinc-100 uppercase truncate max-w-[80px]">
                      {
                        tender.tender_route[tender.tender_route.length - 1]
                          ?.city
                      }
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">
                      {
                        tender.tender_route[tender.tender_route.length - 1]
                          ?.ids_country
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- DATA PANEL (Справа на десктопі, як таб на мобайлі) --- */}
            <div
              className={cn(
                "w-full lg:w-[480px] bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10 h-full overflow-hidden",
                // На мобільному ховаємо деталі, якщо активний таб 'map'
                activeMobileTab === "map" ? "hidden lg:flex" : "flex",
              )}
            >
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* SECTION: Timeline (Компактний) */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-white/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-sky-500" /> Точки
                      маршруту
                    </h3>
                    <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-500">
                      {tender.tender_route.length} ТОЧКИ
                    </span>
                  </div>

                  <div className="relative pl-3">
                    {/* Вертикальна лінія */}
                    <div className="absolute left-[15px] top-2 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800" />

                    {tender.tender_route.map((r, idx) => (
                      <div
                        key={r.id}
                        className="relative flex gap-4 pb-4 last:pb-0 group"
                      >
                        {/* Маркер */}
                        <div
                          className={cn(
                            "mt-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 z-10 shrink-0",
                            idx === 0
                              ? "bg-sky-500 w-3 h-3 -ml-[1px]"
                              : idx === tender.tender_route.length - 1
                                ? "bg-emerald-500 w-3 h-3 -ml-[1px]"
                                : "bg-zinc-300 dark:bg-zinc-600",
                          )}
                        />

                        {/* Дані точки */}
                        <div className="flex-1 flex flex-col -mt-1">
                          <div className="flex justify-between items-baseline mb-0.5 gap-2">
                            <p className="text-xs font-bold dark:text-zinc-100 uppercase tracking-tight">
                              {r.city}{" "}
                              <span className="text-zinc-400 font-normal ml-0.5">
                                {r.ids_country}
                              </span>
                            </p>
                            <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                              {r.date_point
                                ? new Date(r.date_point).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium leading-tight">
                            {r.address || "Адреса уточнюється"}
                          </p>

                          {/* Бейджі митниці/завантаження всередині таймлайну */}
                          {(r.customs || r.point_name) && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {r.point_name && (
                                <span className="text-[8px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-500/20 uppercase">
                                  {r.point_name}
                                </span>
                              )}
                              {r.customs && (
                                <span className="text-[8px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-500/20 uppercase">
                                  Митниця
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SECTION: Cargo & Specs */}
                <section className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 bg-zinc-900 dark:bg-zinc-100 rounded-xl p-4 text-white dark:text-black shadow-inner">
                    <p className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1 tracking-widest flex items-center gap-1.5">
                      <Box size={12} /> Вантаж
                    </p>
                    <p className="text-sm font-bold uppercase tracking-tight leading-tight">
                      {tender.cargo || "Не вказано"}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200/80 dark:border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
                      <Weight size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-bold uppercase text-zinc-400">
                        Вага
                      </span>
                      <span className="text-sm font-black dark:text-zinc-100 leading-none mt-0.5 truncate">
                        {tender.weight}{" "}
                        <span className="text-[9px] font-bold text-zinc-500">
                          т
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200/80 dark:border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                      <Ruler size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-bold uppercase text-zinc-400">
                        Об'єм
                      </span>
                      <span className="text-sm font-black dark:text-zinc-100 leading-none mt-0.5 truncate">
                        {tender.volume}{" "}
                        <span className="text-[9px] font-bold text-zinc-500">
                          м³
                        </span>
                      </span>
                    </div>
                  </div>
                </section>

                {/* SECTION: Requirements */}
                <section className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200/80 dark:border-white/5 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-100 dark:border-white/5 pb-3">
                    <Truck size={14} className="text-zinc-500" /> Вимоги
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase text-zinc-400 mb-0.5">
                        Причеп
                      </span>
                      <span className="text-[11px] font-bold dark:text-zinc-200 uppercase">
                        {tender.tender_trailer?.[0]?.trailer_type_name ||
                          "Тент / Реф"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase text-zinc-400 mb-0.5">
                        Кількість авто
                      </span>
                      <span className="text-[11px] font-bold dark:text-zinc-200 uppercase">
                        {tender.car_count} од.
                      </span>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="text-[9px] font-bold uppercase text-zinc-400 mb-1">
                        Спосіб завантаження
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tender.tender_load?.map((l) => (
                          <span
                            key={l.id}
                            className="text-[9px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase"
                          >
                            {l.load_type_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION: Notes */}
                {tender.notes && (
                  <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl p-3 border border-amber-100 dark:border-amber-500/10 flex gap-2">
                    <AlertCircle
                      size={14}
                      className="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p className="text-[10px] text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed">
                      {tender.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* --- BOTTOM STICKY ACTIONS --- */}
              <div className="shrink-0 p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200/80 dark:border-white/5 flex gap-3 z-20">
                <div className="flex-1 flex flex-col justify-center pl-2">
                  <span className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1 mb-0.5">
                    <Timer size={10} /> Дедлайн
                  </span>
                  <span className="text-[11px] font-black dark:text-zinc-100">
                    До 18:00
                  </span>
                </div>

                <button className="flex-[2] h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
                  Подати ставку <CheckCircle2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
