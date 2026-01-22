// src/shared/socket/chat-events.ts
import { Socket } from "socket.io-client";
import { toast } from "sonner";

export const registerTenderEvents = (socket: Socket) => {
  socket.on("new_message", (data) => {
    toast.info(`Нове повідомлення у чаті ${data.chatId}`);
    // Тут можна оновити Zustand стор або викликати queryClient.invalidateQueries()
  });

  socket.on("user_typing", (data) => {
    console.log(`${data.username} пише...`);
  });
};