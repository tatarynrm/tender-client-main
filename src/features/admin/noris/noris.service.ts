import api from "@/shared/api/instance.api";

export interface INorisCandidate {
  kod: number;
  nur: string | null;
  zkpo: string | null;
  fo: number | null;
  nadr: string | null;
  // edrpou — збіг за ЄДРПОУ, name — за назвою, manual — ручний пошук
  match: "edrpou" | "name" | "manual";
  linked_company?: { id: number; company_name: string } | null;
}

export interface INorisCompany {
  id: number;
  company_name: string | null;
  company_name_full: string | null;
  edrpou: string | null;
  address: string | null;
  candidates: INorisCandidate[];
  error: string | null;
}

export interface INorisUnlinkedResponse {
  rows: INorisCompany[];
  total: number;
  page: number;
  limit: number;
  page_count: number;
}

export const norisService = {
  getUnlinked: (page: number, limit: number) =>
    api
      .get<INorisUnlinkedResponse>("/admin/company/noris/unlinked", {
        params: { page, limit },
      })
      .then((res) => res.data),

  link: (id: number, migrate_id: number) =>
    api
      .post("/admin/company/noris/link", { id, migrate_id })
      .then((res) => res.data),

  // Ручний пошук у реєстрі Oracle (ЄДРПОУ або назва)
  searchOracle: (q: string) =>
    api
      .get<any[]>("/oracle/search-company", { params: { edrpou: q } })
      .then((res) => (Array.isArray(res.data) ? res.data : [])),
};
