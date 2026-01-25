"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-white/10" />
    );

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-sm overflow-hidden group",
        "bg-white dark:bg-slate-900 border-zinc-200 dark:border-white/10 hover:border-teal-500",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: 20, opacity: 0, rotate: -45, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: -20, opacity: 0, rotate: 45, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 500, // Було 300 (більше = швидше)
            damping: 30, // Було 20 (більше = менше зайвих коливань)
            mass: 0.5, // Додайте це: менша маса рухається швидше
          }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon
              size={18}
              className="text-teal-400 fill-teal-400/10 transition-colors group-hover:text-teal-300"
              strokeWidth={2.5}
            />
          ) : (
            <Sun
              size={18}
              className="text-amber-500 fill-amber-500/10 transition-colors group-hover:text-amber-600"
              strokeWidth={2.5}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ефект легкого сяйва при наведенні */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div
          className={cn(
            "absolute inset-0 blur-md scale-150",
            isDark ? "bg-teal-500/5" : "bg-amber-500/5",
          )}
        />
      </div>

      <span className="sr-only">Змінити тему</span>
    </button>
  );
}
