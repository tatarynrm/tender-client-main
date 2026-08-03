import { authService } from "@/features/auth/services";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useProfileLogoutMutation() {
  const router = useRouter();

  const { mutate: logout, isPending: isLoadingLogout } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authService.logout(),
    onSuccess() {
      toast.success("Ви успішно вийшли з аккаунту");
      window.location.href = "/auth/login";
    },
    onError() {
      toast.error("Не вдалося вийти з аккаунту");
    },
  });

  return { logout, isLoadingLogout };
}
