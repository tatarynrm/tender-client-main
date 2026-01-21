"use client";

import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export type Namespace = "chat" | "tender" | "user" | "load";
type Sockets = Record<Namespace, Socket | null>;

const SocketContext = createContext<Sockets | null>(null);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: number;
}) => {
  const socketsRef = useRef<Sockets>({
    chat: null,
    tender: null,
    user: null,
    load: null,
  });

  useEffect(() => {
    // 1. Якщо userId зник (logout), закриваємо з'єднання
    if (!userId) {
      Object.values(socketsRef.current).forEach((socket) => {
        if (socket) {
          socket.disconnect();
        }
      });
      // Очищаємо реф, щоб при зміні на новий userId створилися нові сокети
      socketsRef.current = { chat: null, tender: null, user: null, load: null };
      return;
    }

    const namespaces: Namespace[] = ["chat", "tender", "user", "load"];

    namespaces.forEach((ns) => {
      const currentSocket = socketsRef.current[ns];

      // 2. Якщо сокета ще немає - створюємо його
      if (!currentSocket) {
        const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
          transports: ["websocket"],
          auth: { userId },
          reconnection: true,
          reconnectionAttempts: Infinity, // Нескінченні спроби підключення
          reconnectionDelay: 1000,
          autoConnect: true,
        });

        socketsRef.current[ns] = socket;

        socket.on("connect", () => console.log(`✅ Connected to ${ns}`));
        socket.on("connect_error", (err) =>
          console.error(`❌ Error ${ns}:`, err.message),
        );
      }
      // 3. Якщо сокет існує, але відключений - з'єднуємо
      else if (!currentSocket.connected) {
        currentSocket.auth = { userId }; // Оновлюємо ID про всяк випадок
        currentSocket.connect();
      }
    });

    return () => {
      // При розмонтуванні всього додатку закриваємо сокети
      // У Next.js це спрацює лише при повному закритті вкладки або переході на інший домен
    };
  }, [userId]); // Магія тут: як тільки userId зміниться з null на ID, useEffect спрацює

  return (
    <SocketContext.Provider value={socketsRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSockets = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSockets must be used within SocketProvider");
  return ctx;
};
