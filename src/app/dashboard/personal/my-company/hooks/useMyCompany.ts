import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";

export const useMyCompany = (migrate_id?: number) => {
  const { data: company, isLoading, error } = useQuery({
    queryKey: ["my-company", migrate_id],
    queryFn: async () => {
      const response = await api.post("/company/my", { migrate_id });
      return response.data;
    },
  });

  return {
    company,
    isLoading,
    error,
  };
};
