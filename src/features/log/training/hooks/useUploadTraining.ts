import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trainingService } from "../../services/training.service";
import { ITrainingVideoForm } from "../types/training.type";
import { trainingErrorMessage } from "../utils/training.utils";
import { TRAINING_QUERY_KEY } from "./useTrainings";

export const useUploadTraining = (onProgress?: (percent: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ITrainingVideoForm & { file: File }) =>
      trainingService.upload(payload, onProgress),
    onSuccess: () => {
      toast.success("Відео завантажено");
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(trainingErrorMessage(error, "Не вдалося завантажити відео"));
    },
  });
};
