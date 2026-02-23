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
}

export interface IPerson {
  id: number;
  name: string;
  ids_sex: 'M' | 'F' | string;
  surname: string;
  birthday: string | null;
  last_name: string;
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
}

export interface IDepartment {
  id: number;
  idnt: any | null;
  root_company: number;
  department_name: string;
}