import api from "@/shared/api/instance.api";

export interface ICurrencySum {
  valut: string;
  valut_code: string;
  suma: number;
}

export interface IFinanceStatistic {
  // Усього до оплати по виставлених рахунках (може містити декілька валют)
  suma_borg_all?: ICurrencySum[];
  // Плановано до оплати в поточному місяці
  suma_borg_curr_month?: ICurrencySum[];
  // Оплачено у поточному місяці
  suma_opl_curr_month?: ICurrencySum[];

  count_rah_grafik?: number;
  count_rah_opl_curr_month?: number;
  count_rah_opl_prev_month?: number;
  count_rah_problem?: number;
  count_zay_doc_wait?: number;
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
  suma?: number;
  sumaopl?: number;
  borg?: number;
  valut?: string;
  valut_code?: string;
  problem_info?: string | any | null;
  perev_list: IPerevItem[];
}

export interface IPagination {
  page: number;
  per_page: number;
  page_count: number;
  rows_all: number;
}

export interface IFinanceListResponse {
  status: string;
  content: IInvoice[];
  props: {
    pagination: IPagination;
  };
}

/**
 * Елемент списку перевезень (p_carrier.run → perev_list). Структурно це той
 * самий рядок, що й у perev_list всередині рахунку, лише ttn_list може бути
 * відсутнім — рахунок ще не виставлений.
 */
export type ITransportationItem = Omit<IPerevItem, "ttn_list"> & {
  ttn_list?: ITtnItem[];
};

export interface ITransportationListResponse {
  status: string;
  content: ITransportationItem[];
  props?: {
    pagination?: IPagination;
  };
}

export type FinanceStatusType =
  | "GRAFIK"
  | "OPL_CURR_MONTH"
  | "OPL_PREV_MONTH"
  | "PROBLEM"
  | "DOC_WAIT"
  | "PLAN"
  | "OPL_PREV"
  | "OPL_CUR"
  | "PROTERM";

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
    status: FinanceStatusType,
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

  /**
   * Список перевезень (func: perev_list). Використовується вкладкою
   * «Невиставлені рахунки» — там рахунку ще немає, тож rah_list порожній.
   */
  async getTransportationList(
    mid: string | number,
    status: FinanceStatusType,
    page: number = 1,
    perPage: number = 20
  ): Promise<ITransportationListResponse | null> {
    try {
      const response = await api.post<ITransportationListResponse>(
        `/oracle/carrier-transportation-list/${mid}`,
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
      console.error("Failed to fetch transportation list:", error);
      return null;
    }
  }
}

export const financeService = new FinanceService();
