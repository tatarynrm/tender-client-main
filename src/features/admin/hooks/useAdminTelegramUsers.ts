import { useQuery } from "@tanstack/react-query";
import { adminTelegramService } from "../services/admin.telegram.service";

export const useAdminTelegramUsers = () => {
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin", "telegram-users"],
    queryFn: () => adminTelegramService.getTelegramUsers(),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "telegram-stats"],
    queryFn: () => adminTelegramService.getStats(),
  });

  return {
    users: users || [],
    stats,
    isLoading,
    refetch
  };
};
