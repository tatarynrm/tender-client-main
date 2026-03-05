"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Truck as TruckIcon,
  Package,
  Menu,
  X,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useLoads, TenderListFilters } from "@/features/log/hooks/useLoads";
import { LoadApiItem } from "@/features/log/types/load.type";
import Loader from "@/shared/components/Loaders/MainLoader";
import { RouteBuilderPanel, WaypointItem } from "@/features/log/map/components/route-builder/RouteBuilderPanel";
import L from "leaflet";

const LogMapComponent = dynamic(
  () => import("@/features/log/map/components/LogMapComponent"),
  {
    ssr: false,
    loading: () => <Loader />,
  }
);

export default function MapPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"loads" | "builder">("loads");

  // Route Builder state
  const [builderWaypoints, setBuilderWaypoints] = useState<L.LatLng[]>([]);
  const [calculatedDistance, setCalculatedDistance] = useState<number | undefined>();
  const [calculatedTime, setCalculatedTime] = useState<number | undefined>();

  const handleRouteSubmit = (waypoints: WaypointItem[]) => {
    const leafletWaypoints = waypoints.map(w => L.latLng(w.lat!, w.lng!));
    setBuilderWaypoints(leafletWaypoints);
    setCalculatedDistance(undefined);
    setCalculatedTime(undefined);
  };

  const handleRouteFound = useCallback((data: { totalDistance: number, totalTime: number }) => {
    setCalculatedDistance((prev) => prev === data.totalDistance ? prev : data.totalDistance);
    setCalculatedTime((prev) => prev === data.totalTime ? prev : data.totalTime);
  }, []);

  // Отримуємо активні вантажі
  const queryFilters: TenderListFilters = useMemo(
    () => ({
      active: true,
      limit: 100, // Завантажуємо для карти більше (можна налаштувати)
      page: 1,
    }),
    []
  );

  const { loads, isLoading } = useLoads(queryFilters);

  // Фільтруємо вантажі для пошуку за компанією чи маршрутом
  const filteredLoads = useMemo(() => {
    if (!searchQuery) return loads;
    const lowerQuery = searchQuery.toLowerCase();

    return loads.filter((load: LoadApiItem) => {
      const matchCompany = load.company_name?.toLowerCase().includes(lowerQuery);
      const matchCityFrom = load.crm_load_route_from.some((r) =>
        r.city?.toLowerCase().includes(lowerQuery)
      );
      const matchCityTo = load.crm_load_route_to.some((r) =>
        r.city?.toLowerCase().includes(lowerQuery)
      );
      return matchCompany || matchCityFrom || matchCityTo;
    });
  }, [loads, searchQuery]);

  // Знаходимо обраний вантаж
  const selectedLoad = useMemo(
    () => loads.find((l) => l.id.toString() === selectedId) || null,
    [loads, selectedId]
  );

  return (
    <main className="flex h-[84dvh] w-full bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Мобільна кнопка меню */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[98] p-3 bg-blue-600 text-white rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ЛІВИЙ САЙДБАР */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[98] w-full sm:w-80 lg:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white italic shadow-inner">
                <MapPin size={18} />
              </div>
              <span className="text-zinc-800">Logistics</span>
              <span className="text-blue-600 font-extrabold">Map</span>
            </h1>
            <button
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Таби */}
          <div className="flex p-2 gap-1 shrink-0 px-4 pt-4">
            <button
              onClick={() => { setActiveTab("loads"); setBuilderWaypoints([]); }}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all border",
                activeTab === "loads"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 border-zinc-200 dark:border-zinc-700 shadow-sm"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700"
              )}
            >
              Вантажі
            </button>
            <button
              onClick={() => { setActiveTab("builder"); setSelectedId(null); }}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all border",
                activeTab === "builder"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 border-zinc-200 dark:border-zinc-700 shadow-sm"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700"
              )}
            >
              Маршрут
            </button>
          </div>

          {activeTab === "loads" ? (
            <>
              {/* Пошук */}
              <div className="p-4 space-y-3 shrink-0 pt-2">
                <div className="relative group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Пошук за маршрутом або компанією..."
                    className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-transparent rounded-xl text-sm focus:border-blue-500/30 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Список вантажів */}
              <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-20 space-y-2">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                    Активні завантаження
                  </h2>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {filteredLoads.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((skeleton) => (
                      <div key={skeleton} className="p-4 rounded-2xl border border-zinc-100 bg-white shadow-sm animate-pulse space-y-3">
                        <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
                        <div className="h-3 bg-zinc-100 rounded w-full"></div>
                        <div className="h-3 bg-zinc-100 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredLoads.length > 0 ? (
                  filteredLoads.map((load: LoadApiItem) => {
                    const isSelected = selectedId === load.id.toString();

                    return (
                      <div
                        key={load.id}
                        onClick={() => setSelectedId(load.id.toString())}
                        className={cn(
                          "group p-4 rounded-2xl cursor-pointer transition-all border",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-md scale-[1.02]"
                            : "bg-white dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors mt-0.5",
                            isSelected ? "bg-blue-600 text-white shadow-inner" : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                          )}>
                            <Package size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start mb-1.5">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 pr-2">
                                {load.company_name}
                              </p>
                              <ChevronRight
                                size={16}
                                className={cn(
                                  "shrink-0 transition-transform",
                                  isSelected ? "text-blue-600 translate-x-1" : "text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5"
                                )}
                              />
                            </div>

                            {/* Маршрут */}
                            <div className="space-y-1.5 mb-2.5 relative">
                              {/* Лінія маршруту */}
                              <div className="absolute left-[7px] top-[14px] bottom-[10px] w-px bg-zinc-200 border-l border-dashed border-zinc-300 z-0"></div>

                              {/* Звідки */}
                              <div className="flex items-center gap-2 relative z-10">
                                <div className="w-4 h-4 rounded-full bg-emerald-100 border-[3px] border-white shadow-sm flex items-center justify-center shrink-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-xs font-semibold text-zinc-600 truncate">
                                  {load.crm_load_route_from[0]?.city || "Невідомо"} <span className="text-zinc-400 font-medium text-[10px]">({load.crm_load_route_from[0]?.ids_country || "-"})</span>
                                </span>
                              </div>

                              {/* Куди */}
                              <div className="flex items-center gap-2 relative z-10">
                                <div className="w-4 h-4 rounded-full bg-red-100 border-[3px] border-white shadow-sm flex items-center justify-center shrink-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                </div>
                                <span className="text-xs font-semibold text-zinc-600 truncate">
                                  {load.crm_load_route_to[0]?.city || "Невідомо"} <span className="text-zinc-400 font-medium text-[10px]">({load.crm_load_route_to[0]?.ids_country || "-"})</span>
                                </span>
                              </div>
                            </div>

                            {/* Нижні теги */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className={cn(
                                "text-[10px] font-black px-1.5 py-0.5 rounded border",
                                isSelected
                                  ? "bg-white dark:bg-zinc-900 text-blue-600 border-blue-200"
                                  : "bg-zinc-50 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-600"
                              )}>
                                {load.car_count_actual} авто
                              </span>

                              {load.price && (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  {load.price} {load.valut_name}
                                </span>
                              )}

                              <span className="text-[10px] font-medium text-zinc-400 truncate max-w-[100px]" title={load.load_info}>
                                {load.load_info}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                    <Package size={48} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">Завантажень не знайдено</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <RouteBuilderPanel
              onRouteSubmit={handleRouteSubmit}
              calculatedDistance={calculatedDistance}
              calculatedTime={calculatedTime}
            />
          )}
        </div>
      </aside>

      {/* ПРАВА ЧАСТИНА (КАРТА) */}
      <section className="flex-1 relative flex flex-col h-full bg-slate-100 dark:bg-zinc-900">
        {/* Floating Top Bar (Controls) */}
        <div className="absolute top-4 right-4 z-[98] flex gap-2 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 px-4 py-2 font-bold text-xs rounded-xl shadow-lg shadow-red-500/10 transition-all flex items-center gap-2"
              >
                <X size={14} /> Скинути маршрут
              </button>
            )}

          </div>
        </div>

        {/* MAP COMPONENT */}
        <div className={cn(
          "flex-1 w-full h-full relative z-0 transition-all duration-700",
          (selectedId || (builderWaypoints && builderWaypoints.length > 0)) ? "filter-none" : "grayscale-[0.15] contrast-[1.05]"
        )}>
          {!isLoading && (
            <LogMapComponent
              loads={filteredLoads}
              selectedId={selectedId}
              builderWaypoints={builderWaypoints}
              onRouteFound={handleRouteFound}
            />
          )}
        </div>

        {/* Loading overlay for map */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <Loader />
          </div>
        )}

      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
