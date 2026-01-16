"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
export interface Location {
  id: string;
  lat: number;
  lng: number;
  address: string;
}

export interface Cargo extends Location {
  weight: number;
  type: string;
}

export interface Truck extends Location {
  plateNumber: string;
  status: "empty" | "loaded" | "on_way";
}

// Налаштування іконок через SVG або URL
const createIcon = (color: string) =>
  new L.DivIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    className: "custom-marker-icon",
    iconSize: [12, 12],
  });

export default function LogiMap({
  trucks,
  cargos,
}: {
  trucks: Truck[];
  cargos: Cargo[];
}) {
  return (
    <MapContainer
      center={[49.0, 31.0]} // Центр України
      zoom={6}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Світла лаконічна карта
        attribution="&copy; OpenStreetMap"
      />

      <ZoomControl position="bottomright" />

      {/* Рендер Вантажівок */}
      {trucks.map((truck) => (
        <Marker
          key={truck.id}
          position={[truck.lat, truck.lng]}
          icon={createIcon("#2563eb")}
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <h3 className="font-bold border-b mb-1">{truck.plateNumber}</h3>
              <p className="text-sm italic">Статус: {truck.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Рендер Вантажів */}
      {cargos.map((cargo) => (
        <Marker
          key={cargo.id}
          position={[cargo.lat, cargo.lng]}
          icon={createIcon("#ea580c")}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold border-b mb-1 text-orange-600">
                {cargo.type}
              </h3>
              <p className="text-sm">Вага: {cargo.weight} т</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
