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
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        className={cn(
          "relative rounded-2xl border bg-white/[0.04] backdrop-blur-xl transition-all duration-300",
          focused
            ? "border-violet-500/50 shadow-[0_0_0_4px_rgba(139,92,246,0.1),0_8px_30px_-12px_rgba(139,92,246,0.5)]"
            : "border-violet-900/50 shadow-[0_4px_24px_-16px_rgba(0,0,0,0.8)]",
        )}
      >
        <div className="flex items-end gap-2 p-2">
          <Sparkles
            className={cn(
              "mb-2.5 ml-1.5 h-4 w-4 shrink-0 transition-colors duration-300",
              focused ? "text-violet-400" : "text-zinc-600",
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
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Надіслати"
            className={cn(
              "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
              canSend
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.7)] hover:brightness-110 active:scale-95"
                : "bg-white/[0.05] text-zinc-600",
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

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-600">
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
