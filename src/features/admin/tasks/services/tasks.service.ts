import { ITask, ITasksFile, TaskDraft, TaskPatch } from "../types/task.type";

/**
 * Увага: цей сервіс НЕ використовує shared/api/instance.api — той інстанс
 * дивиться на NestJS (:7000). Завдання зберігаються у локальному файлі
 * і обслуговуються route handler'ами самого Next, тобто той самий origin.
 */
const BASE = "/api/admin/tasks";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Помилка запиту");
  }

  return res.json();
}

export const tasksService = {
  getAll: () => request<ITasksFile>(BASE, { cache: "no-store" }),

  create: (draft: TaskDraft) =>
    request<ITask>(BASE, { method: "POST", body: JSON.stringify(draft) }),

  update: (id: string, patch: TaskPatch) =>
    request<ITask>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    request<{ ok: true }>(`${BASE}/${id}`, { method: "DELETE" }),

  addComment: (id: string, payload: { author: string; text: string }) =>
    request<ITask>(`${BASE}/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateComment: (id: string, commentId: string, text: string) =>
    request<ITask>(`${BASE}/${id}/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    }),

  removeComment: (id: string, commentId: string) =>
    request<ITask>(`${BASE}/${id}/comments/${commentId}`, { method: "DELETE" }),
};
