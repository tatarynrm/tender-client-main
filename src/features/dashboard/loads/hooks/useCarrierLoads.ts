import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { carrierLoadService } from "../../services/carrier-load.service";
import { CarrierLoadListParams } from "../types/carrier-load.type";

export const useCarrierLoads = (params: CarrierLoadListParams) =>
  useQuery({
    queryKey: ["carrier-loads", params],
    queryFn: () => carrierLoadService.getList(params),
    staleTime: 1000 * 30,
    // Сокет-подій по заявках у просторі перевізника немає — оновлюємо список фоном.
    refetchInterval: 1000 * 60,
    placeholderData: keepPreviousData,
  });
