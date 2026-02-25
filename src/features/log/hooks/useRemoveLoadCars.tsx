import api from "@/shared/api/instance.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveCars = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isLoading } = useMutation({
    mutationFn: async (data: { id_crm_load: number; car_count: number }) => {
      // Припускаємо, що ендпоінт такий самий за логікою
      const res = await api.post("/crm/load/remove-cars", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Заявки видалено 🗑️");

      // Оновлюємо списки
      queryClient.invalidateQueries({
        queryKey: ["loads"],
        exact: false,
      });

      // Оновлюємо конкретний вантаж за ID
      queryClient.invalidateQueries({
        queryKey: ["load", variables.id_crm_load],
      });
    },
    onError: () => {
      toast.error("Не вдалося видалити машини ❌");
    },
  });

  return { removeCarsMutate: mutateAsync, isLoadingRemove: isLoading };
};
