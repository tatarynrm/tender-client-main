import { IApiResponse } from "@/shared/api/api.type";
import api from "@/shared/api/instance.api";
import { IUserAccount } from "../types/user.types";

export const adminUserService = {
  getUsers: async (params: URLSearchParams) => {
    const res = await api.get<IApiResponse<IUserAccount[]>>(`/admin/user/list?${params.toString()}`);
    return res.data;
  },
  getOneUser: async (id: number) => {
    const res = await api.get(`/admin/user/one/${id}`);
    return res.data.content;
  },
  createUser: async (data: any) => {
    const res = await api.post("/admin/user/save", data);
    return res.data;
  },

};
