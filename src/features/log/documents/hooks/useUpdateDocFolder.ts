import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export const useUpdateDocFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; parentId?: string | null } }) =>
      documentsService.updateFolder(id, payload),
    onSuccess: (_folder, { payload }) => {
      toast.success(payload.parentId !== undefined ? "Папку переміщено" : "Папку перейменовано");
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося змінити папку"));
    },
  });
};
