// Налаштування тривог зберігаються ЛИШЕ локально (localStorage), не в БД.

export interface AirAlertSettings {
  /** Обране місто (для показу), напр. "Львів" */
  city: string | null;
  /** Ключ області тривоги, напр. "Львівська область" */
  region: string | null;
  /** Звукове сповіщення */
  soundOn: boolean;
  /** Браузерне сповіщення (Notification API) */
  notifyOn: boolean;
}

const KEY = "ict_air_alert_settings";

export const DEFAULT_SETTINGS: AirAlertSettings = {
  city: null,
  region: null,
  soundOn: true,
  notifyOn: true,
};

export function loadSettings(): AirAlertSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AirAlertSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* приватний режим / квота — ігноруємо, віджет працює без збереження */
  }
}
