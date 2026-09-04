// types.ts
export interface CreateCompanyDto {
  address: string;
  company_name: string;
  company_name_full?: string;
  edrpou: string;
  id_country: number;
  id_company_form: number;
  is_carrier?: boolean;
  is_expedition?: boolean;
  is_client?: boolean;
  ids_members_exp?: string | null;
  ids_members_imp?: string | null;
  ids_members_reg?: string | null;
}
