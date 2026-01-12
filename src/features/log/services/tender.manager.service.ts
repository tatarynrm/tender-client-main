import api from "@/shared/api/instance.api";
import { ITender } from "../types/tender.type";
import { IApiResponse } from "@/shared/api/api.type";
import { ITenderClientFormData } from "@/features/dashboard/types/dropdown.types";

export const tenderManagerService = {
  // getTenders: async (): Promise<ITender[]> => {
  //   const { data } = await api.get("/tender/list");
  //   return data.content;
  // },

  // getOneTender: async (id: number | string): Promise<ITender> => {
  //   const { data } = await api.get(`/tender/${id}`);
  //   return data.content[0]; // або data, залежно від твоєї відповіді бекенду
  // },

  getTenders: async (
    params?: URLSearchParams
  ): Promise<IApiResponse<ITender[]>> => {
    const query = params?.toString();
    const { data } = await api.get(`/tender/list${query ? `?${query}` : ""}`);
    return data;
  },
  getTenderFormData: async (
    params?: URLSearchParams
  ): Promise<ITenderClientFormData> => {
    const { data } = await api.get<IApiResponse<ITenderClientFormData>>(
      `/tender/list-form-data`
    );
    return data.content;
  },

  getOneTender: async (id: number | string): Promise<ITender> => {
    const { data } = await api.get(`/tender/${id}`);
    return data.content[0];
  },
};
