// @/features/log/tenders/components/ListControls.tsx
"use client";

import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { SortAsc, ListFilter } from "lucide-react";

interface ListControlsProps {
  currentLimit: number;
  currentSort: string;
  onLimitChange: (limit: number) => void;
  onSortChange: (sort: string) => void;
}

export const ListControls = ({ 
  currentLimit, 
  onLimitChange, 
  currentSort, 
  onSortChange 
}: ListControlsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-gray-100 mb-4">
      {/* ЛІВА ЧАСТИНА: Сортування */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <SortAsc className="h-4 w-4" />
          <span>Сортувати:</span>
        </div>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200 focus:ring-orange-500">
            <SelectValue placeholder="Оберіть порядок" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Спочатку нові</SelectItem>
            <SelectItem value="oldest">Спочатку старі</SelectItem>
            <SelectItem value="price_asc">Дешевші</SelectItem>
            <SelectItem value="price_desc">Дорожчі</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ПРАВА ЧАСТИНА: Ліміт */}
      <div className="flex items-center gap-4">
        <ItemsPerPage 
          defaultValue={currentLimit} 
          onChange={onLimitChange} 
        />
      </div>
    </div>
  );
};