"use client";

import { useModal } from "@/shared/providers/GlobalModalProvider";
import { useEffect } from "react";

export const RestTimerTracker = () => {
  const { openModal } = useModal();

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const today = now.toDateString();

      // Наприклад, зараз 23:45. 
      // Якщо ви ставите 23:36 і зараз вже 23:45 — модалка не відкриється через strict equality (===).
      // Краще використовувати таку логіку:
      
      // 1. ОБІД (з 13:00 до 14:00)
      if (hours === 13) {
        const lastRest = localStorage.getItem("lastRestShown");
        if (lastRest !== today) {
          openModal("rest");
          localStorage.setItem("lastRestShown", today);
        }
      }

      // 2. КІНЕЦЬ ДНЯ (з 18:00 до 23:59)
      if (hours >= 18) {
        const lastWorkEnd = localStorage.getItem("lastWorkEndShown");
        if (lastWorkEnd !== today) {
          openModal("workEnd");
          localStorage.setItem("lastWorkEndShown", today);
        }
      }
    };

    // Перевіряємо раз на 30 секунд
    const interval = setInterval(checkTime, 30000);
    checkTime(); // Важливо: викликаємо відразу при завантаженні сторінки!

    return () => clearInterval(interval);
  }, [openModal]);

  return null;
};