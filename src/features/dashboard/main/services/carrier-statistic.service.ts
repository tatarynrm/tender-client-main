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
  km?: number;
  vant_name?: string;
  vant_ton?: number;
  vant_objem?: number;
  code_status?: string;
  status_name?: string;
  code_status_detail?: string;
  status_detail_name?: string;
  code_status_ruh?: string;
  status_ruh?: string | null;
  code_status_opl?: string;
  status_opl?: string | null;
  opl_plan_date?: string | null;
  opl_fakt_date?: string | null;
  opl_suma?: number;
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

export interface ITransportationRoutePoint {
  code_punkt: string;
  punkt_type: string;
  date: string | null;
  date2: string | null;
  country: string;
  town: string;
  post: string | null;
  adr: string | null;
  ur_osoba: string | null;
  prim: string | null;
  telefon: string | null;
  gpslat: number | null;
  gpslon: number | null;
}

export interface ITransportationDetails {
  kod_zay: number;
  firma: string;
  zay_num: string;
  zav_date: string;
  zav_town: string;
  zav_country: string;
  rozv_town: string;
  rozv_country: string;
  am: string;
  am_mark: string;
  pr: string;
  pr_mark: string;
  pr_type: string;
  driver: string;
  driver_phone: string;
  fraht: number;
  km: number;
  valut: string;
  valut_code: string;
  vant_name: string;
  vant_ton: number;
  vant_objem: number;
  code_status: string;
  status_name: string;
  code_status_detail: string;
  status_detail_name: string;
  code_status_ruh: string;
  status_ruh: string | null;
  code_status_opl: string;
  status_opl: string | null;
  opl_plan_date: string | null;
  opl_fakt_date: string | null;
  opl_suma: number;
  manager: {
    kod_os: number;
    imja: string;
    prizv: string;
    phone: string;
    email: string;
    department: string;
  };
  route: ITransportationRoutePoint[];
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

  async getCarrierContacts(mid: string | number): Promise<any> {
    try {
      const response = await api.get<any>(
        `/oracle/carrier-contacts/${mid}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contacts", error);
      return null;
    }
  }

  async getCarrierTransportations(mid: string | number): Promise<any> {
    try {
      const response = await api.get<any>(
        `/oracle/carrier-transportations/${mid}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transportations", error);
      return null;
    }
  }

  async getCarrierTransportationList(
    mid: string | number,
    status: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<IActiveTransport[]> {
    try {
      const response = await api.post<IActiveTransport[]>(
        `/oracle/carrier-transportation-list/${mid}`,
        { status, pagination: { page, per_page: perPage } }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transportation list", error);
      return [];
    }
  }

  async getCarrierTransportationOne(mid: string | number, kod: number): Promise<ITransportationDetails | null> {
    try {
      const response = await api.post<ITransportationDetails>(
        `/oracle/carrier-transportation/${mid}`,
        { kod }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transportation details", error);
      return null;
    }
  }
}

export const carrierStatisticService = new CarrierStatisticService();
