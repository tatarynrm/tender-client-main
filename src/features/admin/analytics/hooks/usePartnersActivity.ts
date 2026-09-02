import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { partnersActivityService } from "../services/partners-activity.service";

export function usePartnersActivity(params: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["partners-activity", params],
    queryFn: () => partnersActivityService.getReport(params),
    placeholderData: keepPreviousData,
  });
}
