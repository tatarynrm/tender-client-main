import { useQuery } from "@tanstack/react-query";
import { trainingService } from "../../services/training.service";

export const TRAINING_QUERY_KEY = ["training-videos"];

export const useTrainings = () =>
  useQuery({
    queryKey: TRAINING_QUERY_KEY,
    queryFn: () => trainingService.getList(),
    select: (res) => res.content ?? [],
    staleTime: 1000 * 60,
  });
