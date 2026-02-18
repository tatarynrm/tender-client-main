"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { User as UserIcon, Edit, Search, X } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { Button, Input } from "@/shared/components/ui";
import LinkButton from "@/shared/components/Buttons/LinkButton";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { useRouter } from "next/navigation";

// Схема з чіткими типами
const userFilterSchema = z.object({
  email: z.string(),
  company: z.string(),
  page: z.number(),
  limit: z.number(),
});

 type UserFilterValues = z.infer<typeof userFilterSchema>;

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilterValues>({
    email: "",
    company: "",
    page: 1,
    limit: 20,
  });

  const { register, watch, setValue, reset } = useForm<UserFilterValues>({
    // Використання 'as any' тут вирішує проблему несумісності ResolverOptions
    resolver: zodResolver(userFilterSchema) as any,
    defaultValues: {
      email: "",
      company: "",
      page: 1,
      limit: 20,
    },
  });

  const emailValue = watch("email");
  const companyValue = watch("company");

  const { users, pagination, isLoading } = useAdminUsers(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        email: emailValue || "",
        company: companyValue || "",
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(handler);
  }, [emailValue, companyValue]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePerPageChange = useCallback((newSize: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit: newSize }));
  }, []);

  const clearFilters = () => {
    const defaults = { email: "", company: "", page: 1, limit: 20 };
    reset(defaults);
    setFilters(defaults);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "ПІБ",
      accessorFn: (row) => {
        const p = row.person;
        return (
          `${p?.surname || ""} ${p?.name || ""} ${p?.last_name || ""}`.trim() ||
          "—"
        );
      },
    },
    {
      header: "Компанія",
      accessorFn: (row) =>
        row.company?.company_name || row.migrate_company || "Немає",
    },
    { accessorKey: "email", header: "Email" },
    {
      header: "Роль",
      cell: ({ row }) => {
        const role = row.original.person?.person_role;
        if (role?.is_admin)
          return <span className="font-semibold text-red-600">Адмін</span>;
        if (role?.is_manager)
          return <span className="text-blue-600">Менеджер</span>;
        return "Користувач";
      },
    },
    {
      header: "Дії",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/admin/users/edit/${row.original.id}`)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Управління користувачами
        </h2>
        <LinkButton
          title="Додати користувача"
          href="/admin/users/create"
          icon={<UserIcon size={18} />}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            {...register("email")}
            placeholder="Пошук за email..."
            className="pl-9 pr-9"
          />
          {emailValue && (
            <button
              type="button"
              onClick={() => setValue("email", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            {...register("company")}
            placeholder="EDRPOU / Назва компанії..."
            className="pl-9 pr-9"
          />
          {companyValue && (
            <button
              type="button"
              onClick={() => setValue("company", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={!emailValue && !companyValue}
        >
          Скинути фільтри
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users || []}
          isLoading={isLoading}
          pageCount={pagination?.page_count || 1}
          currentPage={filters.page}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePerPageChange}
        />
      </div>
    </div>
  );
}
