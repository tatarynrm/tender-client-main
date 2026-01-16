// @/shared/components/Pagination/ItemsPerPage.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ItemsPerPageProps {
  options?: number[];
  defaultValue?: number;
  onChange?: (value: number) => void; // нова пропса
}

export const ItemsPerPage = ({
  options = [10, 20, 50, 100],
  defaultValue = 10,
  onChange,
}: ItemsPerPageProps) => {
  const searchParams = useSearchParams();
  const currentLimit = searchParams.get("limit") || String(defaultValue);

  const handleValueChange = (value: string) => {
    onChange?.(Number(value));
  };

  return (
    <div className="flex items-center gap-2">
      {/* <span className="text-sm text-gray-500 whitespace-nowrap">Показувати по:</span> */}
      <Select value={currentLimit} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[80px] h-8 border-gray-300">
          <SelectValue placeholder={currentLimit} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};