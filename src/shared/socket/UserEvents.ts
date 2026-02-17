// src/shared/socket/UserEvents.ts
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "@romannoris/tender-shared-types";

export const registerUserEvents = (socket: Socket) => {
  // 1. Твій івент для тестування розсилки
  socket.on("new_notification", (data: any) => {

    toast.success(`Нове повідомлення: ${data.message}`);

    // Якщо у тебе є Zustand стор для сповіщень:
    // useNotificationStore.getState().addNotification(data);
  });

  // 2. Івент зміни статусу (Online/Offline) інших юзерів
  socket.on(
    "user_status_change",
    (data: { userId: string; isOnline: boolean }) => {

      // Тут можна зробити invalidateQueries для списку друзів/користувачів
    },
  );

  // 3. Інші івенти неймспейсу /user...
};
