"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { suggestionService } from "@/shared/services/suggestion.service";
import { toast } from "sonner";
import { useModal } from "@/shared/hooks/useGlobalModal";
import {
  Loader2,
  Send,
  MessageSquare,
  Lightbulb,
  Bug,
  Heart,
  Sparkles
} from "lucide-react";
import { cn } from "@/shared/utils";

const categories = [
  { id: "suggestion", label: "Ідея", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "bug", label: "Помилка", icon: Bug, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "feedback", label: "Відгук", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "other", label: "Інше", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
];

export const ModernSuggestionForm = () => {
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("suggestion");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { close } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Будь ласка, введіть ваше повідомлення");
      return;
    }

    setIsLoading(true);
    try {
      await suggestionService.saveSuggestion(`${category.toUpperCase()}: ${notes}`);
      setIsSuccess(true);
      toast.success("Дякуємо! Ваша пропозиція надіслана.");
      setTimeout(() => {
        close();
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося відправити повідомлення. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[550px] flex flex-col w-full">
      {/* Dynamic Background Elements - Always present */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
            scale: [1, 1.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px]"
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 500,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-2 h-2 bg-indigo-400/30 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex flex-col items-center justify-center py-20 text-center flex-grow px-6"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.7, 1] }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40"
              >
                <Sparkles className="text-white w-12 h-12" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-green-500 rounded-full -z-10 blur-2xl"
              />
            </div>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">Надіслано!</h3>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Дякуємо! Ваша ідея вже летить до нашої команди.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-8 flex-grow relative z-10 w-full"
          >
            <div className="flex flex-col gap-1 mb-2">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">
                Ваш відгуки та ідеї
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ми цінуємо кожну думку, яка допомагає нам ставати кращими.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 block">
                  Оберіть категорію
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300",
                          active
                            ? cn("bg-white dark:bg-zinc-800 shadow-xl ring-2 ring-indigo-500/20", cat.border)
                            : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        <div className={cn("p-2 rounded-xl mb-2", cat.bg)}>
                          <Icon className={cn("w-5 h-5", cat.color)} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          active ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                        )}>
                          {cat.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 block">
                  Ваше повідомлення
                </label>
                <div className="relative group">
                  <Textarea
                    placeholder="Розкажіть нам щось цікаве або повідомте про проблему..."
                    className="min-h-[160px] resize-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-300 rounded-2xl p-4 text-base"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notes.length} characters
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[200px] text-center sm:text-left flex items-center gap-1.5 leading-tight">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Ваші ідеї допомагають нам ставати кращими кожного дня.
              </p>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={close}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Пізніше
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !notes.trim()}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white gap-2 px-8 py-6 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="font-bold">Надіслати</span>
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
