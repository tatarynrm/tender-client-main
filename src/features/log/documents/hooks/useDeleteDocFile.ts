import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export const useDeleteDocFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** Кілька id — масове видалення вибраних файлів. */
    mutationFn: async ({ ids, confirm }: { ids: string[]; confirm: string }) => {
      for (const id of ids) await documentsService.deleteFile(id, confirm);
      return ids.length;
    },
    onSuccess: (count) => {
      toast.success(count > 1 ? `Видалено файлів: ${count}` : "Файл видалено");
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося видалити файл"));
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
};
