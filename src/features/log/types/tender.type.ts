// export interface ITender {
//   id: number;
//   step: number | null;
//   cargo: string;
//   notes: string | null;
//   author: string;
//   id_usr: number;
//   volume: number | null;
//   weight: number | null;
//   id_valut: number;
//   ids_type: "GENERAL" | string;
//   car_count: number;
//   cost_start: number | null;
//   ids_status: string | null;
//   time_start: string | null;
//   valut_name: string;
//   tender_load: any[]; // Якщо треба — зроблю точний тип
//   tender_type: string;
//   without_vat: boolean | null;
//   company_name: string;
//   tender_route: ITenderRoute[];
//   car_count_add: number | null;
//   price_request: number | null;
//   tender_status: string | null;
//   time_end: string | null;
//   tender_trailer: ITenderTrailer[];
//   car_count_actual: number | null;
//   car_count_closed: number | null;
//   id_owner_company: number;
//   duration_continue: number | null;
//   tender_permission: any[]; // Якщо треба — зроблю тип
//   car_count_canceled: number | null;
//   city?:string
//   ids_country?:string

// }

// export interface ITenderRoute {
//   id: number;
//   notes: string | null;
//   country: string;
//   customs: boolean;
//   locality: string;
//   id_parent: number;
//   id_region: number;
//   ids_point: "LOAD_FROM" | "LOAD_TO" | string;
//   order_num: number;
//   date_point: string | null;
//   id_country: number;
//   point_name: string;
//   date_point2: string | null;
//   region_name: string;
//   city?:string;
//     ids_country?:string
// }

// export interface ITenderTrailer {
//   id: number;
//   id_parent: number;
//   order_num: number;
//   ids_trailer_type: "TENT" | "REF" | string;
//   trailer_type_name: string;
// }

export interface ITender {
  id: number;

  cargo: string;
  email: string;
  notes: string | null;
  author: string;

  volume: number | null;
  weight: number | null;

  ids_type: "GENERAL" | string;
  ids_status: "WAITING" | string;
  ids_valut: "UAH" | "USD" | "EUR" | string;

  time_start: string | null;
  time_end: string | null;

  price_start: number | null;
  price_next: number | null;
  price_step: number | null;
  request_price: number | null;
  price_proposed: number | null;
  price_redemption: number | null;

  without_vat: boolean;
  duration_continue: boolean;

  car_count: number;
  car_count_actual: number;
  car_count_closed: number;
  car_count_canceled: number;

  company_name: string;

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
  id_author: number;
  id_company: number;
  company_name: string;
  
  // Бажано замінити any на конкретний інтерфейс, якщо він у вас вже є
  person_phone: any[]; 
  
  price_proposed: number;
  redemption_price: string;
  
  // Нові поля для кількості машин
  car_count_winner: number;
  car_count_proposed: number;
}