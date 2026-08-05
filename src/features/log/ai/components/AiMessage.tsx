"use client";

import { cn } from "@/shared/utils/index";
import { motion } from "framer-motion";
import { Check, Copy, Database } from "lucide-react";
import { useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter";
import { ILocalAiMessage } from "../types/local-ai.types";
import { AiDataTable } from "./AiDataTable";
import { AiOrb } from "./AiOrb";

interface Props {
  message: ILocalAiMessage;
  /** Друкувати текст посимвольно — лише для щойно отриманої відповіді. */
  animate?: boolean;
}

export function AiMessage({ message, animate = false }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const { shown, isTyping } = useTypewriter(message.content, animate && !isUser);
  const text = isUser ? message.content : shown;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Буфер обміну недоступний (не-https контекст) — мовчки нічого не робимо
    }
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-violet-600/30 bg-violet-900/50 px-4 py-2.5 text-sm leading-relaxed shadow-sm backdrop-blur-sm">
          <p className="whitespace-pre-wrap text-zinc-100">{text}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group flex gap-3"
    >
      <AiOrb size={32} active={isTyping} className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-100/90">
          {text}
          {isTyping && (
            <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-violet-400" />
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {message.toolName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.1] px-2.5 py-1 text-[11px] font-medium text-violet-300">
              <Database className="h-3 w-3" />
              {message.toolName}
              {message.rows?.length ? ` · ${message.rows.length} рядк.` : null}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Скопіювати відповідь"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-zinc-500 transition-all",
              "opacity-0 hover:bg-violet-500/10 hover:text-violet-300 focus-visible:opacity-100 group-hover:opacity-100",
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                Скопійовано
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Копіювати
              </>
            )}
          </button>
        </div>

        {/* Таблицю показуємо, коли текст уже дописався — інакше вона смикається */}
        {!isTyping && message.rows && message.rows.length > 0 && (
          <AiDataTable rows={message.rows} />
        )}
      </div>
    </motion.div>
  );
}
