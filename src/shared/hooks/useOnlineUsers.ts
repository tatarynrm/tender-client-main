import { useEffect, useState, useCallback } from "react";
import { useSockets } from "../providers/SocketProvider";

export const useOnlineUsers = () => {
  const { user: userSocket } = useSockets();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const fetchOnlineList = useCallback(() => {
    if (userSocket?.connected) {
      userSocket.emit("get_online_users", (ids: string[]) => {
        if (Array.isArray(ids)) {
          setOnlineUsers(new Set(ids.map(String)));
        }
      });
    }
  }, [userSocket]);

  useEffect(() => {
    if (!userSocket) return;

    // Очищуємо список при зміні сокета (наприклад, при перелогіні)
    setOnlineUsers(new Set());

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

    const onConnect = () => {
      console.log("🟢 Connected/Reconnected to /user (global tracking)");
      userSocket.emit("heartbeat");
      fetchOnlineList();
    };

    userSocket.on("user_status_change", handleStatusChange);
    userSocket.on("connect", onConnect);
    // Важливо для перелогіну:
    userSocket.on("reconnect", onConnect);

    // Якщо сокет вже підключився поки хук монтувався
    if (userSocket.connected) {
      onConnect();
    }

    const heartbeatInterval = setInterval(() => {
      if (userSocket.connected) userSocket.emit("heartbeat");
    }, 45000);

    return () => {
      clearInterval(heartbeatInterval);
      userSocket.off("user_status_change", handleStatusChange);
      userSocket.off("connect", onConnect);
      userSocket.off("reconnect", onConnect);
    };
    // Додаємо userSocket як залежність, щоб при його зміні (після login) хук перезібрався
  }, [userSocket, fetchOnlineList]);

  return onlineUsers;
};
