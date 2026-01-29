"use client";

import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";
import { useSockets } from "../SocketProvider";
import { toast } from "sonner";
import { useEffect, ReactNode } from "react";

// 1. Визначаємо перелік доступних команд
export type SystemCommandType = 
  | "FORCE_RELOAD" 
  | "FORCE_LOGOUT" 
  | "SHOW_NOTIFICATION" 
  | "UPDATE_CARGO_PRICE";

// 2. Типізуємо структуру самої події
interface SystemCommandPayload {
  type: SystemCommandType;
  payload?: any; // Можна уточнити для кожного типу, якщо потрібно
}

interface SocketActionProviderProps {
  children: ReactNode;
}

export const SocketActionProvider = ({ children }: SocketActionProviderProps) => {
  const { load: loadSocket } = useSockets();
  const {  logout } = useProfileLogoutMutation();

  useEffect(() => {
    if (!loadSocket) return;

    // 3. Об'єкт команд з типізованими ключами
    const commands: Record<SystemCommandType, (data?: any) => void> = {
      FORCE_RELOAD: () => {
        window.location.reload();
      },
      FORCE_LOGOUT: () => {
        logout();
      },
      SHOW_NOTIFICATION: (data) => {
        toast.info(data?.message || "Системне повідомлення");
      },
      UPDATE_CARGO_PRICE: (data) => {
        console.log("Оновлення ціни для:", data?.id);
        // Тут логіка з queryClient.invalidateQueries
      },
    };

    // 4. Слухач з деструктуризацією та типізацією
    const handleSystemCommand = ({ type, payload }: SystemCommandPayload) => {
      const execute = commands[type];
      if (execute) {
        execute(payload);
      } else {
        console.warn(`Unknown system command received: ${type}`);
      }
    };

    loadSocket.on("system_command", handleSystemCommand);

    return () => {
      loadSocket.off("system_command", handleSystemCommand);
    };
  }, [loadSocket, logout]);

  return <>{children}</>;
};