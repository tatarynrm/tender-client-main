import api from "@/shared/api/instance.api";
import { useSockets } from "@/shared/providers/SocketProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Описуємо тип payload (можете розширити під ваші потреби)
export interface SaveTenderPayload {
  id?: number | string;
  [key: string]: any;
}

export const useSaveTender = () => {
  const queryClient = useQueryClient();
  const { tender } = useSockets();

  return useMutation({
    // Функція, яка робить запит на сервер
    mutationFn: async (payload: SaveTenderPayload) => {
      // Рекомендую з часом перенести цей виклик у tenderManagerService.saveTender(payload)
      const response = await api.post("/tender/save", payload);
      return response.data;
    },
    // Виконується при успішному запиті
    onSuccess: (data, variables) => {

      const isEdit = !!variables.id;

      toast.success(isEdit ? "Успішно" : "Успішно");

      // Відправляємо сокет-подію
      if (tender?.connected) {
        tender.emit("tender_updated");
      }

      // Інвалідуємо кеш запитів, щоб список тендерів автоматично оновився
      // "tenders" — це базовий ключ, який ви використовуєте в useTenderListManagers
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
    // Виконується при помилці
    onError: (error: any) => {
      console.error("Помилка при збереженні тендеру:", error);
      // Бекенд (callProcedure) віддає текст помилки з процедури в message,
      // напр. "Не можна змінювати тендер, якщо він створений вчора чи
      // раніше, лише пролонгацію" — показуємо його менеджеру як є.
      const message =
        error?.response?.data?.message || "Помилка при збереженні тендеру";
      toast.error(message);
    },
  });
};