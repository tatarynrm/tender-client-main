// @/shared/hooks/useEventEffect.ts
import { useState, useEffect, useCallback } from "react";
import { AppEventType, eventBus } from "@/shared/lib/event-bus";

interface EventEffectOptions {
  duration?: number;      // тривалість стану true
  cooldown?: number;      // час до повного зникнення (наприклад для бейджа)
}

// @/shared/hooks/useEventEffect.ts
export function useEventEffect(
  eventId: number | string, 
  events: AppEventType[], 
  options: EventEffectOptions = {}
) {
  const { duration = 6000, cooldown = 30000 } = options;
  
  const [isActive, setIsActive] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [lastEvent, setLastEvent] = useState<AppEventType | null>(null);

  const handleEvent = useCallback((event: AppEventType, incomingId: any) => {
    // Порівнюємо як рядки, щоб уникнути проблем "123" vs 123
    if (String(incomingId) === String(eventId)) {
      setLastEvent(event);
      setIsActive(true);
      setIsPending(true);

      const activeTimer = setTimeout(() => setIsActive(false), duration);
      const pendingTimer = setTimeout(() => {
        setIsPending(false);
        setLastEvent(null);
      }, cooldown);

      return () => {
        clearTimeout(activeTimer);
        clearTimeout(pendingTimer);
      };
    }
  }, [eventId, duration, cooldown]);

  useEffect(() => {
    // Створюємо обгортки для кожного типу події
    const handlers = events.map(eventType => {
      const wrapper = (e: any) => handleEvent(eventType, e.detail); // Дістаємо detail тут
      eventBus.on(eventType, wrapper);
      return { eventType, wrapper };
    });

    return () => {
      handlers.forEach(({ eventType, wrapper }) => {
        eventBus.off(eventType, wrapper);
      });
    };
  }, [events, handleEvent]);

  return { isActive, isPending, lastEvent };
}