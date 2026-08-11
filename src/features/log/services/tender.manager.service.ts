import api from "@/shared/api/instance.api";
import { ITender } from "../types/tender.type";
import { IApiResponse } from "@/shared/api/api.type";
import { ITenderClientFormData } from "@/features/dashboard/types/dropdown.types";

export interface ICustomerStats {
  id: number | null;
  migrate_id: string | null;
  company_name_full: string | null;
  edrpou: string | null;
  address: string | null;
  is_blocked: boolean | null;
  black_list: boolean | null;
  created_at: string | null;
  tender_count: number;
}

// Сира відповідь Oracle p_tender.GetCompany (той самий виклик, що й /company/my)
export interface IOracleCompanyInfo {
  migrate_company?: string;
  migrate_id?: number;
  edrpou?: string;
  company_name?: string;
  company_form?: string;
  company_name_full?: string;
  ipn?: string;
  fo?: string;
  is_client?: number;
  is_carrier?: number;
  is_expedition?: number;
  address_fysical?: string;
  address_legal?: string;
  use_medoc?: number;
  use_vchasno?: number;
  pdv_status?: string;
  contracts?: Array<{
    migrate_id?: number;
    firma?: string;
    number?: string;
    date?: string;
    termin?: string;
  }>;
  directions?: any[];
  transport?: any[];
}

export interface ICustomerTrip {
  NUM: string | null;
  DATZAV: string | null;
  DATROZV: string | null;
  PUNKTZ: string | null;
  PUNKTR: string | null;
  VOD1: string | null;
  VOD1TEL: string | null;
  AM: string | null;
  AMMARK: string | null;
  VANTAZH: string | null;
  VANTTON: number | null;
  ZAMSUMA: number | null;
  VALUTZ_NAME: string | null;
  PERSUMA: number | null;
  VALUTP_NAME: string | null;
  CARRIER_NAME: string | null;
  CODE_STATUSMEN: string | null;
  PRIMSTATUSMEN: string | null;
  // Наші ICT-менеджери (по завантаженні/розвантаженні)
  MEN_ZAV: string | null;
  MEN_ROZV: string | null;
  // Зовнішні контакти на боці замовника/перевізника (часто відсутні)
  KONTAKT_ZAM: string | null;
  KONTAKT_ZAM_TEL: string | null;
  KONTAKT_ZAM_EMAIL: string | null;
  KONTAKT_PER: string | null;
  KONTAKT_PER_TEL: string | null;
  KONTAKT_PER_EMAIL: string | null;
}

export interface ICustomerTripsResponse {
  rows: ICustomerTrip[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface ICustomerTenderBid {
  id: number;
  carrier_name: string | null;
  bidder_name: string | null;
  price_proposed: number | null;
  car_count: number | null;
  time_add: string | null;
  notes: string | null;
}

export interface ICustomerTenderDetail {
  id: number;
  cargo: string | null;
  created_at: string | null;
  ids_status: string | null;
  author_name: string | null;
  bids: ICustomerTenderBid[];
}

export interface ICustomerTendersResponse {
  rows: ICustomerTenderDetail[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

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
    return data.content;
  },

  sendCustomNotification: async (id: number | string, message: string): Promise<any> => {
    const { data } = await api.post(`/tender/${id}/notify`, { 
      id_tender: id, 
      message: message, 
      ids_notify: 'TENDER_MESSAGE_ANY' 
    });
    return data;
  },

  sendResultNotification: async (id: number | string): Promise<any> => {
    const { data } = await api.post(`/tender/${id}/notify-results`);
    return data;
  },

  getCustomerStats: async (companyName: string): Promise<ICustomerStats> => {
    const { data } = await api.get(`/tender/customer-stats`, {
      params: { name: companyName },
    });
    return data;
  },

  getCustomerTrips: async (
    migrateId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<ICustomerTripsResponse> => {
    const { data } = await api.get(`/oracle/customer-trips/${migrateId}`, {
      params: { page, perPage },
    });
    return data;
  },

  getCustomerTenderDetails: async (
    companyId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<ICustomerTendersResponse> => {
    const { data } = await api.get(`/tender/customer-tenders`, {
      params: { companyId, page, perPage },
    });
    return data;
  },

  // Той самий ендпоінт, що й у "Моя компанія" перевізника — p_tender.GetCompany в Oracle
  getCustomerCompanyInfo: async (
    migrateId: string
  ): Promise<IOracleCompanyInfo | null> => {
    const { data } = await api.post(`/company/my`, { migrate_id: migrateId });
    return data;
  },
};
