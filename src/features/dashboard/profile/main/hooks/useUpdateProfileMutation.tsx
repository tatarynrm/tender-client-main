import { useMutation } from "@tanstack/react-query";
import { profileService } from "../services";
import { TypeProfileSchema } from "../schemes";
import { toast } from "sonner";

export function useUpdateProfileMutation() {
  const { mutate: updateProfile, isPending: isLoadingUpdateProfile } =
    useMutation({
      mutationKey: ["update profile"],
      mutationFn: (data: TypeProfileSchema) =>
        profileService.updateProfile(data),
      onSuccess() {
        toast.success("Ви успішно обновили профіль");
      },
      onError() {
        toast.error("Не вдалося оновити профіль");
      },
    });

  return {
    updateProfile,
    isLoadingUpdateProfile,
  };
}
