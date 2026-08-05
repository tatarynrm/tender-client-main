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
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap">{text}</p>
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
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-200">
          {text}
          {isTyping && (
            <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-blue-500" />
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/*
            Технічну назву функції (runSqlQuery, searchDocuments тощо) не
            показуємо ніколи — це внутрішня кухня, користувачу вона нічого не
            пояснює. Лишається сам факт звернення до бази й кількість рядків.
          */}
          {message.toolName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
              <Database className="h-3 w-3" />
              Дані з бази
              {message.rows?.length ? ` · ${message.rows.length} рядк.` : null}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Скопіювати відповідь"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-slate-400 transition-all dark:text-slate-500",
              "opacity-0 hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-white/5 dark:hover:text-slate-200",
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
