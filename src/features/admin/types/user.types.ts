/**
 * Ролі та права доступу користувача
 */
export interface UserPersonRole {
  id: number;
  is_ict?: boolean;
  is_admin: boolean;
  id_person: number;
  is_manager: boolean;
}

/**
 * Дані про фізичну особу (співробітника)
 */
export interface UserPerson {
  id: number;
  ipn: string | null;
  name: string;
  email: string;
  ipn_uk: string | null;
  ids_sex: "M" | "F"; // Можна розширити, якщо є інші значення
  surname: string;
  birthday: string | null;
  email_uk: string;
  initials: string;
  last_name: string;
  created_at: string;
  id_company: number;
  migrate_id: string;
  updated_at: string;
  person_role: UserPersonRole;
  date_release: string | null;
  initials_rev: string;
  person_phone: string[]; // Або масив об'єктів, якщо з'являться дані
  date_employment: string | null;
  migrate_company: string;
  address_register: string | null;
  address_residential: string | null;
}

/**
 * Основний об'єкт користувача (System User)
 */
export interface IUserAccount {
  id: number;
  email: string;
  person: UserPerson;
  verified: boolean;
  id_person: number;
  created_at: string;
  id_company: number;
  id_usr_pre: number | null;
  is_blocked: boolean;
  migrate_id: string;
  updated_at: string;
  migrate_company: string;
}
