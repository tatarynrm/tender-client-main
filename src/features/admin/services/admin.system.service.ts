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

  startMeeting: async () => {
    const response = await api.post("/admin/system/meeting/start");
    return response.data;
  },

  stopMeeting: async () => {
    const response = await api.post("/admin/system/meeting/stop");
    return response.data;
  },

  getCurrentMeeting: async () => {
    const response = await api.get("/systems/meeting/current");
    return response.data;
  }
};