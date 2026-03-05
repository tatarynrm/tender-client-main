import React, { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus, Calculator, Route as RouteIcon, MapPin, Truck, HelpCircle } from "lucide-react";
import { SortableWaypoint } from "./SortableWaypoint";
import { AppButton } from "@/shared/components/Buttons/AppButton";

export interface WaypointItem {
    id: string;
    value: string;
    lat?: number;
    lng?: number;
}

interface RouteBuilderPanelProps {
    onRouteSubmit: (waypoints: WaypointItem[]) => void;
    calculatedDistance?: number;
    calculatedTime?: number;
}

export const RouteBuilderPanel = ({ onRouteSubmit, calculatedDistance, calculatedTime }: RouteBuilderPanelProps) => {
    const [points, setPoints] = useState<WaypointItem[]>([
        { id: "1", value: "Київ" },
        { id: "2", value: "Львів" }
    ]);
    const [pricePerKm, setPricePerKm] = useState<number | "">(35); // UAH per km
    const [isSearching, setIsSearching] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPoints((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleCreatePoint = () => {
        const newId = Date.now().toString();
        setPoints([...points, { id: newId, value: "" }]);
    };

    const handleRemovePoint = (id: string) => {
        if (points.length <= 2) return;
        setPoints(points.filter(p => p.id !== id));
    };

    const handleChangePoint = (id: string, value: string) => {
        setPoints(points.map(p => p.id === id ? { ...p, value } : p));
    };

    const handleGeocodeAndSubmit = async () => {
        setIsSearching(true);
        try {
            // Create a copy of points to update with coordinates
            const processedPoints = [...points];

            for (let i = 0; i < processedPoints.length; i++) {
                const point = processedPoints[i];
                if (!point.value) continue;

                // Use Nominatim OSM API for free geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(point.value)}&limit=1`, {
                    headers: {
                        "Accept-Language": "uk,en"
                    }
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    processedPoints[i] = {
                        ...point,
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                }
            }

            onRouteSubmit(processedPoints.filter(p => p.lat && p.lng));
        } catch (e) {
            console.error("Geocoding failed", e);
        } finally {
            setIsSearching(false);
        }
    };

    // Convert meters to kilometers
    const distanceKm = calculatedDistance ? (calculatedDistance / 1000).toFixed(1) : 0;
    // Convert seconds to hours and minutes
    const hours = calculatedTime ? Math.floor(calculatedTime / 3600) : 0;
    const minutes = calculatedTime ? Math.floor((calculatedTime % 3600) / 60) : 0;

    const estimatedCost = calculatedDistance ? ((calculatedDistance / 1000) * Number(pricePerKm || 0)).toFixed(0) : 0;

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <div className="mb-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-3 rounded-2xl">
                    <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <RouteIcon size={14} /> Конструктор маршруту
                    </h3>
                    <p className="text-[11px] font-medium text-blue-800/70 dark:text-blue-300/70">
                        Додайте точки, перетягуйте їх для зміни порядку та розрахуйте оптимальний маршрут.
                    </p>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={points.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4 mb-4">
                            {points.map((point, index) => (
                                <SortableWaypoint
                                    key={point.id}
                                    id={point.id}
                                    value={point.value}
                                    index={index}
                                    onChange={handleChangePoint}
                                    onRemove={handleRemovePoint}
                                    placeholder={index === 0 ? "Місто відправлення..." : index === points.length - 1 ? "Місто призначення..." : "Проміжна точка..."}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <button
                    onClick={handleCreatePoint}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl font-bold text-sm transition-all outline-none"
                >
                    <Plus size={16} /> Додати точку
                </button>

                <div className="mt-4 mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                            Тариф за км
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/30 transition-all">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 pl-3">₴</div>
                        <input
                            type="number"
                            value={pricePerKm || ''}
                            onChange={(e) => setPricePerKm(e.target.value === "" ? "" : Number(e.target.value))}
                            className="flex-1 bg-transparent border-none outline-none font-black text-zinc-800 dark:text-zinc-100 text-sm py-1"
                        />
                        <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500 pr-3">грн / км</div>
                    </div>
                </div>

            </div>

            <div className="px-4 pb-4 pt-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">

                {calculatedDistance ? (
                    <div className="mb-3 p-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white shadow-lg animate-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="text-[10px] text-zinc-500 font-bold">Відстань</div>
                                    <div className="text-sm font-black">{distanceKm} <span className="text-xs text-zinc-400">км</span></div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div>
                                    <div className="text-[10px] text-zinc-500 font-bold">Час</div>
                                    <div className="text-sm font-black">{hours}<span className="text-xs text-zinc-400">г</span> {minutes}<span className="text-xs text-zinc-400">хв</span></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 font-bold">Вартість</div>
                                <div className="text-base font-black text-emerald-400">{estimatedCost} <span className="text-xs text-emerald-600/60">UAH</span></div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <button
                    onClick={handleGeocodeAndSubmit}
                    disabled={isSearching}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Calculator size={18} />
                    )}
                    {isSearching ? "Пошук маршруту..." : "Розрахувати маршрут"}
                </button>
            </div>

        </div >
    );
}
