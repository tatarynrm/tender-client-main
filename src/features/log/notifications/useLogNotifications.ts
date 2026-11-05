import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { useSockets } from "@/shared/providers/SocketProvider";

export interface LogNotification {
  id: number;
  content: any;
  ids_notify_type: string;
  created_at: string;
  value: string | null;
  time_seen: string | null;
}

// Сповіщення менеджера ICT для дзвіночка в хедері /log.
// Список — GET /notification/user-notifications, прочитання — /seen та /seen-all.
// Живі оновлення — через сокет-подію new_notification (оптимістично, без очікування
// мережі) + періодичний рефетч як підстраховка.
export const useLogNotifications = () => {
  const qc = useQueryClient();
  const { user: userSocket } = useSockets();

  // Оптимістична надбавка до лічильника: збільшується миттєво на сокет-подію,
  // обнуляється щойно прийшли свіжі дані з сервера.
  const [liveBump, setLiveBump] = useState(0);
  // Лічильник «дзвінків» — зростає на кожну нову подію, щоб тригерити анімацію.
  const [ping, setPing] = useState(0);

  const query = useQuery<LogNotification[]>({
    queryKey: ["logNotifications"],
    queryFn: async () => {
      const { data } = await api.get("/notification/user-notifications");
      return data?.content ?? data ?? [];
    },
    staleTime: 1000 * 10,
    // Підстраховка на випадок пропущеної сокет-події: лічильник не застрягне.
    refetchInterval: 1000 * 20,
    refetchOnWindowFocus: true,
  });

  // Свіжі дані з сервера вже враховують нові сповіщення — скидаємо оптимістику.
  useEffect(() => {
    setLiveBump(0);
  }, [query.dataUpdatedAt]);

  useEffect(() => {
    if (!userSocket) return;
    const onNew = () => {
      // Миттєво рухаємо лічильник і тригеримо анімацію, не чекаючи рефетчу.
      setLiveBump((b) => b + 1);
      setPing((p) => p + 1);
      qc.invalidateQueries({ queryKey: ["logNotifications"] });
    };
    userSocket.on("new_notification", onNew);
    return () => {
      userSocket.off("new_notification", onNew);
    };
  }, [userSocket, qc]);

  const markSeen = useMutation({
    mutationFn: async (id: number) =>
      (await api.post("/notification/seen", { id })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logNotifications"] }),
  });

  const markAll = useMutation({
    mutationFn: async () => (await api.post("/notification/seen-all")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logNotifications"] }),
  });

  const list = query.data ?? [];
  const serverUnread = list.filter((n) => !n.time_seen).length;
  const unreadCount = serverUnread + liveBump;

  return { ...query, list, unreadCount, ping, markSeen, markAll };
};
