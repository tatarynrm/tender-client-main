"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Copy,
  CalendarClock,
  Clock,
  Wallet,
  FileText,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    icon: CalendarClock,
    label: "Дати",
    desc: "Завантаження та розвантаження",
  },
  { icon: Clock, label: "Час", desc: "Початок і кінець проведення" },
  { icon: Wallet, label: "Бюджет", desc: "Валюта та ціни тендеру" },
];

export const CopyTenderInfoModal = () => {
  return (
    <div className="w-full">
      {/* ── Анімований граф потоку ── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-white/5 p-5 sm:p-6 mb-6 overflow-hidden">
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {/* Джерело */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-16 h-20 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center"
            >
              <FileText className="text-slate-400" size={26} />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow"
              >
                <Copy size={12} />
              </motion.div>
            </motion.div>
            <span className="text-[10px] font-bold text-slate-500">
              Поточний тендер
            </span>
          </div>

          <FlowArrow delay={0} />

          {/* 3 кроки */}
          <div className="flex items-end gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: [1, 1.14, 1],
                    boxShadow: [
                      "0 0 0 rgba(59,130,246,0)",
                      "0 6px 18px rgba(59,130,246,0.35)",
                      "0 0 0 rgba(59,130,246,0)",
                    ],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.5,
                    repeatDelay: 0.8,
                  }}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-500"
                >
                  <s.icon size={20} />
                </motion.div>
                <span className="text-[9px] font-bold text-slate-500">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <FlowArrow delay={0.4} />

          {/* Результат */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{ y: [6, 0, 6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-16 h-20 rounded-xl bg-blue-500 text-white shadow-lg flex items-center justify-center"
            >
              <FileText size={26} />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow"
              >
                <CheckCircle2 size={13} />
              </motion.div>
            </motion.div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Нова копія
            </span>
          </div>
        </div>

        {/* бейджі статусу */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <StatusBadge
            icon={<CalendarCheck size={12} />}
            text="Заплановані"
            tone="indigo"
          />
          <span className="text-[10px] text-slate-400">або</span>
          <StatusBadge icon={<Zap size={12} />} text="Активні" tone="emerald" />
        </div>
      </div>

      {/* ── Текстове пояснення ── */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        Кнопка <b>«Копіювати»</b> створює новий тендер на основі поточного. Усі
        дані (маршрут, вантаж, транспорт, замовник, аудиторія) переносяться
        автоматично — вам треба лише оновити те, що змінюється від рейсу до
        рейсу.
      </p>

      <ol className="space-y-3 mb-5">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <s.icon size={14} className="text-blue-500" />
                {s.label}
              </div>
              <div className="text-[13px] text-slate-500">{s.desc}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        Після заповнення трьох кроків копія створюється одразу. Якщо{" "}
        <b>початок проведення</b> у майбутньому — тендер потрапляє в{" "}
        <b>«Заплановані»</b>, якщо час уже настав — одразу в <b>«Активні»</b>.
      </div>
    </div>
  );
};

const FlowArrow = ({ delay }: { delay: number }) => (
  <motion.div
    animate={{ x: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 1.4, repeat: Infinity, delay }}
    className="text-blue-400"
  >
    <ArrowRight size={20} />
  </motion.div>
);

const StatusBadge = ({
  icon,
  text,
  tone,
}: {
  icon: React.ReactNode;
  text: string;
  tone: "indigo" | "emerald";
}) => (
  <span
    className={
      tone === "indigo"
        ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
        : "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
    }
  >
    {icon}
    {text}
  </span>
);
