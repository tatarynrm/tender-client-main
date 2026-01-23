"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Map,
  X,
  Volume2,
  Navigation,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface AlarmStatus {
  isAlarm: boolean;
  regionName: string;
  lastUpdate: string;
}

export const AirAlarmWidget = () => {
  const [status, setStatus] = useState<AlarmStatus>({
    isAlarm: false,
    regionName: "Визначення...",
    lastUpdate: "--:--",
  });
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);

  const prevAlarmRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Ініціалізація звуку
  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm/air-alarm.mp3");
    audioRef.current.volume = 0.6;
  }, []);

  // 2. РЕАЛЬНЕ ВИЗНАЧЕННЯ ГЕОЛОКАЦІЇ (Додано назад)
  useEffect(() => {
    const fallback = "Київська область";

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=uk`,
            );
            const data = await res.json();
            const region = data.principalSubdivision || fallback;
            console.log("📍 Локація визначена:", region);
            setDetectedRegion(region);
          } catch (e) {
            setDetectedRegion(fallback);
          }
        },
        () => setDetectedRegion(fallback),
        { timeout: 10000 },
      );
    } else {
      setDetectedRegion(fallback);
    }
  }, []);

  // 3. ПЕРЕВІРКА ТРИВОГИ
  useEffect(() => {
    if (!detectedRegion) return;

    const checkAlarm = async () => {
      // Відразу міняємо текст з "Визначення" на назву області
      setStatus((prev) => ({
        ...prev,
        regionName: detectedRegion.replace(" область", " обл."),
      }));

      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://alerts.in.ua/api/states?t=${Date.now()}`,
        )}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents && !data.contents.trim().startsWith("<!DOCTYPE")) {
          const statesData = JSON.parse(data.contents);
          const currentRegionData = statesData.states.find(
            (s: any) =>
              detectedRegion.toLowerCase().includes(s.name.toLowerCase()) ||
              s.name.toLowerCase().includes(detectedRegion.toLowerCase()),
          );

          const isCurrentlyAlarm = currentRegionData?.alert || false;

          if (isCurrentlyAlarm && !prevAlarmRef.current) {
            audioRef.current?.play().catch(() => {});
          }

          prevAlarmRef.current = isCurrentlyAlarm;
          setStatus({
            isAlarm: isCurrentlyAlarm,
            regionName: detectedRegion.replace(" область", " обл."),
            lastUpdate: new Date().toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
      } catch (e) {
        console.warn("API тривог недоступне, чекаємо наступної спроби");
      }
    };

    checkAlarm();
    const timer = setInterval(checkAlarm, 30000);
    return () => clearInterval(timer);
  }, [detectedRegion]);

  return (
    <div className="relative ">
      <button
        onClick={() => {
          setIsMapOpen(true);
          audioRef.current?.pause();
        }}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95 shadow-sm relative overflow-hidden",
          status.isAlarm
            ? "bg-red-500/10 border-red-500 text-red-600 animate-pulse"
            : "bg-white dark:bg-slate-900 border-emerald-500/50 text-emerald-600",
        )}
      >
        {!status.isAlarm && (
          <span className="absolute inset-0 border border-emerald-500 rounded-xl animate-[ping_2s_infinite] opacity-20 pointer-events-none" />
        )}

        {status.isAlarm ? (
          <div className="relative">
            <ShieldAlert size={14} className="animate-bounce" />
            <Volume2
              size={8}
              className="absolute -top-1 -right-1 animate-pulse"
            />
          </div>
        ) : (
          <ShieldCheck size={14} />
        )}

        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px] font-black uppercase tracking-tight">
            {status.isAlarm ? "Повітряна тривога" : "Небезпеки немає"}
          </span>
          <div className="flex items-center gap-1">
            {!detectedRegion && (
              <Navigation size={8} className="animate-pulse" />
            )}
            <span className="text-[8px] opacity-70 font-bold uppercase whitespace-nowrap">
              {status.regionName} • {status.lastUpdate}
            </span>
          </div>
        </div>

        <Map
          size={12}
          className={cn(
            "ml-1 opacity-40",
            status.isAlarm && "animate-spin-slow",
          )}
        />
      </button>

      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    status.isAlarm ? "bg-red-500" : "bg-emerald-500",
                  )}
                >
                  <ShieldAlert size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-black uppercase">Карта тривог</h3>
              </div>
              <button
                onClick={() => setIsMapOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                src="https://alerts.in.ua/"
                className="w-full h-full border-none"
                title="Map"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
