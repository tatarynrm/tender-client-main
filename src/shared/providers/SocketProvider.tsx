// "use client";

// import {
//   createContext,
//   useContext,
//   ReactNode,
//   useEffect,
//   useState,
//   useRef,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { IUserProfile } from "../types/user.types";
// import { useAuth } from "./AuthCheckProvider";
// import { useSocketEvents } from "../hooks/useSocketEvenets";

// export type Namespace = "chat" | "tender" | "user" | "load";
// type Sockets = Record<Namespace, Socket | null>;

// const SocketContext = createContext<Sockets | null>(null);

// export const SocketProvider = ({
//   children,
//   profile: initialProfile,
// }: {
//   children: ReactNode;
//   profile?: IUserProfile | null;
// }) => {
//   // 1. Отримуємо профіль з Auth контексту (який ви оновлюєте вручну в mutate)
//   const { profile: clientProfile } = useAuth();

//   // Визначаємо актуальний профіль: пріоритет клієнтському стану
//   const currentProfile = clientProfile;

//   const [activeSockets, setActiveSockets] = useState<Sockets>({
//     chat: null,
//     tender: null,
//     user: null,
//     load: null,
//   });

//   const socketsRef = useRef<Sockets>(activeSockets);

//   useEffect(() => {
//     console.log(currentProfile, "CURERENT PROFILE");

//     // 2. Якщо користувач не авторизований
//     if (!currentProfile?.id) {
//       if (Object.values(socketsRef.current).some((s) => s !== null)) {
//         Object.values(socketsRef.current).forEach((s) => s?.disconnect());
//         const empty = { chat: null, tender: null, user: null, load: null };
//         socketsRef.current = empty;
//         setActiveSockets(empty);
//       }
//       return;
//     }

//     const namespaces: Namespace[] = ["chat", "tender", "user"];
//     if (currentProfile.is_ict) namespaces.push("load");

//     let wasUpdated = false;
//     const currentBatch = { ...socketsRef.current };

//     namespaces.forEach((ns) => {
//       const existingSocket = currentBatch[ns];

//       if (!existingSocket) {
//         // 3. Створення нового з'єднання
//         const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
//           transports: ["websocket"],
//           auth: { userId: currentProfile.id },
//           reconnection: true,
//           reconnectionAttempts: Infinity,
//           reconnectionDelay: 1000,
//         });

//         currentBatch[ns] = socket;
//         wasUpdated = true;

//         socket.on("connect", () => console.log(`✅ Connected to ${ns}`));
//         socket.on("connect_error", (err) =>
//           console.error(`❌ ${ns}:`, err.message),
//         );
//       } else {
//         // 4. КРИТИЧНО: Якщо сокет вже є, оновлюємо ID (на випадок зміни юзера без F5)
//         existingSocket.auth = { userId: currentProfile.id };
//         if (!existingSocket.connected) {
//           existingSocket.connect();
//         }
//       }
//     });

//     // Очищення зайвого простору імен
//     if (!currentProfile.is_ict && currentBatch.load) {
//       currentBatch.load.disconnect();
//       currentBatch.load = null;
//       wasUpdated = true;
//     }

//     if (wasUpdated) {
//       socketsRef.current = currentBatch;
//       setActiveSockets(currentBatch);
//     }
//   }, [currentProfile?.id, currentProfile?.is_ict]); // Слідкуємо за конкретними полями

//   return (
//     <SocketContext.Provider value={activeSockets}>
//       {children}
//       <SocketEventsManager />
//     </SocketContext.Provider>
//   );
// };

// export const useSockets = () => {
//   const ctx = useContext(SocketContext);
//   if (!ctx) throw new Error("useSockets must be used within SocketProvider");
//   return ctx;
// };
// // Маленький допоміжний компонент, щоб використовувати хук всередині контексту
// const SocketEventsManager = () => {
//   useSocketEvents();
//   return null;
// };

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
          console.log(`🔌 Disconnecting from ${ns}...`);
          socket.removeAllListeners();
          socket.disconnect();
        }
      });
      const empty = { chat: null, tender: null, user: null, load: null };
      socketsRef.current = empty;
      setActiveSockets(empty);
    };

    // 1. Якщо юзера немає (Logout) — чистимо все
    if (!currentProfile?.id) {
      cleanupSockets();
      return;
    }

    // 2. Якщо юзер зайшов (Login) — ТЕЖ спочатку чистимо все старе,
    // щоб уникнути дублів та "завислих" з'єднань від попереднього сеансу
    cleanupSockets();

    console.log(`🚀 Initializing sockets for user: ${currentProfile.id}`);

    const namespaces: Namespace[] = ["chat", "tender", "user"];
    if (currentProfile.is_ict) namespaces.push("load");

    const newBatch: Sockets = {
      chat: null,
      tender: null,
      user: null,
      load: null,
    };

    namespaces.forEach((ns) => {
      const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/${ns}`, {
        transports: ["websocket"],
        auth: { userId: currentProfile.id },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,

        forceNew: true, // Примусово створювати нове з'єднання
        multiplex: false, // Вимкнути спільне використання з'єднання для різних інстансів
        query: {
          uId: currentProfile.id, // Додатковий ідентифікатор у query
          time: Date.now(), // Робить URL унікальним для браузера
        },
      });

      socket.on("connect", () => {
        console.log(`✅ Connected to ${ns} (ID: ${currentProfile.id})`);
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
  }, [currentProfile?.id, currentProfile?.is_ict]);

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
