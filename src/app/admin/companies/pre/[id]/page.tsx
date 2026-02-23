"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { adminPreRegisterService } from "@/features/admin/services/admin.users-pre-register.service";
import SaveCompanyForm from "@/features/admin/companies/components/Companies/SaveCompanyForm";

const PreRegisterUserPage = () => {
  // 1. Дістаємо ID з URL
  const params = useParams();
  const id = params.id as string;

  // 2. Завантажуємо дані конкретного запису
  const { data, isLoading, error } = useQuery({
    queryKey: ["pre-register-user", id],
    queryFn: () => adminPreRegisterService.getCompanyDataFromPre(Number(id)),
    enabled: !!id, // Запит піде тільки якщо є id
  });

  const user = data?.content;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Запис не знайдено</h2>
        <Link
          href="/admin/companies/pre"
          className="text-teal-600 hover:underline"
        >
          Повернутися до списку
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Кнопка Назад */}
      <div className="mb-6">
        <Link href="/admin/companies/pre">
          <AppButton
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
          >
            Назад до списку
          </AppButton>
        </Link>
      </div>
      <SaveCompanyForm defaultValues={user} />
    </div>
  );
};

export default PreRegisterUserPage;
