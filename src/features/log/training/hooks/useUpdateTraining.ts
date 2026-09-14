import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trainingService } from "../../services/training.service";
import { ITrainingVideoForm } from "../types/training.type";
import { trainingErrorMessage } from "../utils/training.utils";
import { TRAINING_QUERY_KEY } from "./useTrainings";

export const useUpdateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ITrainingVideoForm }) =>
      trainingService.update(id, payload),
    onSuccess: () => {
      toast.success("Зміни збережено");
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(trainingErrorMessage(error, "Не вдалося зберегти зміни"));
    },
  });
};
