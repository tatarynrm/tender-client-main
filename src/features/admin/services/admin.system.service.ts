import api from "@/shared/api/instance.api";

export const adminSystemService = {
  sendCommand: async (data: {
    type: string;
    payload?: any;
    userId?: string;
  }) => {
    // Використовуємо ваш шлях до API
    const response = await api.post("/admin/system/send-command", data);
    return response.data;
  },
};