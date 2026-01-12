"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

export type Namespace = "chat" | "tender" | "user" | "load";
type Sockets = Record<Namespace, Socket | null>;

const SocketContext = createContext<Sockets | null>(null);

interface Props {
  children: ReactNode;
  userId: string | null; // <-- приймаємо userId як пропс
}

export const SocketProvider = ({ children, userId }: Props) => {
  const [sockets, setSockets] = useState<Sockets>({
    chat: null,
    tender: null,
    user: null,
    load: null,
  });

  useEffect(() => {
    if (!userId) return; // якщо немає userId, не підключаємо

    const createSocket = (namespace: Namespace) =>
      io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${namespace}`, {
        transports: ["websocket"],
        auth: { userId },
        reconnection: true,
        autoConnect: true,
      });

    const chat = createSocket("chat");
    const tender = createSocket("tender");
    const user = createSocket("user");
    const load = createSocket("load");

    setSockets({ chat, tender, user, load });

    return () => {
      chat.disconnect();
      tender.disconnect();
      user.disconnect();
      load.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={sockets}>{children}</SocketContext.Provider>
  );
};

export const useSockets = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSockets must be used within SocketProvider");
  return ctx;
};
