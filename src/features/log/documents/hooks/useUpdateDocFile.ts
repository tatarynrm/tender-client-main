import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

type Payload = { name?: string; folderId?: string | null };

export const useUpdateDocFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** Кілька id — масове переміщення вибраних файлів. */
    mutationFn: async ({ ids, payload }: { ids: string[]; payload: Payload }) => {
      for (const id of ids) await documentsService.updateFile(id, payload);
      return ids.length;
    },
    onSuccess: (count, { payload }) => {
      toast.success(
        payload.folderId !== undefined
          ? count > 1 ? `Переміщено файлів: ${count}` : "Файл переміщено"
          : "Файл перейменовано",
      );
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося змінити файл"));
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
};
