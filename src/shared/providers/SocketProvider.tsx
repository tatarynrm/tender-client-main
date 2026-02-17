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

import { useAuth } from "./AuthCheckProvider";
import { useSocketEvents } from "../hooks/useSocketEvenets";

export type Namespace = "chat" | "tender" | "user" | "load";
type Sockets = Record<Namespace, Socket | null>;

const SocketContext = createContext<Sockets | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { profile: currentProfile } = useAuth();

  const [activeSockets, setActiveSockets] = useState<Sockets>({
    chat: null,
    tender: null,
    user: null,
    load: null,
  });

  // Використовуємо ref для стабільного доступу до поточних сокетів без зайвих ререндерів
  const socketsRef = useRef<Sockets>(activeSockets);

  useEffect(() => {
    // Функція для повного очищення сокетів
    const cleanupSockets = () => {
      Object.entries(socketsRef.current).forEach(([ns, socket]) => {
        if (socket) {
          // console.log(`🔌 Disconnecting from ${ns}...`);
          socket.removeAllListeners();
          socket.disconnect();
        }
      });
      const empty = { chat: null, tender: null, user: null, load: null };
      socketsRef.current = empty;
      setActiveSockets(empty);
    };

    // 1. Якщо юзера немає (Logout) — чистимо все
    if (!currentProfile?.person.id) {
      cleanupSockets();
      return;
    }

    // 2. Якщо юзер зайшов (Login) — ТЕЖ спочатку чистимо все старе,
    // щоб уникнути дублів та "завислих" з'єднань від попереднього сеансу
    cleanupSockets();

    // console.log(
    //   `🚀 Initializing sockets for user: ${currentProfile.person.id}`,
    // );

    const namespaces: Namespace[] = ["chat", "tender", "user"];
    if (currentProfile.role.is_ict) namespaces.push("load");

    const newBatch: Sockets = {
      chat: null,
      tender: null,
      user: null,
      load: null,
    };

    namespaces.forEach((ns) => {
      const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
        transports: ["websocket"],
        auth: { userId: currentProfile.person.id },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,

        forceNew: true, // Примусово створювати нове з'єднання
        multiplex: false, // Вимкнути спільне використання з'єднання для різних інстансів
        query: {
          uId: currentProfile.person.id, // Додатковий ідентифікатор у query
          time: Date.now(), // Робить URL унікальним для браузера
        },
      });

      socket.on("connect", () => {
        // console.log(`✅ Connected to ${ns} (ID: ${currentProfile.person.id})`);
      });

      socket.on("connect_error", (err) => {
        console.error(`❌ Connection error on ${ns}:`, err.message);
      });

      newBatch[ns] = socket;
    });

    socketsRef.current = newBatch;
    setActiveSockets(newBatch);

    // 3. Cleanup при розмонтуванні компонента
    return () => {
      // Тут можна не викликати cleanupSockets(), щоб не розривати зв'язок при React-ререндері,
      // але оскільки ми залежимо від [currentProfile?.id], цей ефект сам все підчистить при зміні юзера.
    };
  }, [currentProfile?.person.id, currentProfile?.role.is_ict]);

  return (
    <SocketContext.Provider value={activeSockets}>
      {children}
      {/* Менеджер івентів має бути всередині провайдера */}
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
