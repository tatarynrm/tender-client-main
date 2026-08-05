"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Поступова поява тексту.
 *
 * Стрімінгу з бекенда немає (відповідь формується у два кроки), тому готовий
 * текст показуємо порційно — це прибирає різкий «стрибок» цілої відповіді.
 * Швидкість адаптивна: довга відповідь друкується не довше ~2.5 с.
 */
export function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(() => (enabled ? "" : text));
  const doneRef = useRef(!enabled);

  useEffect(() => {
    if (!enabled || doneRef.current) {
      setShown(text);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      doneRef.current = true;
      setShown(text);
      return;
    }

    const total = text.length;
    // 90 символів/с, але не довше 2.5 с на всю відповідь
    const charsPerSecond = Math.max(90, total / 2.5);
    let start: number | null = null;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const count = Math.floor(((now - start) / 1000) * charsPerSecond);

      if (count >= total) {
        doneRef.current = true;
        setShown(text);
        return;
      }

      setShown(text.slice(0, count));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, enabled]);

  return { shown, isTyping: !doneRef.current && shown.length < text.length };
}
