"use client";
import api from "@/shared/api/instance.api";
import { useEffect, useState } from "react";

interface TelegramConnectButtonProps {
  token: string | null;
  email?: string;
}

export const TelegramConnectButton = ({
  token,
  email,
}: TelegramConnectButtonProps) => {
  const [loading, setLoading] = useState(false);

  const fetchToken = async () => {
    if (!email) return null;
    try {
      const { data } = await api.post("/telegram-token/get-token", { email });
      return data.token;
    } catch (error) {
      console.error("Failed to fetch telegram token:", error);
      return null;
    }
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const activeToken = token || (await fetchToken());

      if (activeToken) {
        const botName =
          process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "icttender_bot";
        const url = `https://t.me/${botName}?start=${activeToken}`;
        window.open(url, "_blank");
      } else {
        console.error("No token available for Telegram connection");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="px-6 py-2 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Завантаження..." : "Підключити Telegram"}
    </button>
  );
};
