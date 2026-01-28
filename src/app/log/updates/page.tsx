"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  CalendarDays 
} from "lucide-react";
import { cn } from "@/shared/utils"; // Переконайтеся, що шлях правильний

// Тип для даних оновлення
interface UpdateItem {
  id: number;
  title: string;
  description: React.ReactNode; // Змінили на ReactNode, щоб можна було передавати JSX (списки)
  images: string[]; // Масив зображень замість одного рядка
  date: string;
}

const UPDATES_DATA: UpdateItem[] = [
  {
    id: 1,
    title: "Картка вантажу",
    date: "2026-01-28 14:47",
    images: [
      "/learn/cargo-28-01-2026.png",
      "/learn/cargo-active-status-online.png", // Додайте сюди реальні шляхи до додаткових фото
      "/learn/cargo-active-status-offline.png",
    ],
    description: (
      <div className="space-y-4">
        <p>
          Ми повністю переробили картку вантажу, перетворивши її на повноцінний пульт керування логістикою. 
          Ось що тепер доступно:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>
            <strong>Real-time індикація:</strong> Анімація ("shake") та кольорові бейджі при зміні ціни, додаванні авто чи нових повідомленнях.
          </li>
          <li>
            <strong>Детальний маршрут:</strong> Відображення прапорів країн, назв областей та точних адрес при наведенні (Tooltip).
          </li>
          <li>
            <strong>Статуси та таймінг:</strong> Чітке відображення дат завантаження/розвантаження та часу останнього оновлення.
          </li>
          <li>
            <strong>Комунікація:</strong> Вбудована кнопка чату з лічильником непрочитаних повідомлень та пульсуючим індикатором.
          </li>
          <li>
            <strong>Лічильники авто:</strong> Окремі лічильники для авто "В пошуку", "Закритих" та "Відмінених" заявок.
          </li>
          <li>
            <strong>Дії менеджера:</strong> Швидкий доступ до історії, редагування, закриття заявки та перегляду профілю автора (з індикатором онлайн/офлайн).
          </li>
          <li>
            <strong>Інформативність:</strong> Відображення типу оплати, валюти, типу кузова та додаткових умов (LTL, запит ціни).
          </li>
        </ul>
      </div>
    ),
  },
];

export default function UpdatesPage() {
  const [modalState, setModalState] = useState<{ images: string[]; index: number } | null>(null);

  const navigateModal = (direction: number) => {
    setModalState((prev) => {
      if (!prev) return null;
      const newIndex = (prev.index + direction + prev.images.length) % prev.images.length;
      return { ...prev, index: newIndex };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalState) return;
      if (e.key === "Escape") setModalState(null);
      if (e.key === "ArrowLeft") navigateModal(-1);
      if (e.key === "ArrowRight") navigateModal(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState]);

  return (
    <div className="min-h-screen  py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-teal-600 mb-2 tracking-tight">Журнал оновлень</h1>
          <p className="text-gray-500 italic">Дізнавайтесь про нові можливості платформи першими</p>
        </header>

        <div className="space-y-10">
          {UPDATES_DATA.map((item) => (
            <UpdateCard 
              key={item.id} 
              item={item} 
              onImageClick={(images, index) => setModalState({ images, index })} 
            />
          ))}
        </div>
      </div>

      {/* MODAL LIGHTBOX */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setModalState(null)}>
          <button className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full z-50 transition-all">
            <X size={32} />
          </button>

          {modalState.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); navigateModal(-1); }} className="absolute left-6 p-4 text-white/70 hover:text-white bg-white/10 rounded-full z-50 transition-all hover:scale-110">
                <ChevronLeft size={48} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigateModal(1); }} className="absolute right-6 p-4 text-white/70 hover:text-white bg-white/10 rounded-full z-50 transition-all hover:scale-110">
                <ChevronRight size={48} />
              </button>
            </>
          )}

          <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={modalState.images[modalState.index]} alt="Full view" fill className="object-contain" priority />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/10 text-white rounded-full text-sm">
              {modalState.index + 1} / {modalState.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UpdateCard({ item, onImageClick }: { item: UpdateItem; onImageClick: (images: string[], index: number) => void }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  return (
    <article className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
      
      {/* ЛІВА ЧАСТИНА - ГАЛЕРЕЯ (FIT MODE) */}
      <div className="relative w-full md:w-[45%] h-[350px] md:h-auto bg-[#1a1a1a] flex items-center justify-center shrink-0">
        <div 
          className="relative w-full h-full cursor-zoom-in group/gallery p-4"
          onClick={() => onImageClick(item.images, currentImgIndex)}
        >
          <Image
            src={item.images[currentImgIndex]}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-700 group-hover/gallery:scale-[1.02] p-4"
          />
          
          {/* Zoom Hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity bg-black/20 pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30">
               <ZoomIn size={24} />
            </div>
          </div>

          {/* Nav Controls */}
          {item.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImgIndex((p) => (p - 1 + item.images.length) % item.images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md opacity-0 group-hover/gallery:opacity-100 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImgIndex((p) => (p + 1) % item.images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md opacity-0 group-hover/gallery:opacity-100 transition-all">
                <ChevronRight size={20} />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {item.images.map((_, idx) => (
                  <div key={idx} className={cn("h-1.5 rounded-full transition-all", idx === currentImgIndex ? "w-6 bg-teal-400" : "w-1.5 bg-white/30")} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ПРАВА ЧАСТИНА */}
      <div className="flex flex-col p-8 md:p-10 flex-1 justify-center">
        <div className="flex items-center gap-4 mb-6">
          <span className="px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest rounded-full border border-teal-100">
            Версія {item.id}.0
          </span>
          <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
             <CalendarDays size={16} />
             <time>{item.date}</time>
          </div>
        </div>

        <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
          {item.title}
        </h3>

        <div className="text-gray-600 text-lg leading-relaxed mb-4">
          {item.description}
        </div>
      </div>
    </article>
  );
}