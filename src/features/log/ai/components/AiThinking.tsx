"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AiOrb } from "./AiOrb";

/**
 * Один підпис на весь час очікування.
 *
 * Раніше тут змінювалися етапи конвеєра («обираю джерело», «читаю базу») —
 * це розкривало внутрішню кухню й нічого не давало користувачу. Лишився
 * лічильник секунд: він показує, що запит живий.
 */
const THINKING_LABEL = "Виконую запит — очікуйте";

export function AiThinking() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex gap-3"
    >
      <AiOrb size={32} active />

      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 bg-[length:200%_100%] bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-200 dark:to-blue-300"
            style={{ animation: "ai-shimmer 2.4s linear infinite" }}
          >
            {THINKING_LABEL}
          </motion.span>

          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-blue-500 dark:bg-blue-400"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>

          <span className="ml-1 font-mono text-xs opacity-50">{seconds}с</span>
        </div>

        {/* Скелет майбутньої відповіді */}
        <div className="flex max-w-md flex-col gap-2">
          {[100, 82, 60].map((w, i) => (
            <motion.div
              key={w}
              className="h-2.5 rounded-full bg-slate-200 dark:bg-white/10"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
