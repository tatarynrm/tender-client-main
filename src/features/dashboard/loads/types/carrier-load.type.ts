// Рядок content процедури crm_load_per_list (екран заявок перевізника).
// Набір полів звірений із процедурою: назви замовника, ціни, вантажу,
// ваги/об'єму й контактів менеджера вона НЕ віддає.

export interface CarrierLoadTrailer {
  id: number;
  id_parent: number;
  ids_trailer_type: string; // "TENT"
  trailer_type_name: string | null; // "Тент"
  order_num: number | null;
}

export interface CarrierLoadItem {
  id: number;
  created_at: string;
  updated_at: string;
  date_load: string | null;
  date_load2: string | null;
  date_unload: string | null;
  is_collective: boolean;
  is_price_request: boolean;
  id_author: number | null;
  /** Ім'я та прізвище менеджера ICT, який розмістив заявку */
  author: string | null;
  car_count_add: number | null;
  car_count_actual: number | null;
  car_count_closed: number | null;
  car_count_canceled: number | null;
  ids_transit_type: string | null; // "R" | "E" | "I" | "T" ...
  transit_type: string | null; // "Регіональні"
  ids_country: string | null;
  ids_country_from: string | null;
  ids_country_to: string | null;
  city_from: string | null;
  city_to: string | null;
  region_from: string | null;
  region_to: string | null;
  crm_load_trailer: CarrierLoadTrailer[];
}

export interface CarrierLoadListParams {
  page?: number;
  limit?: number;
  transit?: string;
}
