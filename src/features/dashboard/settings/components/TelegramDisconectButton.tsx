"use client";
import api from "@/shared/api/instance.api";

import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { toast } from "sonner";

export const TelegramDisconnectButton = ({ telegram_id }: { telegram_id: number }) => {
  const { profile, setProfile } = useAuth();
  
  const handleDisconnect = async () => {
    try {
      await api.post("/telegram-token/disconnect", { telegram_id });
      toast.success("Telegram успішно відключено!");
      // 🔥 Оновлюємо UI миттєво
      if (profile) {
        setProfile({
          ...profile,
          person_telegram: null,
        });
      }
    } catch (err) {
      console.error("Помилка при відключенні Telegram:", err);
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Відключити Telegram
    </button>
  );
};
