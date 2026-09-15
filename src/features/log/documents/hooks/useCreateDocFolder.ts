import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { docErrorMessage } from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export const useCreateDocFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; parentId: string | null }) =>
      documentsService.createFolder(payload),
    onSuccess: (folder) => {
      toast.success(`Папку «${folder.name}» створено`);
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(docErrorMessage(error, "Не вдалося створити папку"));
    },
  });
};
