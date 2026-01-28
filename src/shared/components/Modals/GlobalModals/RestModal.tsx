"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Coffee, X, RefreshCw, AlertCircle, Utensils } from "lucide-react";
import { AppButton } from "../../Buttons/AppButton";

export const RestModal = ({ close }: { close: () => void }) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const GIPHY_KEY = "R2GJRljiw5B8DmkKARD5alOTsYQMUDRY";
  // dsddsdsasdsdweweew

  const fetchGif = useCallback(async () => {
    setIsGifLoading(true);
    setHasError(false);

    try {
      // Ключові слова змінено на більш "обідні" та позитивні
      const keywords = [
        "lunch time",
        "food",
        "funny animal eat",
        "relaxing",
        "pizza time",
      ];

      const search = keywords[Math.floor(Math.random() * keywords.length)];

      const res = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=${search}&rating=g`,
      );

      const json = await res.json();
      const url =
        json?.data?.images?.downsized_large?.url ||
        json?.data?.images?.original?.url;

      if (url) {
        setGifUrl(url);
      } else {
        throw new Error("No GIF URL found");
      }
    } catch (e) {
      console.error("Giphy Error:", e);
      setHasError(true);
    } finally {
      setIsGifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGif();
  }, [fetchGif]);

  return (
    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 text-center border border-zinc-100 dark:border-white/5 overflow-hidden">
      <button
        onClick={close}
        className="absolute right-5 top-5 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
      >
        <X size={20} />
      </button>

      {/* Іконка змінена на комбінацію Кави та Виделки */}
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-500">
        <Utensils size={28} strokeWidth={1.5} className="animate-pulse" />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        Смачного перекусу! 🥪
      </h3>

      <p className="text-slate-500 dark:text-zinc-400 text-[14px] mb-6 leading-relaxed px-2">
        Вже 13:00 — найкращий час, щоб відкласти задачі, підкріпитися та трохи
        перезавантажитись.
      </p>

      <div className="relative w-full h-56 mb-6 bg-zinc-100 dark:bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center group border border-zinc-50 dark:border-white/5 shadow-inner">
        {isGifLoading ? (
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
              Шукаю щось апетитне...
            </p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center gap-3 px-4">
            <AlertCircle size={32} className="text-zinc-300" />
            <p className="text-[12px] text-zinc-400 leading-tight">
              Картинка не завантажилась, але обід за розкладом!
            </p>
            <button
              onClick={fetchGif}
              className="text-orange-500 text-[12px] font-bold hover:underline"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : (
          gifUrl && (
            <>
              <img
                src={gifUrl}
                alt="Lunch GIF"
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                onError={() => setHasError(true)}
              />
              <button
                onClick={fetchGif}
                className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <RefreshCw size={18} />
              </button>
            </>
          )
        )}
      </div>

      <AppButton
        onClick={close}
        className="w-full h-12 rounded-2xl bg-orange-600 shadow-lg shadow-orange-500/20 text-white font-bold text-[15px] active:scale-95 transition-all"
      >
        Зрозумів, іду обідати
      </AppButton>

      <div className="absolute -bottom-10 -left-10 -z-10 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />
    </div>
  );
};
