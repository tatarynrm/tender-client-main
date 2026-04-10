import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";

export const useNotificationSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notificationSettings"],
    queryFn: async () => {
      const { data } = await api.post("/notification/getNotification");
      // Handle the { status: "ok", content: { ... } } wrapper
      return data?.content || data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/notification/updateNotification", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Налаштування сповіщень збережено");
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
    },
    onError: (err) => {
      console.error("Failed to update notification settings", err);
      toast.error("Помилка при збереженні налаштувань");
    },
  });

  return {
    ...query,
    updateMutation,
  };
};
