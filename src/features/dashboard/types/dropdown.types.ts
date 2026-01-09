// shared/types/dropdowns.type.ts

export interface IRegionDropdown {
  ids: string;
  short_name: string;
  region_name: string;
}

export interface ICountryDropdown {
  ids: string;
  idnt2: string;
  idnt3: string;
  idntnum: string;
  country_name: string;
}

export interface ILoadTypeDropdown {
  ids: string;
  value: string;
  order_num: number;
}

export interface ITenderTypeDropdown {
  ids: string;
  value: string;
}

export interface ITrailerTypeDropdown {
  ids: string;
  value: string;
  order_num: number;
}

export interface ILoadPermissionDropdown {
  ids: string;
  value: string;
  order_num: number;
}
export interface ITenderStatusDropdown {
  ids: string;
  value: string;
  order_num: number;
}
export interface ITenderClientFormData {
  region_dropdown: IRegionDropdown[];
  country_dropdown: ICountryDropdown[];
  load_type_dropdown: ILoadTypeDropdown[];
  tender_type_dropdown: ITenderTypeDropdown[];
  trailer_type_dropdown: ITrailerTypeDropdown[];
  load_permission_dropdown: ILoadPermissionDropdown[];
  tender_status_dropdown: ITenderStatusDropdown[];
}
