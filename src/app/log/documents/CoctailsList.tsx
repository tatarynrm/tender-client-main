"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/shared/api/instance.api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  FileText,
  Play,
  Music,
  Box,
  X,
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
} from "lucide-react";

interface Cocktail {
  id: string;
  name: string;
  price: number;
  images: { id: string; url: string }[];
}

export default function CocktailList() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isZipping, setIsZipping] = useState<string | null>(null);

  // Стейт для перегляду медіа
  const [viewData, setViewData] = useState<{
    cocktail: Cocktail;
    index: number;
  } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

  const fetchCocktails = async () => {
    try {
      const { data } = await api.get("/cocktails/list");
      setCocktails(data);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCocktails();
  }, []);

  // --- НАВІГАЦІЯ ---
  const handlePrev = useCallback(() => {
    if (!viewData) return;
    const { cocktail, index } = viewData;
    const newIndex = index > 0 ? index - 1 : cocktail.images.length - 1;
    setViewData({ cocktail, index: newIndex });
  }, [viewData]);

  const handleNext = useCallback(() => {
    if (!viewData) return;
    const { cocktail, index } = viewData;
    const newIndex = index < cocktail.images.length - 1 ? index + 1 : 0;
    setViewData({ cocktail, index: newIndex });
  }, [viewData]);

  // --- ОБРОБКА КЛАВІАТУРИ ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewData) return;

      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setViewData(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    // Прибираємо прослуховувач при закритті або перемалюванні
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewData, handlePrev, handleNext]);

  // --- ЛОГІКА СКАТУВАННЯ ZIP ---
  const downloadAllMedia = async (cocktail: Cocktail) => {
    setIsZipping(cocktail.id);
    const zip = new JSZip();

    try {
      const downloadPromises = cocktail.images.map(async (img) => {
        const response = await fetch(`${baseUrl}${img.url}`);
        const blob = await response.blob();
        const fileName = img.url.split("/").pop() || `file-${img.id}`;
        zip.file(fileName, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${cocktail.name.replace(/\s+/g, "_")}_all_files.zip`);
    } catch (error) {
      console.error("Помилка при створенні ZIP:", error);
      alert("Не вдалося завантажити всі файли");
    } finally {
      setIsZipping(null);
    }
  };

  // --- РЕНДЕР КОНТЕНТУ ---
  const renderMediaContent = (url: string, name: string, isFullView = false) => {
    const fullUrl = `${baseUrl}${url}`;
    const ext = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      return (
        <img
          src={fullUrl}
          alt={name}
          className={`w-full h-full ${isFullView ? "object-contain" : "object-cover"}`}
        />
      );
    }

    if (["mp4", "webm", "ogg", "mov"].includes(ext || "")) {
      return (
        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
          <video
            src={fullUrl}
            controls={isFullView}
            autoPlay={isFullView}
            className="w-full h-full object-contain"
            muted={!isFullView}
          />
          {!isFullView && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <Play fill="currentColor" size={20} />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (["mp3", "wav", "ogg"].includes(ext || "")) {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center gap-4 ${isFullView ? "bg-zinc-900" : "bg-amber-50"}`}>
          <div className={`${isFullView ? "w-32 h-32 bg-amber-600 shadow-amber-500/20" : "w-16 h-16 bg-amber-500"} rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-pulse`}>
            <Music size={isFullView ? 48 : 24} />
          </div>
          {isFullView ? (
            <div className="w-full max-w-md px-4">
              <audio src={fullUrl} controls autoPlay className="w-full h-12 accent-amber-500" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4 text-center">Playing: {name}</p>
            </div>
          ) : (
            <span className="text-amber-600 text-[10px] font-black uppercase tracking-tighter">Audio Track ({ext})</span>
          )}
        </div>
      );
    }

    if (ext === "pdf") {
      return isFullView ? (
        <iframe src={fullUrl} className="w-full h-[80vh] rounded-[2rem] bg-white border-none" title="PDF Preview" />
      ) : (
        <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-2 text-blue-500">
          <FileText size={40} />
          <span className="text-[10px] font-black uppercase tracking-tighter">PDF</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400">
        <Box size={40} />
        <span className="text-[10px] font-black uppercase tracking-tighter">FILE: {ext}</span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-10 text-zinc-400 uppercase font-black animate-pulse flex items-center gap-3">
        <Loader2 className="animate-spin" /> Завантаження...
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 bg-zinc-50 min-h-screen">
      {cocktails.map((cocktail) => (
        <div key={cocktail.id} className="group bg-white border border-zinc-200 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
          <div className="relative h-64 w-full bg-zinc-100 flex overflow-x-auto snap-x scrollbar-hide">
            {cocktail.images.map((img, idx) => (
              <div key={img.id} className="min-w-full h-full snap-center relative cursor-pointer" onClick={() => setViewData({ cocktail, index: idx })}>
                {renderMediaContent(img.url, cocktail.name)}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              </div>
            ))}
          </div>

          <div className="p-6 flex justify-between items-center">
            <h3 className="font-black text-zinc-900 uppercase text-lg truncate pr-4">{cocktail.name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAllMedia(cocktail)}
                disabled={isZipping === cocktail.id}
                className="p-3 bg-zinc-100 text-zinc-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isZipping === cocktail.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              </button>
              <button className="bg-zinc-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest hover:bg-zinc-700 transition-colors">EDIT</button>
            </div>
          </div>
        </div>
      ))}

      {/* --- LIGHTBOX --- */}
      {viewData && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-between py-10 px-6 animate-in fade-in duration-300">
          <button onClick={() => setViewData(null)} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 z-[110]">
            <X size={24} />
          </button>

          <div className="flex-1 flex items-center justify-center w-full max-w-6xl relative">
            <button onClick={handlePrev} className="absolute left-0 p-6 text-white/40 hover:text-white transition-all z-20">
              <ArrowLeft size={48} strokeWidth={1} />
            </button>
            <button onClick={handleNext} className="absolute right-0 p-6 text-white/40 hover:text-white transition-all z-20">
              <ArrowRight size={48} strokeWidth={1} />
            </button>

            <div className="w-full max-h-[70vh] flex items-center justify-center p-4">
              {renderMediaContent(viewData.cocktail.images[viewData.index].url, viewData.cocktail.name, true)}
            </div>
          </div>

          <div className="w-full max-w-4xl flex flex-col items-center gap-6">
            <div className="flex gap-3 p-3 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-x-auto no-scrollbar max-w-full">
              {viewData.cocktail.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setViewData({ ...viewData, index: idx })}
                  className={`relative min-w-[60px] h-[60px] rounded-2xl overflow-hidden border-2 transition-all 
                  ${viewData.index === idx ? "border-blue-500 scale-110 shadow-lg shadow-blue-500/40" : "border-transparent opacity-30"}`}
                >
                  {renderMediaContent(img.url, "thumb")}
                </button>
              ))}
            </div>

            <div className="text-white text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
              <span className="opacity-50">{viewData.index + 1} / {viewData.cocktail.images.length}</span>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="truncate max-w-[200px]">{viewData.cocktail.name}</span>
              <button
                onClick={() => {
                  const url = `${baseUrl}${viewData.cocktail.images[viewData.index].url}`;
                  const name = url.split("/").pop() || "file";
                  saveAs(url, name);
                }}
                className="ml-4 flex items-center gap-2 p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
              >
                <Download size={14} />
                <span className="tracking-tighter uppercase">Save File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}