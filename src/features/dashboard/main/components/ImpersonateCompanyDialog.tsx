"use client";

import { useState } from "react";
import { useAdminCompanies } from "@/features/admin/hooks/useAdminCompanies";
import { adminUserService } from "@/features/admin/services/admin.user.service";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Check, Building2, Search, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";

export default function ImpersonateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Fetch companies with debounced search only if length >= 2
  const shouldSearch = debouncedSearch.length >= 2;
  const { companies, isLoading: companiesLoading } = useAdminCompanies(
    shouldSearch ? { search: debouncedSearch, per_page: 50 } : { per_page: 0 }
  );

  const displayedCompanies = shouldSearch ? companies : [];

  const handleImpersonate = async () => {
    if (!selectedCompanyId) {
      toast.error("Оберіть компанію");
      return;
    }

    try {
      setLoading(true);
      await adminUserService.impersonateCompany(Number(selectedCompanyId));
      toast.success("Компанію змінено! Перезавантаження...");
      setOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Помилка при зміні компанії");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2 font-medium bg-blue-50/50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 transition-all"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Змінити компанію
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="p-6 pb-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Перегляд від імені компанії
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Знайдіть та виберіть компанію (за назвою або ЄДРПОУ), щоб переглядати систему від її імені:
          </p>
        </div>

        <div className="flex flex-col gap-0 px-6 py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Введіть назву компанії або ЄДРПОУ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-lg shadow-sm"
            />
          </div>
          
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-sm overflow-hidden flex flex-col">
            <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
              {!shouldSearch && (
                <div className="px-4 py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                  <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  <span>Введіть хоча б 2 символи для пошуку...</span>
                </div>
              )}
              
              {shouldSearch && companiesLoading && (
                <div className="px-4 py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span>Пошук компаній...</span>
                </div>
              )}

              {shouldSearch && !companiesLoading && displayedCompanies?.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                  <Search className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  <span>Компаній не знайдено.</span>
                </div>
              )}

              {shouldSearch && !companiesLoading && displayedCompanies && displayedCompanies.length > 0 && (
                <ul className="flex flex-col">
                  {displayedCompanies.map((company) => {
                    const isSelected = selectedCompanyId === String(company.id);
                    return (
                      <li
                        key={company.id}
                        onClick={() => setSelectedCompanyId(String(company.id))}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors",
                          isSelected 
                            ? "bg-blue-50 dark:bg-blue-900/20" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected 
                            ? "border-blue-500 bg-blue-500 text-white" 
                            : "border-slate-300 dark:border-slate-700 bg-transparent"
                        )}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                          <span className={cn(
                            "font-medium truncate text-sm transition-colors",
                            isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"
                          )}>
                            {company.company_name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              ID: {company.id}
                            </span>
                            {company.edrpou && (
                              <span className="truncate">ЄДРПОУ: {company.edrpou}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <Button
            onClick={handleImpersonate}
            disabled={!selectedCompanyId || loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 shadow-sm rounded-lg"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Зачекайте..." : "Перейти до кабінету компанії"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
