import api from "@/shared/api/instance.api";
import { IApiResponse } from "@/shared/api/api.type";

export interface IUser {
  id_usr: number;
  name: string;
  surname: string;
  email: string;
  isOnline?: boolean;
  // додайте інші поля за потреби
}

export const userClientsService = {
  getAllUsers: async (
    params?: URLSearchParams,
  ): Promise<IApiResponse<IUser[]>> => {
    const query = params?.toString();
    const { data } = await api.get(`/users/all`);
    return data;
  },
};
