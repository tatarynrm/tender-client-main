"use client";
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { ITenderRoute } from "../../types/tender.type";

// Фікс іконок Leaflet для Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface TenderMapProps {
  points: ITenderRoute[];
  captureId?: string;
  onReady?: (distance: number) => void;
}

function RoutingMachine({
  points,
  onReady,
}: {
  points: ITenderRoute[];
  onReady?: (dist: number) => void;
}) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || points.length < 2) return;

    const validPoints = [...points]
      .filter((p) => p.lat && p.lon)
      .sort((a, b) => a.order_num - b.order_num);

    if (validPoints.length < 2) return;

    const waypoints = validPoints.map((p) => L.latLng(p.lat, p.lon));

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Створюємо контроль маршруту без візуального сміття
    const control = (L as any).Routing.control({
      waypoints,
      lineOptions: {
        styles: [{ color: "#0ea5e9", weight: 4, opacity: 0.8 }], // sky-500 для сучасного вигляду
        addWaypoints: false,
      },
      router: (L as any).Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      show: false, // Приховуємо панель
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null, // Забороняємо створювати дублюючі маркери по маршруту
    }).addTo(map);

    // ЖОРСТКО ховаємо контейнер з інструкціями (оверлей поворотів), якщо він все ж відрендерився
    const container = control.getContainer();
    if (container) {
      container.style.display = "none";
    }

    routingControlRef.current = control;

    control.on("routesfound", (e: any) => {
      const routes = e.routes;
      const distanceInKm = routes[0].summary.totalDistance / 1000;
      if (onReady) onReady(distanceInKm);
    });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, points, onReady]);

  return null;
}

export const TenderMap = ({ points, captureId, onReady }: TenderMapProps) => {
  const validPoints = points?.filter((p) => p && typeof p.lat === "number" && typeof p.lon === "number") || [];

  if (validPoints.length === 0)
    return (
      <div className="h-[300px] w-full bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-400 text-xs font-black uppercase tracking-widest border border-zinc-200 dark:border-white/5">
        Координати маршруту відсутні
      </div>
    );

  return (
    <div id={captureId} className="h-full w-full relative z-0">
      <MapContainer
        center={[validPoints[0].lat, validPoints[0].lon]}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Сучасна світла карта CartoDB
          crossOrigin="anonymous"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RoutingMachine points={validPoints} onReady={onReady} />
        {validPoints.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup className="text-[10px] font-bold uppercase">{p.city || p.address}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};