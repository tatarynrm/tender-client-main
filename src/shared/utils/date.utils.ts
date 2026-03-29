import { format } from "date-fns";

/**
 * Formats a date string.
 * If time is 00:00, returns only dd.MM.
 * Otherwise returns dd.MM - HH:mm.
 */
export const formatTenderDate = (
  dateString?: string | Date | null
): string => {
  if (!dateString) return "";
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const h = date.getHours();
  const m = date.getMinutes();

  if (h === 0 && m === 0) {
    return format(date, "dd.MM");
  }

  return format(date, "dd.MM - HH:mm");
};

/**
 * Formats a duration/range of load dates.
 */
export const getTenderLoadDateString = (
  date1?: string | Date | null,
  date2?: string | Date | null
): string => {
  const d1 = formatTenderDate(date1);
  const d2 = formatTenderDate(date2);

  if (d1 && d2 && d1 !== d2) return `${d1} — ${d2}`;
  return d1 || d2 || "—";
};
