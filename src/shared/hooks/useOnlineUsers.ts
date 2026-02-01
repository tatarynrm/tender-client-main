import { useEffect, useState, useCallback } from "react";
import { useSockets } from "../providers/SocketProvider";

export const useOnlineUsers = () => {
  const { load: loadSocket } = useSockets();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const fetchOnlineList = useCallback(() => {
    if (loadSocket?.connected) {
      loadSocket.emit("get_online_users", (ids: string[]) => {
        if (Array.isArray(ids)) {
          setOnlineUsers(new Set(ids.map(String)));
        }
      });
    }
  }, [loadSocket]);

  useEffect(() => {
    if (!loadSocket) return;

    // Очищуємо список при зміні сокета (наприклад, при перелогіні)
    setOnlineUsers(new Set());

    const handleStatusChange = (data: { userId: string; isOnline: boolean }) => {
      if (!data?.userId) return;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isOnline) newSet.add(String(data.userId));
        else newSet.delete(String(data.userId));
        return newSet;
      });
    };

    const onConnect = () => {
      console.log("🟢 Connected/Reconnected to /load");
      loadSocket.emit("heartbeat");
      fetchOnlineList();
    };

    loadSocket.on("user_status_change", handleStatusChange);
    loadSocket.on("connect", onConnect);
    // Важливо для перелогіну:
    loadSocket.on("reconnect", onConnect);

    // Якщо сокет вже підключився поки хук монтувався
    if (loadSocket.connected) {
      onConnect();
    }

    const heartbeatInterval = setInterval(() => {
      if (loadSocket.connected) loadSocket.emit("heartbeat");
    }, 45000);

    return () => {
      clearInterval(heartbeatInterval);
      loadSocket.off("user_status_change", handleStatusChange);
      loadSocket.off("connect", onConnect);
      loadSocket.off("reconnect", onConnect);
    };
    // Додаємо loadSocket як залежність, щоб при його зміні (після login) хук перезібрався
  }, [loadSocket, fetchOnlineList]); 

  return onlineUsers;
};
