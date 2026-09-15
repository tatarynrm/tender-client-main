import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export const useDeleteDocFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm: string }) =>
      documentsService.deleteFolder(id, confirm),
    onSuccess: (res) => {
      toast.success(`Папку видалено (файлів: ${res.deletedFiles})`);
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося видалити папку"));
    },
  });
};
