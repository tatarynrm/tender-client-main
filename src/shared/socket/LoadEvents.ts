// src/shared/socket/chat-events.ts
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAdminNotificationStore } from "../stores/useAdminNotificationStore";

export const registerLoadEvents = (socket: Socket) => {
  socket.on("new_message", (data) => {
    toast.info(`Нове повідомлення у чаті ${data.chatId}`);
    // Тут можна оновити Zustand стор або викликати queryClient.invalidateQueries()
  });

  // Слухаємо адмінські сповіщення
  socket.on("admin_notification", (data: { message: string; type: any }) => {
    const { showNotification } = useAdminNotificationStore.getState();
    showNotification(data.message, data.type);
  });

  socket.on("user_typing", (data) => {
 
  });
};