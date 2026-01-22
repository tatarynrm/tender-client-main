// src/shared/socket/utils.ts
import { Socket } from "socket.io-client";

export const unregisterEvents = (socket: Socket | null, events: string[]) => {
  if (!socket) return;
  events.forEach(event => {
    socket.off(event); // Видаляє всі обробники тільки для цього конкретного івенту
  });
};