import { create } from "zustand";

type NotificationType = "warning" | "advice" | "request";

interface AdminNotificationState {
  isOpen: boolean;
  message: string;
  type: NotificationType;
  showNotification: (message: string, type: NotificationType) => void;
  closeNotification: () => void;
}

export const useAdminNotificationStore = create<AdminNotificationState>((set) => ({
  isOpen: false,
  message: "",
  type: "request",
  showNotification: (message, type) => set({ isOpen: true, message, type }),
  closeNotification: () => set({ isOpen: false }),
}));
