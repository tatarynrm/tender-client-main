export interface ActiveStats {
  all: number;
  export: number;
  import: number;
  region: number;
  transit: number;
}

export interface PeriodStats {
  day_prev: number;
  week_prev: number;
  month_prev: number;
  day_current: number;
  week_current: number;
  month_current: number;
}

export interface DashboardStats {
  active: ActiveStats[];
  closed: PeriodStats[];
  published: PeriodStats[];
}