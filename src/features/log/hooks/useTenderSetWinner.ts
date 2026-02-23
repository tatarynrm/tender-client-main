import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/shared/api/instance.api";
import { toast } from "sonner";

export interface SetWinnerPayload {
  id_tender_rate: number;
  car_count: number;
}

export const useTenderSetWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SetWinnerPayload) => {
      const response = await api.post("/tender/set-winner", payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Якщо car_count > 0, значить ми призначили переможця
      // Якщо car_count === 0 (або null), значить ми його скасували
      if (variables.car_count > 0) {
        toast.success("Переможця успішно встановлено!");
      } else {
        toast.success("Переможця скасовано.");
      }

      // Оновлюємо кеш, щоб UI одразу показав зміни.
      // Змініть "tenders" на той queryKey, який використовується у вас для отримання списку
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      console.error("Помилка встановлення переможця:", error);
      toast.error(
        error?.response?.data?.message || "Не вдалося оновити переможця.",
      );
    },
  });
};
