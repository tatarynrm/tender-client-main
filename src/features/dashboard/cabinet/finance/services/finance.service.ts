import api from "@/shared/api/instance.api";

export interface IFinanceStatistic {
  all_borg: number;
  all_zay_count: number;
  all_rah_count: number;
  proterm_borg: number;
  proterm_zay_count: number;
  proterm_rah_count: number;
  plan_opl: number;
  plan_zay_count: number;
  plan_rah_count: number;
  opl_prev_suma: number;
  opl_prev_zay_count: number;
  opl_prev_rah_count: number;
  opl_cur_suma: number;
  opl_cur_zay_count: number;
  opl_cur_rah_count: number;
}

export interface IContactPerson {
  kod_os: number;
  imja: string;
  prizv: string;
  phone: string | null;
  email: string | null;
  department: string;
}

export interface ITtnItem {
  kod_ttn: number;
  ttn_num: string;
  ttn_dat: string | null;
  tovar_nakladna: string | null;
  akt_num: string | null;
  dovir: string | null;
  prim: string | null;
}

export interface IPerevItem {
  kod_zay: number;
  firma: string;
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
  dat_status_ruh: string | null;
  code_status_opl: string;
  status_opl: string | null;
  opl_plan_date: string | null;
  opl_fakt_date: string | null;
  opl_suma: number;
  manager: IContactPerson;
  ttn_list: ITtnItem[];
}

export interface IInvoice {
  kod_rah: number;
  firma: string;
  rah_num: string;
  rah_dat: string;
  doc_otrim: string | null;
  dat_opl_plan: string | null;
  dat_opl: string | null;
  grafik_dat: string | null;
  economist: IContactPerson;
  perev_list: IPerevItem[];
}

export interface IFinanceListResponse {
  status: string;
  content: IInvoice[];
  props: {
    pagination: {
      page: number;
      per_page: number;
      page_count: number;
      rows_all: number;
    };
  };
}

class FinanceService {
  async getFinanceStatistic(mid: string | number): Promise<IFinanceStatistic | null> {
    try {
      const response = await api.get<{ status: string; content: IFinanceStatistic }>(
        `/oracle/carrier-finance-statistic/${mid}`
      );
      return response.data?.content || null;
    } catch (error) {
      console.error("Failed to fetch finance statistics:", error);
      return null;
    }
  }

  async getFinanceList(
    mid: string | number,
    status: "BORG" | "PROTERM" | "PLAN" | "OPL_PREV" | "OPL_CUR",
    page: number = 1,
    perPage: number = 20
  ): Promise<IFinanceListResponse | null> {
    try {
      const response = await api.post<IFinanceListResponse>(
        `/oracle/carrier-finance-list/${mid}`,
        {
          status,
          pagination: {
            page,
            per_page: perPage,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch finance list:", error);
      return null;
    }
  }
}

export const financeService = new FinanceService();
