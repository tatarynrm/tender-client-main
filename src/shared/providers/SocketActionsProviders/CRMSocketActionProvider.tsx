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

export const CRMSocketActionProvider = ({
  children,
}: SocketActionProviderProps) => {
  const { user: userSocket } = useSockets();
  const { logout } = useProfileLogoutMutation();

  useEffect(() => {
    if (!userSocket) return;

    // 3. Об'єкт команд з типізованими ключами
    const commands: Record<SystemCommandType, (data?: any) => void> = {
      FORCE_RELOAD: () => {
        console.log("FORCE");

        window.location.reload();
      },
      FORCE_LOGOUT: () => {
        logout();
      },
      SHOW_NOTIFICATION: (data) => {
        toast.info(data?.message || "Системне повідомлення");
      },
      UPDATE_CARGO_PRICE: (data) => {
        // console.log("Оновлення ціни для:", data?.id);
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

    userSocket.on("system_command", handleSystemCommand);

    return () => {
      userSocket.off("system_command", handleSystemCommand);
    };
  }, [userSocket, logout]);

  return <>{children}</>;
};
