import { useEffect, useRef } from "react";
import { useSockets } from "../providers/SocketProvider";

export const useGlobalHeartbeat = () => {
  const { user } = useSockets();
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    // Оновлюємо час останньої активності при взаємодії
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Відправляємо heartbeat кожні 45 секунд, але тільки якщо юзер був активний останні 2 хвилини
    const heartbeatInterval = setInterval(() => {
      if (user.connected) {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        // Якщо юзер активний (дія була менше ніж 90 секунд тому)
        if (timeSinceLastActivity < 90000) {
          user.emit("heartbeat");
        }
      }
    }, 45000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(heartbeatInterval);
    };
  }, [user]);
};
