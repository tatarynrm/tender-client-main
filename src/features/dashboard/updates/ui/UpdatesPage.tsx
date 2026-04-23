"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  PlusCircle, 
  Wrench,
  Rocket,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRightIcon
} from "lucide-react";
import changelogData from "@/shared/data/changelog.json";

export type UpdateCategory = "carrier" | "manager" | "admin" | "all";
export type UpdateType = "added" | "improved" | "fixed" | "security";

interface ChangelogEntry {
  id: string;
  date: string;
  time?: string;
  version: string;
  category: UpdateCategory;
  type: UpdateType;
  title: string;
  description: string;
}

interface UpdatesPageProps {
  category?: UpdateCategory;
}

const ITEMS_PER_PAGE = 5;

const getTypeStyles = (type: UpdateType) => {
  switch (type) {
    case "added":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        icon: PlusCircle,
        label: "Нове"
      };
    case "improved":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
        icon: Wrench,
        label: "Покращено"
      };
    case "fixed":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        icon: CheckCircle2,
        label: "Виправлено"
      };
    case "security":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20",
        icon: ShieldAlert,
        label: "Безпека"
      };
  }
};

const getCategoryLabel = (category: UpdateCategory) => {
  switch (category) {
    case "carrier": return "Перевізник";
    case "manager": return "Менеджер LOG";
    case "admin": return "Адмін";
    case "all": return "Для всіх";
  }
};

export function UpdatesPage({ category }: UpdatesPageProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return (changelogData as ChangelogEntry[]).filter(
      (item) => !category || item.category === category || item.category === "all"
    ).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [category]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentItems = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Ггрупування по днях
  const groupedItems = useMemo(() => {
    const groups: Record<string, ChangelogEntry[]> = {};
    currentItems.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return groups;
  }, [currentItems]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 pb-20 px-4">
      <header className="space-y-4 text-center py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 mb-4"
        >
          <Rocket className="w-10 h-10 text-blue-500" />
        </motion.div>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
          Журнал <span className="text-blue-500">Оновлень</span>
        </h1>
        <p className="text-base lg:text-lg font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Детальна історія вдосконалення нашої платформи. Ми стаємо кращими щодня.
        </p>
      </header>

      <div className="space-y-16">
        {Object.entries(groupedItems).map(([date, items], groupIdx) => (
          <div key={date} className="space-y-8">
            <div className="sticky top-20 z-20 flex items-center gap-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-4 rounded-2xl">
              <div className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-black uppercase tracking-widest text-sm shadow-xl">
                <Calendar className="w-4 h-4" />
                {date}
              </div>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-zinc-200 dark:from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {items.map((entry, idx) => {
                const typeStyle = getTypeStyles(entry.type);
                const TypeIcon = typeStyle.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white/50 dark:bg-zinc-950/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group-hover:border-blue-500/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TypeIcon className="w-32 h-32" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                          <TypeIcon className="w-4 h-4" />
                          {typeStyle.label}
                        </div>
                        {entry.time && (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-4 h-4" />
                            {entry.time}
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400">
                          <Tag className="w-4 h-4" />
                          {getCategoryLabel(entry.category)}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Версія</span>
                           <span className="text-sm font-black text-blue-500">v{entry.version}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-6 group-hover:text-blue-500 transition-colors uppercase tracking-tight">
                        {entry.title}
                      </h3>
                      
                      <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base lg:text-lg font-medium whitespace-pre-wrap">
                        {entry.description}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 rounded-2xl font-black transition-all ${
                  currentPage === i + 1 
                  ? "bg-blue-500 text-white shadow-xl shadow-blue-500/30" 
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
