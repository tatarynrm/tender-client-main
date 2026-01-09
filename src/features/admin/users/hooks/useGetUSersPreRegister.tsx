import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";

export interface UserPreRegister {
  id: number;
  name: string;
  last_name: string;
  surname: string;
  company_name: string;
  company_address: string;
  company_edrpou: string;
  company_carrier: boolean;
  company_expedition: boolean;
  company_freighter: boolean;
  country_idnt: string;
  country_name: string;
  email: string;
  phone: string;
  is_ict?: boolean;
  id_usr?: number | null;
  id_company?: number | null;
}

export const useGetUsersPreRegister = () => {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["users-pre-register"], // ключ для кешу
    queryFn: async () => {
      const { data } = await api.post("/users/pre-register");
      return data.content as UserPreRegister[];
    },
  });

  return {
    usersPre: data ?? [],
    isLoading,
    isFetching,
    refetch, // 👈 тепер можна викликати refetch() у будь-якому місці
    error,
  };
};
