import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trainingService } from "../../services/training.service";
import { trainingErrorMessage } from "../utils/training.utils";
import { TRAINING_QUERY_KEY } from "./useTrainings";

export const useDeleteTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingService.remove(id),
    onSuccess: () => {
      toast.success("Відео видалено");
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(trainingErrorMessage(error, "Не вдалося видалити відео"));
    },
  });
};
