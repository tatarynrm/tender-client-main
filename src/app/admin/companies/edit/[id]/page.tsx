"use client";

import { useParams } from "next/navigation";
import Loading from "@/shared/components/ui/Loading";
import { useCompanyById } from "@/features/admin/hooks/useAdminCompanies";
import SaveCompanyForm from "@/features/admin/companies/components/Companies/SaveCompanyForm";

export default function EditCompanyPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useCompanyById(Number(id));

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Компанію не знайдено або стався збій завантаження
      </div>
    );
  }

  return (
    <div className="p-6">
      <SaveCompanyForm defaultValues={data} />
    </div>
  );
}
