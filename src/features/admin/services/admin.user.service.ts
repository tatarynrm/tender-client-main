import api from "@/shared/api/instance.api";

export const adminUserService = {
  getUsers: async (params: URLSearchParams) => {
    const res = await api.get(`/admin/user/list?${params.toString()}`);
    return res.data;
  },
  getOneUser: async (id: number) => {
    const res = await api.get(`/admin/user/${id}`);
    return res.data;
  },
  createUser: async (data: any) => {
    const res = await api.post("/admin/user/create", data);
    return res.data;
  },
  updateUser: async (data: any) => {
    const res = await api.post("/admin/user/update", data);
    return res.data;
  }
};