import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

type Payload = { name?: string; folderId?: string | null };

export const useUpdateDocFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** Перейменування — по одному файлу; переміщення — одним масовим запитом. */
    mutationFn: async ({ ids, payload }: { ids: string[]; payload: Payload }) => {
      if (payload.folderId !== undefined) {
        const { moved } = await documentsService.moveFiles(ids, payload.folderId);
        return moved;
      }
      await documentsService.updateFile(ids[0], payload);
      return 1;
    },
    onSuccess: (count, { payload }) => {
      toast.success(
        payload.folderId !== undefined
          ? count === 1 ? "Файл переміщено" : `Переміщено файлів: ${count}`
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
