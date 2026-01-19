"use client";

import { useRef, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LoadApiItem } from "../../types/load.type";

// Іконки
const startIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const endIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function SetBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export function CargoMap({ cargo }: { cargo: LoadApiItem }) {
  const mapRef = useRef<L.Map>(null!);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  const fromPoints = cargo.crm_load_route_from
    .filter((p) => p.lat && p.lon)
    .map((p) => [Number(p.lat), Number(p.lon)] as [number, number]);
  const toPoints = cargo.crm_load_route_to
    .filter((p) => p.lat && p.lon)
    .map((p) => [Number(p.lat), Number(p.lon)] as [number, number]);
  const allWaypoints = [...fromPoints, ...toPoints];

  useEffect(() => {
    if (allWaypoints.length < 2) return;

    // Формуємо запит до OSRM (формат: lon,lat;lon,lat)
    const coordsString = allWaypoints.map((p) => `${p[1]},${p[0]}`).join(";");

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          // OSRM повертає [lon, lat], для Leaflet треба [lat, lon]
          const coordinates = data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]] as [number, number],
          );
          setRoutePolyline(coordinates);
        }
      })
      .catch((err) => console.error("Маршрут не знайдено:", err));
  }, [cargo]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        center={allWaypoints[0] || [49, 24]}
        zoom={6}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <SetBounds points={allWaypoints} />

        {/* Реальна лінія дороги */}
        {routePolyline.length > 0 && (
          <>
            <Polyline
              positions={routePolyline}
              pathOptions={{ color: "#3b82f6", weight: 5, opacity: 0.8 }}
            />
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "white",
                weight: 2,
                opacity: 0.5,
                dashArray: "5, 10",
              }}
            />
          </>
        )}

        {/* Маркери */}
        {fromPoints.map((pos, i) => (
          <Marker key={`f-${i}`} position={pos} icon={startIcon}>
            <Popup>
              <b>Завантаження:</b> {cargo.crm_load_route_from[i].city}
            </Popup>
          </Marker>
        ))}
        {toPoints.map((pos, i) => (
          <Marker key={`t-${i}`} position={pos} icon={endIcon}>
            <Popup>
              <b>Розвантаження:</b> {cargo.crm_load_route_to[i].city}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-3 left-12 z-[1000] bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 shadow-sm">
        Маршрут: {allWaypoints.length} точок
      </div>
    </div>
  );
}
