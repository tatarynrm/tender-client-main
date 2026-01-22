"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { IUserProfile } from "../types/user.types";
import { useAuth } from "./AuthCheckProvider";
import { useSocketEvents } from "../hooks/useSocketEvenets";

export type Namespace = "chat" | "tender" | "user" | "load";
type Sockets = Record<Namespace, Socket | null>;

const SocketContext = createContext<Sockets | null>(null);

export const SocketProvider = ({
  children,
  profile: initialProfile,
}: {
  children: ReactNode;
  profile: IUserProfile | null;
}) => {
  // 1. Отримуємо профіль з Auth контексту (який ви оновлюєте вручну в mutate)
  const { profile: clientProfile } = useAuth();

  // Визначаємо актуальний профіль: пріоритет клієнтському стану
  const currentProfile = clientProfile;

  const [activeSockets, setActiveSockets] = useState<Sockets>({
    chat: null,
    tender: null,
    user: null,
    load: null,
  });

  const socketsRef = useRef<Sockets>(activeSockets);

  useEffect(() => {
    // 2. Якщо користувач не авторизований
    if (!currentProfile?.id) {
      if (Object.values(socketsRef.current).some((s) => s !== null)) {
        Object.values(socketsRef.current).forEach((s) => s?.disconnect());
        const empty = { chat: null, tender: null, user: null, load: null };
        socketsRef.current = empty;
        setActiveSockets(empty);
      }
      return;
    }

    const namespaces: Namespace[] = ["chat", "tender", "user"];
    if (currentProfile.is_ict) namespaces.push("load");

    let wasUpdated = false;
    const currentBatch = { ...socketsRef.current };

    namespaces.forEach((ns) => {
      const existingSocket = currentBatch[ns];

      if (!existingSocket) {
        // 3. Створення нового з'єднання
        const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
          transports: ["websocket"],
          auth: { userId: currentProfile.id },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
        });

        currentBatch[ns] = socket;
        wasUpdated = true;

        socket.on("connect", () => console.log(`✅ Connected to ${ns}`));
        socket.on("connect_error", (err) =>
          console.error(`❌ ${ns}:`, err.message),
        );
      } else {
        // 4. КРИТИЧНО: Якщо сокет вже є, оновлюємо ID (на випадок зміни юзера без F5)
        existingSocket.auth = { userId: currentProfile.id };
        if (!existingSocket.connected) {
          existingSocket.connect();
        }
      }
    });

    // Очищення зайвого простору імен
    if (!currentProfile.is_ict && currentBatch.load) {
      currentBatch.load.disconnect();
      currentBatch.load = null;
      wasUpdated = true;
    }

    if (wasUpdated) {
      socketsRef.current = currentBatch;
      setActiveSockets(currentBatch);
    }
  }, [currentProfile?.id, currentProfile?.is_ict]); // Слідкуємо за конкретними полями

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
// Маленький допоміжний компонент, щоб використовувати хук всередині контексту
const SocketEventsManager = () => {
  useSocketEvents();
  return null;
};
