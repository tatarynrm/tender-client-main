// "use client";
// import dynamic from "next/dynamic";
// import { useState } from "react";
// // types.ts
// export interface Location {
//   id: string;
//   lat: number;
//   lng: number;
//   address: string;
// }

// export interface Cargo extends Location {
//   weight: number;
//   type: string;
// }

// export interface Truck extends Location {
//   plateNumber: string;
//   status: "empty" | "loaded" | "on_way";
// }

// const LogiMap = dynamic(() => import("@/shared/components/Map/LogiMap"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-full w-full flex items-center justify-center bg-gray-100">
//       Завантаження карти...
//     </div>
//   ),
// });

// export default function MapPage() {
//   // Тестові дані (замініть на fetch з вашої БД)
//   const [trucks] = useState<Truck[]>([
//     {
//       id: "1",
//       lat: 50.45,
//       lng: 30.52,
//       address: "Київ",
//       plateNumber: "AA1111BB",
//       status: "empty",
//     },
//     {
//       id: "2",
//       lat: 49.83,
//       lng: 24.02,
//       address: "Львів",
//       plateNumber: "BC2222CB",
//       status: "on_way",
//     },
//   ]);

//   const [cargos] = useState<Cargo[]>([
//     {
//       id: "c1",
//       lat: 48.46,
//       lng: 35.04,
//       address: "Дніпро",
//       weight: 20,
//       type: "Зерно",
//     },
//     {
//       id: "c2",
//       lat: 46.48,
//       lng: 30.72,
//       address: "Одеса",
//       weight: 5,
//       type: "Побутова техніка",
//     },
//   ]);

//   return (
//     <main className="flex h-screen w-screen overflow-hidden font-sans">
//       {/* Sidebar - Список об'єктів */}
//       <div className="w-80 h-full bg-white shadow-xl z-[1000] flex flex-col border-r border-gray-200">
//         <div className="p-4 border-b bg-blue-600 text-white">
//           <h1 className="text-xl font-bold">Logistics Control</h1>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-6">
//           <section>
//             <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
//               Активні Авто ({trucks.length})
//             </h2>
//             {trucks.map((t) => (
//               <div
//                 key={t.id}
//                 className="p-3 mb-2 rounded-lg border hover:bg-blue-50 cursor-pointer transition"
//               >
//                 <p className="font-bold text-gray-800">{t.plateNumber}</p>
//                 <p className="text-xs text-gray-500">{t.address}</p>
//                 <span
//                   className={`text-[10px] px-2 py-1 rounded-full ${
//                     t.status === "empty"
//                       ? "bg-green-100 text-green-700"
//                       : "bg-yellow-100 text-yellow-700"
//                   }`}
//                 >
//                   {t.status === "empty" ? "Вільний" : "В дорозі"}
//                 </span>
//               </div>
//             ))}
//           </section>

//           <section>
//             <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
//               Вантажі ({cargos.length})
//             </h2>
//             {cargos.map((c) => (
//               <div
//                 key={c.id}
//                 className="p-3 mb-2 rounded-lg border border-orange-100 hover:bg-orange-50 cursor-pointer transition"
//               >
//                 <p className="font-bold text-gray-800">{c.type}</p>
//                 <p className="text-xs text-gray-500">
//                   {c.weight} т • {c.address}
//                 </p>
//               </div>
//             ))}
//           </section>
//         </div>
//       </div>

//       {/* Контейнер Карти */}
//       <div className="flex-1 relative">
//         <LogiMap trucks={trucks} cargos={cargos} />
//       </div>
//     </main>
//   );
// }
"use client";
import { Cargo, Truck } from "@/shared/components/Map/LogiMap";
import dynamic from "next/dynamic";
import { useState } from "react";


const LogiMap = dynamic(() => import("@/shared/components/Map/LogiMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
});

export default function MapPage() {
  const [trucks] = useState<Truck[]>([
    { id: "1", lat: 50.45, lng: 30.52, address: "Київ", plateNumber: "AA1111BB", status: "empty" },
    { id: "2", lat: 49.83, lng: 24.02, address: "Львів", plateNumber: "BC2222CB", status: "on_way" },
  ]);

  const [cargos] = useState<Cargo[]>([
    { id: "c1", lat: 48.46, lng: 35.04, address: "Дніпро", weight: 20, type: "Зерно" },
    { id: "c2", lat: 46.48, lng: 30.72, address: "Одеса", weight: 5, type: "Техніка" },
  ]);

  return (
    <main className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Тонкий Сайдбар */}
      <aside className="w-64 h-full bg-white/80 backdrop-blur-md z-[1000] flex flex-col border-r border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-lg font-bold tracking-tight text-slate-800">Dispatch <span className="text-blue-600">Pro</span></h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Секція Авто */}
          <div className="px-4 py-4">
            <h2 className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Вантажівки</h2>
            {trucks.map((t) => (
              <div key={t.id} className="group p-3 mb-1 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">{t.plateNumber}</p>
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${t.status === 'empty' ? 'bg-green-500' : 'bg-amber-400'}`} />
                </div>
                <p className="text-[11px] text-slate-500 truncate">{t.address}</p>
              </div>
            ))}
          </div>

          <hr className="mx-6 border-slate-100" />

          {/* Секція Вантажів */}
          <div className="px-4 py-4">
            <h2 className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Завантаження</h2>
            {cargos.map((c) => (
              <div key={c.id} className="p-3 mb-1 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <p className="text-sm font-medium text-slate-700">{c.type}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{c.weight}т</span>
                  <span className="text-[10px] text-slate-400">{c.address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Футер сайдбару */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <button className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition">
            Додати завантаження +
          </button>
        </div>
      </aside>

      {/* Мапа */}
      <div className="flex-1 relative">
        <LogiMap trucks={trucks} cargos={cargos} />
        
        {/* Панель швидких фільтрів поверх карти */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
          <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-white">
            Всі авто
          </div>
          <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-white">
            Тільки вільні
          </div>
        </div>
      </div>
    </main>
  );
}