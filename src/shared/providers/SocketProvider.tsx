"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useAuth } from "./AuthCheckProvider";
import { useSocketEvents } from "../hooks/useSocketEvenets";

export type Namespace = "chat" | "tender" | "user" | "load";
export type Sockets = Record<Namespace, Socket | null>;

const SocketContext = createContext<Sockets | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { profile: currentProfile } = useAuth();

  const [activeSockets, setActiveSockets] = useState<Sockets>({
    chat: null,
    tender: null,
    user: null,
    load: null,
  });

  useEffect(() => {
    // 1. Якщо юзера немає — обнуляємо стейт і виходимо
    if (!currentProfile?.person.id) {
      setActiveSockets({ chat: null, tender: null, user: null, load: null });
      return;
    }

    const userId = currentProfile.person.id;
    const isIct = currentProfile.role.is_ict;

    // 2. Визначаємо потрібні неймспейси
    const namespaces: Namespace[] = ["chat", "tender", "user"];
    if (isIct) namespaces.push("load");

    // Створюємо локальний об'єкт для нових з'єднань
    const newSockets: Partial<Sockets> = {};

    // 3. Ініціалізуємо сокети
    namespaces.forEach((ns) => {
      const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
        transports: ["websocket"],
        auth: { userId },
        // Залишаємо стандартну логіку Socket.io для перепідключення.
        // Прибрано: forceNew, multiplex, та timestamp з query, 
        // оскільки вони ламали кешування з'єднань при ререндері.
        reconnection: true,
      });

      socket.on("connect", () => {
        // console.log(`✅ Connected to ${ns}`);
      });

      socket.on("connect_error", (err) => {
        console.error(`❌ Connection error on ${ns}:`, err.message);
      });

      newSockets[ns] = socket;
    });

    // Оновлюємо стейт новими сокетами
    setActiveSockets((prev) => ({ ...prev, ...newSockets }) as Sockets);

    // 4. ПРАВИЛЬНИЙ CLEANUP (Життєво необхідно для React 18 Strict Mode)
    return () => {
      namespaces.forEach((ns) => {
        const socket = newSockets[ns];
        if (socket) {
          // console.log(`🔌 Disconnecting from ${ns}...`);
          socket.removeAllListeners();
          socket.disconnect();
        }
      });
    };
  }, [currentProfile?.person.id, currentProfile?.role.is_ict]); // Залежності чіткі та правильні

  return (
    <SocketContext.Provider value={activeSockets}>
      {children}
      <SocketEventsManager />
    </SocketContext.Provider>
  );
};

export const useSockets = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSockets must be used within SocketProvider");
  return ctx;
};

const SocketEventsManager = () => {
  useSocketEvents();
  return null;
};