import api from "@/shared/api/instance.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useChangePasswordMutation = () => {
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: async (values: any) => {
      const { confirmPassword, ...data } = values;
      const response = await api.patch("/users/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Пароль успішно змінено! Перевірте електронну пошту.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Не вдалося змінити пароль";
      toast.error(message);
    },
  });

  return { changePassword, isPending };
};
