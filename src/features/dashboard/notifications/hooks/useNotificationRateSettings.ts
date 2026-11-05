import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";

// Налаштування сповіщень про ставки: від перевізників і від менеджерів ICT.
// Читання — tender_notify_rate, збереження — tender_notify_rate_save.
export const useNotificationRateSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notificationRateSettings"],
    queryFn: async () => {
      const { data } = await api.get("/notification/getNotificationRate");
      return data?.content || data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(
        "/notification/updateNotificationRate",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationRateSettings"] });
    },
    onError: (err) => {
      console.error("Failed to update rate notification settings", err);
    },
  });

  return {
    ...query,
    updateMutation,
  };
};
