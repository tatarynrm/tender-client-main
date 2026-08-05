"use client";

import { motion } from "framer-motion";

interface Props {
  rows: Record<string, any>[];
}

/**
 * Технічні ідентифікатори в таблиці не показуємо: користувачу вони нічого не
 * пояснюють, а місце й увагу забирають. Заборона тримається у двох місцях —
 * тут і в промпті генератора SQL, бо історія розмов зберігає й старі відповіді.
 */
const ID_COLUMN = /^(id|ids?_.+|.+_id|kod|kod_.+)$/i;

/**
 * Заголовки завжди українською. Основне джерело — самі запити: і фіксовані
 * SELECT-и, і згенеровані моделлю дають колонкам українські псевдоніми
 * (`AS "Кількість тендерів"`). Словник нижче рятує старі відповіді з історії
 * та рідкісні випадки, коли модель проігнорувала правило.
 */
const HEADERS: Record<string, string> = {
  client: "Клієнт",
  carrier: "Перевізник",
  company_name: "Компанія",
  department_name: "Відділ",
  display_name: "Назва файлу",
  extension: "Тип",
  file_size: "Розмір",
  price: "Ціна",
  date_load: "Завантаження",
  date_unload: "Розвантаження",
  load_info: "Вантаж",
  cargo: "Вантаж",
  count: "Кількість",
  total: "Разом",
  stavok: "Ставок",
  tenderiv: "Тендерів",
  aktyvnyh: "Активних",
  zakrytyh: "Закритих",
  pereviznykiv: "Перевізників",
  viddil: "Відділ",
  serednia: "Середнє",
  serednia_stavka: "Середня ставка",
  serednia_startova: "Середня стартова ціна",
  narahovano: "Нараховано",
  oplacheno: "Оплачено",
  zaborhovanist: "Заборгованість",
  aktiv: "Актів",
  platezhiv: "Платежів",
  period: "Період",
  reysiv: "Рейсів",
  dohid: "Дохід",
  vytraty: "Витрати",
  prybutok: "Прибуток",
};

/** Кирилиця в назві означає, що псевдонім уже український — чіпати не треба. */
const isUkrainian = (name: string) => /[а-яїієґ]/i.test(name);

const toHeader = (name: string): string => {
  if (isUkrainian(name)) return name;

  const known = HEADERS[name.toLowerCase()];
  if (known) return known;

  // Невідома латинська назва: хоч приберемо підкреслення, щоб не лякала
  const readable = name.replace(/_/g, " ").trim();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
};

/**
 * Таблиця даних під відповіддю моделі.
 *
 * Колонки визначаються з самих рядків: набір полів залежить від питання,
 * тому фіксованої схеми тут бути не може.
 */
export function AiDataTable({ rows }: Props) {
  if (!rows?.length) return null;

  const all = Object.keys(rows[0]);
  const withoutIds = all.filter((col) => !ID_COLUMN.test(col));
  // Якщо вибірка складається з самих ідентифікаторів, порожню таблицю
  // показувати гірше, ніж технічні колонки
  const columns = withoutIds.length ? withoutIds : all;

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
      className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/60"
    >
      {/*
        Прокрутка нативна з класом ai-thin-scroll (див. animation.effects.css):
        смуга завтовшки 4px, майже прозора, помітнішає лише під курсором.
        Radix ScrollArea тут був зайвим шаром: він малював власну смугу поверх
        нативної, і в кадрі опинялися дві.
      */}
      <div className="ai-thin-scroll max-h-[420px] w-full overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xl dark:bg-slate-800/95">
            <tr className="border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300"
                >
                  {toHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr
                key={i}
                className="border-t border-slate-100 transition-colors hover:bg-blue-50/60 dark:border-white/5 dark:hover:bg-blue-500/5"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300"
                  >
                    {format(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > visible.length && (
        <div className="border-t border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
          Показано {visible.length} із {rows.length} рядків
        </div>
      )}
    </motion.div>
  );
}
