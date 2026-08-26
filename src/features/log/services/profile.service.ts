import api from "@/shared/api/instance.api";
import { IPersonPhone } from "@/shared/types/user.types";

export interface IAddPhonePayload {
  phone: string;
  is_telegram?: boolean;
  is_viber?: boolean;
  is_whatsapp?: boolean;
}

export const profileService = {
  // Додати телефон поточного менеджера (person_phone).
  addPhone: async (payload: IAddPhonePayload): Promise<IPersonPhone> => {
    const { data } = await api.post<IPersonPhone>("/users/profile/phone", payload);
    return data;
  },
};
