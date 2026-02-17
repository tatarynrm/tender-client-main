// // components/Tender/TenderMap.tsx
// import React, { useEffect } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine";
// import { ITenderRoute } from "../../types/tender.type";

// interface TenderMapProps {
//   points: ITenderRoute[];
//   captureId?: string;
//   onReady?: () => void; // Додаємо цей проп
// }

// // Внутрішній компонент для оновлення стану самої карти Leaflet
// function MapUpdater({ points }: { points: ITenderRoute[] }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!map || points.length === 0) return;

//     // Сортуємо та фільтруємо точки
//     const validPoints = points
//       .filter((p) => p.lat && p.lon)
//       .sort((a, b) => a.order_num - b.order_num);

//     if (validPoints.length === 0) return;

//     // 1. Оновлюємо центр карти по першій точці при зміні маршруту
//     map.setView([validPoints[0].lat, validPoints[0].lon], map.getZoom());

//     // 2. Ініціалізуємо маршрут
//     const waypoints = validPoints.map((p) => L.latLng(p.lat, p.lon));
//     const routingControl = (L as any).Routing.control({
//       waypoints,
//       lineOptions: { styles: [{ color: "#ea580c", weight: 5, opacity: 0.8 }] },
//       addWaypoints: false,
//       draggableWaypoints: false,
//       fitSelectedRoutes: true,
//       show: false,
//       createMarker: () => null,
//     }).addTo(map);

//     return () => {
//       if (map) map.removeControl(routingControl);
//     };
//   }, [map, points]);

//   return null;
// }

// export const TenderMap = ({ points, captureId }: TenderMapProps) => {
//   return (
//     <div id={captureId} className="h-full w-full relative">
//       <MapContainer
//         center={[points[0]?.lat || 50, points[0]?.lon || 30]}
//         zoom={6}
//         className="h-full w-full"
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           crossOrigin="anonymous"
//         />
//         <MapUpdater points={points} />
//         {points.map((p, idx) => (
//           <Marker key={p.id} position={[p.lat, p.lon]}>
//             <Popup>{p.city}</Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };
"use client";
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { ITenderRoute } from "../../types/tender.type";

// Фікс іконок Leaflet для Next.js (без цього маркери можуть зникати)
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

function RoutingMachine({ points, onReady }: { points: ITenderRoute[], onReady?: (dist: number) => void }) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || points.length < 2) return;

    // Сортуємо точки за порядком
    const validPoints = [...points]
      .filter((p) => p.lat && p.lon)
      .sort((a, b) => a.order_num - b.order_num);

    if (validPoints.length < 2) return;

    const waypoints = validPoints.map((p) => L.latLng(p.lat, p.lon));

    // Видаляємо старий контроль, якщо він був (важливо для React Strict Mode)
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Створюємо новий контроль маршруту
    const control = (L as any).Routing.control({
      waypoints,
      lineOptions: {
        styles: [{ color: "#ea580c", weight: 5, opacity: 0.8 }],
        addWaypoints: false,
      },
      router: (L as any).Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1", // Пряма адреса сервера
        profile: 'driving', // Профіль для авто
      }),
      show: false, // Приховуємо текстову панель з інструкціями
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null, // Не дублюємо маркери роутером
    }).addTo(map);

    routingControlRef.current = control;

    // Слухаємо подію знаходження маршруту, щоб отримати кілометраж
    control.on('routesfound', (e: any) => {
      const routes = e.routes;
      const distanceInKm = routes[0].summary.totalDistance / 1000;
      // console.log(`Дистанція: ${distanceInKm.toFixed(1)} км`);
      if (onReady) onReady(distanceInKm);
    });

    // Обробка помилок
    control.on('routingerror', (e: any) => {
      console.error("Помилка побудови маршруту:", e);
    });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, points]);

  return null;
}

export const TenderMap = ({ points, captureId, onReady }: TenderMapProps) => {
  if (!points || points.length === 0) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Немає координат</div>;

  return (
    <div id={captureId} className="h-full w-full relative">
      <MapContainer
        center={[points[0].lat, points[0].lon]}
        zoom={6}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
          attribution='&copy; OpenStreetMap'
        />

        <RoutingMachine points={points} onReady={onReady} />

        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup>{p.city}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};