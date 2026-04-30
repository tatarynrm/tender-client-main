import { format } from "date-fns";

/**
 * Internal helper to get date parts in Kyiv timezone
 */
const getKyivParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  return {
    day: getPart("day"),
    month: getPart("month"),
    year: getPart("year"),
    hour: parseInt(getPart("hour"), 10),
    minute: parseInt(getPart("minute"), 10),
    hourStr: getPart("hour"),
    minuteStr: getPart("minute"),
  };
};

/**
 * Formats a date string.
 * If time is 00:00, returns only dd.MM.
 * Otherwise returns dd.MM - HH:mm.
 */
export const formatTenderDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "";
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const { day, month, hour, minute, hourStr, minuteStr } = getKyivParts(date);

  if (hour === 0 && minute === 0) {
    return `${day}.${month}`;
  }

  return `${day}.${month} - ${hourStr}:${minuteStr}`;
};

/**
 * Formats a date string as dd.MM (HH:mm).
 * If time is 00:00, returns only dd.MM.
 */
export const formatTenderDateTime = (
  dateString?: string | Date | null,
): string => {
  if (!dateString) return "";
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const { day, month, hour, minute, hourStr, minuteStr } = getKyivParts(date);

  if (hour === 0 && minute === 0) {
    return `${day}.${month}`;
  }

  return `${day}.${month} (${hourStr}:${minuteStr})`;
};

/**
 * Formats a duration/range of load dates.
 */
export const getTenderLoadDateString = (
  date1?: string | Date | null,
  date2?: string | Date | null,
): string => {
  const d1 = formatTenderDateTime(date1);
  const d2 = formatTenderDateTime(date2);

  if (d1 && d2 && d1 !== d2) return `${d1} - ${d2}`;
  return d1 || d2 || "—";
};

/**
 * Formats a date string as dd.MM.yyyy HH:mm:ss
 */
export const formatFullDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return "";
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};
