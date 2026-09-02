// Звіт "Активність партнерів" — зовнішні (не ICT) admin/manager по компаніях.
// Дані з GET /admin/user/partners-activity.

export interface IPartnerUserActivity {
  id_usr: number;
  surname: string | null;
  name: string | null;
  last_name: string | null;
  position: string | null;
  email: string | null;
  is_admin: boolean;
  is_manager: boolean;
  /** Кількість входів (LOGIN) за вибраний період */
  login_count: number;
  /** Перший вхід у періоді */
  first_login: string | null;
  /** Останній вхід у періоді */
  last_login: string | null;
  /** Остання будь-яка дія у періоді */
  last_activity: string | null;
  /** Усього дій у періоді */
  activity_count: number;
}

export interface IPartnerCompanyActivity {
  company_id: number | null;
  company_name: string | null;
  company_name_full: string | null;
  edrpou: string | null;
  users_count: number;
  active_users_count: number;
  total_logins: number;
  users: IPartnerUserActivity[];
}

export interface IPartnersActivityTotals {
  companies_count: number;
  active_companies_count: number;
  users_count: number;
  active_users_count: number;
  total_logins: number;
}

export interface IPartnersActivityReport {
  period: { startDate: string | null; endDate: string | null };
  totals: IPartnersActivityTotals;
  companies: IPartnerCompanyActivity[];
}
