// @/shared/lib/event-bus.ts

// Типізація подій для всього додатка
export type AppEventType =
  | "cargo_shake"
  | "cargo_shake_car_count"
  | "notification_received"
  | "update_comment"
  | "update_load_date"
  | "load_add_car"
  | "load_remove_car"
  | "load_deleted"
  | "user_balance_updated"

export const eventBus = {
  // Викликати подію
  emit(event: AppEventType, detail: any) {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  },

  // Підписатися на подію
  on(event: AppEventType, handler: (e: CustomEvent) => void) {
    window.addEventListener(event, handler as EventListener);
  },

  // Відписатися
  off(event: AppEventType, handler: (e: CustomEvent) => void) {
    window.removeEventListener(event, handler as EventListener);
  },
};
