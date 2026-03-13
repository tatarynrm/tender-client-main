// 🔹 Оновлений тип даних із API на основі реального об'єкта
export type LoadRouteItem = {
  id: number;
  lat: number;
  lon: number;
  city: string;
  address: string;
  country: string; // "UA", "DE"
  id_parent: number;
  order_num: number;
  ids_region: string | null; // "UA-46"
  ids_country: string; // "UA"
  ids_route_type: "LOAD_FROM" | "LOAD_TO";
  region: string | null;
  street: string | null;
  house: string | null;
  post_code: string | null;
};

export type LoadTrailerItem = {
  id: number;
  id_parent: number;
  order_num: number;
  ids_trailer_type: string; // "TENT"
  trailer_type_name: string; // "Тент"
};

export type LoadApiItem = {
  id: number;
  author: string;
  company_name: string;
  load_info: string;
  transit_type: string; // "Експорт"
  ids_transit_type: string; // "E"
  car_count_add: number;
  car_count_actual: number;
  car_count_closed: number;
  car_count_canceled: number;
  crm_load_trailer: LoadTrailerItem[]; // Тепер це масив об'єктів
  crm_load_route_from: LoadRouteItem[];
  crm_load_route_to: LoadRouteItem[];
  created_at: string;
  updated_at: string;
  status?: string;
  messages: number;
  is_collective: boolean;
  is_price_request: boolean;
  price: number | null;
  valut_name: string | null;
  ids_valut: string | null;
  comment_count: number;
  comment_last_time: string | null;
  comment_read_time: string | null;
  id_usr: number;
  date_load: string | Date;
  date_load2?: string | Date;
  date_unload: string | Date;
  id_author?: number;
};

export interface ValutDropdownItem {
  ids: string; // Код валюти (USD, UAH...)
  idv: string; // Скорочення
  cent: string; // Копійки/центи
  idnt: string; // Ідентифікатор
  idntnum: string; // ISO номер
  capacity: number; // Кількість знаків після коми
  valut_name: string; // Повна назва
}

export interface RegionDropdownItem {
  ids: string; // Код регіону (UA-05, ARK...)
  short_name: string; // Коротка назва
  region_name: string; // Повна назва
}

export interface RouteTypeDropdownItem {
  crm: boolean;
  ids: "LOAD_FROM" | "LOAD_TO"; // Тип точки
  info: string; // Повна назва
  value: string; // Коротка назва (Зав/Розв)
}

export interface TrailerTypeDropdownItem {
  ids: string; // Код причепа (TENT, REF...)
  value: string; // Назва українською
  order_num: number; // Порядок сортування
}

// Загальний інтерфейс об'єкта, який повертає useLoadFormData
export interface LoadFormData {
  valut_dropdown: ValutDropdownItem[];
  region_dropdown: RegionDropdownItem[];
  route_type_dropdown: RouteTypeDropdownItem[];
  trailer_type_dropdown: TrailerTypeDropdownItem[];
}

// features/log/types/load.type.ts (або де у вас лежать типи)

export interface DropdownOption {
  ids: string | number;
  value: string; // Для trailer_type_dropdown, company_dropdown
  country_name?: string; // Для country_dropdown
  region_name?: string; // Для region_dropdown
  valut_name?: string; // Для valut_dropdown
  short_name?: string;
}
export interface DepartmentDropdownOption {
  ids: string | number;
  value: string; // Для trailer_type_dropdown, company_dropdown

}

export interface Dropdowns {
  load_cancel_type_dropdown?: DropdownOption[];
  valut_dropdown?: DropdownOption[];
  region_dropdown?: DropdownOption[];
  company_dropdown?: DropdownOption[];
  country_dropdown?: DropdownOption[];
  manager_dropdown?: DropdownOption[];
  trailer_type_dropdown?: DropdownOption[];
  // Додаткові поля, якщо вони можуть з'явитися
  load_type_dropdown?: DropdownOption[];
  tender_type_dropdown?: DropdownOption[];
  transit_dropdown?: DropdownOption[];
  department_dropdown?: DepartmentDropdownOption[];
}
