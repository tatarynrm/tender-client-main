"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { AddCarsFormValues } from "../active/ui/CargoCarAddModal";

export const useAddCars = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isLoading } = useMutation({
    mutationFn: async (data: AddCarsFormValues) => {
      const res = await api.post("/crm/load/add-cars", data);
      return res.data;
    },
    onSuccess: () => {
     
      queryClient.invalidateQueries({ queryKey: ["loads"] });
    },
    onError: () => {
      toast.error("Помилка при додаванні машин ❌");
    },
  });

  return { mutateAsync, isLoading };
};
