import api from "@/shared/api/instance.api";
import { Dropdowns, LoadApiItem, LoadFormData } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";

export const loadService = {
  /** Отримання списку вантажів з фільтрами */
  getLoads: async (
    params?: URLSearchParams
  ): Promise<IApiResponse<LoadApiItem[]>> => {
    const query = params?.toString();

    const { data } = await api.get(`/crm/load/list${query ? `?${query}` : ""}`);

    return data;
  },

  /** Дані для форми створення вантажу */
  getLoadFormData: async (): Promise<LoadFormData[]> => {
    const { data } = await api.get("/form-data/getCreateCargoFormData");

    return data.content;
  },
  /** Дані для форми створення вантажу */
  getLoadFilters: async (): Promise<Dropdowns> => {
    const { data } = await api.get("/form-data/load-filters");

    return data.content;
  },

  /** Отримання одного вантажу */
  getOneLoad: async (id: number | string): Promise<LoadApiItem> => {
    const { data } = await api.get(`/crm/load/${id}`);
    return data.content[0];
  },
};
