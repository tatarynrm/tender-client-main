import { useEffect, useState } from "react";
import { useSockets } from "../providers/SocketProvider";

// React: хук для отримання статусу конкретного користувача
// useOnlineUsers.ts
export const useOnlineUsers = () => {
  const { user: userSocket } = useSockets();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userSocket) {
      setOnlineUsers(new Set());
      return;
    }

    const fetchOnline = () => {
      console.log("📡 Fetching online users list...");
      userSocket.emit("get_online_users", (ids: string[]) => {
        if (Array.isArray(ids)) {
          setOnlineUsers(new Set(ids.map(String)));
        }
      });
    };

    // Якщо сокет ВЖЕ підключений на момент рендеру (таке часто буває при Login)
    if (userSocket.connected) {
      fetchOnline();
    }

    const handleStatusChange = (data: {
      userId: string;
      isOnline: boolean;
    }) => {
      if (!data?.userId) return;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isOnline) newSet.add(String(data.userId));
        else newSet.delete(String(data.userId));
        return newSet;
      });
    };

    userSocket.on("user_status_change", handleStatusChange);
    userSocket.on("connect", fetchOnline);

    // Замість повного очищення при disconnect, краще просто чекати reconnect
    // або очищати тільки якщо ми реально розлогінились
    userSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    return () => {
      userSocket.off("user_status_change", handleStatusChange);
      userSocket.off("connect", fetchOnline);
      userSocket.off("disconnect");
    };
  }, [userSocket]); // Хук перепідпишеться, коли SocketProvider дасть новий об'єкт сокета

  return onlineUsers;
};
