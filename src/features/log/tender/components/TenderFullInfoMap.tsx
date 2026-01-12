// components/Tender/TenderMap.tsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { ITenderRoute } from "../../types/tender.type";

interface TenderMapProps {
  points: ITenderRoute[];
  captureId?: string;
  onReady?: () => void; // Додаємо цей проп
}

// Внутрішній компонент для оновлення стану самої карти Leaflet
function MapUpdater({ points }: { points: ITenderRoute[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Сортуємо та фільтруємо точки
    const validPoints = points
      .filter((p) => p.lat && p.lon)
      .sort((a, b) => a.order_num - b.order_num);

    if (validPoints.length === 0) return;

    // 1. Оновлюємо центр карти по першій точці при зміні маршруту
    map.setView([validPoints[0].lat, validPoints[0].lon], map.getZoom());

    // 2. Ініціалізуємо маршрут
    const waypoints = validPoints.map((p) => L.latLng(p.lat, p.lon));
    const routingControl = (L as any).Routing.control({
      waypoints,
      lineOptions: { styles: [{ color: "#ea580c", weight: 5, opacity: 0.8 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (map) map.removeControl(routingControl);
    };
  }, [map, points]);

  return null;
}

export const TenderMap = ({ points, captureId }: TenderMapProps) => {
  return (
    <div id={captureId} className="h-full w-full relative">
      <MapContainer
        center={[points[0]?.lat || 50, points[0]?.lon || 30]}
        zoom={6}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />
        <MapUpdater points={points} />
        {points.map((p, idx) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup>{p.city}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
