import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toastMessageHandler } from "@/shared/utils";
import { toast } from "sonner";
import { ErrorResponse } from "@/shared/api";

import { userService } from "../services";
import { TypeCreateUserSchema } from "../schemas";

export function useCreateUser() {
  const queryClient = useQueryClient();
  const {
    mutate: createUserFromPreRegister,
    isPending: isLoadingUserPreRegister,
  } = useMutation({
    mutationKey: ["create user"],
    mutationFn: ({ values }: { values: TypeCreateUserSchema }) =>
      userService.createNewUser(values),

    onSuccess() {
      toast.success("Успішне створення користувача", {
        description: "Очікуйте на підтвердження модератором.",
      });
      queryClient.invalidateQueries({ queryKey: ["users-pre-register"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },

    onError(error: any) {
      // Якщо використовуєш axios, помилка лежить у error.response.data
      const err = error?.response?.data as ErrorResponse | undefined;

      toast.error(err?.message);
    },
  });

  return { createUserFromPreRegister, isLoadingUserPreRegister };
}
