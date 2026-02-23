"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { CreateUserDialog } from "./CreateUserDialog";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { IPreRegisterUser } from "../../hooks/useAdminPreRegisterUsers";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCircle2,
  MapPin,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { useRouter } from "next/navigation";

interface Props {
  data: IPreRegisterUser[];
}

export const UsersTable = ({ data }: Props) => {
  const router = useRouter();
  const columns: ColumnDef<IPreRegisterUser>[] = [
    {
      accessorKey: "surname",
      header: "Користувач",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.surname} {row.original.name}
          </span>
          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
            {row.original.last_name || ""}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Контакти",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.email}</span>
          <span className="text-[11px] text-teal-600 font-semibold italic">
            {row.original.phone}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "company_name",
      header: "Дані реєстрації",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {row.original.company_name}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            <MapPin size={10} />
            {row.original.country_name} • {row.original.company_form}
          </div>
        </div>
      ),
    },
    {
      id: "company_status",
      header: "Статус Компанії",
      cell: ({ row }) => {
        const idCompany = row.original.company?.id; // Використовуємо вкладений id з об'єкта
        return idCompany ? (
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg w-fit border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Створено
            </span>
          </div>
        ) : (
          // <CreateCompanyDialog companyData={row.original} />
          <AppButton
            onClick={() =>
              router.push(`/admin/companies/pre/${row.original.id}`)
            }
          >
            Створити
          </AppButton>
        );
      },
    },
    {
      id: "user_status",
      header: "Статус Акаунту",
      cell: ({ row }) => {
        const hasUser = !!row.original.id_usr;
        const hasCompany = !!row.original.company?.id;

        if (hasUser) {
          return (
            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg w-fit border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Створено
              </span>
            </div>
          );
        }

        if (hasCompany) {
          return (
            <AppButton
              onClick={() => router.push(`/admin/users/pre/${row.original.id}`)}
            >
              Створити
            </AppButton>
          );
        }

        return (
          <div className="flex items-center gap-1.5 text-slate-400 italic">
            <AlertCircle size={14} />
            <span className="text-[11px]">Чекає на компанію</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Дата",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-400 font-mono">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      // Додаємо стилізацію рядків або порожнього стану через пропси DataTable, якщо він підтримує
    />
  );
};
