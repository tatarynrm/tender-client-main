"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { CloseCargoFormValues } from "../active/ui/CargoCloseByManagerModal";

export const useCloseCargoByManager = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: closeCargoMutate, isPending: isLoadingCloseCargo } =
    useMutation({
      mutationFn: async (data: CloseCargoFormValues) => {
        // Шлях до вашого API для закриття вантажу
        const res = await api.post("/crm/load/close-cargo-by-manager", data);
        return res.data;
      },
      onSuccess: () => {
        toast.success("Закрито авто ✅");
        // Оновлюємо список вантажів, щоб дані в таблиці стали актуальними
        queryClient.invalidateQueries({ queryKey: ["loads"] });
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.message || "Помилка при закритті вантажу";
        toast.error(`${errorMsg} ❌`);
      },
    });

  return { closeCargoMutate, isLoadingCloseCargo };
};
