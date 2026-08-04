import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminOracleDocsService } from "../services/admin.oracle-docs.service";

export const useOracleDocs = () => {
  const queryClient = useQueryClient();

  const docsQuery = useQuery({
    queryKey: ["admin", "oracle-docs"],
    queryFn: () => adminOracleDocsService.getDocs(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const statusQuery = useQuery({
    queryKey: ["admin", "oracle-docs-status"],
    queryFn: () => adminOracleDocsService.getStatus(),
  });

  const refreshMutation = useMutation({
    mutationFn: () => adminOracleDocsService.refresh(),
    onSuccess: () => {
      toast.success("Документацію схеми Oracle оновлено");
      queryClient.invalidateQueries({ queryKey: ["admin", "oracle-docs"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "oracle-docs-status"],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Не вдалося оновити документацію";
      toast.error(message);
    },
  });

  return {
    docs: docsQuery.data,
    isLoading: docsQuery.isLoading,
    error: docsQuery.error as any,
    status: statusQuery.data,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
};
