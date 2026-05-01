import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { useCallback } from "react";

export const useCompanyUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const response = await api.post("/users/my-company-users");
      // Handle the format from usr_list which might be in .content
      return response.data.content || response.data;
    },
  });

  const saveUser = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post("/users/register-from-company", userData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      const isUpdate = !!variables.id;
      toast.success(isUpdate ? "Дані користувача оновлено!" : "Користувача успішно створено!");
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Помилка при збереженні користувача");
    },
  });

  const getOneUser = useCallback(async (id: number | string) => {
    const response = await api.get(`/users/one/${id}`);
    const data = response.data.content?.[0] || response.data.content || response.data?.[0] || response.data;
    return data;
  }, []);

  return {
    users,
    isLoading,
    saveUser,
    getOneUser,
  };
};
