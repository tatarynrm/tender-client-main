import api from "@/shared/api/instance.api";
import {
  ILocalAiAnswer,
  ILocalAiHealth,
  ILocalAiMessage,
  ILocalAiSession,
} from "../ai/types/local-ai.types";

/**
 * Клієнт локального AI-помічника.
 *
 * Ходимо єдиним axios-інстансом проєкту: авторизація тримається на кукі
 * `centrifuge`, тому власний fetch чи новий інстанс дали б 401.
 *
 * Ендпоінти local-ai повертають дані напряму, без обгортки {status, content} —
 * контролер віддає результат сервісу як є.
 */
export const localAiService = {
  getHealth: async (): Promise<ILocalAiHealth> => {
    const { data } = await api.get("/local-ai/health");
    return data;
  },

  getSessions: async (): Promise<ILocalAiSession[]> => {
    const { data } = await api.get("/local-ai/sessions");
    return data;
  },

  // POST /local-ai/sessions свідомо не має клієнта: розмову заводить сервер
  // разом із першим повідомленням, інакше порожні чати займали б слоти ліміту.

  getMessages: async (sessionId: string): Promise<ILocalAiMessage[]> => {
    const { data } = await api.get(`/local-ai/sessions/${sessionId}/messages`);
    return data;
  },

  renameSession: async (sessionId: string, title: string) => {
    const { data } = await api.patch(`/local-ai/sessions/${sessionId}`, {
      title,
    });
    return data;
  },

  deleteSession: async (sessionId: string) => {
    const { data } = await api.delete(`/local-ai/sessions/${sessionId}`);
    return data;
  },

  deleteAllSessions: async (): Promise<{ deleted: number }> => {
    const { data } = await api.delete("/local-ai/sessions");
    return data;
  },

  sendMessage: async (
    text: string,
    sessionId?: string,
  ): Promise<ILocalAiAnswer> => {
    const { data } = await api.post("/local-ai/chat", { text, sessionId });
    return data;
  },
};
