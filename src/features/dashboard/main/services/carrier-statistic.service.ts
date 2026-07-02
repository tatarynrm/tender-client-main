import api from "@/shared/api/instance.api";

export interface IManager {
  kod_os: number;
  imja: string;
  prizv: string;
  phone: string;
  email: string;
}

export interface IActiveTransport {
  kod_zay: number;
  firma?: string;
  zay_num: string;
  zav_date: string;
  zav_town: string;
  zav_country: string;
  rozv_town: string;
  rozv_country: string;
  am: string;
  am_mark: string | null;
  pr: string | null;
  pr_mark: string | null;
  pr_type: string;
  driver: string;
  driver_phone: string;
  manager: IManager;
  fraht?: number;
  valut?: string;
  valut_code?: string;
  status?: string;
}

export interface ILastEvent {
  code: string;
  label: string;
  date: string | null;
  info: string | null;
}

export interface ICarrierStatistic {
  kod_per: number;
  work_begin: string;
  work_end: string;
  zay_count_all: number;
  zay_count_active: number;
  doc_no_set: number;
  doc_waiting: number;
  debt_payment: {
    valut: string;
    valut_code?: string;
    ids?: string;
    sum: number;
    zay_count: number;
  }[];
  waiting_payment: {
    valut: string;
    valut_code?: string;
    date_opl?: string;
    ids?: string;
    sum: number;
    zay_count: number;
  }[];
  zay_chart: {
    month: string;
    count: number;
    current_month: number;
  }[];
  last_events?: ILastEvent[];
  zay_list_10?: IActiveTransport[];
  [key: string]: any;
}

export interface ICarrierCooperation {
  kod_per: number;
  zay_count_all: number;
  work_begin: string;
  work_end: string;
  oborot: number;
  work_len_days: number;
  zay_list_active: any[];
  dog_list_active: any[];
  direction_list_mn: any[];
  direction_list_reg: any[];
  [key: string]: any;
}

class CarrierStatisticService {
  async getCarrierStatistic(mid: string | number): Promise<ICarrierStatistic> {
    const response = await api.get<ICarrierStatistic>(
      `/oracle/carrier-statistic/${mid}`
    );
    return response.data;
  }

  async getCarrierCooperation(mid: string | number): Promise<ICarrierCooperation> {
    const response = await api.get<ICarrierCooperation>(
      `/oracle/carrier-cooperation/${mid}`
    );
    return response.data;
  }
}

export const carrierStatisticService = new CarrierStatisticService();
