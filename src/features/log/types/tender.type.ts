export interface ITender {
  id: number;

  cargo: string;
  email: string;
  notes: string | null;
  author?: string;
  client_name?: string;

  volume: number | null;
  weight: number | null;

  ids_type: "GENERAL" | string;
  ids_status: "WAITING" | string;
  ids_valut: "UAH" | "USD" | "EUR" | string;

  time_start: string | Date | null;
  time_end: string | Date | null;

  price_start: number | null;
  price_next: number | null;
  price_step: number | null;
  request_price: number | null;
  price_proposed: number | null;
  price_redemption: number | null;
  price_client: number | null;
  person_price_proposed: number | null;

  without_vat: boolean;
  duration_continue: boolean;

  car_count: number;
  car_count_actual: number;
  car_count_closed: number;
  car_count_canceled: number;

  company_name: string;

  company_winner_car_count: number;
  company_offer_car_count: number;
  cost_start: number;

  ref_temperature_from: number | null;

  ref_temperature_to: number | null;

  tender_status: string;
  valut_name?: string;

  tender_type?: string;
  rating?: number;

  usr_phone: any[]; // якщо зʼявиться структура — типізуємо
  rate_company: IRateCompany[];

  tender_load: ITenderLoad[];
  tender_route: ITenderRoute[];
  tender_trailer: ITenderTrailer[];
  tender_permission: ITenderPermission[];
  files?: any[];
  date_load?: string | null;
  date_load2?: string | null;
  date_unload?: string | null;
  ids_members?: "ALL" | "CARRIER" | "MANAGER" | string | null;

  close_status: "AGREE" | "ENABLE" | "DISABLE" | null;
}
export interface ITenderLoad {
  id: number;
  ids_load_type: "UP" | "BACK" | string;
  load_type_name: string;
}
export interface ITenderRoute {
  id: number;
  id_parent: number; // ID тендера, до якого належить точка
  order_num: number; // Порядковий номер у маршруті (важливо для степпера та карти)

  // Географія
  lat: number;
  lon: number;
  city: string;
  locality?: string; // Може бути null/undefined, якщо місто велике
  address: string;
  country: string; // Код країни (UA, PL тощо)
  ids_country: string; // Часто дублює country або використовується для зв'язку
  ids_region: number | null;
  region_name: string | null;

  // Логістичні параметри
  customs: boolean; // Чи є точка митницею
  point_name: string; // Назва точки для відображення (Завантаження, Кордон тощо)

  // Тип точки (Union type для автокомпліту)
  ids_point:
    | "LOAD_FROM" // Початкова точка завантаження
    | "LOAD_TO" // Кінцева точка розвантаження
    | "BORDER" // Перетин кордону
    | "CUSTOM_UP" // Замитнення (експорт)
    | "CUSTOM_DOWN" // Розмитнення (імпорт)
    | string; // Для кастомних значень

  // Дати (ISO string)
  date_point: string | null; // Бажана дата (від)
  date_point2: string | null; // Бажана дата (до)

  // Додатково
  notes: string | null;
}
export interface ITenderTrailer {
  id: number;
  ids_trailer_type: "TENT" | "REF" | "CILNOMET" | "ZERNO" | string;
  trailer_type_name: string;
}
export interface ITenderPermission {
  id: number;
  ids_permission_type: "CMR" | "CUSTOM" | "CMR_INSHURANCE" | string;
  load_type_name: string;
}
export interface IRateCompany {
  id: number;
  email: string;
  author: string;
  id_author?: number;
  id_company: number;
  company_name: string;

  // Бажано замінити any на конкретний інтерфейс, якщо він у вас вже є
  person_phone: any[];

  price_proposed: number;
  redemption_price: string;

  // Нові поля для кількості машин
  car_count_winner: number;
  car_count_proposed: number;

  time_add?: string;
  notes: string | null;
}
