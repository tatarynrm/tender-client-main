"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  X,
  ChevronDown,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useAirAlerts } from "../api/useAirAlerts";
import { UkraineAlertMap } from "./UkraineAlertMap";
import { CITY_TO_REGION } from "../data/regions";
import {
  loadSettings,
  saveSettings,
  getLastAlert,
  setLastAlert,
  type AirAlertSettings,
} from "../lib/storage";
import { playAlarm, playClear, armAudio } from "../lib/alarmSound";

const NEPTUN_URL = "https://neptun.in.ua/";

export const AirAlertWidget = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AirAlertSettings>(() =>
    loadSettings(),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data } = useAirAlerts();
  const regions = data?.regions ?? {};

  // підтягнути збережені налаштування після монтування (localStorage)
  // і розблокувати звук на першому ж жесті користувача.
  useEffect(() => {
    setSettings(loadSettings());
    armAudio();
  }, []);

  const update = (patch: Partial<AirAlertSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const userAlerted = settings.region
    ? Boolean(regions[settings.region])
    : undefined;

  // --- Детектор стану по обраній області: сповіщення + звук ---
  // Останній "оголошений" стан тримаємо в localStorage (getLastAlert/setLastAlert),
  // тож тривога озвучується і коли вона ВЖЕ активна на момент заходу/вибору міста,
  // але не повторюється при переходах між сторінками, доки стан не зміниться.
  useEffect(() => {
    if (!settings.region || !data) return;
    const now = Boolean(regions[settings.region]);
    const last = getLastAlert(settings.region);
    if (last === now) return; // стан не змінився з минулого разу — тиша

    if (now) {
      // тривога (нова або вже активна, яку ще не озвучували для цього міста)
      if (settings.soundOn) playAlarm();
      if (
        settings.notifyOn &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification("🚨 Повітряна тривога", {
          body: `${settings.city}: оголошено тривогу. Пройдіть в укриття.`,
        });
      }
    } else if (last === true) {
      // відбій озвучуємо лише якщо раніше справді була тривога
      if (settings.soundOn) playClear();
      if (
        settings.notifyOn &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification("✅ Відбій тривоги", {
          body: `${settings.city}: тривогу скасовано.`,
        });
      }
    }

    setLastAlert(settings.region, now);
  }, [data, regions, settings.region, settings.city, settings.soundOn, settings.notifyOn]);

  const enableNotifications = () => {
    if (typeof Notification === "undefined") {
      update({ notifyOn: false });
      return;
    }
    if (Notification.permission === "granted") {
      update({ notifyOn: !settings.notifyOn });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) =>
        update({ notifyOn: p === "granted" }),
      );
    } else {
      update({ notifyOn: false });
    }
  };

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CITY_TO_REGION.filter((c) => c.city.toLowerCase().includes(q));
  }, [search]);

  const activeCount = useMemo(
    () => Object.values(regions).filter(Boolean).length,
    [regions],
  );

  // стиль кнопки залежно від стану обраної області
  const btnState =
    userAlerted === true
      ? "alert"
      : userAlerted === false
        ? "calm"
        : "idle";

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 shadow-sm bg-white dark:bg-slate-900",
          btnState === "alert"
            ? "border-red-500 animate-pulse"
            : btnState === "calm"
              ? "border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500"
              : "border-red-300 dark:border-red-500/30 hover:border-red-500",
        )}
      >
        {btnState === "calm" ? (
          <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        ) : (
          <ShieldAlert
            size={16}
            className={btnState === "alert" ? "text-red-600" : "text-red-500"}
          />
        )}
        <div className="flex flex-col items-start leading-none gap-0.5 min-w-0">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-tight truncate",
              btnState === "alert"
                ? "text-red-600"
                : btnState === "calm"
                  ? "text-emerald-600"
                  : "text-red-500",
            )}
          >
            {btnState === "alert"
              ? "Тривога!"
              : btnState === "calm"
                ? "Спокійно"
                : "Карта тривог"}
          </span>
          <span className="text-[9px] font-medium text-blue-500 truncate">
            {settings.city ?? "Україна"}
          </span>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-3 ml-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Оперативна карта повітряних тривог
                </h3>
                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                  {activeCount} активних
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: карта + панель */}
            <div className="flex flex-col lg:flex-row min-h-0 overflow-auto">
              {/* Карта */}
              <div className="relative flex-1 bg-[#0b1a33] p-3 sm:p-6 flex items-center justify-center min-h-[320px]">
                <UkraineAlertMap
                  regions={regions}
                  selectedRegion={settings.region}
                />
              </div>

              {/* Панель керування */}
              <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 p-5 flex flex-col gap-5">
                {/* Вибір міста */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Ваше місто
                  </label>
                  <button
                    onClick={() => setPickerOpen((v) => !v)}
                    className="mt-1.5 w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <MapPin size={15} className="text-blue-500 shrink-0" />
                      {settings.city ?? "Оберіть місто"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-slate-400 transition-transform",
                        pickerOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {pickerOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <Search size={14} className="text-slate-400 ml-1" />
                        <input
                          autoFocus
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Пошук міста..."
                          className="w-full bg-transparent text-xs p-1 outline-none"
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto p-1">
                        {filteredCities.map((c) => {
                          const a = Boolean(regions[c.region]);
                          return (
                            <button
                              key={c.city}
                              onClick={() => {
                                update({ city: c.city, region: c.region });
                                setPickerOpen(false);
                                setSearch("");
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <span className="truncate">{c.city}</span>
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full shrink-0",
                                  a ? "bg-red-500 animate-pulse" : "bg-emerald-400",
                                )}
                              />
                            </button>
                          );
                        })}
                        {filteredCities.length === 0 && (
                          <div className="p-4 text-center text-[10px] text-slate-400 italic">
                            Місто не знайдено
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Статус обраного міста */}
                {settings.region && (
                  <div
                    className={cn(
                      "rounded-xl p-3 flex items-center gap-3 border",
                      userAlerted
                        ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                        : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
                    )}
                  >
                    {userAlerted ? (
                      <ShieldAlert className="text-red-500 shrink-0" size={22} />
                    ) : (
                      <ShieldCheck
                        className="text-emerald-500 shrink-0"
                        size={22}
                      />
                    )}
                    <div className="leading-tight">
                      <div
                        className={cn(
                          "text-sm font-black",
                          userAlerted ? "text-red-600" : "text-emerald-600",
                        )}
                      >
                        {userAlerted ? "Повітряна тривога" : "Зараз спокійно"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {settings.region}
                      </div>
                    </div>
                  </div>
                )}

                {/* Перемикачі */}
                <div className="flex flex-col gap-2">
                  <ToggleRow
                    active={settings.soundOn}
                    onClick={() => update({ soundOn: !settings.soundOn })}
                    onLabel="Звук увімкнено"
                    offLabel="Звук вимкнено"
                    iconOn={<Volume2 size={16} />}
                    iconOff={<VolumeX size={16} />}
                  />
                  <ToggleRow
                    active={settings.notifyOn}
                    onClick={enableNotifications}
                    onLabel="Сповіщення увімкнено"
                    offLabel="Сповіщення вимкнено"
                    iconOn={<Bell size={16} />}
                    iconOff={<BellOff size={16} />}
                  />
                </div>

                {/* Кнопка дронів (neptun) */}
                <a
                  href={NEPTUN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Карта дронів (neptun.in.ua)
                </a>

                <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                  Місто та налаштування зберігаються лише у вашому браузері.
                  Дані тривог — по областях.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleRow = ({
  active,
  onClick,
  onLabel,
  offLabel,
  iconOn,
  iconOff,
}: {
  active: boolean;
  onClick: () => void;
  onLabel: string;
  offLabel: string;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors",
      active
        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600"
        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400",
    )}
  >
    <span className="flex items-center gap-2">
      {active ? iconOn : iconOff}
      {active ? onLabel : offLabel}
    </span>
    <span
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors",
        active ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
          active ? "left-[18px]" : "left-0.5",
        )}
      />
    </span>
  </button>
);
