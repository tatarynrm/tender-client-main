"use client";

import { Button, Input } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ChangeEvent } from "react";

interface CompanyFiltersProps {
  filters: {
    search: string;

  };
  onChange: (filters: CompanyFiltersProps["filters"]) => void;
  onApply: () => void;
  onReset: () => void;
}

export function CompanyFilters({
  filters,
  onChange,
  onApply,
  onReset,
}: CompanyFiltersProps) {
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const toggle = (key: keyof typeof filters) => {
    onChange({
      ...filters,
      [key]: filters[key] ? "" : "1",
    });
  };

  return (
    <div className="rounded-xl border p-4 space-y-4 ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 🔍 Search */}
        <Input
          placeholder="Пошук (назва, ЄДРПОУ)"
          value={filters.search}
          onChange={handleInput}
        />


      </div>

      {/* 🔘 Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onReset}>
          Скинути
        </Button>
        <Button onClick={onApply}>
          Застосувати
        </Button>
      </div>
    </div>
  );
}
