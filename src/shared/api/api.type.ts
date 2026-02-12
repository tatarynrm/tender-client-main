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
export interface ILoadAddData {
  count_mn: number;
  count_tr: number;
  count_all: number;
  count_exp: number;
  count_imp: number;
  count_reg: number;
}
export interface IApiResponse<T> {
  status: "ok" | "error";
  content: T;
  add_data?: ILoadAddData;
  props?: {
    pagination?: ApiPagination;
    [key: string]: any;
  };
}
