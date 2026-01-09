import api from "@/shared/api/instance.api";
import { ITender } from "../types/tender.type";

export const tenderService = {
  getTenders: async (): Promise<ITender[]> => {
    const { data } = await api.get("/tender/list");
    return data.content;
  },

  getOneTender: async (id: number | string): Promise<ITender> => {
    const { data } = await api.get(`/tender/${id}`);
    return data.content[0]; // або data, залежно від твоєї відповіді бекенду
  },
};
