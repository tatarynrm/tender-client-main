import api from "@/shared/api/instance.api";

export interface IActiveTransport {
  kod_zay: number;
  zay_num: string;
  zav_date: string;
  zav_town: string;
  zav_country: string;
  rozv_town: string;
  rozv_country: string;
  am: string;
  am_mark: string;
  pr: string | null;
  pr_mark: string | null;
  pr_type: string;
  driver: string;
  driver_phone: string;
  manager: string;
  manager_phone: string;
  fraht?: number;
  valut?: string;
  valut_code?: string;
  status?: string;
}

export interface ILastEvent {
  date: string;
  label: string;
  info: string;
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
    ids?: string;
    sum: number;
    zay_count: number;
  }[];
  waiting_payment: {
    valut: string;
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
  [key: string]: any;
}

class CarrierStatisticService {
  async getCarrierStatistic(mid: string | number): Promise<ICarrierStatistic> {
    const response = await api.get<ICarrierStatistic>(
      `/oracle/carrier-statistic/${mid}`
    );
    return response.data;
  }
}

export const carrierStatisticService = new CarrierStatisticService();
