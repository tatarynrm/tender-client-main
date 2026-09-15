import { useQuery } from "@tanstack/react-query";
import { documentsService } from "../../services/documents.service";

export const DOCUMENTS_QUERY_KEY = ["documents-tree"];

export const useDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: () => documentsService.getTree(),
    select: (res) => res.content ?? { folders: [], files: [] },
    staleTime: 1000 * 30,
  });
