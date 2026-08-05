"use client";

import { Kbd } from "@/shared/components/ui/kbd";
import { cn } from "@/shared/utils/index";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isPending: boolean;
  disabled?: boolean;
}

const MAX_HEIGHT = 200;

/**
 * Поле вводу: висота росте під текст, Enter надсилає, Shift+Enter — новий рядок.
 * Фокус ловиться з будь-якої точки сторінки по «/», щоб не тягтись до мишки.
 */
export function AiComposer({
  value,
  onChange,
  onSend,
  isPending,
  disabled,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  // Автовисота: скидаємо, щоб scrollHeight порахувався від нуля
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable)
        return;

      e.preventDefault();
      textareaRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canSend = Boolean(value.trim()) && !isPending && !disabled;

  return (
    <div className="border-t border-slate-200/70 px-3 pt-3 pb-3 sm:px-4 sm:pb-4 dark:border-white/10">
      <div
        className={cn(
          "relative rounded-xl border bg-white transition-all duration-200 dark:bg-slate-800/60",
          focused
            ? "border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] dark:border-blue-500/60"
            : "border-slate-200 shadow-sm dark:border-white/10",
        )}
      >
        <div className="flex items-end gap-2 p-2">
          <Sparkles
            className={cn(
              "mb-2.5 ml-1.5 h-4 w-4 shrink-0 transition-colors duration-200",
              focused ? "text-blue-500" : "text-slate-300 dark:text-slate-600",
            )}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            rows={1}
            placeholder="Запитайте про рейси, заявки, тендери…"
            disabled={disabled}
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Надіслати"
            className={cn(
              "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
              canSend
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95"
                : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600",
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Kbd>Enter</Kbd> надіслати
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>Shift</Kbd>
          <Kbd>Enter</Kbd> новий рядок
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>/</Kbd> фокус на полі
        </span>
      </div>
    </div>
  );
}
