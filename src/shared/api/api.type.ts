// export interface IApiResponse<T> {
//   status: "ok" | "error";
//   content: T;
// }
export interface ApiPagination {
  page: number;
  per_page: number;
  page_count: number;
  rows_all: number;
}
export interface ILoadAddDataFilter {
  mn: number;
  tr: number;
  all: number;
  exp: number;
  imp: number;
  reg: number;
}
export interface ILoadAddDataAll {
  mn: number;
  tr: number;
  all: number;
  exp: number;
  imp: number;
  reg: number;
}
export interface ILoadData {
  car_count_all: ILoadAddDataAll;
  car_count_filter: ILoadAddDataFilter;
}
export interface IApiResponse<T> {
  status: "ok" | "error";
  content: T;
  add_data?: ILoadData;
  props?: {
    pagination?: ApiPagination;
    [key: string]: any;
  };
}
