import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/shared/api/instance.api";

export interface ProlongPayload {
  id_tender: number | string;
  // Новий час завершення, ISO (timestamptz)
  time: string;
}

// Пролонгація активного тендера (процедура tender_prolongation).
export const useTenderProlong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProlongPayload) => {
      const response = await api.post("/tender/prolongation", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Тендер пролонговано");
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Не вдалося пролонгувати тендер.",
      );
    },
  });
};
