"use client";

import { useModalStore } from "@/shared/stores/useModalStore";
import { useEffect } from "react";
import { RestModal } from "../RestModal";
import { WorkEndModal } from "../WorkEndModal";

export const RestTimerTracker = () => {
  const { openModal, closeModal } = useModalStore();

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const today = now.toDateString();
      
      // 1. ОБІД (з 13:00 до 14:00)
      if (hours === 13) {
        const lastRest = localStorage.getItem("lastRestShown");
        if (lastRest !== today) {
          openModal(<RestModal close={closeModal} />, { 
            className: "p-0 border-none bg-transparent shadow-none sm:max-w-sm",
          });
          localStorage.setItem("lastRestShown", today);
        }
      }

      // 2. КІНЕЦЬ ДНЯ (з 18:00 до 23:59)
      if (hours >= 18) {
        const lastWorkEnd = localStorage.getItem("lastWorkEndShown");
        if (lastWorkEnd !== today) {
          openModal(<WorkEndModal close={closeModal} />, { 
            className: "p-0 border-none bg-transparent shadow-none sm:max-w-sm",
          });
          localStorage.setItem("lastWorkEndShown", today);
        }
      }
    };

    const interval = setInterval(checkTime, 30000);
    checkTime();

    return () => clearInterval(interval);
  }, [openModal, closeModal]);

  return null;
};