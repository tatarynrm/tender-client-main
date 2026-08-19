import api from "@/shared/api/instance.api";

export interface ICurrencySum {
  valut: string;
  valut_code: string;
  suma: number;
}

// Тиждень у графіку планових платежів (чип-підтаб усередині вкладки "Планові платежі").
export interface IPlanWeek {
  // ISO-дата тижня — ключ фільтра, який передаємо у список (body.week).
  week: string;
  // Людська назва тижня, напр. "26/34 тиж". Може повторюватись для різних дат
  // (два дні одного ISO-тижня), тож не є унікальним ключем — ключ це week.
  week_title: string;
  rah_count: number;
}

export interface IFinanceStatistic {
  // Планові платежі — загальна кількість рахунків у графіку.
  plan?: number;
  // Розбивка планових платежів по тижнях (чипи всередині "Планові платежі").
  plan_week?: IPlanWeek[];
  // Оплачені.
  opl?: number;
  // Рахунки до врегулювання.
  problem?: number;
  // Невиставлені рахунки (перевезення без виставленого рахунку).
  norah?: number;
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
  | "PLAN"
  | "OPL"
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
    perPage: number = 20,
    week?: string | null
  ): Promise<IFinanceListResponse | null> {
    try {
      const response = await api.post<IFinanceListResponse>(
        `/oracle/carrier-finance-list/${mid}`,
        {
          status,
          // Для "Планові платежі" (GRAFIK) фільтруємо по конкретному тижню.
          // Бекенд прозоро прокидає весь body у процедуру p_carrier.run.
          ...(week ? { week } : {}),
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

  /**
   * Пошук рахунків за фільтрами (вкладка «Пошук»). Викликає окрему
   * Oracle-функцію rah_filter (аналог perev_filter у перевезеннях).
   * Тіло: { filter, pagination }. Повертає масив content і total із
   * props.pagination для розрахунку сторінок.
   */
  async searchInvoices(
    mid: string | number,
    filter: Record<string, string | number>,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ content: IInvoice[]; total: number }> {
    try {
      const response = await api.post<any>(
        `/oracle/carrier-finance-filter/${mid}`,
        { filter, pagination: { page, per_page: perPage } }
      );
      const data = response.data;
      const content: IInvoice[] = Array.isArray(data)
        ? data
        : (data?.content ?? []);
      // props.pagination може називати підсумок по-різному — читаємо гнучко.
      const p = data?.props?.pagination ?? {};
      const total = Number(
        p.total ?? p.total_rows ?? p.total_count ?? p.count ?? p.rows ?? p.rows_all ?? 0
      );
      return { content, total: Number.isFinite(total) ? total : 0 };
    } catch (error) {
      console.error("Failed to search invoices:", error);
      return { content: [], total: 0 };
    }
  }
}

export const financeService = new FinanceService();
