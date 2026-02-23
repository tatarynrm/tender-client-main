"use client";

import { useTelegramIntegration } from "@/shared/hooks/useTelegramIntegration";
import React from "react";

// Варіант 1: Якщо хочете використати глобальний тип (розкоментуйте імпорт):
// import { IUserProfile } from '@/features/auth/types';

// Варіант 2: Локальна типізація (рекомендовано для UI-компонентів, щоб вони були незалежними)
interface TelegramSettingsCardProps {
  user: {
    email: string;
    // Додаємо нашу нову вкладену структуру
    person_telegram: {
      telegram_id: number;
      username: string | null;
      first_name: string | null;
    } | null;
  };
  onProfileUpdate: () => void;
}

export const TelegramSettingsCard: React.FC<TelegramSettingsCardProps> = ({
  user,
  onProfileUpdate,
}) => {
  // Дістаємо логіку з нашого хука
  const { isConnecting, isDisconnecting, handleConnect, handleDisconnect } =
    useTelegramIntegration(onProfileUpdate);

  // Перевіряємо, чи є вкладений об'єкт і чи є в ньому telegram_id
  const isConnected = Boolean(user.person_telegram?.telegram_id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-xl transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Іконка Telegram */}
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-500 rounded-full">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Telegram Сповіщення
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isConnected
                ? "Ви отримуєте миттєві сповіщення про нові тендери."
                : "Підключіть бота, щоб не пропустити вигідні замовлення."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        {isConnected ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="flex w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">
                {/* ВИПРАВЛЕНО ТУТ: user.person_telegram?.telegram_id */}
                Активно{" "}
                <span className="text-gray-400 font-normal ml-1">
                  (ID:{" "}
                  {user.person_telegram?.username ||
                    user.person_telegram?.first_name ||
                    user.person_telegram?.telegram_id}
                  )
                </span>
              </span>
            </div>

            <button
              onClick={() =>
                handleDisconnect(user.person_telegram!.telegram_id)
              }
              disabled={isDisconnecting}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              {isDisconnecting ? "Відключення..." : "Відключити"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleConnect(user.email)}
            disabled={isConnecting}
            className="w-full sm:w-auto flex justify-center items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Генерація посилання...
              </>
            ) : (
              "Підключити бота 🚀"
            )}
          </button>
        )}
      </div>
    </div>
  );
};
