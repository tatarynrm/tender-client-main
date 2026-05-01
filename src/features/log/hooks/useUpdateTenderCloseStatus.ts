import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";

interface UpdateCloseStatusPayload {
  id_tender: string | number;
  close_status: "ENABLE" | "DISABLE";
  notes?: string;
}

export const useUpdateTenderCloseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCloseStatusPayload) => {
      const response = await api.post("/tender/set-agree", payload);
      return response.data;
    },
    onSuccess: (data: any) => {
      const result = data?.content?.[0] || data;

      if (result?.status_changed === false) {
        toast.error("Статус не оновлено!");
      } else {
        toast.success("Статус погодження успішно оновлено!");
      }
      
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Не вдалося оновити статус погодження.";
      toast.error(errorMsg);
    },
  });
};
