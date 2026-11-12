import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/shared/api/instance.api";

export interface RateCancelPayload {
  // id ставки (rate_company[].id)
  id: number;
}

// Скасування власної ставки менеджера ICT (процедура tender_rate_cancel).
// Ставка лишається в списку з відміткою time_canceled.
export const useTenderRateCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RateCancelPayload) => {
      const response = await api.post("/tender/cancel-rate", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Ставку скасовано");
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      console.error("Помилка скасування ставки:", error);
      toast.error(
        error?.response?.data?.message || "Не вдалося скасувати ставку.",
      );
    },
  });
};
