import { IApiResponse } from "@/shared/api/api.type";
import api from "@/shared/api/instance.api";
import { IPreRegisterUser } from "../hooks/useAdminPreRegisterUsers";

export const adminPreRegisterService = {
  // Отримання списку з параметрами
getUsers: async (params: Record<string, any>) => {
    // Axios автоматично перетворить { page: 1 } у ?page=1
    const { data } = await api.get<IApiResponse<IPreRegisterUser[]>>(
      "/admin/user/pre-register/list", 
      { params } 
    );
    return data;
  },
  // Отримання одного запису
  getOne: async (id: number) => {
    const res = await api.get(`/admin/pre-register/one/${id}`);
    // Повертаємо content, як у вашому прикладі з getOneUser
    return res.data.content;
  },

  // Збереження або створення
  saveUser: async (data: Partial<IPreRegisterUser>) => {
    const res = await api.post("/admin/pre-register/save", data);
    return res.data;
  },

  // Видалення (якщо потрібно)
  deleteUser: async (id: number) => {
    const res = await api.delete(`/admin/pre-register/delete/${id}`);
    return res.data;
  },
  getCompanyDataFromPre: async (id: number) => {
    const res = await api.get(`/admin/company/pre/${id}`);
    return res.data;
  },
};
