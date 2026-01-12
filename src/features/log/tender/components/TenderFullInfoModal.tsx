"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ITender, ITenderRoute } from "../../types/tender.type";
import { X, MapPin, Truck, Box, FileText, ArrowLeft } from "lucide-react";
import { tenderManagerService } from "../../services/tender.manager.service";
import { cn } from "@/shared/utils";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// PDF & Image capture
import { pdf } from "@react-pdf/renderer";
import { toPng } from "html-to-image";
import { TenderFullInfoPDF } from "@/shared/components/PDF/Tender PDF/TenderFullInfoPDF";
import { TenderMap } from "./TenderFullInfoMap";

// Виправлення іконок Leaflet для Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Компонент побудови маршруту
function RoutingMachine({ points }: { points: ITenderRoute[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length < 2) return;

    const validPoints = points
      .filter((p) => p.lat !== null && p.lon !== null)
      .sort((a, b) => a.order_num - b.order_num);

    const waypoints = validPoints.map((p) => L.latLng(p.lat, p.lon));

    const routingControl = (L as any).Routing.control({
      waypoints,
      lineOptions: { styles: [{ color: "#2563eb", weight: 5, opacity: 0.7 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null, // Вимикаємо дефолтні маркери роутингу
    }).addTo(map);

    return () => {
      if (map && routingControl) map.removeControl(routingControl);
    };
  }, [map, points]);

  return null;
}

export default function TenderFullInfoModal({
  tenderId,
  onClose,
}: {
  tenderId: number | null | undefined;
  onClose: () => void;
}) {
  const [tender, setTender] = useState<ITender | null>(null);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0); // Для вибору варіанту
  const [isExporting, setIsExporting] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false); // Стан готовності карти
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

      // Скріншот саме поточної карти
      const mapImageData = await toPng(mapElement, {
        cacheBust: true,
        pixelRatio: 1.5,
        filter: (node) =>
          !["leaflet-control-container"].some((cls) =>
            node?.classList?.contains(cls)
          ),
      });

      const blob = await pdf(
        <TenderFullInfoPDF tender={tender} mapImage={mapImageData} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tender_${tender.id}.pdf`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };
  // Скидаємо стан при зміні тендера
  useEffect(() => {
    setIsMapReady(false);
  }, [tenderId]);

  if (!tenderId) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col transition-opacity duration-300",
        tenderId ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    >
      {/* HEADER */}
      <header className="h-16 shrink-0 border-b dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">Назад</span>
          </button>
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
          <div>
            <h1 className="text-sm md:text-base font-black uppercase tracking-tight dark:text-white leading-none">
              Тендер{" "}
              <span className="text-orange-600">№{tender?.id || "..."}</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              {tender?.company_name || "Завантаження..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting || !tender}
            className="flex bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest border dark:border-zinc-700 disabled:opacity-50"
          >
            {isExporting ? "Генерація..." : "Зберегти PDF"}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900 text-white rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {!tender ? (
        <div className="flex-1 flex items-center justify-center font-black text-zinc-400 animate-pulse uppercase">
          Завантаження даних...
        </div>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: MAP */}
          {/* MAP AREA */}
          <div id="map-capture-area" className="flex-1 relative bg-zinc-100">
            <TenderMap
              points={tender?.tender_route || []}
              captureId="map-capture-area"
              onReady={() => setIsMapReady(true)} // Активуємо кнопку
            />
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full md:w-[450px] lg:w-[500px] overflow-y-auto bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                <MapPin size={14} /> Логістичний ланцюжок
              </div>
              <div className="space-y-0">
                {tender.tender_route.map((r, idx) => (
                  <div
                    key={r.id}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {idx !== tender.tender_route.length - 1 && (
                      <div className="absolute left-[7px] top-[22px] bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                    )}
                    <div
                      className={cn(
                        "mt-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-950 z-10 shrink-0",
                        r.ids_point === "LOAD_FROM"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      )}
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-50 dark:text-zinc-400 leading-none mb-1">
                        {r.point_name}
                      </p>
                      <p className="text-base font-bold dark:text-zinc-200">
                        {r.city}, {r.ids_country}
                      </p>
                      <p className="text-xs text-zinc-500">{r.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <Box size={18} className="text-blue-500 mb-3" />
                <h4 className="text-[10px] font-black uppercase text-zinc-400">
                  Вантаж
                </h4>
                <p className="text-base font-black dark:text-zinc-100 uppercase truncate">
                  {tender.cargo}
                </p>
                <p className="text-xs text-zinc-500 font-bold mt-1">
                  {tender.weight}т / {tender.volume}м³
                </p>
              </div>
              <div className="p-4 rounded-2xl border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <Truck size={18} className="text-amber-500 mb-3" />
                <h4 className="text-[10px] font-black uppercase text-zinc-400">
                  Транспорт
                </h4>
                <p className="text-sm font-black dark:text-zinc-100 uppercase">
                  {tender.tender_trailer?.[0]?.trailer_type_name || "Стандарт"}
                </p>
                <p className="text-xs text-zinc-500 font-bold mt-1">
                  {tender.car_count} авто
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                <FileText size={14} /> Додатково
              </div>
              <div className="flex flex-wrap gap-2">
                {tender.tender_load?.map((l) => (
                  <span
                    key={l.id}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[11px] font-black uppercase border dark:border-zinc-700"
                  >
                    {l.load_type_name}
                  </span>
                ))}
              </div>
              {tender.notes && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-xs italic text-orange-800 dark:text-orange-300">
                  {tender.notes}
                </div>
              )}
            </section>

            <div className="pt-4 sticky bottom-0 bg-white dark:bg-zinc-950">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-900/20 uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                Відгукнутися
                <ArrowLeft size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
