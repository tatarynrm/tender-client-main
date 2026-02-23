export type CarrierRating = "MAIN" | "MEDIUM" | "IMPORTANT";
export interface ICompany {
  id: number;
  company_name: string;
  company_name_full?: string; // Додано
  company_form?: string; // Додано (ФОП/ТОВ)
  edrpou: string;
  address: string | null;
  web_site?: string; // Додано
  is_blocked: boolean;
  black_list: boolean;
  is_carrier: boolean;
  is_expedition: boolean;
  is_client: boolean;
  ids_country?: string; // Додано
  created_at: string;
  updated_at: string;
  rating: number | null;
  ids_carrier_rating: CarrierRating;

  // from pre
  company_edrpou?: string; // Додано для сумісності з даними, які можуть прийти з pre-register
  company_expedition?: boolean; // Додано для сумісності з даними, які можуть прийти з pre-register
  company_client?: boolean; // Додано для сумісності з даними, які можуть прийти з pre-register
  company_carrier?: boolean; // Додано для сумісності з даними, які можуть прийти з pre-register
}
