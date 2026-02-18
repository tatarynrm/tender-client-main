export interface ICompany {
  id: number;
  company_name: string;
  edrpou: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  rating: number | null;
  black_list: boolean;
  is_carrier: boolean;
  is_expedition: boolean;
  is_client: boolean;
  address: string | null;
}