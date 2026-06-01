export interface IUserProfile {
  id: number;
  role: IUserRole;
  email: string;
  person: IPerson;
  company: ICompany;
  verified: boolean;
  department: IDepartment;
  is_blocked: boolean;
  // Додаємо нове поле. Воно може бути null, якщо користувач ще не підключив бота
  person_telegram: IPersonTelegram | null;
}

// Створюємо новий інтерфейс для Telegram-даних
export interface IPersonTelegram {
  telegram_id: number; // Якщо в БД це BIGINT, іноді pg повертає його як string, тоді змініть на number | string
  username: string | null; // В Telegram може не бути username
  first_name: string | null;
}

export interface IUserRole {
  is_ict: boolean;
  is_admin: boolean;
  is_manager: boolean;
  is_head_department?: boolean;
}

export interface IPerson {
  id: number;
  name: string;
  ids_sex: "M" | "F" | string;
  surname: string;
  birthday: string | null;
  last_name: string;
  phone?: string;
  person_role?: {
    id: number;
    is_ict?: boolean;
    is_admin: boolean;
    id_person: number;
    is_manager: boolean;
    is_head_department?: boolean;
  };
}

export interface ICompany {
  id: number;
  devid: number | null;
  edrpou: string;
  gps_lat: number | null;
  gps_lon: number | null;
  web_site: string;
  is_client: boolean;
  black_list: boolean;
  is_blocked: boolean;
  is_carrier: boolean;
  ids_country: string;
  company_form: string;
  company_name: string;
  is_expedition: boolean;
  migrate_id?: string | number;
}

export interface IDepartment {
  id: number;
  idnt: any | null;
  root_company: number;
  department_name: string;
}

export interface IUserActivity {
  id: string | number;
  id_usr: number;
  company_id?: number;
  action: string;
  path?: string;
  duration?: number;
  ip_address?: string;
  usr_agent?: string;
  metadata?: any;
  created_at: string;
}

export interface IUserActivityResponse {
  activities: IUserActivity[];
  nextCursor: string | null;
}
