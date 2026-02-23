import api from "@/shared/api/instance.api";


export const adminCompanyService = {
  getCompanies: (params: URLSearchParams) => 
    api.get("/company/all", { params }).then(res => res.data),
    
  getCompanyById: (id: number) => 
    api.get(`/admin/company/one/${id}`).then(res => res.data),
    
  createCompany: (data: any) => 
    api.post("/admin/company/save", data).then(res => res.data),
};