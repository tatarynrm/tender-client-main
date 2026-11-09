import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/shared/api/instance.api";

export interface RateDeletePayload {
  // id ставки (rate_company[].id)
  id: number;
}

// Видалення власної ставки менеджера ICT (процедура tender_rate_delete).
export const useTenderRateDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RateDeletePayload) => {
      const response = await api.post("/tender/del-rate", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Ставку видалено");
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      console.error("Помилка видалення ставки:", error);
      toast.error(
        error?.response?.data?.message || "Не вдалося видалити ставку.",
      );
    },
  });
};
