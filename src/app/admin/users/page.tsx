"use client";

import { useState } from "react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/components/ui";
import { ColumnDef } from "@tanstack/react-table";

import { User as UserIcon, Trash2, Edit } from "lucide-react";
import LinkButton from "@/shared/components/Buttons/LinkButton";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";

export default function UsersPage() {
  const [filters, setFilters] = useState({

    page: 1,
    per_page: 10
  });

  const { users, pagination, isLoading } = useAdminUsers(filters);

  const columns: ColumnDef<any>[] = [
    { 
      header: "ПІБ", 
      accessorFn: (row) => `${row.person?.surname || ""} ${row.person?.name || ""} ${row.person?.last_name || ""}` 
    },
    { accessorKey: "email", header: "Email" },
    {
      header: "Роль",
      cell: ({ row }) => {
        if (row.original.person?.person_role?.is_admin) return "Адмін";
        if (row.original.is_manager) return "Менеджер";
        return "Користувач";
      },
    },
    {
      header: "Дії",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost"> <Edit className="w-4 h-4" /> </Button>

        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Користувачі</h2>
        <LinkButton title="Додати" href="/admin/users/create" icon={<UserIcon />} />
      </div>


      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pageCount={pagination?.page_count || 1}
        currentPage={filters.page}
        onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
      />
    </div>
  );
}