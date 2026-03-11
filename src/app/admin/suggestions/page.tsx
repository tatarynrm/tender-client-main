"use client";

import React, { useEffect, useState } from "react";
import api from "@/shared/api/instance.api";
import { 
  MessageSquare, 
  Lightbulb, 
  Bug, 
  Heart, 
  Clock, 
  User,
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

const categories = [
  { id: "ALL", label: "Всі", icon: MessageSquare, color: "text-slate-500", bg: "bg-slate-100", darkBg: "dark:bg-slate-800" },
  { id: "SUGGESTION", label: "Ідеї", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", darkBg: "dark:bg-amber-500/10" },
  { id: "BUG", label: "Помилки", icon: Bug, color: "text-red-500", bg: "bg-red-500/10", darkBg: "dark:bg-red-500/10" },
  { id: "FEEDBACK", label: "Відгуки", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", darkBg: "dark:bg-rose-500/10" },
  { id: "OTHER", label: "Інше", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10", darkBg: "dark:bg-indigo-500/10" },
];

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { config } = useFontSize();

  useEffect(() => {
    api.get("/suggestion/list")
      .then(res => {
        setSuggestions(res.data);
      })
      .catch(err => console.error("Error fetching suggestions:", err))
      .finally(() => setLoading(false));
  }, []);

  const parseSuggestion = (notes: string) => {
    if (!notes) return { type: "OTHER", text: "" };
    const parts = notes.split(": ");
    if (parts.length > 1) {
      const type = parts[0].toUpperCase();
      const text = parts.slice(1).join(": ");
      // Check if type is one of our known categories
      if (["SUGGESTION", "BUG", "FEEDBACK", "OTHER"].includes(type)) {
        return { type, text };
      }
    }
    return { type: "OTHER", text: notes };
  };

  const filtered = suggestions.filter(s => {
    const { type, text } = parseSuggestion(s.notes);
    const matchesFilter = filter === "ALL" || type === filter;
    const authorName = `${s.person_name || ""} ${s.person_surname || ""}`.toLowerCase();
    const matchesSearch = text.toLowerCase().includes(search.toLowerCase()) || 
                         authorName.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-1 pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-2xl border border-indigo-100 dark:border-indigo-400/20">
            <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className={cn("font-black tracking-tight text-slate-900 dark:text-white", config.title)}>
              Відгуки та ідеї
            </h1>
            <p className={cn("text-slate-500 font-medium", config.label)}>
              Пропозиції та зауваження від користувачів платформи
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
                filter === cat.id 
                  ? "bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 shadow-md ring-2 ring-indigo-500/10" 
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <cat.icon className={cn("w-3.5 h-3.5", filter === cat.id ? "text-indigo-500" : "text-slate-400")} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Пошук за текстом або автором..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl h-56 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-white/10" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((s) => {
            const { type, text } = parseSuggestion(s.notes);
            const category = categories.find(c => c.id === type) || categories.find(c => c.id === "OTHER")!;
            const Icon = category.icon;

            return (
              <div 
                key={s.id} 
                className="group bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-500 flex flex-col relative overflow-hidden h-full"
              >
                {/* Decorative background circle */}
                <div className={cn("absolute -top-12 -right-12 w-32 h-32 blur-3xl rounded-full opacity-10 group-hover:opacity-20 transition-opacity", category.bg)} />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={cn("flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest", category.bg, category.color)}>
                    <Icon size={12} />
                    {category.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-tighter">
                    <Clock size={12} />
                    {format(new Date(s.created_at), "d MMMM, HH:mm", { locale: uk })}
                  </div>
                </div>

                <div className="flex-grow mb-8 relative z-10">
                   <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium line-clamp-6 group-hover:line-clamp-none transition-all">
                    {text}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-500">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                      {s.person_name} {s.person_surname}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Автор</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-32 text-center bg-white/30 dark:bg-slate-900/20 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
            <div className="inline-flex p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-500 uppercase tracking-tight">Нічого не знайдено</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2 px-6">Спробуйте змінити фільтри або пошуковий запит</p>
          </div>
        )}
      </div>
    </div>
  );
}
