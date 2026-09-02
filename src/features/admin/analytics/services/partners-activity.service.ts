import api from "@/shared/api/instance.api";
import { IPartnersActivityReport } from "../types/partners-activity.types";

export const partnersActivityService = {
  getReport: (params?: { startDate?: string; endDate?: string }) =>
    api
      .get<IPartnersActivityReport>("/admin/user/partners-activity", { params })
      .then((res) => res.data),
};
