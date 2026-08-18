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
  zav_obl?: string | null;
  rozv_town: string;
  rozv_country: string;
  rozv_obl?: string | null;
  rozv_date?: string | null;
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
  info2?: string | null;
  /**
   * Ідентифікатор сутності події. Для code === "TENDER" це id тендера —
   * по ньому подія веде на список активних тендерів із підсвіткою.
   * Оракловські події його не віддають, тому опційний.
   */
  id?: number | null;
}

/**
 * Статистика тендерів приходить не з Oracle, а з процедури Postgres
 * tender_statistic — бекенд доклеює її до відповіді /oracle/carrier-statistic.
 */
export interface ITenderStatistic {
  count_plan: number;
  count_active: number;
  count_ending: number;
  /**
   * Подія по тендерах у форматі last_events. Поки тендерної події немає,
   * процедура віддає порожній об'єкт — звідси Partial.
   */
  event: Partial<ILastEvent> | null;
}

/**
 * Зведення співпраці. Раніше ці поля лежали пласко в корені відповіді
 * /oracle/carrier-statistic, тепер бекенд віддає їх вкладеними в cooperation.
 */
export interface ICooperationSummary {
  work_begin: string;
  zay_count_all: number;
  zay_count_active: number;
  doc_waiting: number;
  doc_no_set: number;
  oborot: number;
  curr_month_payable?: {
    valut: string;
    valut_code: string;
    suma: number;
  }[];
}

/** Активний договір перевізника (блок «Умови співпраці»). */
export interface IActiveDog {
  kod_dog: number;
  firma: string;
  dog_num: string;
  dog_date: string;
  termin: string;
  perev_mn: number;
  perev_ukr: number;
  payment_procedure: string;
  edo_medok: number;
  edo_vchasno: number;
}

/** Міжнародний напрямок (країна → країна) для блоків напрямків. */
export interface IDirectionMn {
  kod_krainaz: number;
  kod_krainar: number;
  country_zav: string;
  country_rozv: string;
  zay_count: number;
}

/** Регіональний напрямок (область → область) для блоку напрямків. */
export interface IDirectionReg {
  kod_oblz: number;
  kod_oblr: number;
  obl_zav: string;
  obl_rozv: string;
  zay_count: number;
}

export interface ICarrierStatistic {
  kod_per: number;
  /** Зведення співпраці — тепер вкладене, а не пласко в корені. */
  cooperation: ICooperationSummary;
  zay_chart: {
    month: string;
    count: number;
    current_month: number;
  }[];
  last_events?: ILastEvent[];
  dog_list_active?: IActiveDog[];
  direction_list_mn?: IDirectionMn[];
  direction_list_reg?: IDirectionReg[];
  tender_statistic?: ITenderStatistic | null;
  /** Наразі бекенд не віддає — лишено опційним для картки планованих оплат. */
  waiting_payment?: {
    valut: string;
    valut_code?: string;
    date_opl?: string;
    ids?: string;
    sum: number;
    zay_count: number;
  }[];
  debt_payment?: {
    valut: string;
    valut_code?: string;
    ids?: string;
    sum: number;
    zay_count: number;
  }[];
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
  zav_obl?: string | null;
  rozv_town: string;
  rozv_country: string;
  rozv_obl?: string | null;
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
      const response = await api.post<
        IActiveTransport[] | { content?: IActiveTransport[] }
      >(
        `/oracle/carrier-transportation-list/${mid}`,
        { status, pagination: { page, per_page: perPage } }
      );
      // Ендпоінт віддає { status, content, props } — масив лежить у content.
      // Перевірку на масив лишаємо на випадок старої форми відповіді.
      const data = response.data;
      return Array.isArray(data) ? data : (data?.content ?? []);
    } catch (error) {
      console.error("Failed to fetch transportation list", error);
      return [];
    }
  }

  /**
   * Пошук перевезень за фільтрами (вкладка «Пошук»). Викликає окрему
   * Oracle-функцію perev_filter. Повертає масив content і total із
   * props.pagination для розрахунку сторінок.
   */
  async getCarrierTransportationFilter(
    mid: string | number,
    filter: Record<string, string | number>,
    page: number = 1,
    perPage: number = 10
  ): Promise<{ content: IActiveTransport[]; total: number }> {
    try {
      const response = await api.post<any>(
        `/oracle/carrier-transportation-filter/${mid}`,
        { filter, pagination: { page, per_page: perPage } }
      );
      const data = response.data;
      const content: IActiveTransport[] = Array.isArray(data)
        ? data
        : (data?.content ?? []);
      // props.pagination може називати підсумок по-різному — читаємо гнучко.
      const p = data?.props?.pagination ?? {};
      const total = Number(
        p.total ?? p.total_rows ?? p.total_count ?? p.count ?? p.rows ?? 0
      );
      return { content, total: Number.isFinite(total) ? total : 0 };
    } catch (error) {
      console.error("Failed to filter transportation list", error);
      return { content: [], total: 0 };
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
