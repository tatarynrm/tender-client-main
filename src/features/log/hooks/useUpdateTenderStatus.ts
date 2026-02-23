// features/log/hooks/useUpdateTenderStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/shared/api/instance.api";
import { toast } from "sonner";

interface UpdateStatusPayload {
  id: string;
  ids_status: string;
}

export const useUpdateTenderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateStatusPayload) => {
      const response = await api.post("/tender/set-status", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Статус успішно оновлено!");
      
      // Інвалідуємо список тендерів, щоб вони перезавантажилися
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      
      // Якщо у вас є детальна сторінка конкретного тендеру, можна інвалідувати і його
      // queryClient.invalidateQueries({ queryKey: ["tender"] });
    },
    onError: (error) => {
      console.error("Помилка оновлення статусу:", error);
      toast.error("Не вдалося оновити статус.");
    },
  });
};