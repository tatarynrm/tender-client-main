import api from "@/shared/api/instance.api";

export const adminTelegramService = {
  getTelegramUsers: async () => {
    const res = await api.get("/admin/telegram-users");
    return res.data;
  },
  sendBroadcast: async (data: { message: string, filter?: any }) => {
    const res = await api.post("/admin/telegram-broadcast", data);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get("/admin/telegram-stats");
    return res.data;
  }
};
