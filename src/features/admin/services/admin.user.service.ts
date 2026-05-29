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
  deleteUser: async (id: number | string) => {
    const res = await api.post("/admin/user/delete", { id });
    return res.data;
  },
  getIctUsers: async () => {
    const res = await api.post<IApiResponse<IUserAccount[]>>("/users/user-list-ict");
    // Ensure we handle { content: ... } wrapper
    return res.data;
  },
  updateUserRole: async (id: number | string, data: { is_head_department?: boolean }) => {
    const res = await api.patch(`/users/${id}/role`, data);
    return res.data;
  },
};
