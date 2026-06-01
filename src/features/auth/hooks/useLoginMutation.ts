import api from "@/shared/api/instance.api";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services";
import { TypeLoginSchema } from "../schemes";
import { toast } from "sonner";
import { ErrorResponse } from "@/shared/api";
import { useRouter } from "next/navigation";
import { Dispatch } from "react";
import { useAuth } from "@/shared/providers/AuthCheckProvider"; // Імпортуємо ваш хук
import { useSockets } from "@/shared/providers/SocketProvider";

// export function useLoginMutation(
//   setIsShowTwoFactor: Dispatch<React.SetStateAction<boolean>>,
// ) {
//   const router = useRouter();
//   const { setProfile } = useAuth(); // Отримуємо доступ до оновлення профілю

//   const { mutate: login, isPending: isLoadingLogin } = useMutation({
//     mutationKey: ["login user"],
//     mutationFn: async ({ values }: { values: TypeLoginSchema }) => {
//       return authService.login(values);
//     },
//     onSuccess(data: any) {
//       // 1. Перевірка на 2FA
//       if (data?.data?.message?.includes("Перевірте вашу пошту")) {
//         setIsShowTwoFactor(true);
//         toast.info("Перевірте пошту. Введіть код 2FA");
//         return;
//       }

//       // 2. Успішний вхід — оновлюємо дані в клієнтському контексті миттєво
//       // Припускаємо, що дані користувача приходять у data.data.user (перевірте структуру вашого API)
//       if (data?.data?.user) {
//         setProfile(data.data.user);
//       }

//       toast.success("Успішний вхід!");

//       // 3. Синхронізація сервера
//       // Це змусить RootLayout заново виконати getProfile() на фоні
//       router.refresh();

//       // 4. Перехід на головну панель
//       router.push("/dashboard");
//     },
//     onError(error: any) {
//       const err = error?.response?.data as ErrorResponse | undefined;
//       toast.error(err?.message || "Помилка входу");
//     },
//   });

//   return { login, isLoadingLogin };
// }
export function useLoginMutation(
  setIsShowTwoFactor: Dispatch<React.SetStateAction<boolean>>,
) {
  const router = useRouter();
  const { setProfile } = useAuth();
  const { load: loadSocket } = useSockets();
  const { mutate: login, isPending: isLoadingLogin } = useMutation({
    mutationKey: ["login user"],
    mutationFn: async ({ values }: { values: TypeLoginSchema }) => {
      return authService.login(values);
    },
    onSuccess(data: any) {
      // 1. Перевірка на 2FA
      if (data?.data?.message?.includes("Перевірте вашу пошту")) {
        setIsShowTwoFactor(true);
        toast.info("Перевірте пошту. Введіть код 2FA");
        return;
      }

      // 2. Оновлюємо стейт
      const user = data?.data?.user;

      if (user) {
        setProfile(user);

        // ВИПРАВЛЕННЯ ПОМИЛКИ ТУТ:
        if (loadSocket) {
          // 1. Оновлюємо дані авторизації всередині об'єкта сокета
          loadSocket.auth = { userId: String(user.id) };

          // 2. Перепідключаємось, щоб бекенд отримав новий handshake
          loadSocket.disconnect().connect();

          console.log("🔌 Socket reconnected with user:", user.id);
        }
        
        // Track login activity
        try {
          api.post("/activities/track", {
            action: "LOGIN",
            path: "/login"
          }).catch(() => {});
        } catch (e) {}
      }
      toast.success("Успішний вхід!");

      // 3. ПРАВИЛЬНА ПОСЛІДОВНІСТЬ:
      // Спочатку refresh, щоб сервер оновив profile в RootLayout
      router.refresh();

      // Невелика затримка або просто push.
      // Завдяки тому, що ми в MainProvider прокинули profile,
      // інтерфейс не "сіпнеться".
      router.push("/dashboard");
    },
    onError(error: any) {
      const err = error?.response?.data as ErrorResponse | undefined;
      const message = Array.isArray(err?.message)
        ? err.message[0]
        : err?.message;
      toast.error(message || "Помилка входу");
    },
  });

  return { login, isLoadingLogin };
}
