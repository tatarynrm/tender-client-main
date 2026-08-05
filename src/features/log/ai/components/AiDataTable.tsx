"use client";

import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Props {
  rows: Record<string, any>[];
}

/**
 * Таблиця даних під відповіддю моделі.
 *
 * Колонки визначаються з самих рядків: набір полів залежить від того,
 * який tool відпрацював, тому фіксованої схеми тут бути не може.
 */
export function AiDataTable({ rows }: Props) {
  if (!rows?.length) return null;

  const columns = Object.keys(rows[0]);
  const visible = rows.slice(0, 50);

  const format = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }
    // Дати з БД приходять ISO-рядком — показуємо без часової частини
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return value.slice(0, 10);
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-background/50 shadow-[0_12px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
    >
      <ScrollArea className="w-full">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl">
              <tr className="border-b border-border/50">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-3 py-2.5 text-left font-medium tracking-wide text-muted-foreground/80 uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border/30 transition-colors hover:bg-sky-400/[0.05]"
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="whitespace-nowrap px-3 py-2 text-foreground/85"
                    >
                      {format(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {rows.length > visible.length && (
        <div className="border-t border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground/70">
          Показано {visible.length} із {rows.length} рядків
        </div>
      )}
    </motion.div>
  );
}
