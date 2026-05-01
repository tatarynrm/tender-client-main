import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";

interface ProlongationPayload {
  id_tender: number | string;
  time: string; // ISO format or timestamp
}

export const useTenderProlongation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProlongationPayload) => {
      const response = await api.post("/tender/notify-prolongation", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Тендер успішно пролонговано!");
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Не вдалося пролонгувати тендер.";
      toast.error(errorMsg);
    },
  });
};
