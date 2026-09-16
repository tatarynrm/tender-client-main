import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export const useDeleteDocFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** Один запит на всі вибрані файли; уже видалені кимось файли бекенд пропускає. */
    mutationFn: ({ ids, confirm }: { ids: string[]; confirm: string }) =>
      documentsService.deleteFiles(ids, confirm),
    onSuccess: ({ deleted }) => {
      toast.success(deleted === 1 ? "Файл видалено" : `Видалено файлів: ${deleted}`);
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося видалити файли"));
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
};
