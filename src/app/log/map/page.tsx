"use client";

import { Cargo, Truck } from "@/shared/components/Map/LogiMap";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import {
  Search,
  Truck as TruckIcon,
  Package,
  Filter,
  Menu,
  X,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/utils";

const LogiMap = dynamic(() => import("@/shared/components/Map/LogiMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
      Завантаження карти...
    </div>
  ),
});

export default function MapPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "empty" | "on_way">(
    "all"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [trucks] = useState<Truck[]>([
    {
      id: "1",
      lat: 50.45,
      lng: 30.52,
      address: "Київ",
      plateNumber: "AA1111BB",
      status: "empty",
    },
    {
      id: "2",
      lat: 49.83,
      lng: 24.02,
      address: "Львів",
      plateNumber: "BC2222CB",
      status: "on_way",
    },
  ]);

  const [cargos] = useState<Cargo[]>([
    {
      id: "c1",
      lat: 48.46,
      lng: 35.04,
      address: "Дніпро",
      weight: 20,
      type: "Зерно",
    },
    {
      id: "c2",
      lat: 46.48,
      lng: 30.72,
      address: "Одеса",
      weight: 5,
      type: "Техніка",
    },
  ]);

  // Фільтрація даних
  const filteredTrucks = useMemo(
    () =>
      trucks.filter(
        (t) =>
          (filterStatus === "all" || t.status === filterStatus) &&
          t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [trucks, filterStatus, searchQuery]
  );

  return (
    <main className="flex h-[84dvh] w-full bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Мобільна кнопка меню */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[98] p-1 bg-blue-600 text-white rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ЛІВИЙ САЙДБАР */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[98] w-full sm:w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white italic">
                M
              </div>
              ICT<span className="text-blue-600 font-extrabold">Track</span>
            </h1>
            <button
              className="lg:hidden text-slate-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Пошук та Фільтри */}
          <div className="p-4 space-y-3">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Пошук авто..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(["all", "empty", "on_way"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    filterStatus === s
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {s === "all" ? "Всі" : s === "empty" ? "Вільні" : "В дорозі"}
                </button>
              ))}
            </div>
          </div>

          {/* Список об'єктів */}
          <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-6 pb-20">
            {/* Секція Траки */}
            <div>
              <div className="px-3 flex justify-between items-center mb-2">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Транспорт
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {filteredTrucks.length}
                </span>
              </div>
              <div className="space-y-1">
                {filteredTrucks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "group p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                      selectedId === t.id
                        ? "bg-blue-50 border-blue-100 shadow-sm"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-xl shrink-0 transition-colors",
                          t.status === "empty"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        )}
                      >
                        <TruckIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-sm text-slate-800">
                            {t.plateNumber}
                          </p>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 tracking-tight">
                          {t.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Секція Вантажі */}
            <div>
              <div className="px-3 flex justify-between items-center mb-2">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Вантажі
                </h2>
              </div>
              <div className="space-y-1">
                {cargos.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "group p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                      selectedId === c.id
                        ? "bg-indigo-50 border-indigo-100 shadow-sm"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Package size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-800">
                          {c.type}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-indigo-500 bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                            {c.weight} т
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {c.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-slate-100 lg:mb-0 mb-safe">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              <Plus size={18} /> Створити замовлення
            </button>
          </div>
        </div>
      </aside>

      {/* ПРАВА ЧАСТИНА (КАРТА) */}
      <section className="flex-1 relative flex flex-col h-full">
        {/* Floating Top Bar (Controls) */}
        <div className="absolute top-4 left-4 right-4 z-[98] flex justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex bg-white/90 backdrop-blur shadow-xl border border-slate-200 p-2.5 rounded-xl text-slate-700 hover:bg-white transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="hidden sm:flex bg-white/90 backdrop-blur shadow-xl border border-slate-200 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg">
                Карта
              </button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
                Супутник
              </button>
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur shadow-xl border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">
                  Система активна
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="text-xs font-bold text-blue-600">14:02</div>
            </div>
          </div>
        </div>

        {/* MAP COMPONENT */}
        <div className="flex-1 w-full h-full grayscale-[0.2] contrast-[1.1]">
          <LogiMap trucks={filteredTrucks} cargos={cargos} />
        </div>

        {/* Bottom Panel (Mobile Overlay) */}
        {selectedId && (
          <div className="absolute bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[98] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Обраний об'єкт
                </p>
                <p className="text-sm font-black text-slate-800">
                  {filteredTrucks.find((t) => t.id === selectedId)
                    ?.plateNumber ||
                    cargos.find((c) => c.id === selectedId)?.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
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
        .mb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </main>
  );
}
