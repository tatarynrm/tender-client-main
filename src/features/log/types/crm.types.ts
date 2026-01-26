export interface ActiveStats {
  all: number;
  export: number;
  import: number;
  region: number;
  transit: number;
}

export interface PeriodStats {
  day_current: number;
  day_prev: number;
  week_current: number;
  week_prev: number;
  month_current: number;
  month_prev: number;
}

export interface ChartClient {
  added: number;
  closed: number;
  canceled: number;
  id_client: number | null;
  company_name: string;
}

export interface ChartCountry {
  added: number;
  closed: number;
  canceled: number;
  ids_country: string | null;
  country_name: string;
}

export interface DashboardStats {
  date1: string;
  date2: string;
  car_actual: ActiveStats[];
  car_closed: PeriodStats[];
  car_published: PeriodStats[];
  chart_clients: ChartClient[];
  chart_countries: ChartCountry[];
}