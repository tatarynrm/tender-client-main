"use client";
import { Key, ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { cn } from "@/shared/utils";
import api from "@/shared/api/instance.api";
import { Switch } from "@/shared/components/ui";

import { TelegramConnectButton } from "./TelegramConnectButton";
import { TelegramDisconnectButton } from "./TelegramDisconectButton";
const notificationCategories = [
  {
    title: "Тендери",
    description: "Сповіщення про нові тендери та зміни у них.",
    options: [
      "Нові тендери у вашому регіоні",
      "Зміни у тендерах, на які ви подали заявку",
      "Завершені тендери та результати",
    ],
  },
  {
    title: "Заявки",
    description: "Сповіщення про стан ваших заявок та оновлення.",
    options: [
      "Статус заявок",
      "Нові заявки від клієнтів",
      "Затримки або проблеми у заявках",
    ],
  },
  {
    title: "Аналітика",
    description: "Статистика та звіти для вашого бізнесу.",
    options: [
      "Щотижневі звіти",
      "Щомісячні звіти",
      "Попередження про низьку ефективність",
    ],
  },
  {
    title: "Маркетинг",
    description: "Сповіщення про новини та пропозиції платформи.",
    options: [
      "Акції та знижки",
      "Новини платформи",
      "Офіційні оновлення та анонси",
    ],
  },
  {
    title: "Системні повідомлення",
    description: "Сповіщення про безпеку та технічні оновлення.",
    options: [
      "Попередження про безпеку",
      "Оновлення системи",
      "Технічні проблеми та аварії",
    ],
  },
];

export const NotificationsTab = () => {
  const [activeTab, setActiveTab] = useState<"email" | "telegram">("email");
  const { profile, setProfile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Animated Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "email" ? (
            <EmailNotifications />
          ) : (
            <TelegramNotifications profile={profile} setProfile={setProfile} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* --------------------------------
   📩 Email Notifications Component
-----------------------------------*/
const EmailNotifications = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Лівий сайдбар з меню категорій */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 md:border-r border-zinc-200/80 dark:border-white/5 md:pr-6">
        {notificationCategories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(idx)}
            className={cn(
              "text-left px-4 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-between text-[13px]",
              activeCategory === idx
                ? "bg-[#6366f1]/10 text-[#6366f1] dark:bg-indigo-500/20 dark:text-indigo-400 border border-[#6366f1]/20 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent",
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Права частина з опціями */}
      <div className="flex-1 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white dark:bg-[#0f1115] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
                {notificationCategories[activeCategory].title}
              </h3>
              <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mb-8 pb-6 border-b border-zinc-100 dark:border-white/5">
                {notificationCategories[activeCategory].description}
              </p>

              <div className="flex flex-col gap-5">
                {notificationCategories[activeCategory].options.map(
                  (opt, idx) => (
                    <label
                      key={idx}
                      className="flex items-center justify-between gap-4 cursor-pointer group p-2 hover:bg-zinc-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {opt}
                      </span>
                      <Switch className="data-[state=checked]:bg-[#6366f1]" />
                    </label>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --------------------------------
   🤖 Telegram Notifications Component
-----------------------------------*/
export const TelegramNotifications = ({ profile, setProfile }: any) => {
  const [telegramToken, setTelegramToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const socketRef = useRef<any>(null);

  // 🔑 Отримання токена для підключення
  useEffect(() => {
    if (!profile?.email) return;

    const fetchToken = async () => {
      setLoadingToken(true);
      try {
        const { data } = await api.post("/telegram-token/get", {
          email: profile.email,
        });
        const token = data.token || data; // переконайся, що це токен
        setTelegramToken(token);
      } catch (err) {
        console.error("Помилка при отриманні Telegram токену:", err);
      } finally {
        setLoadingToken(false);
      }
    };

    fetchToken();
  }, [profile?.email]);

  // 🔄 Рендеринг
  if (!profile?.telegram_id) {
    if (loadingToken) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Завантаження токену Telegram...
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Для отримання Telegram-сповіщень потрібно підключити Telegram.
        </p>
        <TelegramConnectButton token={telegramToken} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TelegramDisconnectButton telegram_id={profile.telegram_id} />
      <EmailNotifications />
    </div>
  );
};
/* --------------------------------
   🧭 Tabs Component
-----------------------------------*/
const Tabs = ({ activeTab, setActiveTab }: any) => (
  <div className="flex justify-center gap-4 mb-6">
    {["email", "telegram"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-6 py-2 rounded-full font-medium transition cursor-pointer ${
          activeTab === tab
            ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-lg"
            : "border-1 text-gray-400 hover:bg-white/20"
        }`}
      >
        {tab === "email" ? "Email сповіщення" : "Telegram сповіщення"}
      </button>
    ))}
  </div>
);
