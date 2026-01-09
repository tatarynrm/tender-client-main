// "use client";

// import {
//   createContext,
//   useContext,
//   ReactNode,
//   useEffect,
//   useState,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { useAuth } from "./AuthCheckProvider";

// export type Namespace = "chat" | "tender" | "user" | "load";
// type Sockets = Record<Namespace, Socket | null>;

// const SocketContext = createContext<Sockets | null>(null);

// interface Props {
//   children: ReactNode;
// }

// export const SocketProvider = ({ children }: Props) => {
//   const [sockets, setSockets] = useState<Sockets>({
//     chat: null,
//     tender: null,
//     user: null,
//     load: null,
//   });

//   // Отримуємо userId із localStorage (після перезавантаження сторінки)
//   const userId =
//     typeof window !== "undefined" ? localStorage.getItem("socket") : null;

//   useEffect(() => {
//     if (!userId) return; // Якщо немає userId, не підключаємо сокети

//     const chat = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat`, {
//       transports: ["websocket"],
//       auth: { userId },
//       reconnection: true,
//       autoConnect: true,
//     });

//     const tender = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/tender`, {
//       transports: ["websocket"],
//       auth: { userId },
//       reconnection: true,
//       autoConnect: true,
//     });

//     const user = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/user`, {
//       transports: ["websocket"],
//       auth: { userId },
//       reconnection: true,
//       autoConnect: true,
//     });
//     const load = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/load`, {
//       transports: ["websocket"],
//       auth: { userId },
//       reconnection: true,
//       autoConnect: true,
//     });

//     setSockets({ chat, tender, user, load });

//     return () => {
//       chat.disconnect();
//       tender.disconnect();
//       user.disconnect();
//     };
//   }, [userId]); // Підключаємо сокети, коли userId змінюється

//   return (
//     <SocketContext.Provider value={sockets}>{children}</SocketContext.Provider>
//   );
// };

// export const useSockets = () => {
//   const ctx = useContext(SocketContext);
//   if (!ctx) throw new Error("useSockets must be used within SocketProvider");
//   return ctx;
// };
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
