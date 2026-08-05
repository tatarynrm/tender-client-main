"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AiOrb } from "./AiOrb";

/**
 * Етапи повторюють реальний конвеєр на сервері: модель обирає функцію,
 * функція йде в базу, далі модель переказує результат. Тому підпис міняється
 * не «для краси» — він показує, на чому саме зараз стоїть запит.
 */
const STAGES = [
  { after: 0, label: "Розбираю запит" },
  { after: 2, label: "Обираю джерело даних" },
  { after: 5, label: "Читаю базу" },
  { after: 11, label: "Формую відповідь" },
  { after: 25, label: "Ще працюю — запит великий" },
];

export function AiThinking() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stage =
    [...STAGES].reverse().find((s) => seconds >= s.after) ?? STAGES[0];

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
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <motion.span
            key={stage.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-300 bg-[length:200%_100%] bg-clip-text text-transparent"
            style={{ animation: "ai-shimmer 2.4s linear infinite" }}
          >
            {stage.label}
          </motion.span>

          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-violet-400"
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
              className="h-2.5 rounded-full bg-violet-500/[0.12]"
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
