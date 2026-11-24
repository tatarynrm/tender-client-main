import api from "@/shared/api/instance.api";
import { IApiResponse } from "@/shared/api/api.type";
import {
  CarrierLoadItem,
  CarrierLoadListParams,
} from "../loads/types/carrier-load.type";

export const carrierLoadService = {
  /** Екран заявок перевізника — crm_load_list_per, ціла обгортка з props.pagination */
  getList: async (
    params: CarrierLoadListParams = {},
  ): Promise<IApiResponse<CarrierLoadItem[]>> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.set(key, String(val));
      }
    });
    const qs = query.toString();
    const { data } = await api.get(
      `/crm/load/carrier-list${qs ? `?${qs}` : ""}`,
    );
    return data;
  },
};
