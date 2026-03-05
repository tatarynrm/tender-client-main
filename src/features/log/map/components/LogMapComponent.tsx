"use client";

import { useEffect, useState, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    Polyline,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LoadApiItem } from "@/features/log/types/load.type";
import RoutingMachine from "./RoutingMachine";

// Fix Leaflet icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const loadIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const unloadIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LogMapComponentProps {
    loads: LoadApiItem[];
    selectedId: string | null;
    builderWaypoints?: L.LatLng[];
    onRouteFound?: (data: { totalDistance: number; totalTime: number }) => void;
}

const FitBounds = ({ data, builderWaypoints }: { data: LoadApiItem[], builderWaypoints?: L.LatLng[] }) => {
    const map = useMap();
    useEffect(() => {
        const latLngs: L.LatLngTuple[] = [];

        if (builderWaypoints && builderWaypoints.length > 0) {
            builderWaypoints.forEach(w => latLngs.push([w.lat, w.lng]));
        } else {
            data.forEach((l) => {
                l.crm_load_route_from.forEach(p => {
                    if (p.lat && p.lon) latLngs.push([p.lat, p.lon]);
                });
                l.crm_load_route_to.forEach(p => {
                    if (p.lat && p.lon) latLngs.push([p.lat, p.lon]);
                });
            });
        }

        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            setTimeout(() => map.fitBounds(bounds, { padding: [50, 50] }), 500);
        }
    }, [data, map, builderWaypoints]);
    return null;
}

export default function LogMapComponent({ loads, selectedId, builderWaypoints, onRouteFound }: LogMapComponentProps) {

    const currentLoad = useMemo(() => {
        if (!selectedId) return null;
        return loads.find((l) => l.id.toString() === selectedId) || null;
    }, [selectedId, loads]);

    const mapLoads = currentLoad ? [currentLoad] : loads;

    // If we are in builder mode
    const isBuilderMode = builderWaypoints && builderWaypoints.length > 0;

    return (
        <MapContainer
            center={[48.3794, 31.1656]} // Центр України
            zoom={6}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="bottomright" />
            <FitBounds data={mapLoads} builderWaypoints={builderWaypoints} />

            {isBuilderMode ? (
                <>
                    {builderWaypoints.map((wp, i) => (
                        <Marker
                            key={`builder-wp-${i}`}
                            position={[wp.lat, wp.lng]}
                            icon={i === 0 ? loadIcon : i === builderWaypoints.length - 1 ? unloadIcon : new L.Icon({
                                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })}
                        >
                            <Popup>
                                <div className="font-sans font-bold text-sm">Точка {i + 1}</div>
                            </Popup>
                        </Marker>
                    ))}
                    {builderWaypoints.length >= 2 && (
                        <RoutingMachine waypoints={builderWaypoints} color="#8b5cf6" onRouteFound={onRouteFound} />
                    )}
                </>
            ) : (
                mapLoads.map((load) => {
                    const waypoints: L.LatLng[] = [];

                    load.crm_load_route_from.forEach(p => {
                        if (p.lat && p.lon) waypoints.push(L.latLng(p.lat, p.lon));
                    });
                    load.crm_load_route_to.forEach(p => {
                        if (p.lat && p.lon) waypoints.push(L.latLng(p.lat, p.lon));
                    });

                    const isSelected = selectedId === load.id.toString();

                    return (
                        <div key={`load-${load.id}`}>
                            {/* Рендеримо маркери Завантаження */}
                            {load.crm_load_route_from.map((p, i) =>
                                p.lat && p.lon ? (
                                    <Marker key={`from-${p.id}-${i}`} position={[p.lat, p.lon]} icon={loadIcon}>
                                        <Popup>
                                            <div className="font-sans font-bold text-sm mb-1">{load.company_name}</div>
                                            <div className="font-sans text-xs text-zinc-500 mb-1">Завантаження: {p.city}</div>
                                            <div className="font-sans text-xs text-zinc-500">{load.load_info}</div>
                                        </Popup>
                                    </Marker>
                                ) : null
                            )}

                            {/* Рендеримо маркери Розвантаження */}
                            {load.crm_load_route_to.map((p, i) =>
                                p.lat && p.lon ? (
                                    <Marker key={`to-${p.id}-${i}`} position={[p.lat, p.lon]} icon={unloadIcon}>
                                        <Popup>
                                            <div className="font-sans font-bold text-sm mb-1">{load.company_name}</div>
                                            <div className="font-sans text-xs text-zinc-500">Розвантаження: {p.city}</div>
                                        </Popup>
                                    </Marker>
                                ) : null
                            )}

                            {/* Роутинг */}
                            {isSelected && waypoints.length >= 2 && (
                                <RoutingMachine waypoints={waypoints} color="#3b82f6" />
                            )}
                            {!isSelected && waypoints.length >= 2 && (
                                <Polyline
                                    positions={waypoints.map(w => [w.lat, w.lng])}
                                    pathOptions={{ color: "#94a3b8", weight: 3, opacity: 0.5, dashArray: "5, 10" }}
                                />
                            )}
                        </div>
                    )
                })
            )}
        </MapContainer>
    )
}
