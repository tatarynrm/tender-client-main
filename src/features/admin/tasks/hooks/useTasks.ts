import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksService } from "../services/tasks.service";
import { TaskDraft, TaskPatch } from "../types/task.type";

export const TASKS_QUERY_KEY = ["admin", "project-tasks"];

export const useTasks = () =>
  useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: tasksService.getAll,
    staleTime: 1000 * 30,
  });

const useTasksMutation = <TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  successMessage: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error) => {
      console.error("Помилка операції із завданням:", error);
      toast.error(error.message || "Не вдалося виконати дію");
    },
  });
};

export const useCreateTask = () =>
  useTasksMutation((draft: TaskDraft) => tasksService.create(draft), "Завдання створено");

export const useUpdateTask = () =>
  useTasksMutation(
    ({ id, patch }: { id: string; patch: TaskPatch }) => tasksService.update(id, patch),
    "Зміни збережено",
  );

export const useDeleteTask = () =>
  useTasksMutation((id: string) => tasksService.remove(id), "Завдання видалено");

export const useAddComment = () =>
  useTasksMutation(
    ({ id, author, text }: { id: string; author: string; text: string }) =>
      tasksService.addComment(id, { author, text }),
    "Коментар додано",
  );

export const useEditComment = () =>
  useTasksMutation(
    ({ id, commentId, text }: { id: string; commentId: string; text: string }) =>
      tasksService.updateComment(id, commentId, text),
    "Коментар оновлено",
  );

export const useDeleteComment = () =>
  useTasksMutation(
    ({ id, commentId }: { id: string; commentId: string }) =>
      tasksService.removeComment(id, commentId),
    "Коментар видалено",
  );
