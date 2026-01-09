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

export interface IApiResponse<T> {
  status: "ok" | "error";
  content: T;
  props?: {
    pagination?: ApiPagination;
    [key: string]: any;
  };
}
