"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { Info } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface MyTooltipProps {
  text: React.ReactNode;
  important?: boolean;
  icon?: React.ReactNode;
  size?: number;
  side?: TooltipSide;
  className?: string;
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MyTooltip({
  text,
  important = false,
  icon,
  size = 13,
  side = "top",
  className,
  disabled = false,
}: MyTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;
    const gap = 8;

    if (side === "top") {
      top = rect.top + scrollY - gap;
      left = rect.left + scrollX + rect.width / 2;
    } else if (side === "bottom") {
      top = rect.bottom + scrollY + gap;
      left = rect.left + scrollX + rect.width / 2;
    } else if (side === "left") {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - gap;
    } else if (side === "right") {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX + rect.width + gap;
    }

    return { top, left };
  }, [side]);

  // Оновлення при скролі/резйазі тільки якщо видимий
  useEffect(() => {
    if (!visible) return;

    const handleUpdate = () => {
      const p = calculatePosition();
      if (p) setCoords(p);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [visible, calculatePosition]);

  const show = () => {
    if (disabled) return;
    const p = calculatePosition();
    if (p) {
      setCoords(p);
      setVisible(true);
    }
  };

  const hide = () => {
    setVisible(false);
    // Не скидаємо coords відразу, щоб анімація зникнення відпрацювала на місці
  };

  if (disabled) return null;

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(
          "relative inline-flex items-center justify-center shrink-0 cursor-pointer outline-none select-none",
          "transition-colors duration-150",
          important
            ? "text-rose-400 hover:text-rose-500"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
          className,
        )}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          visible ? hide() : show();
        }}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        role="button"
      >
        {icon ?? (
          <Info style={{ width: "100%", height: "100%" }} strokeWidth={2.5} />
        )}
      </span>

      {/* Рендеримо тільки якщо є розраховані координати */}
      {mounted && visible && coords && createPortal(
        <span
          className={cn(
            "fixed z-[99999999] pointer-events-none whitespace-normal break-words rounded-xl px-3 py-2",
            "bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium leading-relaxed",
            "shadow-xl shadow-black/30",
            "max-w-[240px] w-max animate-in fade-in zoom-in-95 duration-150",
            side === "top" && "-translate-x-1/2 -translate-y-full",
            side === "bottom" && "-translate-x-1/2",
            side === "left" && "-translate-x-full -translate-y-1/2",
            side === "right" && "-translate-y-1/2"
          )}
          style={{
            top: coords.top - window.scrollY,
            left: coords.left - window.scrollX,
          }}
        >
          {text}
          <span
            className={cn(
              "absolute w-0 h-0 border-[5px]",
              side === "top" && "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800 dark:border-t-slate-700",
              side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800 dark:border-b-slate-700",
              side === "left" && "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800 dark:border-l-slate-700",
              side === "right" && "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800 dark:border-r-slate-700"
            )}
          />
        </span>,
        document.body
      )}
    </>
  );
}
